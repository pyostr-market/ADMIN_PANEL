import { useEffect } from 'react';
import { useSocket } from './SocketProvider';

export function useSocketCollectionUpdater({ entity, setItems, getId = (item) => item.id }) {
  const socket = useSocket();

  useEffect(() => {
    const unsubscribeCreate = socket.subscribe(`${entity}:create`, (createdItem) => {
      setItems((prev) => {
        const createdId = getId(createdItem);
        const alreadyExists = prev.some((item) => getId(item) === createdId);

        if (alreadyExists) {
          return prev;
        }

        return [createdItem, ...prev];
      });
    });

    const unsubscribeUpdate = socket.subscribe(`${entity}:update`, (updatedItem) => {
      setItems((prev) => {
        const updatedId = getId(updatedItem);
        const exists = prev.some((item) => getId(item) === updatedId);

        if (!exists) {
          return prev;
        }

        return prev.map((item) => (getId(item) === updatedId ? updatedItem : item));
      });
    });

    const unsubscribeDelete = socket.subscribe(`${entity}:delete`, (deletedItem) => {
      setItems((prev) => {
        const deletedId = getId(deletedItem);
        const exists = prev.some((item) => getId(item) === deletedId);

        if (!exists) {
          return prev;
        }

        return prev.filter((item) => getId(item) !== deletedId);
      });
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [entity, getId, setItems, socket]);
}
