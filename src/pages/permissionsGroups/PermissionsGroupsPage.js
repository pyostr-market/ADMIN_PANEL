import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import {
  createGroupRequest,
  createPermissionRequest,
  deleteGroupRequest,
  getGroupsRequest,
  getPermissionsRequest,
  updateGroupRequest,
  updatePermissionRequest,
} from './api/permissionsGroupsApi';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import './PermissionsGroupsPage.css';

const TABS = {
  permissions: 'permissions',
  groups: 'groups',
};

const PAGE_LIMIT = 20;
const EMPTY_PAGINATION = { page: 1, limit: PAGE_LIMIT, total: 0, pages: 1 };

function buildPermissionBuckets(permissions) {
  return permissions.reduce((acc, permission) => {
    const key = typeof permission.name === 'string'
      ? permission.name.split(':').filter(Boolean)[0] || 'other'
      : 'other';

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(permission);
    return acc;
  }, {});
}

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
    <div className="entity-modal-overlay" role="presentation" onClick={onClose}>
      <div className="entity-modal" role="dialog" aria-modal="true" aria-label="Редактирование права" onClick={(event) => event.stopPropagation()}>
        <div className="entity-modal__header">
          <h3>Редактирование права</h3>
          <button type="button" className="entity-modal__icon-btn" onClick={onClose} aria-label="Закрыть окно">
            <FiX />
          </button>
        </div>
        <form
          className="entity-modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              name: name.trim(),
              description: description.trim() || null,
            });
          }}
        >
          <label className="entity-field">
            <span>Ключ</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label className="entity-field">
            <span>Описание</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Описание права"
            />
          </label>
          <div className="entity-modal__actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" disabled={isSubmitting || !name.trim()}>ОК</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PermissionCreateModal({ onClose, onSubmit, isSubmitting }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="entity-modal-overlay" role="presentation" onClick={onClose}>
      <div className="entity-modal" role="dialog" aria-modal="true" aria-label="Создание права" onClick={(event) => event.stopPropagation()}>
        <div className="entity-modal__header">
          <h3>Создание права</h3>
          <button type="button" className="entity-modal__icon-btn" onClick={onClose} aria-label="Закрыть окно">
            <FiX />
          </button>
        </div>
        <form
          className="entity-modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              name: name.trim(),
              description: description.trim() || null,
            });
          }}
        >
          <label className="entity-field">
            <span>Ключ</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Например: product:view"
            />
          </label>
          <label className="entity-field">
            <span>Описание</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Описание права"
            />
          </label>
          <div className="entity-modal__actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" disabled={isSubmitting || !name.trim()}>Создать</button>
          </div>
        </form>
      </div>
    </div>
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
    setSelectedPermissions((prev) => (
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    ));
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
    <div className="entity-modal-overlay" role="presentation" onClick={onClose}>
      <div className="entity-modal entity-modal--wide" role="dialog" aria-modal="true" aria-label="Редактирование группы" onClick={(event) => event.stopPropagation()}>
        <div className="entity-modal__header">
          <h3>{group ? 'Редактирование группы' : 'Создание группы'}</h3>
          <button type="button" className="entity-modal__icon-btn" onClick={onClose} aria-label="Закрыть окно">
            <FiX />
          </button>
        </div>
        <form
          className="entity-modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              name: name.trim(),
              description: description.trim() || null,
              permission_ids: selectedPermissions.slice().sort((a, b) => a - b),
            });
          }}
        >
          <label className="entity-field">
            <span>Название группы</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label className="entity-field">
            <span>Описание</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Описание группы"
            />
          </label>

          <div className="group-permissions-picker">
            <div className="group-permissions-picker__header">
              <p className="group-permissions-picker__title">Права группы</p>
              <div className="group-permissions-picker__actions">
                <button type="button" onClick={expandAllSections} disabled={filteredSectionKeys.length === 0}>
                  Развернуть все
                </button>
                <button type="button" onClick={collapseAllSections} disabled={filteredSectionKeys.length === 0}>
                  Свернуть все
                </button>
              </div>
            </div>

            <div className="group-permissions-filters">
              <div className="group-permissions-filters__search">
                <FiSearch className="group-permissions-filters__icon" />
                <input
                  type="text"
                  placeholder="Поиск прав..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="group-permissions-filters__section">
                <select
                  value={selectedSectionFilter}
                  onChange={(event) => setSelectedSectionFilter(event.target.value)}
                >
                  <option value="all">Все разделы</option>
                  {sectionKeys.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredSectionKeys.length === 0 && (
              <p className="permissions-groups-page__empty">
                {searchQuery || selectedSectionFilter !== 'all'
                  ? 'По вашему запросу ничего не найдено.'
                  : 'Список прав пуст.'}
              </p>
            )}

            {filteredSectionKeys.map((section) => {
              const sectionPermissions = filteredBuckets[section] ?? [];
              const selectedInSection = sectionPermissions.filter((item) => selectedPermissions.includes(item.id)).length;

              return (
                <div key={section} className="group-permissions-section">
                  <button
                    type="button"
                    className="group-permissions-section__trigger"
                    onClick={() => toggleSection(section)}
                  >
                    <span>{section}</span>
                    <span>{selectedInSection}/{sectionPermissions.length}</span>
                  </button>
                  {expandedSections[section] && (
                    <div className="group-permissions-section__items">
                      {sectionPermissions.map((permission) => (
                        <label key={permission.id} className="group-permission-item">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <span>
                            <strong>{permission.name}</strong>
                            {permission.description ? ` — ${permission.description}` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="entity-modal__actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" disabled={isSubmitting || !name.trim()}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PermissionsGroupsPage() {
  const [activeTab, setActiveTab] = useState(TABS.permissions);

  const [permissions, setPermissions] = useState([]);
  const [permissionsForModal, setPermissionsForModal] = useState([]);
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [permissionsPagination, setPermissionsPagination] = useState(EMPTY_PAGINATION);
  const [permissionsSearch, setPermissionsSearch] = useState('');
  const [permissionsSectionFilter, setPermissionsSectionFilter] = useState('all');

  const [groups, setGroups] = useState([]);
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsPagination, setGroupsPagination] = useState(EMPTY_PAGINATION);
  const [groupsSearch, setGroupsSearch] = useState('');

  const [isPermissionsLoading, setPermissionsLoading] = useState(true);
  const [isGroupsLoading, setGroupsLoading] = useState(false);
  const [isGroupsApiUnsupported, setGroupsApiUnsupported] = useState(false);
  const [isPermissionsModalLoading, setPermissionsModalLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const hasLoadedPermissionsRef = useRef(false);
  const hasLoadedGroupsRef = useRef(false);
  const hasLoadedPermissionsForModalRef = useRef(false);

  const [editingPermission, setEditingPermission] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  const notifications = useNotifications();

  const refreshPermissions = useCallback(async (page, search) => {
    setPermissionsLoading(true);

    try {
      const permissionsData = await getPermissionsRequest({ page, limit: PAGE_LIMIT, search: search || undefined });
      setPermissions(permissionsData.items);
      setPermissionsPagination(permissionsData.pagination ?? EMPTY_PAGINATION);
      hasLoadedPermissionsRef.current = true;
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setPermissionsLoading(false);
    }
  }, [notifications]);

  const refreshGroups = useCallback(async (page, search) => {
    setGroupsLoading(true);

    try {
      const groupsData = await getGroupsRequest({ page, limit: PAGE_LIMIT, search: search || undefined });
      setGroups(groupsData.items.map(normalizeGroup));
      setGroupsPagination(groupsData.pagination ?? EMPTY_PAGINATION);
      setGroupsApiUnsupported(false);
      hasLoadedGroupsRef.current = true;
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (error?.response?.status === 405 || error?.response?.status === 404) {
        setGroupsApiUnsupported(true);
        setGroups([]);
        setGroupsPagination(EMPTY_PAGINATION);
        notifications.warning(message);
      } else {
        notifications.error(message);
      }
    } finally {
      setGroupsLoading(false);
    }
  }, [notifications]);

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

  useEffect(() => {
    if (activeTab === TABS.permissions && !hasLoadedPermissionsRef.current) {
      refreshPermissions(permissionsPage, permissionsSearch);
    }
  }, [activeTab, refreshPermissions]);

  useEffect(() => {
    if (activeTab === TABS.permissions && hasLoadedPermissionsRef.current) {
      refreshPermissions(permissionsPage, permissionsSearch);
    }
  }, [permissionsPage, permissionsSearch, refreshPermissions]);

  useEffect(() => {
    if (activeTab === TABS.groups && !isGroupsApiUnsupported && !hasLoadedGroupsRef.current) {
      refreshGroups(groupsPage, groupsSearch);
    }
  }, [activeTab, isGroupsApiUnsupported, refreshGroups]);

  useEffect(() => {
    if (activeTab === TABS.groups && !isGroupsApiUnsupported && hasLoadedGroupsRef.current) {
      refreshGroups(groupsPage, groupsSearch);
    }
  }, [groupsPage, groupsSearch, refreshGroups]);

  const handlePermissionSave = async (payload) => {
    if (!editingPermission) {
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updatePermissionRequest(editingPermission.id, payload);
      setPermissions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setPermissionsForModal((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingPermission(null);
      notifications.info(`Право "${updated.name}" обновлено`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionCreate = async (payload) => {
    setSubmitting(true);
    try {
      const created = await createPermissionRequest(payload);
      setPermissions((prev) => [created, ...prev]);
      setPermissionsForModal((prev) => [created, ...prev]);
      setPermissionModalOpen(false);
      refreshPermissions(permissionsPage, permissionsSearch);
      notifications.info(`Право "${created.name}" создано`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupSave = async (payload) => {
    setSubmitting(true);

    try {
      if (editingGroup) {
        await updateGroupRequest(editingGroup.id, payload);
        notifications.info(`Группа "${payload.name}" обновлена`);
      } else {
        await createGroupRequest(payload);
        notifications.info(`Группа "${payload.name}" создана`);
      }

      setGroupModalOpen(false);
      setEditingGroup(null);
      refreshGroups(groupsPage, groupsSearch);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupDelete = async (groupId) => {
    const shouldDelete = window.confirm('Удалить группу?');
    if (!shouldDelete) {
      return;
    }

    setSubmitting(true);

    try {
      await deleteGroupRequest(groupId);
      refreshGroups(groupsPage, groupsSearch);
      notifications.info('Группа удалена');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPermissions = useMemo(() => {
    if (permissionsSectionFilter === 'all') {
      return permissions;
    }

    return permissions.filter((permission) => {
      const permissionSection = permission.name.split(':')[0] || 'other';
      return permissionSection === permissionsSectionFilter;
    });
  }, [permissions, permissionsSectionFilter]);

  const permissionBuckets = useMemo(() => buildPermissionBuckets(permissions), [permissions]);
  const permissionSectionKeys = useMemo(() => Object.keys(permissionBuckets).sort((a, b) => a.localeCompare(b)), [permissionBuckets]);

  const filteredGroups = useMemo(() => {
    return groups;
  }, [groups]);

  return (
    <section className="permissions-groups-page">
      {/* Фиксированный заголовок страницы */}
      <header className="permissions-groups-page__header">
        <h1 className="permissions-groups-page__title">Права и группы</h1>
        <div className="permissions-groups-page__controls">
          {activeTab === TABS.groups ? (
            <button
              type="button"
              className="permissions-groups-page__create-btn"
              onClick={async () => {
                await loadAllPermissionsForGroupModal();
                setEditingGroup(null);
                setGroupModalOpen(true);
              }}
              disabled={isPermissionsModalLoading}
            >
              <FiPlus />
              <span>{isPermissionsModalLoading ? 'Загрузка прав...' : 'Создать группу'}</span>
            </button>
          ) : (
            <PermissionGate permission="permission:create" fallback={null}>
              <button
                type="button"
                className="permissions-groups-page__create-btn"
                onClick={() => {
                  setPermissionModalOpen(true);
                }}
              >
                <FiPlus />
                <span>Создать право</span>
              </button>
            </PermissionGate>
          )}
        </div>
      </header>

      {/* Вкладки навигации */}
      <div className="permissions-groups-page__tabs" role="tablist" aria-label="Права и группы">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === TABS.permissions}
          className={`permissions-groups-page__tab${activeTab === TABS.permissions ? ' permissions-groups-page__tab--active' : ''}`}
          onClick={() => setActiveTab(TABS.permissions)}
        >
          Права
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === TABS.groups}
          className={`permissions-groups-page__tab${activeTab === TABS.groups ? ' permissions-groups-page__tab--active' : ''}`}
          onClick={() => setActiveTab(TABS.groups)}
        >
          Группы
        </button>
      </div>

      {/* Контент вкладок */}
      <div className="permissions-groups-page__content">
        {/* Вкладка Права */}
        {activeTab === TABS.permissions && (
          <>
            <div className={`permissions-groups-page__filters${isPermissionsLoading ? ' permissions-groups-page__filters--loading' : ''}`}>
              <div className={`permissions-groups-page__search${isPermissionsLoading ? ' permissions-groups-page__search--loading' : ''}`}>
                <FiSearch className="permissions-groups-page__icon" />
                <input
                  type="text"
                  placeholder="Поиск прав..."
                  value={permissionsSearch}
                  onChange={(event) => setPermissionsSearch(event.target.value)}
                />
              </div>
              <div className="permissions-groups-page__filters-actions">
                <div className="permissions-groups-page__section-filter">
                  <select
                    value={permissionsSectionFilter}
                    onChange={(event) => setPermissionsSectionFilter(event.target.value)}
                    disabled={isPermissionsLoading}
                  >
                    <option value="all">Все разделы</option>
                    {permissionSectionKeys.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {isPermissionsLoading && (
              <p className="permissions-groups-page__empty">Загрузка...</p>
            )}

            <div className="entity-list-table">
              {filteredPermissions.length === 0 && permissions.length > 0 && (
                <p className="permissions-groups-page__empty">По выбранному разделу ничего не найдено.</p>
              )}

              {filteredPermissions.length === 0 && permissions.length === 0 && (
                <p className="permissions-groups-page__empty">Права не найдены.</p>
              )}

              {filteredPermissions.map((permission) => (
                <article key={permission.id} className="entity-list-row">
                  <div className="entity-list-row__content">
                    <p className="entity-list-row__title">{permission.name}</p>
                    <p className="entity-list-row__description">{permission.description || 'Без описания'}</p>
                  </div>
                  <div className="entity-list-row__actions">
                    <button
                      type="button"
                      className="entity-icon-btn"
                      aria-label={`Изменить право ${permission.name}`}
                      onClick={() => setEditingPermission(permission)}
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="entity-pagination">
              <button
                type="button"
                disabled={isPermissionsLoading || permissionsPagination.page <= 1}
                onClick={() => setPermissionsPage((prev) => Math.max(prev - 1, 1))}
              >
                Назад
              </button>
              <span>
                Страница {permissionsPagination.page} из {Math.max(permissionsPagination.pages ?? 1, 1)} · всего {permissionsPagination.total ?? 0}
              </span>
              <button
                type="button"
                disabled={isPermissionsLoading || permissionsPagination.page >= (permissionsPagination.pages ?? 1)}
                onClick={() => setPermissionsPage((prev) => prev + 1)}
              >
                Вперед
              </button>
            </div>
          </>
        )}

        {/* Вкладка Группы */}
        {activeTab === TABS.groups && (
          <>
            <div className={`permissions-groups-page__filters${isGroupsLoading ? ' permissions-groups-page__filters--loading' : ''}`}>
              <div className={`permissions-groups-page__search${isGroupsLoading ? ' permissions-groups-page__search--loading' : ''}`}>
                <FiSearch className="permissions-groups-page__icon" />
                <input
                  type="text"
                  placeholder="Поиск групп..."
                  value={groupsSearch}
                  onChange={(event) => setGroupsSearch(event.target.value)}
                  disabled={isGroupsLoading}
                />
              </div>
              <div className="permissions-groups-page__filters-actions permissions-groups-page__filters-actions--empty" />
            </div>

            <div className="entity-list-table">
              {isGroupsLoading && (
                <p className="permissions-groups-page__empty">Загрузка...</p>
              )}

              {isGroupsApiUnsupported && (
                <p className="permissions-groups-page__error">API не поддерживает список групп.</p>
              )}

              {!isGroupsLoading && groups.length === 0 && !isGroupsApiUnsupported && (
                <p className="permissions-groups-page__empty">Группы не найдены.</p>
              )}

              {groups.map((group) => (
                <article key={group.id} className="entity-list-row">
                  <div className="entity-list-row__content">
                    <p className="entity-list-row__title">{group.name}</p>
                    <p className="entity-list-row__description">{group.description || 'Без описания'}</p>
                    <p className="entity-list-row__meta">
                      <FiCheck aria-hidden="true" /> Прав: {group.permission_ids.length}
                    </p>
                  </div>
                  <div className="entity-list-row__actions">
                    <button
                      type="button"
                      className="entity-icon-btn"
                      aria-label={`Изменить группу ${group.name}`}
                      onClick={async () => {
                        await loadAllPermissionsForGroupModal();
                        setEditingGroup(group);
                        setGroupModalOpen(true);
                      }}
                      disabled={isPermissionsModalLoading}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      className="entity-icon-btn entity-icon-btn--danger"
                      aria-label={`Удалить группу ${group.name}`}
                      onClick={() => handleGroupDelete(group.id)}
                      disabled={isSubmitting}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="entity-pagination">
              <button
                type="button"
                disabled={isGroupsLoading || groupsPagination.page <= 1}
                onClick={() => setGroupsPage((prev) => Math.max(prev - 1, 1))}
              >
                Назад
              </button>
              <span>
                Страница {groupsPagination.page} из {Math.max(groupsPagination.pages ?? 1, 1)} · всего {groupsPagination.total ?? 0}
              </span>
              <button
                type="button"
                disabled={isGroupsLoading || groupsPagination.page >= (groupsPagination.pages ?? 1)}
                onClick={() => setGroupsPage((prev) => prev + 1)}
              >
                Вперед
              </button>
            </div>
          </>
        )}
      </div>

      <PermissionEditModal
        permission={editingPermission}
        onClose={() => setEditingPermission(null)}
        onSubmit={handlePermissionSave}
        isSubmitting={isSubmitting}
      />

      {isPermissionModalOpen && (
        <PermissionCreateModal
          onClose={() => setPermissionModalOpen(false)}
          onSubmit={handlePermissionCreate}
          isSubmitting={isSubmitting}
        />
      )}

      {isGroupModalOpen && (
        <GroupModal
          group={editingGroup}
          permissions={permissionsForModal.length > 0 ? permissionsForModal : permissions}
          onClose={() => {
            setGroupModalOpen(false);
            setEditingGroup(null);
          }}
          onSubmit={handleGroupSave}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  );
}
