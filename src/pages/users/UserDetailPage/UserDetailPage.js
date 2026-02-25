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
  FiMail,
  FiInfo,
} from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Tabs, Tab } from '../../../shared/ui/Tabs/Tabs';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
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
} from '../api/usersApi';
import { buildPermissionBuckets } from '../../../shared/lib/permissions';
import styles from './UserDetailPage.module.css';

const TABS = {
  general: 'general',
  sessions: 'sessions',
  permissions: 'permissions',
  groups: 'groups',
};

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
      <Tabs className={styles.assignModalTabs}>
        <Tab active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')}>
          Права
        </Tab>
        <Tab active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
          Группы
        </Tab>
      </Tabs>

      <div className={styles.assignModalContent}>
        {activeTab === 'permissions' && (
          <>
            <div className={styles.assignModalSearch}>
              <input
                type="text"
                placeholder="Поиск прав..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredSectionKeys.length === 0 && (
              <p className={styles.assignModalEmpty}>
                {searchQuery ? 'По вашему запросу ничего не найдено.' : 'Список прав пуст.'}
              </p>
            )}

            {filteredSectionKeys.map((section) => {
              const sectionPermissions = filteredBuckets[section] ?? [];
              const selectedInSection = sectionPermissions.filter((item) =>
                selectedPermissions.includes(item.id)
              ).length;

              return (
                <div key={section} className={styles.assignModalSection}>
                  <button
                    type="button"
                    className={styles.assignModalSectionHeader}
                    onClick={() => toggleSection(section)}
                  >
                    <span className={styles.assignModalSectionTitle}>{section}</span>
                    <span className={styles.assignModalSectionCount}>
                      {selectedInSection}/{sectionPermissions.length}
                    </span>
                  </button>
                  {expandedSections[section] && (
                    <div className={styles.assignModalSectionItems}>
                      {sectionPermissions.map((permission) => (
                        <label key={permission.id} className={styles.assignModalPermissionItem}>
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <span className={styles.assignModalPermissionName}>{permission.name}</span>
                          {permission.description && (
                            <span className={styles.assignModalPermissionDesc}>{permission.description}</span>
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
              <p className={styles.assignModalEmpty}>Все доступные группы уже назначены</p>
            ) : (
              <div className={styles.assignModalGroups}>
                {availableGroups.map((group) => (
                  <label key={group.id} className={styles.assignModalGroupItem}>
                    <input
                      type="radio"
                      name="group"
                      value={group.id}
                      checked={selectedGroup === String(group.id)}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    />
                    <div className={styles.assignModalGroupInfo}>
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
      <div className={styles.editUserForm}>
        <label className={styles.editUserFormField}>
          <span className={styles.editUserFormLabel}>ФИО</span>
          <input
            type="text"
            value={formData.fio}
            onChange={(e) => handleChange('fio', e.target.value)}
            placeholder="Иванов Иван Иванович"
            maxLength={255}
          />
        </label>

        <label className={styles.editUserFormField}>
          <span className={styles.editUserFormLabel}>Статус</span>
          <select
            value={formData.is_active ? 'true' : 'false'}
            onChange={(e) => handleChange('is_active', e.target.value === 'true')}
          >
            <option value="true">Активен</option>
            <option value="false">Заблокирован</option>
          </select>
        </label>

        <label className={styles.editUserFormField}>
          <span className={styles.editUserFormLabel}>Верификация</span>
          <select
            value={formData.is_verified ? 'true' : 'false'}
            onChange={(e) => handleChange('is_verified', e.target.value === 'true')}
          >
            <option value="true">Верифицирован</option>
            <option value="false">Не верифицирован</option>
          </select>
        </label>

        <label className={styles.editUserFormField}>
          <span className={styles.editUserFormLabel}>Группа</span>
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
      <p className={styles.terminateSessionNote}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
      <section className={styles.userDetailPage}>
        <div className={styles.userDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных пользователя...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className={styles.userDetailPage}>
        <div className={styles.userDetailPageError}>
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
    <section className={styles.userDetailPage}>
      {/* Header */}
      <header className={styles.userDetailPageHeader}>
        <Button variant="ghost" onClick={() => navigate('/users')} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.userDetailPageActions}>
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
      <Tabs className={styles.userDetailPageTabs}>
        <Tab
          active={activeTab === TABS.general}
          onClick={() => setActiveTab(TABS.general)}
        >
          <FiCalendar /> Информация
        </Tab>
        <Tab
          active={activeTab === TABS.sessions}
          onClick={() => setActiveTab(TABS.sessions)}
        >
          <FiClock /> Сессии
          {userSessions.length > 0 && (
            <span className={styles.tabBadge}>{userSessions.length}</span>
          )}
        </Tab>
        <Tab
          active={activeTab === TABS.permissions}
          onClick={() => setActiveTab(TABS.permissions)}
        >
          <FiShield /> Права
          {userPermissions.length > 0 && (
            <span className={styles.tabBadge}>{userPermissions.length}</span>
          )}
        </Tab>
        <Tab
          active={activeTab === TABS.groups}
          onClick={() => setActiveTab(TABS.groups)}
        >
          <FiUsers /> Группы
          {userGroups.length > 0 && (
            <span className={styles.tabBadge}>{userGroups.length}</span>
          )}
        </Tab>
      </Tabs>

      {/* Content */}
      <div className={styles.userDetailPageContent}>
        {/* General Tab */}
        {activeTab === TABS.general && (
          <div className={styles.userDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <h2 className={styles.panelTitle}>
                  <FiUser className={styles.panelTitleIcon} />
                  Профиль пользователя
                </h2>
              </div>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.userProfileHeader}>
                <div className={`${styles.userProfileAvatar} ${user.is_active ? styles.userProfileAvatarActive : styles.userProfileAvatarInactive}`}>
                  <FiUser />
                </div>
                <div className={styles.userProfileInfo}>
                  <h3 className={styles.userProfileName}>
                    {user.primary_phone?.phone_number || `Пользователь #${user.id}`}
                  </h3>
                  <div className={styles.userProfileBadges}>
                    {!user.is_active && (
                      <span className={`${styles.userProfileBadge} ${styles.userProfileBadgeInactive}`}>
                        <FiLock /> Заблокирован
                      </span>
                    )}
                    {user.is_verified && (
                      <span className={`${styles.userProfileBadge} ${styles.userProfileBadgeVerified}`}>
                        <FiCheck /> Верифицирован
                      </span>
                    )}
                    {user.group && (
                      <span className={`${styles.userProfileBadge} ${styles.userProfileBadgeGroup}`}>
                        <FiShield /> {user.group.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.userInfoGrid}>
                <div className={`${styles.infoCard} ${styles.infoCardHighlight}`}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconPrimary}`}>
                    <FiUsers />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>ID пользователя</span>
                    <span className={`${styles.infoCardValue} ${styles.infoCardValueLarge}`}>
                      {user.id}
                    </span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconSecondary}`}>
                    <FiShield />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>Публичный ID</span>
                    <span className={styles.infoCardValue}>{user.public_id || '—'}</span>
                  </div>
                </div>

                {user.phones?.[0] && (
                  <div className={styles.infoCard}>
                    <div className={`${styles.infoCardIcon} ${styles.infoCardIconSuccess}`}>
                      <FiPhone />
                    </div>
                    <div className={styles.infoCardContent}>
                      <span className={styles.infoCardLabel}>Телефон</span>
                      <span className={styles.infoCardValue}>{user.phones[0].phone_number}</span>
                    </div>
                  </div>
                )}

                {user.fio && (
                  <div className={styles.infoCard}>
                    <div className={`${styles.infoCardIcon} ${styles.infoCardIconInfo}`}>
                      <FiUser />
                    </div>
                    <div className={styles.infoCardContent}>
                      <span className={styles.infoCardLabel}>ФИО</span>
                      <span className={styles.infoCardValue}>{user.fio}</span>
                    </div>
                  </div>
                )}

                {user.group && (
                  <div className={styles.infoCard}>
                    <div className={`${styles.infoCardIcon} ${styles.infoCardIconAccent}`}>
                      <FiUsers />
                    </div>
                    <div className={styles.infoCardContent}>
                      <span className={styles.infoCardLabel}>Группа</span>
                      <span className={styles.infoCardValue}>{user.group.name}</span>
                    </div>
                  </div>
                )}

                <div className={styles.infoCard}>
                  <div className={`${styles.infoCardIcon} ${user.is_active ? styles.infoCardIconSuccess : styles.infoCardIconDanger}`}>
                    <FiInfo />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>Статус</span>
                    <span className={styles.infoCardValue}>
                      {user.is_active ? 'Активен' : 'Заблокирован'}
                    </span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconAccent}`}>
                    <FiCheck />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>Верификация</span>
                    <span className={styles.infoCardValue}>
                      {user.is_verified ? 'Верифицирован' : 'Не верифицирован'}
                    </span>
                  </div>
                </div>

                <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconPrimary}`}>
                    <FiCalendar />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>Создан</span>
                    <span className={styles.infoCardValue}>
                      {user.created_at ? new Date(user.created_at).toLocaleString('ru-RU') : '—'}
                    </span>
                  </div>
                </div>

                <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconSecondary}`}>
                    <FiEdit2 />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>Обновлён</span>
                    <span className={styles.infoCardValue}>
                      {user.updated_at ? new Date(user.updated_at).toLocaleString('ru-RU') : '—'}
                    </span>
                  </div>
                </div>

                <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconInfo}`}>
                    <FiActivity />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>Последний вход</span>
                    <span className={styles.infoCardValue}>
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleString('ru-RU') : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === TABS.sessions && (
          <div className={styles.userDetailPagePanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Активные сессии</h2>
            </div>
            <div className={styles.panelContent}>
              {userSessions.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiClock className={styles.emptyStateIcon} />
                  <p>У пользователя нет активных сессий</p>
                </div>
              ) : (
                <div className={styles.sessionsList}>
                  {userSessions.map((session) => (
                    <div key={session.id} className={styles.sessionCard}>
                      <div className={styles.sessionCardHeader}>
                        <div className={styles.sessionCardTitle}>
                          <FiClock />
                          <span>Сессия #{session.id}</span>
                        </div>
                        <div className={styles.sessionCardStatus}>
                          {session.is_active ? (
                            <span className={`${styles.sessionCardBadge} ${styles.sessionCardBadgeActive}`}>Активна</span>
                          ) : (
                            <span className={`${styles.sessionCardBadge} ${styles.sessionCardBadgeInactive}`}>Неактивна</span>
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
                      <div className={styles.sessionCardBody}>
                        <div className={styles.sessionCardInfo}>
                          <span className={styles.sessionCardLabel}>Создана:</span>
                          <span className={styles.sessionCardValue}>
                            {session.created_at ? new Date(session.created_at).toLocaleString('ru-RU') : '—'}
                          </span>
                        </div>
                        {session.last_activity && (
                          <div className={styles.sessionCardInfo}>
                            <span className={styles.sessionCardLabel}>Последняя активность:</span>
                            <span className={styles.sessionCardValue}>
                              {new Date(session.last_activity).toLocaleString('ru-RU')}
                            </span>
                          </div>
                        )}
                        {session.device_info && (
                          <div className={styles.sessionCardInfo}>
                            <span className={styles.sessionCardLabel}>Устройство:</span>
                            <span className={styles.sessionCardValue}>{session.device_info}</span>
                          </div>
                        )}
                        {session.ip_address && (
                          <div className={styles.sessionCardInfo}>
                            <span className={styles.sessionCardLabel}>IP адрес:</span>
                            <span className={styles.sessionCardValue}>{session.ip_address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === TABS.permissions && (
          <div className={styles.userDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <h2 className={styles.panelTitle}>
                  <FiShield className={styles.panelTitleIcon} />
                  Права пользователя
                </h2>
              </div>
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

            <div className={styles.permissionsSearch}>
              <input
                type="text"
                placeholder="Поиск прав..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
              />
            </div>

            {userPermissions.length === 0 ? (
              <div className={styles.emptyState}>
                <FiShield className={styles.emptyStateIcon} />
                <p>У пользователя нет прав</p>
              </div>
            ) : permissionSectionKeys.length === 0 ? (
              <div className={styles.emptyState}>
                <FiShield className={styles.emptyStateIcon} />
                <p>По вашему запросу ничего не найдено</p>
              </div>
            ) : (
              <div className={styles.permissionsList}>
                {permissionSectionKeys.map((section) => {
                  const sectionPermissions = permissionBuckets[section] ?? [];
                  return (
                    <div key={section} className={styles.permissionsSection}>
                      <div className={styles.permissionsSectionHeader}>
                        <h3 className={styles.permissionsSectionTitle}>{section}</h3>
                        <span className={styles.permissionsSectionCount}>{sectionPermissions.length}</span>
                      </div>
                      <div className={styles.permissionsSectionItems}>
                        {sectionPermissions.map((permission) => (
                          <div key={permission.id} className={styles.permissionCard}>
                            <div className={styles.permissionCardContent}>
                              <strong className={styles.permissionCardName}>{permission.name}</strong>
                              {permission.description && (
                                <span className={styles.permissionCardDescription}>{permission.description}</span>
                              )}
                            </div>
                            <PermissionGate permission={['admin:user:revoke']} fallback={null}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRevokePermission(permission.id)}
                                disabled={isRevoking}
                                aria-label="Отозвать право"
                                className={styles.permissionCardAction}
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
          <div className={styles.userDetailPagePanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Группы пользователя</h2>
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
              <div className={styles.emptyState}>
                <FiUsers className={styles.emptyStateIcon} />
                <p>Пользователь не состоит в группах</p>
              </div>
            ) : (
              <div className={styles.groupsList}>
                {userGroups.map((group) => (
                  <div key={group.id} className={styles.groupCard}>
                    <div className={styles.groupCardIcon}>
                      <FiUsers />
                    </div>
                    <div className={styles.groupCardContent}>
                      <strong className={styles.groupCardName}>{group.name}</strong>
                      {group.description && (
                        <span className={styles.groupCardDescription}>{group.description}</span>
                      )}
                      {group.permissions && (
                        <span className={styles.groupCardMeta}>
                          Прав: {group.permissions.length}
                        </span>
                      )}
                    </div>
                    <div className={styles.groupCardActions}>
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
          <p className={styles.modalText}>
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
