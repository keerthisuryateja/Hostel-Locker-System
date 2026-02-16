import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

export function useIsAdmin() {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!isLoaded || !isSignedIn) {
                console.log('useIsAdmin: Not loaded or not signed in');
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const token = await getToken();

                // Helper to get base URL (same as in api/lockers.ts)
                const getBaseUrl = () => {
                    let url = import.meta.env.VITE_API_URL;
                    if (!url) return '/api';
                    if (url.endsWith('/')) url = url.slice(0, -1);
                    if (!url.endsWith('/api')) url += '/api';
                    return url;
                };

                const baseURL = getBaseUrl();
                console.log('useIsAdmin: Checking admin status at', `${baseURL}/admin/check`);

                const response = await axios.get(`${baseURL}/admin/check`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('useIsAdmin: Check response', response.data);
                setIsAdmin(true);
            } catch (error) {
                console.error('useIsAdmin: Check failed', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [isLoaded, isSignedIn, getToken]);

    return { isAdmin, loading };
}
