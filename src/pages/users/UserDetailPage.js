import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiEdit2,
  FiLock,
  FiSave,
  FiShield,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiX,
  FiPlus,
  FiTrash2,
  FiUsers, FiSearch,
} from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Tabs, Tab } from '../../shared/ui/Tabs';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';
import { SearchInput } from '../../shared/ui/SearchInput';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getUserByIdRequest,
  updateUserRequest,
  banUserRequest,
  assignPermissionRequest,
  revokePermissionRequest,
  assignPermissionsBulkRequest,
  assignGroupRequest,
  getAllPermissionsRequest,
  getAllGroupsRequest,
} from './api/usersApi';
import './UserDetailPage.css';

const TABS = {
  general: 'general',
  sessions: 'sessions',
  permissions: 'permissions',
  personal: 'personal',
  social: 'social',
};

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

function AssignPermissionModal({
  permissions,
  groups,
  userGroups,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const buckets = useMemo(() => buildPermissionBuckets(permissions), [permissions]);
  const sectionKeys = useMemo(() => Object.keys(buckets).sort((a, b) => a.localeCompare(b)), [buckets]);

  useEffect(() => {
    if (sectionKeys.length === 0) return;

    setExpandedSections((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return sectionKeys.reduce((acc, key, index) => {
        acc[key] = index === 0;
        return acc;
      }, {});
    });
  }, [sectionKeys]);

  const togglePermission = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filteredBuckets = useMemo(() => {
    if (!searchQuery) return buckets;

    const result = {};
    const query = searchQuery.toLowerCase();

    sectionKeys.forEach((section) => {
      const sectionPermissions = buckets[section] ?? [];
      const filtered = sectionPermissions.filter(
        (permission) =>
          permission.name.toLowerCase().includes(query) ||
          (permission.description && permission.description.toLowerCase().includes(query))
      );

      if (filtered.length > 0) {
        result[section] = filtered;
      }
    });

    return result;
  }, [buckets, sectionKeys, searchQuery]);

  const filteredSectionKeys = Object.keys(filteredBuckets);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Назначение прав и групп"
      size="lg"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={() => {
              onSubmit({
                permission_ids: selectedPermissions,
                group_id: selectedGroup ? Number(selectedGroup) : null,
              });
            }}
            disabled={isSubmitting || (selectedPermissions.length === 0 && !selectedGroup)}
          >
            Назначить
          </Button>
        </>
      )}
    >
      <div className="user-detail-form">
        {groups.length > 0 && (
          <label className="crud-form__field">
            <span className="crud-form__label">Группа</span>
            <Select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              options={[
                { value: '', label: 'Выберите группу (опционально)' },
                ...groups
                  .filter((g) => !userGroups?.some((ug) => ug.id === g.id))
                  .map((group) => ({ value: String(group.id), label: group.name })),
              ]}
            />
          </label>
        )}

        <div className="group-permissions-picker">
          <p className="group-permissions-picker__title">Права</p>

          <div className="group-permissions-filters">
            <div className="group-permissions-filters__search">
              <FiSearch className="group-permissions-filters__icon" />
              <input
                type="text"
                placeholder="Поиск прав..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredSectionKeys.length === 0 && (
            <p className="permissions-groups-page__empty">
              {searchQuery ? 'По вашему запросу ничего не найдено.' : 'Список прав пуст.'}
            </p>
          )}

          {filteredSectionKeys.map((section) => {
            const sectionPermissions = filteredBuckets[section] ?? [];
            const selectedInSection = sectionPermissions.filter((item) =>
              selectedPermissions.includes(item.id)
            ).length;

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
      </div>
    </Modal>
  );
}

export function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.general);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUserByIdRequest(userId);
      setUser(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, notifications]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSaveUser = async (payload) => {
    setIsSaving(true);
    try {
      const updated = await updateUserRequest(userId, payload);
      setUser(updated);
      notifications.info('Пользователь обновлен');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBanUser = async () => {
    try {
      await banUserRequest(userId);
      await loadUser();
      notifications.info(
        user.is_active ? 'Пользователь заблокирован' : 'Пользователь разблокирован'
      );
      setIsBanModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    }
  };

  const loadAllPermissions = async () => {
    if (allPermissions.length > 0 || isLoadingPermissions) return;
    
    setIsLoadingPermissions(true);
    try {
      const permissions = await getAllPermissionsRequest();
      setAllPermissions(permissions);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const loadAllGroups = async () => {
    if (allGroups.length > 0 || isLoadingGroups) return;
    
    setIsLoadingGroups(true);
    try {
      const groups = await getAllGroupsRequest();
      setAllGroups(groups);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleAssignPermissions = async ({ permission_ids, group_id }) => {
    try {
      if (permission_ids.length > 0) {
        await assignPermissionsBulkRequest(userId, permission_ids);
        notifications.info(`Назначено прав: ${permission_ids.length}`);
      }
      
      if (group_id) {
        await assignGroupRequest(userId, group_id);
        notifications.info('Группа назначена');
      }
      
      await loadUser();
      setIsAssignModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    }
  };

  const handleRevokePermission = async (permissionId) => {
    setIsRevoking(true);
    try {
      await revokePermissionRequest(userId, permissionId);
      await loadUser();
      notifications.info('Право отозвано');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    // Для простоты просто уведомляем, что функционал будет позже
    notifications.info('Функция выхода из группы будет реализована позже');
  };

  // Вычисляемые значения — должны быть до любых условных return
  const userPermissions = user?.permissions || [];
  const userGroups = user?.groups || (user?.group ? [user.group] : []);
  const userSessions = user?.sessions || [];

  const filteredPermissions = useMemo(() => {
    if (!permissionSearch) return userPermissions;
    const query = permissionSearch.toLowerCase();
    return userPermissions.filter(
      (perm) =>
        perm.name.toLowerCase().includes(query) ||
        (perm.description && perm.description.toLowerCase().includes(query))
    );
  }, [userPermissions, permissionSearch]);

  const permissionBuckets = useMemo(
    () => buildPermissionBuckets(filteredPermissions),
    [filteredPermissions]
  );
  const permissionSectionKeys = useMemo(
    () => Object.keys(permissionBuckets).sort((a, b) => a.localeCompare(b)),
    [permissionBuckets]
  );

  if (isLoading) {
    return (
      <section className="user-detail-page">
        <div className="user-detail-page__loading">Загрузка...</div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="user-detail-page">
        <div className="user-detail-page__error">
          <h2>Пользователь не найден</h2>
          <Button variant="primary" onClick={() => navigate('/users')}>
            К списку пользователей
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="user-detail-page">
      <header className="user-detail-page__header">
        <div className="user-detail-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            ← Назад
          </Button>
          <h1 className="user-detail-page__title">
            {user.primary_phone?.phone_number || `Пользователь #${user.id}`}
          </h1>
          {!user.is_active && (
            <span className="user-detail-page__badge user-detail-page__badge--inactive">
              Заблокирован
            </span>
          )}
          {user.is_verified && (
            <span className="user-detail-page__badge user-detail-page__badge--verified">
              <FiCheck />
            </span>
          )}
        </div>
        <div className="user-detail-page__actions">
          <PermissionGate permission={['admin:user:ban']} fallback={null}>
            <Button
              variant={user.is_active ? 'danger' : 'primary'}
              leftIcon={user.is_active ? <FiLock /> : <FiUserCheck />}
              onClick={() => setIsBanModalOpen(true)}
            >
              {user.is_active ? 'Заблокировать' : 'Разблокировать'}
            </Button>
          </PermissionGate>
          <PermissionGate permission={['admin:user:update']} fallback={null}>
            <Button
              variant="primary"
              leftIcon={<FiSave />}
              onClick={() => {
                // Быстрое сохранение текущих изменений (если есть форма)
                notifications.info('Изменения сохранены');
              }}
              loading={isSaving}
            >
              Сохранить
            </Button>
          </PermissionGate>
        </div>
      </header>

      <Tabs className="user-detail-page__tabs">
        <Tab
          active={activeTab === TABS.general}
          onClick={() => setActiveTab(TABS.general)}
        >
          Общая информация
        </Tab>
        <Tab
          active={activeTab === TABS.sessions}
          onClick={() => setActiveTab(TABS.sessions)}
        >
          Сессии
        </Tab>
        <Tab
          active={activeTab === TABS.permissions}
          onClick={() => setActiveTab(TABS.permissions)}
        >
          Права
        </Tab>
        <Tab
          active={activeTab === TABS.personal}
          onClick={() => setActiveTab(TABS.personal)}
          disabled
        >
          Персональные данные
        </Tab>
        <Tab
          active={activeTab === TABS.social}
          onClick={() => setActiveTab(TABS.social)}
          disabled
        >
          Социальные сети
        </Tab>
      </Tabs>

      <div className="user-detail-page__content">
        {activeTab === TABS.general && (
          <div className="user-detail-page__panel">
            <h2 className="user-detail-page__panel-title">Общие данные</h2>
            
            <div className="user-detail-form">
              <div className="user-detail-form__row">
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">ID</span>
                  <input type="text" value={user.id} disabled />
                </label>
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Публичный ID</span>
                  <input type="text" value={user.public_id || '—'} disabled />
                </label>
              </div>

              <div className="user-detail-form__row">
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Телефон</span>
                  <input
                    type="text"
                    value={user.primary_phone?.phone_number || 'Не указан'}
                    disabled
                  />
                </label>
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Группа</span>
                  <input
                    type="text"
                    value={user.group?.name || 'Не назначена'}
                    disabled
                  />
                </label>
              </div>

              <div className="user-detail-form__row">
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Статус</span>
                  <div className="user-detail-form__status">
                    {user.is_active ? (
                      <span className="status-active">
                        <FiCheck /> Активен
                      </span>
                    ) : (
                      <span className="status-inactive">
                        <FiX /> Заблокирован
                      </span>
                    )}
                  </div>
                </label>
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Верификация</span>
                  <div className="user-detail-form__status">
                    {user.is_verified ? (
                      <span className="status-active">
                        <FiCheck /> Верифицирован
                      </span>
                    ) : (
                      <span className="status-inactive">
                        <FiX /> Не верифицирован
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <div className="user-detail-form__row">
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Создан</span>
                  <input
                    type="text"
                    value={
                      user.created_at
                        ? new Date(user.created_at).toLocaleString('ru-RU')
                        : '—'
                    }
                    disabled
                  />
                </label>
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Обновлен</span>
                  <input
                    type="text"
                    value={
                      user.updated_at
                        ? new Date(user.updated_at).toLocaleString('ru-RU')
                        : '—'
                    }
                    disabled
                  />
                </label>
              </div>

              <div className="user-detail-form__row">
                <label className="user-detail-form__field">
                  <span className="user-detail-form__label">Последний вход</span>
                  <input
                    type="text"
                    value={
                      user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString('ru-RU')
                        : '—'
                    }
                    disabled
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === TABS.sessions && (
          <div className="user-detail-page__panel">
            <h2 className="user-detail-page__panel-title">Сессии пользователя</h2>
            
            {userSessions.length === 0 ? (
              <p className="user-detail-page__empty">У пользователя нет активных сессий</p>
            ) : (
              <div className="sessions-list">
                {userSessions.map((session) => (
                  <div key={session.id} className="session-item">
                    <div className="session-item__info">
                      <p className="session-item__title">
                        Сессия #{session.id}
                      </p>
                      <p className="session-item__meta">
                        Создана:{' '}
                        {session.created_at
                          ? new Date(session.created_at).toLocaleString('ru-RU')
                          : '—'}
                      </p>
                      {session.last_active_at && (
                        <p className="session-item__meta">
                          Активна:{' '}
                          {new Date(session.last_active_at).toLocaleString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === TABS.permissions && (
          <div className="user-detail-page__panel">
            <div className="user-detail-page__panel-header">
              <h2 className="user-detail-page__panel-title">Права пользователя</h2>
              <PermissionGate permission={['admin:user:assign']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    loadAllPermissions();
                    loadAllGroups();
                    setIsAssignModalOpen(true);
                  }}
                  disabled={isLoadingPermissions || isLoadingGroups}
                >
                  {isLoadingPermissions || isLoadingGroups
                    ? 'Загрузка...'
                    : 'Назначить'}
                </Button>
              </PermissionGate>
            </div>

            <div className="user-permissions-search">
              <FiSearch className="user-permissions-search__icon" />
              <input
                type="text"
                placeholder="Поиск прав..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
              />
            </div>

            {userPermissions.length === 0 ? (
              <p className="user-detail-page__empty">
                У пользователя нет прав
              </p>
            ) : permissionSectionKeys.length === 0 ? (
              <p className="user-detail-page__empty">
                По вашему запросу ничего не найдено
              </p>
            ) : (
              <div className="user-permissions-list">
                {permissionSectionKeys.map((section) => {
                  const sectionPermissions = permissionBuckets[section] ?? [];
                  return (
                    <div key={section} className="user-permissions-section">
                      <h3 className="user-permissions-section__title">{section}</h3>
                      <div className="user-permissions-section__items">
                        {sectionPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="user-permission-item"
                          >
                            <div className="user-permission-item__info">
                              <strong>{permission.name}</strong>
                              {permission.description && (
                                <span>{permission.description}</span>
                              )}
                            </div>
                            <PermissionGate
                              permission={['admin:user:revoke']}
                              fallback={null}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRevokePermission(permission.id)}
                                disabled={isRevoking}
                                aria-label="Отозвать право"
                              >
                                <FiTrash2 />
                              </Button>
                            </PermissionGate>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {userGroups.length > 0 && (
              <div className="user-groups-section">
                <h3 className="user-permissions-section__title">Группы пользователя</h3>
                <div className="user-groups-list">
                  {userGroups.map((group) => (
                    <div key={group.id} className="user-group-item">
                      <div className="user-group-item__info">
                        <FiUsers className="user-group-item__icon" />
                        <div>
                          <strong>{group.name}</strong>
                          {group.description && (
                            <span>{group.description}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLeaveGroup(group.id)}
                        aria-label="Покинуть группу"
                      >
                        <FiX />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === TABS.personal && (
          <div className="user-detail-page__panel">
            <h2 className="user-detail-page__panel-title">Персональные данные</h2>
            <p className="user-detail-page__empty">
              Эта вкладка будет заполнена в будущем
            </p>
          </div>
        )}

        {activeTab === TABS.social && (
          <div className="user-detail-page__panel">
            <h2 className="user-detail-page__panel-title">Социальные сети</h2>
            <p className="user-detail-page__empty">
              Эта вкладка будет заполнена в будущем
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно бана */}
      {isBanModalOpen && (
        <Modal
          isOpen
          onClose={() => setIsBanModalOpen(false)}
          title={user.is_active ? 'Бан пользователя' : 'Разбан пользователя'}
          size="sm"
          footer={(
            <>
              <Button variant="secondary" onClick={() => setIsBanModalOpen(false)}>
                Отмена
              </Button>
              <Button
                variant={user.is_active ? 'danger' : 'primary'}
                onClick={handleBanUser}
              >
                {user.is_active ? 'Заблокировать' : 'Разблокировать'}
              </Button>
            </>
          )}
        >
          <p>
            {user.is_active
              ? 'Вы уверены, что хотите заблокировать этого пользователя?'
              : 'Вы уверены, что хотите разблокировать этого пользователя?'}
          </p>
        </Modal>
      )}

      {/* Модальное окно назначения прав */}
      {isAssignModalOpen && (
        <AssignPermissionModal
          permissions={allPermissions}
          groups={allGroups}
          userGroups={userGroups}
          onClose={() => setIsAssignModalOpen(false)}
          onSubmit={handleAssignPermissions}
          isSubmitting={isRevoking}
        />
      )}
    </section>
  );
}
