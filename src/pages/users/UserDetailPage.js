import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiEdit2,
  FiLock,
  FiX,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiShield,
  FiClock,
  FiLogOut,
  FiPhone,
  FiCalendar,
  FiActivity,
  FiUser,
} from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Tabs, Tab } from '../../shared/ui/Tabs';
import { Modal } from '../../shared/ui/Modal';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getUserByIdRequest,
  updateUserRequest,
  banUserRequest,
  revokePermissionRequest,
  assignPermissionsBulkRequest,
  assignGroupRequest,
  getAllPermissionsRequest,
  getAllGroupsRequest,
  deleteSessionRequest,
} from './api/usersApi';
import './UserDetailPage.css';

const TABS = {
  general: 'general',
  sessions: 'sessions',
  permissions: 'permissions',
  groups: 'groups',
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

// Модальное окно назначения прав и групп
function AssignModal({
  permissions,
  groups,
  userPermissions,
  userGroups,
  onClose,
  onAssignPermissions,
  onAssignGroup,
  isSubmitting,
}) {
  const [activeTab, setActiveTab] = useState('permissions');
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
      if (filtered.length > 0) result[section] = filtered;
    });
    return result;
  }, [buckets, sectionKeys, searchQuery]);

  const filteredSectionKeys = Object.keys(filteredBuckets);

  const availableGroups = groups.filter((g) => !userGroups?.some((ug) => ug.id === g.id));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Назначение прав и групп"
      size="lg"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          {activeTab === 'permissions' ? (
            <Button
              variant="primary"
              onClick={() => onAssignPermissions(selectedPermissions)}
              disabled={isSubmitting || selectedPermissions.length === 0}
            >
              Назначить права
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => onAssignGroup(selectedGroup ? Number(selectedGroup) : null)}
              disabled={isSubmitting || !selectedGroup}
            >
              Добавить в группу
            </Button>
          )}
        </>
      )}
    >
      <Tabs className="assign-modal__tabs">
        <Tab active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')}>
          Права
        </Tab>
        <Tab active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
          Группы
        </Tab>
      </Tabs>

      <div className="assign-modal__content">
        {activeTab === 'permissions' && (
          <>
            <div className="assign-modal__search">
              <input
                type="text"
                placeholder="Поиск прав..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredSectionKeys.length === 0 && (
              <p className="assign-modal__empty">
                {searchQuery ? 'По вашему запросу ничего не найдено.' : 'Список прав пуст.'}
              </p>
            )}

            {filteredSectionKeys.map((section) => {
              const sectionPermissions = filteredBuckets[section] ?? [];
              const selectedInSection = sectionPermissions.filter((item) =>
                selectedPermissions.includes(item.id)
              ).length;

              return (
                <div key={section} className="assign-modal__section">
                  <button
                    type="button"
                    className="assign-modal__section-header"
                    onClick={() => toggleSection(section)}
                  >
                    <span className="assign-modal__section-title">{section}</span>
                    <span className="assign-modal__section-count">
                      {selectedInSection}/{sectionPermissions.length}
                    </span>
                  </button>
                  {expandedSections[section] && (
                    <div className="assign-modal__section-items">
                      {sectionPermissions.map((permission) => (
                        <label key={permission.id} className="assign-modal__permission-item">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <span className="assign-modal__permission-name">{permission.name}</span>
                          {permission.description && (
                            <span className="assign-modal__permission-desc">{permission.description}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'groups' && (
          <>
            {availableGroups.length === 0 ? (
              <p className="assign-modal__empty">Все доступные группы уже назначены</p>
            ) : (
              <div className="assign-modal__groups">
                {availableGroups.map((group) => (
                  <label key={group.id} className="assign-modal__group-item">
                    <input
                      type="radio"
                      name="group"
                      value={group.id}
                      checked={selectedGroup === String(group.id)}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    />
                    <div className="assign-modal__group-info">
                      <strong>{group.name}</strong>
                      {group.description && <span>{group.description}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// Модальное окно редактирования пользователя
function EditUserModal({ user, groups, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    fio: user?.fio ?? '',
    is_active: user?.is_active ?? true,
    is_verified: user?.is_verified ?? false,
    group_id: user?.group?.id ?? '',
  });

  useEffect(() => {
    setFormData({
      fio: user?.fio ?? '',
      is_active: user?.is_active ?? true,
      is_verified: user?.is_verified ?? false,
      group_id: user?.group?.id ?? '',
    });
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Редактирование пользователя"
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(formData)}
            loading={isSubmitting}
          >
            Сохранить
          </Button>
        </>
      )}
    >
      <div className="edit-user-form">
        <label className="edit-user-form__field">
          <span className="edit-user-form__label">ФИО</span>
          <input
            type="text"
            value={formData.fio}
            onChange={(e) => handleChange('fio', e.target.value)}
            placeholder="Иванов Иван Иванович"
            maxLength={255}
          />
        </label>

        <label className="edit-user-form__field">
          <span className="edit-user-form__label">Статус</span>
          <select
            value={formData.is_active ? 'true' : 'false'}
            onChange={(e) => handleChange('is_active', e.target.value === 'true')}
          >
            <option value="true">Активен</option>
            <option value="false">Заблокирован</option>
          </select>
        </label>

        <label className="edit-user-form__field">
          <span className="edit-user-form__label">Верификация</span>
          <select
            value={formData.is_verified ? 'true' : 'false'}
            onChange={(e) => handleChange('is_verified', e.target.value === 'true')}
          >
            <option value="true">Верифицирован</option>
            <option value="false">Не верифицирован</option>
          </select>
        </label>

        <label className="edit-user-form__field">
          <span className="edit-user-form__label">Группа</span>
          <select
            value={formData.group_id}
            onChange={(e) => handleChange('group_id', e.target.value)}
          >
            <option value="">Без группы</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}

// Модальное окно закрытия сессии
function TerminateSessionModal({ session, onClose, onConfirm, isSubmitting }) {
  if (!session) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Завершение сессии"
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={isSubmitting}
          >
            Завершить
          </Button>
        </>
      )}
    >
      <p>
        Вы уверены, что хотите завершить сессию #{session.id}?
      </p>
      <p className="terminate-session__note">
        Пользователь будет разлогинен в этой сессии.
      </p>
    </Modal>
  );
}

export function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  // Обновляем ref при изменении notifications
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.general);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUserByIdRequest(userId);
      setUser(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Вычисляемые значения — до любых условных return
  const userPermissions = user?.permissions || [];
  const userGroups = user?.group ? [user.group] : [];
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

  const loadAllPermissions = async () => {
    if (allPermissions.length > 0 || isLoadingPermissions) return;
    setIsLoadingPermissions(true);
    try {
      const permissions = await getAllPermissionsRequest();
      setAllPermissions(permissions);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
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
      notificationsRef.current?.error(message);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleSaveUser = async (payload) => {
    setIsSaving(true);
    try {
      await updateUserRequest(userId, payload);
      await loadUser();
      notificationsRef.current?.info('Пользователь обновлен');
      setIsEditModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBanUser = async () => {
    try {
      await banUserRequest(userId);
      await loadUser();
      notificationsRef.current?.info(
        user.is_active ? 'Пользователь заблокирован' : 'Пользователь разблокирован'
      );
      setIsBanModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    }
  };

  const handleAssignPermissions = async (permissionIds) => {
    try {
      await assignPermissionsBulkRequest(userId, permissionIds);
      await loadUser();
      notificationsRef.current?.info(`Назначено прав: ${permissionIds.length}`);
      setIsAssignModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    }
  };

  const handleAssignGroup = async (groupId) => {
    if (!groupId) return;
    try {
      await assignGroupRequest(userId, groupId);
      await loadUser();
      notificationsRef.current?.info('Группа назначена');
      setIsAssignModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    }
  };

  const handleRevokePermission = async (permissionId) => {
    setIsRevoking(true);
    try {
      await revokePermissionRequest(userId, permissionId);
      await loadUser();
      notificationsRef.current?.info('Право отозвано');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    // Пока заглушка - API для удаления из группы нет
    notificationsRef.current?.info('Функция выхода из группы будет реализована позже');
  };

  const handleTerminateSession = async () => {
    if (!selectedSession) return;
    setIsTerminating(true);
    try {
      await deleteSessionRequest(userId, selectedSession.id);
      await loadUser();
      notificationsRef.current?.info('Сессия завершена');
      setIsTerminateModalOpen(false);
      setSelectedSession(null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsTerminating(false);
    }
  };

  if (isLoading) {
    return (
      <section className="user-detail-page">
        <div className="user-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных пользователя...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="user-detail-page">
        <div className="user-detail-page__error">
          <h2>Пользователь не найден</h2>
          <p>Запрошенный пользователь не существует или был удалён</p>
          <Button variant="primary" onClick={() => navigate('/users')}>
            К списку пользователей
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="user-detail-page">
      {/* Header */}
      <header className="user-detail-page__header">
        <div className="user-detail-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/users')} className="back-button">
            ← Назад
          </Button>
          <div className="user-detail-page__user-info">
            <div className={`user-detail-page__avatar ${user.is_active ? 'user-detail-page__avatar--active' : 'user-detail-page__avatar--inactive'}`}>
              <FiUsers />
            </div>
            <div className="user-detail-page__header-text">
              <h1 className="user-detail-page__title">
                {user.primary_phone?.phone_number || `Пользователь #${user.id}`}
              </h1>
              <div className="user-detail-page__badges">
                {!user.is_active && (
                  <span className="user-detail-page__badge user-detail-page__badge--inactive">
                    <FiLock /> Заблокирован
                  </span>
                )}
                {user.is_verified && (
                  <span className="user-detail-page__badge user-detail-page__badge--verified">
                    <FiCheck /> Верифицирован
                  </span>
                )}
                {user.group && (
                  <span className="user-detail-page__badge user-detail-page__badge--group">
                    <FiShield /> {user.group.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="user-detail-page__actions">
          <PermissionGate permission={['admin:user:ban']} fallback={null}>
            <Button
              variant={user.is_active ? 'danger' : 'success'}
              leftIcon={user.is_active ? <FiLock /> : <FiCheck />}
              onClick={() => setIsBanModalOpen(true)}
            >
              {user.is_active ? 'Заблокировать' : 'Разблокировать'}
            </Button>
          </PermissionGate>
          <PermissionGate permission={['admin:user:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={() => {
                loadAllGroups();
                setIsEditModalOpen(true);
              }}
            >
              Редактировать
            </Button>
          </PermissionGate>
        </div>
      </header>

      {/* Tabs */}
      <Tabs className="user-detail-page__tabs">
        <Tab
          active={activeTab === TABS.general}
          onClick={() => setActiveTab(TABS.general)}
        >
          <FiCalendar /> Общая информация
        </Tab>
        <Tab
          active={activeTab === TABS.sessions}
          onClick={() => setActiveTab(TABS.sessions)}
        >
          <FiClock /> Сессии
          {userSessions.length > 0 && (
            <span className="tab-badge">{userSessions.length}</span>
          )}
        </Tab>
        <Tab
          active={activeTab === TABS.permissions}
          onClick={() => setActiveTab(TABS.permissions)}
        >
          <FiShield /> Права
          {userPermissions.length > 0 && (
            <span className="tab-badge">{userPermissions.length}</span>
          )}
        </Tab>
        <Tab
          active={activeTab === TABS.groups}
          onClick={() => setActiveTab(TABS.groups)}
        >
          <FiUsers /> Группы
          {userGroups.length > 0 && (
            <span className="tab-badge">{userGroups.length}</span>
          )}
        </Tab>
      </Tabs>

      {/* Content */}
      <div className="user-detail-page__content">
        {/* General Tab */}
        {activeTab === TABS.general && (
          <div className="user-detail-page__panel user-detail-page__panel--large">
            <div className="panel-header">
              <h2 className="panel-title">Общие данные</h2>
            </div>
            
            <div className="user-info-grid">
              <div className="info-card">
                <div className="info-card__icon info-card__icon--primary">
                  <FiUsers />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">ID пользователя</span>
                  <span className="info-card__value">{user.id}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card__icon info-card__icon--secondary">
                  <FiShield />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Публичный ID</span>
                  <span className="info-card__value code">{user.public_id || '—'}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card__icon info-card__icon--success">
                  <FiPhone />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Телефон</span>
                  <span className="info-card__value">{user.primary_phone?.phone_number || 'Не указан'}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card__icon info-card__icon--primary">
                  <FiUser />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">ФИО</span>
                  <span className="info-card__value">{user.fio || 'Не указано'}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card__icon info-card__icon--info">
                  <FiUsers />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Группа</span>
                  <span className="info-card__value">{user.group?.name || 'Не назначена'}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card__icon info-card__icon--success">
                  <FiCheck />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Статус</span>
                  <span className={`info-card__status ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                    {user.is_active ? 'Активен' : 'Заблокирован'}
                  </span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card__icon info-card__icon--success">
                  <FiCheck />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Верификация</span>
                  <span className={`info-card__status ${user.is_verified ? 'status-active' : 'status-inactive'}`}>
                    {user.is_verified ? 'Верифицирован' : 'Не верифицирован'}
                  </span>
                </div>
              </div>

              <div className="info-card info-card--full">
                <div className="info-card__icon info-card__icon--primary">
                  <FiCalendar />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Создан</span>
                  <span className="info-card__value">
                    {user.created_at ? new Date(user.created_at).toLocaleString('ru-RU') : '—'}
                  </span>
                </div>
              </div>

              <div className="info-card info-card--full">
                <div className="info-card__icon info-card__icon--secondary">
                  <FiEdit2 />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Обновлён</span>
                  <span className="info-card__value">
                    {user.updated_at ? new Date(user.updated_at).toLocaleString('ru-RU') : '—'}
                  </span>
                </div>
              </div>

              <div className="info-card info-card--full">
                <div className="info-card__icon info-card__icon--info">
                  <FiActivity />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Последний вход</span>
                  <span className="info-card__value">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString('ru-RU') : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === TABS.sessions && (
          <div className="user-detail-page__panel">
            <div className="panel-header">
              <h2 className="panel-title">Активные сессии</h2>
            </div>

            {userSessions.length === 0 ? (
              <div className="empty-state">
                <FiClock className="empty-state__icon" />
                <p>У пользователя нет активных сессий</p>
              </div>
            ) : (
              <div className="sessions-list">
                {userSessions.map((session) => (
                  <div key={session.id} className="session-card">
                    <div className="session-card__header">
                      <div className="session-card__title">
                        <FiClock />
                        <span>Сессия #{session.id}</span>
                      </div>
                      <div className="session-card__status">
                        {session.is_active ? (
                          <span className="session-card__badge session-card__badge--active">Активна</span>
                        ) : (
                          <span className="session-card__badge session-card__badge--inactive">Неактивна</span>
                        )}
                      </div>
                      <PermissionGate permission={['admin:user:update']} fallback={null}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSession(session);
                            setIsTerminateModalOpen(true);
                          }}
                          aria-label="Завершить сессию"
                        >
                          <FiLogOut />
                        </Button>
                      </PermissionGate>
                    </div>
                    <div className="session-card__body">
                      <div className="session-card__info">
                        <span className="session-card__label">Создана:</span>
                        <span className="session-card__value">
                          {session.created_at ? new Date(session.created_at).toLocaleString('ru-RU') : '—'}
                        </span>
                      </div>
                      {session.last_activity && (
                        <div className="session-card__info">
                          <span className="session-card__label">Последняя активность:</span>
                          <span className="session-card__value">
                            {new Date(session.last_activity).toLocaleString('ru-RU')}
                          </span>
                        </div>
                      )}
                      {session.device_info && (
                        <div className="session-card__info">
                          <span className="session-card__label">Устройство:</span>
                          <span className="session-card__value">{session.device_info}</span>
                        </div>
                      )}
                      {session.ip_address && (
                        <div className="session-card__info">
                          <span className="session-card__label">IP адрес:</span>
                          <span className="session-card__value">{session.ip_address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === TABS.permissions && (
          <div className="user-detail-page__panel">
            <div className="panel-header">
              <h2 className="panel-title">Права пользователя</h2>
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
                  {isLoadingPermissions || isLoadingGroups ? 'Загрузка...' : 'Назначить'}
                </Button>
              </PermissionGate>
            </div>

            <div className="permissions-search">
              <input
                type="text"
                placeholder="Поиск прав..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
              />
            </div>

            {userPermissions.length === 0 ? (
              <div className="empty-state">
                <FiShield className="empty-state__icon" />
                <p>У пользователя нет прав</p>
              </div>
            ) : permissionSectionKeys.length === 0 ? (
              <div className="empty-state">
                <FiShield className="empty-state__icon" />
                <p>По вашему запросу ничего не найдено</p>
              </div>
            ) : (
              <div className="permissions-list">
                {permissionSectionKeys.map((section) => {
                  const sectionPermissions = permissionBuckets[section] ?? [];
                  return (
                    <div key={section} className="permissions-section">
                      <h3 className="permissions-section__title">{section}</h3>
                      <div className="permissions-section__items">
                        {sectionPermissions.map((permission) => (
                          <div key={permission.id} className="permission-card">
                            <div className="permission-card__content">
                              <strong className="permission-card__name">{permission.name}</strong>
                              {permission.description && (
                                <span className="permission-card__description">{permission.description}</span>
                              )}
                            </div>
                            <PermissionGate permission={['admin:user:revoke']} fallback={null}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRevokePermission(permission.id)}
                                disabled={isRevoking}
                                aria-label="Отозвать право"
                                className="permission-card__action"
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
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === TABS.groups && (
          <div className="user-detail-page__panel">
            <div className="panel-header">
              <h2 className="panel-title">Группы пользователя</h2>
              <PermissionGate permission={['admin:user:assign']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    loadAllGroups();
                    setIsAssignModalOpen(true);
                  }}
                  disabled={isLoadingGroups}
                >
                  {isLoadingGroups ? 'Загрузка...' : 'Добавить в группу'}
                </Button>
              </PermissionGate>
            </div>

            {userGroups.length === 0 ? (
              <div className="empty-state">
                <FiUsers className="empty-state__icon" />
                <p>Пользователь не состоит в группах</p>
              </div>
            ) : (
              <div className="groups-list">
                {userGroups.map((group) => (
                  <div key={group.id} className="group-card">
                    <div className="group-card__icon">
                      <FiUsers />
                    </div>
                    <div className="group-card__content">
                      <strong className="group-card__name">{group.name}</strong>
                      {group.description && (
                        <span className="group-card__description">{group.description}</span>
                      )}
                      {group.permissions && (
                        <span className="group-card__meta">
                          Прав: {group.permissions.length}
                        </span>
                      )}
                    </div>
                    <div className="group-card__actions">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLeaveGroup(group.id)}
                        aria-label="Удалить из группы"
                      >
                        <FiX />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isBanModalOpen && (
        <Modal
          isOpen
          onClose={() => setIsBanModalOpen(false)}
          title={user.is_active ? 'Бан пользователя' : 'Разбан пользователя'}
          size="sm"
          footer={(
            <>
              <Button variant="secondary" onClick={() => setIsBanModalOpen(false)}>Отмена</Button>
              <Button
                variant={user.is_active ? 'danger' : 'success'}
                onClick={handleBanUser}
              >
                {user.is_active ? 'Заблокировать' : 'Разблокировать'}
              </Button>
            </>
          )}
        >
          <p className="modal-text">
            {user.is_active
              ? 'Вы уверены, что хотите заблокировать этого пользователя? Он потеряет доступ к системе.'
              : 'Вы уверены, что хотите разблокировать этого пользователя?'}
          </p>
        </Modal>
      )}

      {isEditModalOpen && (
        <EditUserModal
          user={user}
          groups={allGroups}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveUser}
          isSubmitting={isSaving}
        />
      )}

      {isAssignModalOpen && (
        <AssignModal
          permissions={allPermissions}
          groups={allGroups}
          userPermissions={userPermissions}
          userGroups={userGroups}
          onClose={() => setIsAssignModalOpen(false)}
          onAssignPermissions={handleAssignPermissions}
          onAssignGroup={handleAssignGroup}
          isSubmitting={isRevoking}
        />
      )}

      {isTerminateModalOpen && selectedSession && (
        <TerminateSessionModal
          session={selectedSession}
          onClose={() => {
            setIsTerminateModalOpen(false);
            setSelectedSession(null);
          }}
          onConfirm={handleTerminateSession}
          isSubmitting={isTerminating}
        />
      )}
    </section>
  );
}
