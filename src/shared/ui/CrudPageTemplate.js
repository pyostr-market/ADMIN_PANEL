import { useMemo, useState, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useCrudList, useCrudModal } from '../../lib/crud';
import { PermissionGate } from '../PermissionGate';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { Pagination } from '../ui/Pagination';
import { EntityList } from '../ui/EntityList';
import { Modal } from '../ui/Modal';
import { Tabs, Tab } from '../ui/Tabs';
import './CrudPageTemplate.css';

/**
 * Универсальный шаблон CRUD-страницы
 * @param {Object} props
 * @param {string} props.title - Заголовок страницы
 * @param {Object} props.config - Конфигурация CRUD
 * @param {Function} props.config.fetchFn - Функция получения данных
 * @param {Function} props.config.createFn - Функция создания
 * @param {Function} props.config.updateFn - Функция обновления
 * @param {Function} props.config.deleteFn - Функция удаления
 * @param {string} props.config.entityName - Название сущности
 * @param {string} props.config.entityNamePlural - Название сущности во множественном числе
 * @param {Array} props.config.tabs - Вкладки (опционально)
 * @param {Object} props.config.permissions - Права доступа
 * @param {string|Array} props.config.permissions.view - Право на просмотр
 * @param {string|Array} props.config.permissions.create - Право на создание
 * @param {string|Array} props.config.permissions.update - Право на редактирование
 * @param {string|Array} props.config.permissions.delete - Право на удаление
 * @param {Object} props.config.fields - Поля сущности
 * @param {Array} props.config.fields.list - Поля для отображения в списке
 * @param {Array} props.config.fields.form - Поля для формы
 * @param {Array} props.config.filters - Фильтры (опционально)
 * @param {number} props.config.defaultLimit - Количество элементов на странице
 * @param {Function} props.config.normalizeFn - Функция нормализации данных
 * @param {ReactNode} props.config.renderForm - Кастомная форма редактирования/создания
 * @param {ReactNode} props.config.renderEmpty - Кастомный пустой state
 * @param {ReactNode} props.config.renderHeader - Кастомный заголовок
 * @param {ReactNode} props.config.renderActions - Кастомные действия в списке
 */
export function CrudPageTemplate({ title, config }) {
  const {
    fetchFn,
    createFn,
    updateFn,
    deleteFn,
    entityName = 'Запись',
    entityNamePlural = 'Записи',
    tabs = null,
    permissions = {},
    fields = {},
    filters = [],
    defaultLimit = 20,
    normalizeFn = (data) => data,
    renderForm = null,
    renderEmpty = null,
    renderHeader = null,
    renderActions = null,
  } = config;

  const [activeTab, setActiveTab] = useState(tabs?.[0]?.key || null);

  const crud = useCrudList({
    fetchFn,
    createFn,
    updateFn,
    deleteFn,
    defaultLimit,
    entityName,
    normalizeFn,
  });

  const modal = useCrudModal();

  const currentTabConfig = useMemo(() => {
    if (!tabs || !activeTab) return config;
    const tab = tabs.find((t) => t.key === activeTab);
    return tab ? { ...config, ...tab.config } : config;
  }, [tabs, activeTab, config]);

  const filteredItems = useMemo(() => {
    if (!currentTabConfig.filterFn || !crud.items) return crud.items;
    return currentTabConfig.filterFn(crud.items, { ...crud.filters, search: crud.search });
  }, [crud.items, crud.filters, crud.search, currentTabConfig]);

  const handleCreate = async (payload) => {
    await crud.create(payload);
    modal.closeCreateModal();
  };

  const handleUpdate = async (payload) => {
    if (!modal.editingItem) return;
    await crud.update(modal.editingItem.id, payload);
    modal.closeEditModal();
  };

  const handleDelete = async (item) => {
    const confirmMessage = currentTabConfig.confirmDeleteMessage
      || `Удалить "${item.name || entityName.toLowerCase()}"?`;
    await crud.delete(item.id, confirmMessage);
  };

  const renderListItem = useCallback(
    (item) => {
      const canUpdate = !permissions.update
        || <PermissionGate permission={permissions.update} fallback={null}><span /></PermissionGate>;
      const canDelete = !permissions.delete
        || <PermissionGate permission={permissions.delete} fallback={null}><span /></PermissionGate>;

      const defaultActions = (
        <>
          {permissions.update && (
            <PermissionGate permission={permissions.update} fallback={null}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => modal.openEditModal(item)}
                aria-label={`Изменить ${item.name || entityName}`}
              >
                <FiEdit2 />
              </Button>
            </PermissionGate>
          )}
          {permissions.delete && (
            <PermissionGate permission={permissions.delete} fallback={null}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item)}
                disabled={crud.isSubmitting}
                aria-label={`Удалить ${item.name || entityName}`}
              >
                <FiTrash2 />
              </Button>
            </PermissionGate>
          )}
        </>
      );

      const defaultFields = fields.list || ['name', 'description'];

      return (
        <>
          <div className="crud-item__content">
            {defaultFields.map((field) => {
              if (typeof field === 'function') {
                return field(item);
              }
              if (typeof field === 'object' && field.render) {
                return field.render(item);
              }
              return (
                <p
                  key={field}
                  className={`crud-item__${field === 'name' ? 'title' : 'description'}`}
                >
                  {item[field] || 'Без описания'}
                </p>
              );
            })}
          </div>
          <div className="crud-item__actions">
            {renderActions ? renderActions(item, { onUpdate: () => modal.openEditModal(item), onDelete: () => handleDelete(item) }) : defaultActions}
          </div>
        </>
      );
    },
    [permissions, fields, renderActions, modal, crud.isSubmitting, entityName],
  );

  const renderFilterControls = useMemo(() => {
    if (!filters || filters.length === 0) return null;

    return (
      <div className="crud-page__filters-extra">
        {filters.map((filter) => {
          if (filter.type === 'select') {
            return (
              <Select
                key={filter.key}
                label={filter.label}
                value={crud.filters[filter.key] || ''}
                onChange={(e) => crud.setFilters({ [filter.key]: e.target.value })}
                options={filter.options}
                placeholder={filter.placeholder || `Все ${filter.label.toLowerCase()}`}
                disabled={crud.isLoading}
              />
            );
          }
          return null;
        })}
      </div>
    );
  }, [filters, crud.filters, crud.setFilters, crud.isLoading]);

  const canCreate = !permissions.create
    || <PermissionGate permission={permissions.create} fallback={null}><span /></PermissionGate>;

  return (
    <section className="crud-page">
      {renderHeader ? renderHeader({
        title,
        canCreate,
        onOpenCreate: () => {
          if (permissions.create) {
            modal.openCreateModal();
          }
        },
        isLoading: crud.isLoading,
      }) : (
        <header className="crud-page__header">
          <h1 className="crud-page__title">{title}</h1>
          {permissions.create && (
            <PermissionGate permission={permissions.create} fallback={null}>
              <Button
                variant="primary"
                leftIcon={<FiPlus />}
                onClick={modal.openCreateModal}
                disabled={crud.isLoading}
              >
                Создать {entityName.toLowerCase()}
              </Button>
            </PermissionGate>
          )}
        </header>
      )}

      {tabs && (
        <Tabs className="crud-page__tabs">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Tab>
          ))}
        </Tabs>
      )}

      <div className="crud-page__filters">
        <SearchInput
          value={crud.search}
          onChange={(e) => crud.setSearch(e.target.value)}
          placeholder={`Поиск ${entityNamePlural.toLowerCase()}...`}
          loading={crud.isLoading}
          className="crud-page__search"
        />
        {renderFilterControls}
      </div>

      <EntityList
        items={filteredItems}
        renderItem={renderListItem}
        emptyMessage={renderEmpty || (crud.search ? 'По вашему запросу ничего не найдено' : `${entityNamePlural} не найдены`)}
        loading={crud.isLoading}
        className="crud-page__list"
      />

      {!crud.isLoading && filteredItems && filteredItems.length > 0 && (
        <Pagination
          currentPage={crud.page}
          totalPages={crud.pagination.pages}
          totalItems={crud.pagination.total}
          onPageChange={crud.setPage}
          loading={crud.isLoading}
          className="crud-page__pagination"
        />
      )}

      {renderForm ? renderForm({
        isOpen: modal.isOpen || modal.isCreateModalOpen,
        onClose: modal.closeModal,
        onSubmit: modal.editingItem ? handleUpdate : handleCreate,
        item: modal.editingItem,
        isSubmitting: crud.isSubmitting,
      }) : (
        <>
          <Modal
            isOpen={modal.isOpen}
            onClose={modal.closeEditModal}
            title={`Редактирование ${entityName.toLowerCase()}`}
            size="md"
            footer={(
              <>
                <Button variant="secondary" onClick={modal.closeEditModal}>
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const form = document.querySelector('.crud-form');
                    if (form) form.requestSubmit();
                  }}
                  loading={crud.isSubmitting}
                >
                  Сохранить
                </Button>
              </>
            )}
          >
            <CrudForm
              item={modal.editingItem}
              fields={fields.form || fields.list}
              entityName={entityName}
            />
          </Modal>

          <Modal
            isOpen={modal.isCreateModalOpen}
            onClose={modal.closeCreateModal}
            title={`Создание ${entityName.toLowerCase()}`}
            size="md"
            footer={(
              <>
                <Button variant="secondary" onClick={modal.closeCreateModal}>
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const form = document.querySelector('.crud-form');
                    if (form) form.requestSubmit();
                  }}
                  loading={crud.isSubmitting}
                >
                  Создать
                </Button>
              </>
            )}
          >
            <CrudForm
              item={null}
              fields={fields.form || fields.list}
              entityName={entityName}
            />
          </Modal>
        </>
      )}
    </section>
  );
}

function CrudForm({ item, fields = ['name', 'description'], entityName = 'Запись' }) {
  const [formData, setFormData] = useState(() => {
    const initial = {};
    fields.forEach((field) => {
      const key = typeof field === 'object' && field.key ? field.key : field;
      initial[key] = item?.[key] || '';
    });
    return initial;
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    if (form.checkValidity()) {
      const submitEvent = new CustomEvent('crud-form-submit', { detail: formData });
      form.dispatchEvent(submitEvent);
    } else {
      form.reportValidity();
    }
  };

  return (
    <form className="crud-form" onSubmit={handleSubmit}>
      {fields.map((field) => {
        const key = typeof field === 'object' && field.key ? field.key : field;
        const label = typeof field === 'object' && field.label
          ? field.label
          : key.charAt(0).toUpperCase() + key.slice(1);
        const type = typeof field === 'object' && field.type ? field.type : 'text';
        const required = typeof field === 'object' && field.required !== undefined ? field.required : key === 'name';
        const placeholder = typeof field === 'object' && field.placeholder ? field.placeholder : '';

        if (type === 'textarea') {
          return (
            <label key={key} className="crud-form__field">
              <span className="crud-form__label">{label}</span>
              <textarea
                value={formData[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                required={required}
                rows={4}
              />
            </label>
          );
        }

        return (
          <label key={key} className="crud-form__field">
            <span className="crud-form__label">{label}</span>
            <input
              type={type}
              value={formData[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              required={required}
            />
          </label>
        );
      })}
    </form>
  );
}
