import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiEdit2, FiPlus, FiSearch, FiTrash2, FiUser, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useCrudList } from '../../shared/lib/crud';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { SearchInput } from '../../shared/ui/SearchInput';
import { Select } from '../../shared/ui/Select';
import { Pagination } from '../../shared/ui/Pagination';
import { EntityList } from '../../shared/ui/EntityList';
import { Modal } from '../../shared/ui/Modal';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getUsersRequest,
  deleteUserRequest,
  banUserRequest,
  getAllGroupsRequest,
} from './api/usersApi';
import './UsersListPage.css';

const PAGE_LIMIT = 20;

function BanUserModal({ user, onClose, onSubmit, isSubmitting }) {
  if (!user) {
    return null;
  }

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
            variant={user.is_active ? 'danger' : 'primary'}
            onClick={onSubmit}
            loading={isSubmitting}
          >
            {user.is_active ? 'Заблокировать' : 'Разблокировать'}
          </Button>
        </>
      )}
    >
      <p>
        {user.is_active
          ? `Вы уверены, что хотите заблокировать пользователя `
          : `Вы уверены, что хотите разблокировать пользователя `}
        <strong>{user.primary_phone?.phone_number || `ID: ${user.id}`}</strong>?
      </p>
      {user.is_active && (
        <p className="users-page__confirm-text">
          Пользователь потеряет доступ к системе.
        </p>
      )}
    </Modal>
  );
}

function DeleteUserModal({ user, onClose, onSubmit, isSubmitting }) {
  if (!user) {
    return null;
  }

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
      <p>
        Вы уверены, что хотите удалить пользователя{' '}
        <strong>{user.primary_phone?.phone_number || `ID: ${user.id}`}</strong>?
      </p>
      <p className="users-page__confirm-text">
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

  // Загрузка групп для фильтра
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

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Преобразуем фильтры для API
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
    
    usersCrud.setFilters(apiFilters);
  };

  const handleBanUser = async () => {
    if (!userToBan) return;
    
    try {
      await banUserRequest(userToBan.id);
      notifications.info(
        userToBan.is_active
          ? `Пользователь заблокирован`
          : `Пользователь разблокирован`
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

  return (
    <section className="users-page">
      <header className="users-page__header">
        <h1 className="users-page__title">Пользователи</h1>
        <PermissionGate permission={['admin:user:create']} fallback={null}>
          <Button
            variant="primary"
            leftIcon={<FiPlus />}
            onClick={handleCreateUser}
          >
            Создать пользователя
          </Button>
        </PermissionGate>
      </header>

      <div className={`users-page__filters${usersCrud.isLoading ? ' users-page__filters--loading' : ''}`}>
        <SearchInput
          value={usersCrud.search}
          onChange={(e) => usersCrud.setSearch(e.target.value)}
          placeholder="Поиск пользователей..."
          loading={usersCrud.isLoading}
          className="users-page__search"
        />
        
        <div className="users-page__filters-group">
          <Select
            value={filters.is_active}
            onChange={(e) => handleFilterChange('is_active', e.target.value)}
            onFocus={loadGroups}
            options={[
              { value: 'all', label: 'Все статусы' },
              { value: 'true', label: 'Активные' },
              { value: 'false', label: 'Заблокированные' },
            ]}
            disabled={usersCrud.isLoading}
          />
          
          <Select
            value={filters.is_verified}
            onChange={(e) => handleFilterChange('is_verified', e.target.value)}
            onFocus={loadGroups}
            options={[
              { value: 'all', label: 'Все верификации' },
              { value: 'true', label: 'Верифицированные' },
              { value: 'false', label: 'Не верифицированные' },
            ]}
            disabled={usersCrud.isLoading}
          />
          
          <Select
            value={filters.group}
            onChange={(e) => handleFilterChange('group', e.target.value)}
            onFocus={loadGroups}
            options={[
              { value: 'all', label: 'Все группы' },
              ...groups.map((group) => ({ value: String(group.id), label: group.name })),
            ]}
            disabled={usersCrud.isLoading || isLoadingGroups}
          />
        </div>
      </div>

      <EntityList
        items={usersCrud.items}
        renderItem={(user) => (
          <>
            <div className="users-page__item-content">
              <div className="users-page__item-main">
                <div className={`users-page__avatar ${user.is_active ? 'users-page__avatar--active' : 'users-page__avatar--inactive'}`}>
                  <FiUser />
                </div>
                <div className="users-page__item-info">
                  <p className="users-page__item-title">
                    {user.primary_phone?.phone_number || 'Без телефона'}
                    {!user.is_active && (
                      <span className="users-page__badge users-page__badge--inactive">
                        Заблокирован
                      </span>
                    )}
                    {user.is_verified && (
                      <span className="users-page__badge users-page__badge--verified">
                        <FiCheck />
                      </span>
                    )}
                  </p>
                  <p className="users-page__item-meta">
                    <span>ID: {user.id}</span>
                    {user.group && (
                      <>
                        <span className="users-page__separator">•</span>
                        <span>Группа: {user.group.name}</span>
                      </>
                    )}
                    {user.created_at && (
                      <>
                        <span className="users-page__separator">•</span>
                        <span>Создан: {new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="users-page__item-actions">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewUser(user)}
                aria-label={`Просмотреть пользователя ${user.primary_phone?.phone_number || user.id}`}
              >
                <FiEdit2 />
              </Button>
              
              <PermissionGate permission={['admin:user:ban']} fallback={null}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUserToBan(user)}
                  disabled={usersCrud.isSubmitting}
                  aria-label={user.is_active ? 'Заблокировать пользователя' : 'Разблокировать пользователя'}
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
                >
                  <FiTrash2 />
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        emptyMessage={
          usersCrud.isLoading
            ? 'Загрузка...'
            : usersCrud.search || Object.values(filters).some((f) => f !== 'all')
              ? 'По вашему запросу ничего не найдено.'
              : 'Пользователи не найдены.'
        }
        loading={usersCrud.isLoading}
      />

      {!usersCrud.isLoading && usersCrud.items && usersCrud.items.length > 0 && (
        <Pagination
          currentPage={usersCrud.page}
          totalPages={usersCrud.pagination.pages}
          totalItems={usersCrud.pagination.total}
          onPageChange={usersCrud.setPage}
          loading={usersCrud.isLoading}
        />
      )}

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
    </section>
  );
}
