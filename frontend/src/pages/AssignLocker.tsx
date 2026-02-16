import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { assignLocker, addItems, getMyAssignment } from '../api/lockers';
import { useNavigate } from 'react-router-dom';

export default function AssignLocker() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState([{ item_type: 'Laptop', model: '', color: '', notes: '' }]);
    const [hasActiveAssignment, setHasActiveAssignment] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        const checkAssignment = async () => {
            if (!user) return;
            try {
                const assignment = await getMyAssignment(user.id);
                if (assignment) {
                    setHasActiveAssignment(true);
                }
            } catch (error) {
                console.error("Failed to check assignment status", error);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkAssignment();
    }, [user]);

    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleAddItemField = () => {
        setItems([...items, { item_type: 'Laptop', model: '', color: '', notes: '' }]);
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);
        const toastId = toast.loading('Processing...');

        try {
            const studentId = user.id;

            if (hasActiveAssignment) {
                await addItems(studentId, items);
                toast.success("New items added successfully!", { id: toastId });
            } else {
                const result = await assignLocker(studentId, items);
                toast.success(`Locker ${result.locker_number} Assigned! Pass: ${result.password}`, { id: toastId, duration: 6000 });
            }
            navigate('/dashboard');
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(err);
            const errorMsg = err.response?.data?.error || 'Failed to process request.';
            setError(errorMsg);
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return <div className="text-white text-center mt-20">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {hasActiveAssignment ? "Add Items to Locker" : "New Locker Assignment"}
                </h1>
                <p className="text-gray-400 mt-2">
                    {hasActiveAssignment
                        ? "Secure more belongings in your existing locker."
                        : "Secure your belongings in just a few steps."}
                </p>
            </div>

            <div className="bg-surface rounded-2xl border border-white/5 shadow-2xl p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 font-bold text-sm">1</span>
                            <h2 className="text-lg font-semibold text-white">Student Details</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Name</label>
                                <input type="text" value={user?.fullName || ''} disabled className="block w-full rounded-xl border border-white/10 bg-surfaceHighlight px-4 py-2.5 text-gray-300 sm:text-sm focus:ring-0 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Student ID</label>
                                <input type="text" value={user?.id || ''} disabled className="block w-full rounded-xl border border-white/10 bg-surfaceHighlight px-4 py-2.5 text-gray-300 sm:text-sm focus:ring-0 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 font-bold text-sm">2</span>
                                <h2 className="text-lg font-semibold text-white">Stored Items</h2>
                            </div>
                            <button type="button" onClick={handleAddItemField} className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                + Add Another Item
                            </button>
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className="bg-surfaceHighlight/50 p-5 rounded-xl border border-white/5 space-y-4 transition-all hover:bg-surfaceHighlight">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Type</label>
                                        <div className="relative">
                                            <select
                                                value={item.item_type}
                                                onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                                                className="block w-full appearance-none rounded-xl border border-white/10 bg-background px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                            >
                                                <option>Laptop</option>
                                                <option>Mobile</option>
                                                <option>Tablet</option>
                                                <option>Documents</option>
                                                <option>Others</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Model / Description</label>
                                        <input
                                            type="text"
                                            value={item.model}
                                            onChange={(e) => handleItemChange(index, 'model', e.target.value)}
                                            placeholder="e.g. MacBook Pro"
                                            className="block w-full rounded-xl border border-white/10 bg-background px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm placeholder-gray-600 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Color</label>
                                        <input
                                            type="text"
                                            value={item.color}
                                            onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                                            className="block w-full rounded-xl border border-white/10 bg-background px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                            className="block w-full rounded-xl border border-white/10 bg-background px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-blue-500 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : (hasActiveAssignment ? 'Add Items' : 'Assign Secure Locker')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
