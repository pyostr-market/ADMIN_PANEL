import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiPlus, FiSearch, FiTrash2, FiUser, FiUserCheck, FiUserX, FiEye } from 'react-icons/fi';
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
      <p className="modal-confirm-text">
        {user.is_active
          ? `Вы уверены, что хотите заблокировать пользователя `
          : `Вы уверены, что хотите разблокировать пользователя `}
        <strong>{user.primary_phone?.phone_number || `ID: ${user.id}`}</strong>?
      </p>
      {user.is_active && (
        <p className="modal-confirm-note">
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
      <p className="modal-confirm-text">
        Вы уверены, что хотите удалить пользователя{' '}
        <strong>{user.primary_phone?.phone_number || `ID: ${user.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
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

  return (
    <section className="users-list-page">
      {/* Header */}
      <header className="users-list-page__header">
        <div className="users-list-page__header-content">
          <h1 className="users-list-page__title">Пользователи</h1>
          <p className="users-list-page__subtitle">
            {usersCrud.pagination.total > 0
              ? `Найдено ${usersCrud.pagination.total} пользователей`
              : 'Список пользователей пуст'}
          </p>
        </div>
        <PermissionGate permission={['admin:user:create']} fallback={null}>
          <Button
            variant="primary"
            leftIcon={<FiPlus />}
            onClick={handleCreateUser}
            size="lg"
          >
            Создать пользователя
          </Button>
        </PermissionGate>
      </header>

      {/* Filters */}
      <div className={`users-list-page__filters${usersCrud.isLoading ? ' users-list-page__filters--loading' : ''}`}>
        <div className="users-list-page__filters-main">
          <div className="users-list-page__search-wrapper">
            <FiSearch className="users-list-page__search-icon" />
            <SearchInput
              value={usersCrud.search}
              onChange={(e) => usersCrud.setSearch(e.target.value)}
              placeholder="Поиск по телефону или ID..."
              loading={usersCrud.isLoading}
              className="users-list-page__search"
            />
          </div>
        </div>
        
        <div className="users-list-page__filters-group">
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

      {/* List */}
      <EntityList
        items={usersCrud.items}
        renderItem={(user) => (
          <>
            <div className="users-list-page__item-content" onClick={() => handleViewUser(user)}>
              <div className="users-list-page__item-main">
                <div className={`users-list-page__avatar ${user.is_active ? 'users-list-page__avatar--active' : 'users-list-page__avatar--inactive'}`}>
                  <FiUser />
                </div>
                <div className="users-list-page__item-info">
                  <div className="users-list-page__item-header">
                    <p className="users-list-page__item-title">
                      {user.primary_phone?.phone_number || 'Без телефона'}
                    </p>
                    <div className="users-list-page__item-badges">
                      {!user.is_active && (
                        <span className="users-list-page__badge users-list-page__badge--inactive" title="Заблокирован">
                          <FiUserX />
                        </span>
                      )}
                      {user.is_verified && (
                        <span className="users-list-page__badge users-list-page__badge--verified" title="Верифицирован">
                          <FiCheck />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="users-list-page__item-meta">
                    <span className="users-list-page__meta-item">
                      <span className="users-list-page__meta-label">ID:</span> {user.id}
                    </span>
                    {user.group && (
                      <>
                        <span className="users-list-page__separator">•</span>
                        <span className="users-list-page__meta-item">
                          <FiUser className="users-list-page__meta-icon" />
                          {user.group.name}
                        </span>
                      </>
                    )}
                    {user.created_at && (
                      <>
                        <span className="users-list-page__separator">•</span>
                        <span className="users-list-page__meta-item">
                          {new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="users-list-page__item-actions">
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
                  className={user.is_active ? 'btn-ban' : 'btn-unban'}
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
                  className="btn-delete"
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
            : usersCrud.search || Object.values(filters).some((f) => f !== 'all')
              ? 'По вашему запросу ничего не найдено.'
              : 'Пользователи не найдены.'
        }
        loading={usersCrud.isLoading}
      />

      {/* Pagination */}
      {!usersCrud.isLoading && usersCrud.items && usersCrud.items.length > 0 && (
        <Pagination
          currentPage={usersCrud.page}
          totalPages={usersCrud.pagination.pages}
          totalItems={usersCrud.pagination.total}
          onPageChange={usersCrud.setPage}
          loading={usersCrud.isLoading}
        />
      )}

      {/* Modals */}
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
