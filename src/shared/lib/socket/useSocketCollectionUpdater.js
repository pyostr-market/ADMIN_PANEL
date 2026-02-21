import { useEffect, useRef } from 'react';
import { useSocket } from './SocketProvider';

export function useSocketCollectionUpdater({ entity, setItems, getId = (item) => item.id }) {
  const socket = useSocket();
  
  // Refs для хранения актуальных значений без пересоздания эффектов
  const setItemsRef = useRef(setItems);
  const getIdRef = useRef(getId);

  // Обновляем ref при изменении значений
  useEffect(() => {
    setItemsRef.current = setItems;
  }, [setItems]);

  useEffect(() => {
    getIdRef.current = getId;
  }, [getId]);

  useEffect(() => {
    const unsubscribeCreate = socket.subscribe(`${entity}:create`, (createdItem) => {
      setItemsRef.current((prev) => {
        const createdId = getIdRef.current(createdItem);
        const alreadyExists = prev.some((item) => getIdRef.current(item) === createdId);

        if (alreadyExists) {
          return prev;
        }

        return [createdItem, ...prev];
      });
    });

    const unsubscribeUpdate = socket.subscribe(`${entity}:update`, (updatedItem) => {
      setItemsRef.current((prev) => {
        const updatedId = getIdRef.current(updatedItem);
        const exists = prev.some((item) => getIdRef.current(item) === updatedId);

        if (!exists) {
          return prev;
        }

        return prev.map((item) => (getIdRef.current(item) === updatedId ? updatedItem : item));
      });
    });

    const unsubscribeDelete = socket.subscribe(`${entity}:delete`, (deletedItem) => {
      setItemsRef.current((prev) => {
        const deletedId = getIdRef.current(deletedItem);
        const exists = prev.some((item) => getIdRef.current(item) === deletedId);

        if (!exists) {
          return prev;
        }

        return prev.filter((item) => getIdRef.current(item) !== deletedId);
      });
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [entity, socket]);
}
