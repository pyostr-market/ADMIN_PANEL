import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { useCrudList, useCrudModal } from '../../../shared/lib/crud';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { SearchInput } from '../../../shared/ui/SearchInput/SearchInput';
import { Select } from '../../../shared/ui/Select/Select';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Tabs, Tab } from '../../../shared/ui/Tabs/Tabs';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getGlobalPermissionEffect,
  getViewPermissionEffect,
  isGlobalPermission,
  getPermissionSection,
  isViewPermission,
  buildPermissionBuckets,
} from '../../../shared/lib/permissions';
import {
  getPermissionsRequest,
  createPermissionRequest,
  updatePermissionRequest,
  deletePermissionRequest,
  getGroupsRequest,
  createGroupRequest,
  updateGroupRequest,
  deleteGroupRequest,
} from '../api/permissionsGroupsApi';
import styles from './PermissionsGroupsPage.module.css';

const TABS = {
  permissions: 'permissions',
  groups: 'groups',
};

const PAGE_LIMIT = 20;

function normalizeGroup(group) {
  const permissionIds = Array.isArray(group.permission_ids)
    ? group.permission_ids
    : Array.isArray(group.permissions)
      ? group.permissions.map((permission) => permission.id).filter(Boolean)
      : [];

  return {
    id: group.id,
    name: group.name,
    description: group.description ?? '',
    permission_ids: permissionIds,
  };
}

function PermissionEditModal({ permission, onClose, onSubmit, isSubmitting }) {
  const [name, setName] = useState(permission?.name ?? '');
  const [description, setDescription] = useState(permission?.description ?? '');

  useEffect(() => {
    setName(permission?.name ?? '');
    setDescription(permission?.description ?? '');
  }, [permission]);

  if (!permission) {
    return null;
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Редактирование права"
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={() => {
              onSubmit({
                name: name.trim(),
                description: description.trim() || null,
              });
            }}
            disabled={isSubmitting || !name.trim()}
          >
            Сохранить
          </Button>
        </>
      )}
    >
      <form className="crud-form">
        <label className="crud-form__field">
          <span className="crud-form__label">Ключ</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="crud-form__field">
          <span className="crud-form__label">Описание</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Описание права"
          />
        </label>
      </form>
    </Modal>
  );
}

function PermissionCreateModal({ onClose, onSubmit, isSubmitting }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Создание права"
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={() => {
              onSubmit({
                name: name.trim(),
                description: description.trim() || null,
              });
            }}
            disabled={isSubmitting || !name.trim()}
          >
            Создать
          </Button>
        </>
      )}
    >
      <form className="crud-form">
        <label className="crud-form__field">
          <span className="crud-form__label">Ключ</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Например: product:view"
          />
        </label>
        <label className="crud-form__field">
          <span className="crud-form__label">Описание</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Описание права"
          />
        </label>
      </form>
    </Modal>
  );
}

function GroupModal({
  group,
  permissions,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const [name, setName] = useState(group?.name ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  const [selectedPermissions, setSelectedPermissions] = useState(
    group?.permission_ids ?? [],
  );
  const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');

  const buckets = useMemo(() => buildPermissionBuckets(permissions), [permissions]);
  const sectionKeys = useMemo(() => Object.keys(buckets).sort((a, b) => a.localeCompare(b)), [buckets]);

  useEffect(() => {
    setName(group?.name ?? '');
    setDescription(group?.description ?? '');
    setSelectedPermissions(group?.permission_ids ?? []);
  }, [group]);

  useEffect(() => {
    if (sectionKeys.length === 0) {
      return;
    }

    setExpandedSections((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }

      return sectionKeys.reduce((acc, key, index) => {
        acc[key] = index === 0;
        return acc;
      }, {});
    });
  }, [sectionKeys]);

  const togglePermission = (permissionId) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) {
      return;
    }

    const permissionName = permission.name;
    const section = getPermissionSection(permissionName);
    const isGlobal = isGlobalPermission(permissionName);
    const isView = isViewPermission(permissionName);

    setSelectedPermissions((prev) => {
      const isSelected = prev.includes(permissionId);

      // Если снимаем галочку с глобального права
      if (isGlobal && isSelected) {
        return prev.filter(id => id !== permissionId);
      }

      // Если ставим галочку на глобальное право
      if (isGlobal && !isSelected) {
        // Снимаем все остальные права в этой секции
        const filtered = prev.filter(id => {
          const otherPerm = permissions.find(p => p.id === id);
          const otherSection = getPermissionSection(otherPerm?.name);
          return otherSection !== section;
        });
        // Добавляем только глобальное право
        return [...filtered, permissionId];
      }

      // Если ставим галочку на не-global право
      if (!isGlobal && !isSelected) {
        // Проверяем, есть ли глобальное право для этой секции
        const hasGlobalInSection = prev.some(id => {
          const otherPerm = permissions.find(p => p.id === id);
          return isGlobalPermission(otherPerm?.name) && getPermissionSection(otherPerm?.name) === section;
        });

        // Если есть глобальное, сначала снимаем его
        let newPermissions = prev;
        if (hasGlobalInSection) {
          const globalPerm = permissions.find(p =>
            isGlobalPermission(p?.name) && getPermissionSection(p?.name) === section
          );
          if (globalPerm) {
            newPermissions = prev.filter(id => id !== globalPerm.id);
          }
        }

        // Добавляем выбранное право
        newPermissions = [...newPermissions, permissionId];

        // Авто-выбираем view, если это не view
        if (!isView && section) {
          const viewPermission = permissions.find(p => p.name === `${section}:view`);
          if (viewPermission && !newPermissions.includes(viewPermission.id)) {
            newPermissions.push(viewPermission.id);
          }
        }

        return newPermissions;
      }

      // Если снимаем галочку с не-global права
      if (!isGlobal && isSelected) {
        // Если это view, проверяем, есть ли другие права в этой секции
        if (isView) {
          const otherInSection = permissions.filter(p => {
            const pSection = getPermissionSection(p.name);
            return pSection === section && !isViewPermission(p.name) && prev.includes(p.id);
          });

          // Если есть другие выбранные права в секции, нельзя снять view
          if (otherInSection.length > 0) {
            return prev;
          }
        }

        return prev.filter(id => id !== permissionId);
      }

      return prev;
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const expandAllSections = () => {
    const allExpanded = sectionKeys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setExpandedSections(allExpanded);
  };

  const collapseAllSections = () => {
    setExpandedSections({});
  };

  /**
   * Определяет состояние чекбокса для права
   * Возвращает { disabled: boolean, checked: boolean, locked: boolean }
   */
  const getPermissionCheckboxState = (permission) => {
    const permissionName = permission.name;
    const section = getPermissionSection(permissionName);
    const isGlobal = isGlobalPermission(permissionName);
    const isView = isViewPermission(permissionName);
    const isChecked = selectedPermissions.includes(permission.id);

    // Проверяем, есть ли глобальное право для этой секции среди выбранных
    const hasGlobalInSection = selectedPermissions.some(id => {
      const otherPerm = permissions.find(p => p.id === id);
      return isGlobalPermission(otherPerm?.name) && getPermissionSection(otherPerm?.name) === section;
    });

    const globalPermInSection = hasGlobalInSection
      ? permissions.find(p =>
          isGlobalPermission(p?.name) && getPermissionSection(p?.name) === section
        )
      : null;

    // Если есть глобальное право в секции и это не оно само
    if (hasGlobalInSection && globalPermInSection && globalPermInSection.id !== permission.id) {
      return {
        disabled: true,
        checked: true,
        locked: true,
        lockedBy: globalPermInSection,
      };
    }

    // Если это view право, проверяем, есть ли другие права в секции
    if (isView) {
      const otherInSection = permissions.filter(p => {
        const pSection = getPermissionSection(p.name);
        return pSection === section && !isViewPermission(p.name) && selectedPermissions.includes(p.id);
      });

      if (otherInSection.length > 0) {
        return {
          disabled: true,
          checked: true,
          locked: true,
          lockedBy: 'dependency',
        };
      }
    }

    // Обычное состояние
    return {
      disabled: false,
      checked: isChecked,
      locked: false,
      lockedBy: null,
    };
  };

  const filteredBuckets = useMemo(() => {
    if (!searchQuery && selectedSectionFilter === 'all') {
      return buckets;
    }

    const result = {};
    const query = searchQuery.toLowerCase();

    sectionKeys.forEach((section) => {
      if (selectedSectionFilter !== 'all' && section !== selectedSectionFilter) {
        return;
      }

      const sectionPermissions = buckets[section] ?? [];
      const filtered = sectionPermissions.filter((permission) => {
        const matchesSearch = !searchQuery
          || permission.name.toLowerCase().includes(query)
          || (permission.description && permission.description.toLowerCase().includes(query));

        return matchesSearch;
      });

      if (filtered.length > 0) {
        result[section] = filtered;
      }
    });

    return result;
  }, [buckets, sectionKeys, searchQuery, selectedSectionFilter]);

  const filteredSectionKeys = Object.keys(filteredBuckets);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={group ? 'Редактирование группы' : 'Создание группы'}
      size="xl"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={() => {
              onSubmit({
                name: name.trim(),
                description: description.trim() || null,
                permission_ids: selectedPermissions.slice().sort((a, b) => a - b),
              });
            }}
            disabled={isSubmitting || !name.trim()}
          >
            Сохранить
          </Button>
        </>
      )}
    >
      <div className={styles.groupForm}>
        <label className={styles.crudFormField}>
          <span className={styles.crudFormLabel}>Название группы</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className={styles.crudFormField}>
          <span className={styles.crudFormLabel}>Описание</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Описание группы"
          />
        </label>

        <div className={styles.groupPermissionsPicker}>
          <div className={styles.groupPermissionsPickerHeader}>
            <p className={styles.groupPermissionsPickerTitle}>Права группы</p>
            <div className={styles.groupPermissionsPickerActions}>
              <Button variant="secondary" size="sm" onClick={expandAllSections} disabled={filteredSectionKeys.length === 0}>
                Развернуть все
              </Button>
              <Button variant="secondary" size="sm" onClick={collapseAllSections} disabled={filteredSectionKeys.length === 0}>
                Свернуть все
              </Button>
            </div>
          </div>

          <div className={styles.groupPermissionsFilters}>
            <div className={styles.groupPermissionsFiltersSearch}>
              <FiSearch className={styles.groupPermissionsFiltersIcon} />
              <input
                type="text"
                placeholder="Поиск прав..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className={styles.groupPermissionsFiltersSection}>
              <Select
                value={selectedSectionFilter}
                onChange={(event) => setSelectedSectionFilter(event.target.value)}
                options={[
                  { value: 'all', label: 'Все разделы' },
                  ...sectionKeys.map((section) => ({ value: section, label: section })),
                ]}
              />
            </div>
          </div>

          {filteredSectionKeys.length === 0 && (
            <p className={styles.permissionsGroupsPageEmpty}>
              {searchQuery || selectedSectionFilter !== 'all'
                ? 'По вашему запросу ничего не найдено.'
                : 'Список прав пуст.'}
            </p>
          )}

          {filteredSectionKeys.map((section) => {
            const sectionPermissions = filteredBuckets[section] ?? [];
            const selectedInSection = sectionPermissions.filter((item) => selectedPermissions.includes(item.id)).length;

            return (
              <div key={section} className={styles.groupPermissionsSection}>
                <button
                  type="button"
                  className={styles.groupPermissionsSectionTrigger}
                  onClick={() => toggleSection(section)}
                >
                  <span>{section}</span>
                  <span>{selectedInSection}/{sectionPermissions.length}</span>
                </button>
                {expandedSections[section] && (
                  <div className={styles.groupPermissionsSectionItems}>
                    {sectionPermissions.map((permission) => {
                      const checkboxState = getPermissionCheckboxState(permission);

                      return (
                        <label
                          key={permission.id}
                          className={`${styles.groupPermissionItem}${checkboxState.locked ? ` ${styles.groupPermissionItemLocked}` : ''}`}
                          title={checkboxState.lockedBy
                            ? `Заблокировано: ${checkboxState.lockedBy === 'dependency' ? 'требуется для других прав' : checkboxState.lockedBy.name}`
                            : ''}
                        >
                          <input
                            type="checkbox"
                            checked={checkboxState.checked}
                            onChange={() => togglePermission(permission.id)}
                            disabled={checkboxState.disabled}
                          />
                          <span>
                            <strong>{permission.name}</strong>
                            {permission.description ? ` — ${permission.description}` : ''}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

export function PermissionsGroupsPage() {
  const [activeTab, setActiveTab] = useState(TABS.permissions);
  const [permissionsForModal, setPermissionsForModal] = useState([]);
  const [isPermissionsModalLoading, setPermissionsModalLoading] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);

  const notifications = useNotifications();
  const permissionsModal = useCrudModal();
  const groupsModal = useCrudModal();

  const permissionsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getPermissionsRequest({ page, limit, search });
      return data;
    },
    createFn: createPermissionRequest,
    updateFn: updatePermissionRequest,
    deleteFn: deletePermissionRequest,
    entityName: 'Право',
    entityNamePlural: 'Права',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const groupsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      try {
        const data = await getGroupsRequest({ page, limit, search });
        return {
          ...data,
          items: data.items.map(normalizeGroup),
        };
      } catch (error) {
        if (error?.response?.status === 405 || error?.response?.status === 404) {
          return { items: [], pagination: { page, limit, total: 0, pages: 1 } };
        }
        throw error;
      }
    },
    createFn: createGroupRequest,
    updateFn: updateGroupRequest,
    deleteFn: deleteGroupRequest,
    entityName: 'Группа',
    entityNamePlural: 'Группы',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const hasLoadedPermissionsForModalRef = useRef(false);

  const loadAllPermissionsForGroupModal = async () => {
    if (permissionsForModal.length > 0 || hasLoadedPermissionsForModalRef.current) {
      return;
    }

    setPermissionsModalLoading(true);

    try {
      const firstPage = await getPermissionsRequest({ page: 1, limit: 100 });
      const allItems = [...firstPage.items];
      const totalPages = firstPage.pagination?.pages ?? 1;

      for (let page = 2; page <= totalPages; page += 1) {
        const pageData = await getPermissionsRequest({ page, limit: 100 });
        allItems.push(...pageData.items);
      }

      setPermissionsForModal(allItems);
      hasLoadedPermissionsForModalRef.current = true;
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setPermissionsModalLoading(false);
    }
  };

  const handlePermissionCreate = async (payload) => {
    const result = await permissionsCrud.create(payload);
    if (result) {
      permissionsModal.closeCreateModal();
    }
  };

  const handlePermissionSave = async (payload) => {
    if (!permissionsModal.editingItem) return;

    const result = await permissionsCrud.update(permissionsModal.editingItem.id, payload);
    if (result) {
      permissionsModal.closeEditModal();
    }
  };

  const handleGroupSave = async (payload) => {
    let result;
    if (groupsModal.editingItem) {
      result = await groupsCrud.update(groupsModal.editingItem.id, payload);
    } else {
      result = await groupsCrud.create(payload);
    }
    if (result) {
      groupsModal.closeModal();
    }
  };

  const handleDeleteClick = (permission) => {
    setPermissionToDelete(permission);
  };

  const handleConfirmDelete = async () => {
    if (!permissionToDelete) return;
    const result = await permissionsCrud.delete(permissionToDelete.id);
    if (result) {
      setPermissionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setPermissionToDelete(null);
  };

  const permissionBuckets = useMemo(() => buildPermissionBuckets(permissionsCrud.items || []), [permissionsCrud.items]);
  const permissionSectionKeys = useMemo(() => Object.keys(permissionBuckets).sort((a, b) => a.localeCompare(b)), [permissionBuckets]);

  return (
    <section className={styles.permissionsGroupsPage}>
      <header className={styles.permissionsGroupsPageHeader}>
        <h1 className={styles.permissionsGroupsPageTitle}>Права и группы</h1>
        <div className={styles.permissionsGroupsPageControls}>
          {activeTab === TABS.groups ? (
            <Button
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={async () => {
                await loadAllPermissionsForGroupModal();
                groupsModal.openCreateModal();
              }}
              disabled={isPermissionsModalLoading}
            >
              {isPermissionsModalLoading ? 'Загрузка прав...' : 'Создать группу'}
            </Button>
          ) : (
            <PermissionGate permission="permission:create" fallback={null}>
              <Button
                variant="primary"
                leftIcon={<FiPlus />}
                onClick={permissionsModal.openCreateModal}
              >
                Создать право
              </Button>
            </PermissionGate>
          )}
        </div>
      </header>

      <Tabs className={styles.permissionsGroupsPageTabs}>
        <Tab
          active={activeTab === TABS.permissions}
          onClick={() => setActiveTab(TABS.permissions)}
        >
          Права
        </Tab>
        <Tab
          active={activeTab === TABS.groups}
          onClick={() => setActiveTab(TABS.groups)}
        >
          Группы
        </Tab>
      </Tabs>

      {activeTab === TABS.permissions && (
        <CrudListLayout
          header={null}
          showSearch={true}
          searchValue={permissionsCrud.search}
          onSearchChange={permissionsCrud.setSearch}
          searchLoading={permissionsCrud.isLoading}
          searchPlaceholder="Поиск прав..."
          showFilters={true}
          filters={{}}
          filterConfigs={[
            {
              key: 'section',
              label: 'Раздел',
              options: [
                { value: 'all', label: 'Все разделы' },
                ...permissionSectionKeys.map((section) => ({ value: section, label: section })),
              ],
            },
          ]}
          onFilterChange={() => {}}
          onResetFilters={() => {}}
          hasActiveFilters={false}
          pagination={
            !permissionsCrud.isLoading && permissionsCrud.items && permissionsCrud.items.length > 0 ? (
              <Pagination
                currentPage={permissionsCrud.page}
                totalPages={permissionsCrud.pagination.pages}
                totalItems={permissionsCrud.pagination.total}
                onPageChange={permissionsCrud.setPage}
                loading={permissionsCrud.isLoading}
              />
            ) : null
          }
        >
          <EntityList
            items={permissionsCrud.items}
            renderItem={(permission) => (
              <>
                <div className="entity-item__content">
                  <div className="entity-item__main">
                    <div className="entity-item__info">
                      <div className="entity-item__header">
                        <p className="entity-item__title">{permission.name}</p>
                      </div>
                      <div className="entity-item__meta">
                        <span className="entity-item__description">
                          {permission.description || 'Без описания'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="entity-item__actions">
                  <PermissionGate permission="permission:update" fallback={null}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiEdit2 />}
                      onClick={() => permissionsModal.openEditModal(permission)}
                    >
                      Редактировать
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="permission:delete" fallback={null}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(permission)}
                      disabled={permissionsCrud.isSubmitting}
                    >
                      <FiTrash2 />
                    </Button>
                  </PermissionGate>
                </div>
              </>
            )}
            emptyMessage={
              permissionsCrud.isLoading
                ? 'Загрузка прав...'
                : permissionsCrud.search
                  ? 'По вашему запросу ничего не найдено.'
                  : 'Права не найдены.'
            }
            loading={permissionsCrud.isLoading}
          />
        </CrudListLayout>
      )}

      {activeTab === TABS.groups && (
        <CrudListLayout
          header={null}
          showSearch={true}
          searchValue={groupsCrud.search}
          onSearchChange={groupsCrud.setSearch}
          searchLoading={groupsCrud.isLoading}
          searchPlaceholder="Поиск групп..."
          showFilters={false}
          pagination={
            !groupsCrud.isLoading && groupsCrud.items && groupsCrud.items.length > 0 ? (
              <Pagination
                currentPage={groupsCrud.page}
                totalPages={groupsCrud.pagination.pages}
                totalItems={groupsCrud.pagination.total}
                onPageChange={groupsCrud.setPage}
                loading={groupsCrud.isLoading}
              />
            ) : null
          }
        >
          <EntityList
            items={groupsCrud.items}
            renderItem={(group) => (
              <>
                <div className="entity-item__content">
                  <div className="entity-item__main">
                    <div className="entity-item__info">
                      <div className="entity-item__header">
                        <p className="entity-item__title">{group.name}</p>
                      </div>
                      <div className="entity-item__meta">
                        <span className="entity-item__description">
                          {group.description || 'Без описания'}
                        </span>
                        <span className="entity-item__separator">•</span>
                        <span className="entity-item__meta-item">
                          <span className="entity-item__meta-label">Прав:</span>{' '}
                          {Array.isArray(group.permission_ids) ? group.permission_ids.length : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="entity-item__actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEdit2 />}
                    onClick={async () => {
                      await loadAllPermissionsForGroupModal();
                      groupsModal.openEditModal(group);
                    }}
                    disabled={isPermissionsModalLoading}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => groupsModal.openEditModal(group)}
                    disabled={groupsCrud.isSubmitting}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </>
            )}
            emptyMessage={
              groupsCrud.isLoading
                ? 'Загрузка групп...'
                : groupsCrud.search
                  ? 'По вашему запросу ничего не найдено.'
                  : 'Группы не найдены.'
            }
            loading={groupsCrud.isLoading}
          />
        </CrudListLayout>
      )}

      {/* Модальные окна для прав */}
      {permissionsModal.isCreateModalOpen && (
        <PermissionCreateModal
          onClose={permissionsModal.closeCreateModal}
          onSubmit={handlePermissionCreate}
          isSubmitting={permissionsCrud.isSubmitting}
        />
      )}

      {permissionsModal.isOpen && permissionsModal.editingItem && (
        <PermissionEditModal
          permission={permissionsModal.editingItem}
          onClose={permissionsModal.closeEditModal}
          onSubmit={handlePermissionSave}
          isSubmitting={permissionsCrud.isSubmitting}
        />
      )}

      {/* Модальное окно для групп */}
      {(groupsModal.isOpen || groupsModal.isCreateModalOpen) && (
        <GroupModal
          group={groupsModal.editingItem}
          permissions={permissionsForModal}
          onClose={groupsModal.closeModal}
          onSubmit={handleGroupSave}
          isSubmitting={groupsCrud.isSubmitting || isPermissionsModalLoading}
        />
      )}

      {/* Подтверждение удаления права */}
      {permissionToDelete && (
        <Modal
          isOpen
          onClose={handleCancelDelete}
          title="Удаление права"
          size="sm"
          footer={(
            <>
              <Button variant="secondary" onClick={handleCancelDelete}>Отмена</Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                loading={permissionsCrud.isSubmitting}
              >
                Удалить
              </Button>
            </>
          )}
        >
          <p className={styles.permissionsGroupsPageConfirmText}>
            Вы уверены, что хотите удалить право{' '}
            <strong>{permissionToDelete.name}</strong>?
          </p>
        </Modal>
      )}
    </section>
  );
}
