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
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const token = await getToken();
                const baseURL = import.meta.env.VITE_API_URL || '/api';
                await axios.get(`${baseURL}/admin/check`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsAdmin(true);
            } catch (error) {
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [isLoaded, isSignedIn, getToken]);

    return { isAdmin, loading };
}
