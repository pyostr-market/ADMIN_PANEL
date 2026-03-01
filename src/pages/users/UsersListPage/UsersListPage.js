import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiPlus, FiTrash2, FiUser, FiUserCheck, FiUserX, FiEye } from 'react-icons/fi';
import { useCrudList } from '../../../shared/lib/crud';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getUsersRequest,
  deleteUserRequest,
  banUserRequest,
  getAllGroupsRequest,
} from '../api/usersApi';
import styles from './UsersListPage.module.css';

const PAGE_LIMIT = 20;

function BanUserModal({ user, onClose, onSubmit, isSubmitting }) {
  if (!user) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={user.is_active ? 'Бан пользователя' : 'Разбан пользователя'}
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant={user.is_active ? 'danger' : 'success'}
            onClick={onSubmit}
            loading={isSubmitting}
          >
            {user.is_active ? 'Заблокировать' : 'Разблокировать'}
          </Button>
        </>
      )}
    >
      <p className={styles.modalConfirmText}>
        {user.is_active
          ? `Вы уверены, что хотите заблокировать пользователя `
          : `Вы уверены, что хотите разблокировать пользователя `}
        <strong>{user.primary_phone?.phone_number || `ID: ${user.id}`}</strong>?
      </p>
      {user.is_active && (
        <p className={styles.modalConfirmNote}>
          Пользователь потеряет доступ к системе.
        </p>
      )}
    </Modal>
  );
}

function DeleteUserModal({ user, onClose, onSubmit, isSubmitting }) {
  if (!user) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление пользователя"
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="danger"
            onClick={onSubmit}
            loading={isSubmitting}
          >
            Удалить
          </Button>
        </>
      )}
    >
      <p className={styles.modalConfirmText}>
        Вы уверены, что хотите удалить пользователя{' '}
        <strong>{user.primary_phone?.phone_number || `ID: ${user.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function UsersListPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [userToBan, setUserToBan] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filters, setFilters] = useState({
    is_active: 'all',
    is_verified: 'all',
    group: 'all',
  });
  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const usersCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search, ...customFilters } = {}) => {
      const data = await getUsersRequest({
        page,
        limit,
        search,
        ...customFilters,
      });
      return data;
    },
    deleteFn: deleteUserRequest,
    entityName: 'Пользователь',
    defaultLimit: PAGE_LIMIT,
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Формируем API фильтры - только активные фильтры
    const apiFilters = {};
    if (newFilters.is_active !== 'all') {
      apiFilters.is_active = newFilters.is_active === 'true';
    }
    if (newFilters.is_verified !== 'all') {
      apiFilters.is_verified = newFilters.is_verified === 'true';
    }
    if (newFilters.group !== 'all') {
      apiFilters.group = newFilters.group;
    }

    // Передаем только активные фильтры в useCrudList
    usersCrud.setFilters(apiFilters);
    usersCrud.setPage(1);
    
    // Загружаем группы при первом изменении фильтра группы
    if (key === 'group' && groups.length === 0 && !isLoadingGroups) {
      loadGroups();
    }
  };

  const loadGroups = useCallback(async () => {
    if (groups.length > 0 || isLoadingGroups) return;

    setIsLoadingGroups(true);
    try {
      const allGroups = await getAllGroupsRequest();
      setGroups(allGroups);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [groups.length, isLoadingGroups, notifications]);

  const handleResetFilters = useCallback(() => {
    setFilters({ is_active: 'all', is_verified: 'all', group: 'all' });
    usersCrud.setFilters({});
    usersCrud.setPage(1);
  }, [usersCrud]);

  const handleBanUser = async () => {
    if (!userToBan) return;

    try {
      await banUserRequest(userToBan.id);
      notifications.info(
        userToBan.is_active
          ? 'Пользователь заблокирован'
          : 'Пользователь разблокирован'
      );
      await usersCrud.refresh();
      setUserToBan(null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const result = await usersCrud.delete(userToDelete.id);
    if (result) {
      setUserToDelete(null);
    }
  };

  const handleViewUser = (user) => {
    navigate(`/users/${user.id}`);
  };

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter((f) => f !== 'all').length;
  }, [filters]);

  // Конфигурация фильтров для CrudListLayout
  const filterConfigs = useMemo(() => [
    {
      key: 'is_active',
      label: 'Статус',
      options: [
        { value: 'all', label: 'Все статусы' },
        { value: 'true', label: 'Активные' },
        { value: 'false', label: 'Заблокированные' },
      ],
    },
    {
      key: 'is_verified',
      label: 'Верификация',
      options: [
        { value: 'all', label: 'Все верификации' },
        { value: 'true', label: 'Верифицированные' },
        { value: 'false', label: 'Не верифицированные' },
      ],
    },
    {
      key: 'group',
      label: 'Группа',
      options: [
        { value: 'all', label: 'Все группы' },
        ...groups.map((group) => ({ value: String(group.id), label: group.name })),
      ],
      onFocus: loadGroups,
      disabled: isLoadingGroups,
    },
  ], [groups, loadGroups]);

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.usersListPageTitle}>Пользователи</h1>
            <div className={styles.usersListPageControls}>
              <PermissionGate permission={['admin:user:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={handleCreateUser}
                >
                  Создать пользователя
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={usersCrud.search}
        onSearchChange={usersCrud.setSearch}
        searchLoading={usersCrud.isLoading}
        searchPlaceholder="Поиск по телефону или ID..."
        
        showFilters={true}
        filters={filters}
        filterConfigs={filterConfigs}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={activeFiltersCount > 0}
        filtersLoading={usersCrud.isLoading || isLoadingGroups}
        
        pagination={
          !usersCrud.isLoading && usersCrud.items && usersCrud.items.length > 0 ? (
            <Pagination
              currentPage={usersCrud.page}
              totalPages={usersCrud.pagination.pages}
              totalItems={usersCrud.pagination.total}
              onPageChange={usersCrud.setPage}
              loading={usersCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={usersCrud.items}
          renderItem={(user) => (
            <>
              <div className={styles.usersListPageItemContent} onClick={() => handleViewUser(user)}>
                <div className={styles.usersListPageItemMain}>
                  <div className={`${styles.usersListPageAvatar} ${user.is_active ? styles.usersListPageAvatarActive : styles.usersListPageAvatarInactive}`}>
                    <FiUser />
                  </div>
                  <div className={styles.usersListPageItemInfo}>
                    <div className={styles.usersListPageItemHeader}>
                      <p className={styles.usersListPageItemTitle}>
                        {user.primary_phone?.phone_number || 'Без телефона'}
                      </p>
                      <div className={styles.usersListPageItemBadges}>
                        {!user.is_active && (
                          <span className={`${styles.usersListPageBadge} ${styles.usersListPageBadgeInactive}`} title="Заблокирован">
                            <FiUserX />
                          </span>
                        )}
                        {user.is_verified && (
                          <span className={`${styles.usersListPageBadge} ${styles.usersListPageBadgeVerified}`} title="Верифицирован">
                            <FiCheck />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.usersListPageItemMeta}>
                      <span className={styles.usersListPageMetaItem}>
                        <span className={styles.usersListPageMetaLabel}>ID:</span> {user.id}
                      </span>
                      {user.fio && (
                        <>
                          <span className={styles.usersListPageSeparator}>•</span>
                          <span className={styles.usersListPageMetaItem}>
                            <FiUser className={styles.usersListPageMetaIcon} />
                            {user.fio}
                          </span>
                        </>
                      )}
                      {(user.group || user.created_at) && (
                        <>
                          <span className={styles.usersListPageSeparator}>•</span>
                          {user.group && (
                            <span className={styles.usersListPageMetaItem}>
                              <FiUser className={styles.usersListPageMetaIcon} />
                              {user.group.name}
                            </span>
                          )}
                          {user.group && user.created_at && (
                            <span className={styles.usersListPageSeparator}>•</span>
                          )}
                          {user.created_at && (
                            <span className={styles.usersListPageMetaItem}>
                              {new Date(user.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.usersListPageItemActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewUser(user)}
                  aria-label={`Просмотреть пользователя ${user.primary_phone?.phone_number || user.id}`}
                >
                  Просмотр
                </Button>

                <PermissionGate permission={['admin:user:ban']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUserToBan(user)}
                    disabled={usersCrud.isSubmitting}
                    aria-label={user.is_active ? 'Заблокировать пользователя' : 'Разблокировать пользователя'}
                    className={user.is_active ? styles.btnBan : styles.btnUnban}
                  >
                    {user.is_active ? <FiUserX /> : <FiUserCheck />}
                  </Button>
                </PermissionGate>

                <PermissionGate permission={['admin:user:delete']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUserToDelete(user)}
                    disabled={usersCrud.isSubmitting}
                    aria-label="Удалить пользователя"
                    className={styles.btnDelete}
                  >
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={
            usersCrud.isLoading
              ? 'Загрузка пользователей...'
              : usersCrud.search || activeFiltersCount > 0
                ? 'По вашему запросу ничего не найдено.'
                : 'Пользователи не найдены.'
          }
          loading={usersCrud.isLoading}
        />
      </CrudListLayout>

      {userToBan && (
        <BanUserModal
          user={userToBan}
          onClose={() => setUserToBan(null)}
          onSubmit={handleBanUser}
          isSubmitting={usersCrud.isSubmitting}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onSubmit={handleDeleteUser}
          isSubmitting={usersCrud.isSubmitting}
        />
      )}
    </>
  );
}
