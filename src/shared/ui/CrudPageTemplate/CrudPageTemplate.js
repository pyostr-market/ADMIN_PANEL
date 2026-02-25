import { useMemo, useState, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useCrudList, useCrudModal } from '../../lib/crud';
import { PermissionGate } from '../PermissionGate/PermissionGate';
import { Button } from '../Button/Button';
import { SearchInput } from '../SearchInput/SearchInput';
import { Select } from '../Select/Select';
import { Pagination } from '../Pagination/Pagination';
import { EntityList } from '../EntityList/EntityList';
import { Modal } from '../Modal/Modal';
import { Tabs, Tab } from '../Tabs/Tabs';
import styles from './CrudPageTemplate.module.css';

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
    await crud.delete(item.id);
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
          <div className={styles.crudItemContent}>
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
          <div className={styles.crudItemActions}>
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
      <div className={styles.crudPageFiltersExtra}>
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
    <section className={styles.crudPage}>
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
        <header className={styles.crudPageHeader}>
          <h1 className={styles.crudPageTitle}>{title}</h1>
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
        <Tabs className={styles.crudPageTabs}>
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

      <div className={styles.crudPageFilters}>
        <SearchInput
          value={crud.search}
          onChange={(e) => crud.setSearch(e.target.value)}
          placeholder={`Поиск ${entityNamePlural.toLowerCase()}...`}
          loading={crud.isLoading}
          className={styles.crudPageSearch}
        />
        {renderFilterControls}
      </div>

      <EntityList
        items={filteredItems}
        renderItem={renderListItem}
        emptyMessage={renderEmpty || (crud.search ? 'По вашему запросу ничего не найдено' : `${entityNamePlural} не найдены`)}
        loading={crud.isLoading}
        className={styles.crudPageList}
      />

      {!crud.isLoading && filteredItems && filteredItems.length > 0 && (
        <Pagination
          currentPage={crud.page}
          totalPages={crud.pagination.pages}
          totalItems={crud.pagination.total}
          onPageChange={crud.setPage}
          loading={crud.isLoading}
          className={styles.crudPagePagination}
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
                    const form = document.querySelector(`.${styles.crudForm}`);
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
                    const form = document.querySelector(`.${styles.crudForm}`);
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
    <form className={styles.crudForm} onSubmit={handleSubmit}>
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
            <label key={key} className={styles.crudFormField}>
              <span className={styles.crudFormLabel}>{label}</span>
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
          <label key={key} className={styles.crudFormField}>
            <span className={styles.crudFormLabel}>{label}</span>
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
