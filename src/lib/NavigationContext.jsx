import React, { createContext, useContext, useRef, useCallback } from 'react';

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
    const onPopState = (e) => {
      const stack = stackRef.current;
      if (stack.length > 0) {
        const handler = stack[stack.length - 1];
        stack.pop();
        handler?.();
        // Re-push so the URL doesn't change from the user's perspective
        window.history.pushState({ modal: true }, '');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <NavigationContext.Provider value={{ openModal, closeModal }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useModalBack(onBack) {
  const ctx = useContext(NavigationContext);

  const openModal = useCallback(() => {
    ctx?.openModal(onBack);
  }, [ctx, onBack]);

  const closeModal = useCallback(() => {
    ctx?.closeModal(onBack);
  }, [ctx, onBack]);

  return { openModal, closeModal };
}