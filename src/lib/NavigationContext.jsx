import React, { createContext, useContext, useRef, useCallback, useMemo } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const stackRef = useRef([]);

  const openModal = useCallback((handler) => {
    stackRef.current.push(handler);
    window.history.pushState({ modal: true }, '');
  }, []);

  const closeModal = useCallback((handler) => {
    stackRef.current = stackRef.current.filter(h => h !== handler);
  }, []);

  React.useEffect(() => {
    const onPopState = () => {
      const stack = stackRef.current;
      if (stack.length > 0) {
        const handler = stack[stack.length - 1];
        stack.pop();
        handler?.();
        window.history.pushState({ modal: true }, '');
      }
    };
    window.addEventListener('popstate', onPopState, { passive: true });
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Memoize context value so consumers don't re-render on unrelated parent renders
  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useModalBack(onBack) {
  const ctx = useContext(NavigationContext);
  // Use refs to avoid stale closure issues without triggering re-renders
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const openModal = useCallback(() => {
    ctx?.openModal(onBackRef.current);
  }, [ctx]);

  const closeModal = useCallback(() => {
    ctx?.closeModal(onBackRef.current);
  }, [ctx]);

  return { openModal, closeModal };
}