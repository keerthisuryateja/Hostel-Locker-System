import { useEffect, useState } from 'react';
import { getAllLockersAdmin, forceReleaseLocker, updateLockerStatus } from '../api/admin';
import { useAuth } from '@clerk/clerk-react';
import { useIsAdmin } from '../hooks/useIsAdmin';

interface Locker {
    id: number;
    locker_number: number;
    status: 'available' | 'occupied' | 'maintenance';
    active_assignment: {
        id: string;
        student_id: string;
        assigned_at: string;
        stored_items: { item_type: string, model: string }[];
    } | null;
}

export default function AdminDashboard() {
    const { getToken } = useAuth();
    const { isAdmin, loading: authLoading } = useIsAdmin();
    const [lockers, setLockers] = useState<Locker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            fetchLockers();
        }
    }, [isAdmin]);

    const fetchLockers = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const data = await getAllLockersAdmin(token);
            setLockers(data);
        } catch (error) {
            console.error("Failed to fetch lockers", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="p-8 text-white">Checking permissions...</div>;
    if (!isAdmin) return <div className="p-8 text-red-500 font-bold">Access Denied</div>;

    const handleForceRelease = async (lockerId: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = await getToken();
            await forceReleaseLocker(lockerId, token);
            fetchLockers();
        } catch (error) {
            console.error(error);
            alert("Failed");
        }
    };

    const handleStatusChange = async (lockerId: number, newStatus: string) => {
        try {
            const token = await getToken();
            await updateLockerStatus(lockerId, newStatus, token);
            fetchLockers();
        } catch (error) {
            console.error(error);
            alert("Failed");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Manage lockers and assignments.</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 shadow-xl bg-surface">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-surfaceHighlight/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Locker #</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Student ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-surface text-gray-300">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : lockers.map((locker) => (
                            <tr key={locker.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{locker.locker_number}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                        ${locker.status === 'available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            locker.status === 'occupied' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}
                                    `}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${locker.status === 'available' ? 'bg-green-400' :
                                                locker.status === 'occupied' ? 'bg-red-400' : 'bg-yellow-400'
                                            }`}></span>
                                        {locker.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {locker.active_assignment?.student_id || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {locker.active_assignment?.stored_items.map(i => i.item_type).join(', ') || '-'}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    {locker.status === 'occupied' && (
                                        <button
                                            onClick={() => handleForceRelease(locker.id)}
                                            className="text-red-400 hover:text-red-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
                                        >
                                            Force Release
                                        </button>
                                    )}
                                    {locker.status !== 'maintenance' ? (
                                        <button
                                            onClick={() => handleStatusChange(locker.id, 'maintenance')}
                                            className="text-yellow-500 hover:text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/10 transition-colors"
                                        >
                                            Maintenance
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusChange(locker.id, 'available')}
                                            className="text-green-400 hover:text-green-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors"
                                        >
                                            Set Available
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
