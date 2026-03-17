import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface UseApiDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiData<T>(endpoint: string): UseApiDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoint);
      // Handle both paginated { data: [...] } and flat array responses
      const result = response.data?.data ?? response.data ?? [];
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      console.error(`Failed to fetch ${endpoint}:`, err);
      setError(err.message || 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
