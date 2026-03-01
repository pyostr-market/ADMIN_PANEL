import { useState, useCallback } from 'react';

/**
 * Хук для управления модальными окнами CRUD
 * @param {Object} options - Опции хука
 * @param {boolean} options.initialOpen - Начальное состояние модального окна
 * @returns {Object} - Методы и состояние для управления модальными окнами
 */
export function useCrudModal({ initialOpen = false } = {}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const openEditModal = useCallback((item) => {
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setEditingItem(null);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsCreateModalOpen(false);
    setEditingItem(null);
  }, []);

  return {
    isOpen,
    isCreateModalOpen,
    editingItem,
    openEditModal,
    closeEditModal,
    openCreateModal,
    closeCreateModal,
    closeModal,
  };
}
