import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Item {
    item_type: string;
    model?: string;
    color?: string;
    notes?: string;
}

export const getLockerStatus = async () => {
    const response = await api.get('/lockers/status');
    return response.data;
};

export const assignLocker = async (studentId: string, items: Item[]) => {
    const response = await api.post('/lockers/assign', {
        student_id: studentId,
        items,
    });
    return response.data;
};

export const returnLocker = async (studentId: string, lockerNumber: number) => {
    const response = await api.post('/lockers/return', {
        student_id: studentId,
        locker_number: lockerNumber,
    });
    return response.data;
};

export const getMyAssignment = async (studentId: string) => {
    const response = await api.get('/lockers/my-assignment', {
        params: { student_id: studentId },
    });
    return response.data;
};

export const addItem = async (studentId: string, item: Item) => {
    const response = await api.post('/lockers/add-item', {
        student_id: studentId,
        ...item
    });
    return response.data;
};

export const addItems = async (studentId: string, items: Item[]) => {
    const response = await api.post('/lockers/add-items', {
        student_id: studentId,
        items
    });
    return response.data;
};

export const getLockerStatusAdmin = async (token: string) => {
    const response = await api.get('/lockers/status-admin', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
