import {useEffect, useState} from 'react';
import {useRouteLoaderData} from 'react-router';

export function useIsLoggedIn() {
  const rootData = useRouteLoaderData('root');
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    if (rootData?.isLoggedIn === undefined) {
      setIsLoggedIn(null);
      return undefined;
    }

    let cancelled = false;

    Promise.resolve(rootData.isLoggedIn)
      .then((value) => {
        if (!cancelled) setIsLoggedIn(Boolean(value));
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(null);
      });

    return () => {
      cancelled = true;
    };
  }, [rootData?.isLoggedIn]);

  return isLoggedIn;
}