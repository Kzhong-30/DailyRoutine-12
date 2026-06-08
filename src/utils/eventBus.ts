type Listener = () => void;
const listeners = new Set<Listener>();

export const notifyDataChanged = () => {
  listeners.forEach(listener => listener());
};

export const subscribeDataChanged = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
