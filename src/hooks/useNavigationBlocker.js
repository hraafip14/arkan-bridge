import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

const useNavigationBlocker = (isDirty, onBlock) => {
  // useBlocker harus menerima fungsi biasa, bukan useCallback langsung
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return isDirty && currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') {
      onBlock({
        proceed : () => blocker.proceed(),
        reset   : () => blocker.reset(),
      });
    }
  }, [blocker.state]);
};

export default useNavigationBlocker;