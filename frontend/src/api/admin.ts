import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAllLockersAdmin = async (token?: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/admin/lockers', { headers });
    return response.data;
};

export const forceReleaseLocker = async (lockerId: number, token?: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/admin/lockers/release', {
        locker_id: lockerId
    }, { headers });
    return response.data;
};

export const updateLockerStatus = async (lockerId: number, status: string, token?: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put(`/admin/lockers/${lockerId}`, {
        status
    }, { headers });
    return response.data;
};
