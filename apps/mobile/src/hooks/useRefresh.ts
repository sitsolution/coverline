import { useCallback, useState } from 'react';

/**
 * Drop-in pull-to-refresh for any ScrollView.
 *
 * Usage:
 *   const { refreshing, onRefresh } = useRefresh(loadData);
 *   <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
 */
export function useRefresh(load: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { refreshing, onRefresh };
}
