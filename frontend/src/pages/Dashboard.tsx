import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { getLockerStatus, returnLocker, getMyAssignment, addItem, getLockerStatusAdmin } from '../api/lockers';
import LockerVisual from '../components/LockerVisual';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useAuth } from '@clerk/clerk-react';

interface Locker {
    id: number;
    locker_number: number;
    status: 'available' | 'occupied' | 'maintenance';
    assigned_to?: string; // For admins
}

interface Item {
    item_type: string;
    model?: string;
    color?: string;
    notes?: string;
}

interface Assignment {
    id: string;
    locker_id: number;
    password: string;
    assigned_at: string;
    lockers: { locker_number: number };
    stored_items: Item[];
}

export default function Dashboard() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { isAdmin } = useIsAdmin();
    const [lockers, setLockers] = useState<Locker[]>([]);
    const [myAssignment, setMyAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');
    const [showAddItem, setShowAddItem] = useState(false);
    const [showConfirmReturn, setShowConfirmReturn] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let lockersPromise;
                if (isAdmin) {
                    const token = await getToken();
                    if (token) {
                        lockersPromise = getLockerStatusAdmin(token);
                    } else {
                        lockersPromise = getLockerStatus();
                    }
                } else {
                    lockersPromise = getLockerStatus();
                }

                const [lockersData, myData] = await Promise.all([
                    lockersPromise,
                    user ? getMyAssignment(user.id) : Promise.resolve(null)
                ]);
                setLockers(lockersData);
                setMyAssignment(myData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        // Only fetch when admin status is determined (isAdmin doesn't start as false then true, wait for logic if needed, 
        // but simple dependency is fine for now as useIsAdmin handles loading state internally)
        if (user) {
            fetchData();
        }
    }, [user, isAdmin, getToken]);

    // Re-fetch function for updates (outside useEffect to avoid dependency cycles, 
    // but ideally we'd structure this differently. For now, duplication or refactoring needed.
    // Let's just define a separate refresh function that uses the same logic but isn't the effect itself.)
    const refreshData = async () => {
        try {
            // setLoading(true); // Optional: don't show full loading state on refresh
            const [lockersData, myData] = await Promise.all([
                getLockerStatus(),
                user ? getMyAssignment(user.id) : Promise.resolve(null)
            ]);
            setLockers(lockersData);
            setMyAssignment(myData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const handleReturnClick = () => {
        setShowConfirmReturn(true);
    };

    const confirmReturn = async () => {
        if (!myAssignment || !user) return;

        const toastId = toast.loading('Returning locker...');

        try {
            await returnLocker(user.id, myAssignment.lockers.locker_number);
            toast.success("Locker returned successfully!", { id: toastId });
            setShowConfirmReturn(false);
            refreshData();
        } catch (error) {
            console.error("Failed to return locker", error);
            toast.error("Failed to return locker.", { id: toastId });
        }
    };

    const handleAddItem = async (item: Item) => {
        if (!user) return;
        const toastId = toast.loading('Adding item...');
        try {
            await addItem(user.id, item);
            toast.success("Item added successfully!", { id: toastId });
            setShowAddItem(false);
            refreshData();
        } catch (error) {
            console.error("Failed to add item", error);
            toast.error("Failed to add item.", { id: toastId });
        }
    };

    const handleSubmitAddItem = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleAddItem({
            item_type: formData.get('item_type') as string,
            model: formData.get('model') as string || undefined,
            color: formData.get('color') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        });
    };

    const filteredLockers = lockers.filter(locker => {
        if (filter === 'all') return true;
        return locker.status === filter;
    });

    const stats = {
        total: lockers.length,
        available: lockers.filter(l => l.status === 'available').length,
        occupied: lockers.filter(l => l.status === 'occupied').length,
    };

    return (
        <div className="space-y-10">
            {/* My Assignment Section */}
            {myAssignment && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white shadow-2xl ring-1 ring-white/10">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-10">

                        {/* Interactive Locker Visual */}
                        <div className="w-48 md:w-56 flex-shrink-0 perspective-1000">
                            <LockerVisual
                                status="my-locker"
                                lockerNumber={myAssignment.lockers.locker_number}
                                items={myAssignment.stored_items}
                                isOpen={true}
                            />
                        </div>

                        <div className="flex-1 w-full">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-md border border-white/10 mb-4">
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                                Active Session
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Your Secure Locker</h2>
                            <p className="text-blue-100/80 mt-1 max-w-sm">
                                Use the visual container system to organize your stored items.
                                Click "Add Item" to place a new container.
                            </p>

                            <div className="mt-8 flex gap-12">
                                <div>
                                    <span className="block text-xs font-medium uppercase tracking-wider opacity-60">Locker No.</span>
                                    <span className="text-5xl font-black mt-1 block">{myAssignment.lockers.locker_number}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium uppercase tracking-wider opacity-60">Passcode</span>
                                    <div className="mt-2 flex gap-1">
                                        {myAssignment.password.split('').map((digit, i) => (
                                            <span key={i} className="flex h-10 w-8 items-center justify-center rounded bg-white/20 font-mono text-xl font-bold backdrop-blur-sm">
                                                {digit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-4 bg-black/20 p-5 rounded-2xl backdrop-blur-md border border-white/5 min-w-[200px]">
                            <div>
                                <span className="text-xs font-medium uppercase tracking-wider opacity-60 mb-2 block">Stored Items</span>
                                <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    {myAssignment.stored_items.map((item: Item, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-300 flex-shrink-0"></span>
                                            <div className='flex flex-col'>
                                                <span className="font-medium text-white">{item.item_type}</span>
                                                <span className="text-white/60 text-xs">
                                                    {[item.model, item.color].filter(Boolean).join(' • ')}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setShowAddItem(true)}
                                    className="mt-3 w-full text-xs font-medium text-blue-200 hover:text-white transition-colors flex items-center justify-center gap-1 py-1 rounded-lg hover:bg-white/5"
                                >
                                    + Add Item
                                </button>
                            </div>
                            <button
                                onClick={handleReturnClick}
                                className="mt-2 w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                            >
                                Return & Release
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-white/10">
                        <h3 className="text-lg font-bold text-white mb-4">Add New Item</h3>
                        <form onSubmit={handleSubmitAddItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Item Type</label>
                                <input name="item_type" required className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Laptop" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Model (Optional)</label>
                                <input name="model" className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. MacBook Pro" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Color (Optional)</label>
                                <input name="color" className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Space Grey" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Notes (Optional)</label>
                                <textarea name="notes" className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Additional details..." rows={2} />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddItem(false)} className="flex-1 rounded-xl bg-white/5 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10">Cancel</button>
                                <button type="submit" className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500">Add Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Return Modal */}
            {showConfirmReturn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-white/10 border border-white/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Return Locker?</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Are you sure you want to return your locker? This action cannot be undone and you will lose access immediately.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowConfirmReturn(false)}
                                    className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReturn}
                                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Yes, Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Locker Status</h1>
                    <p className="text-gray-400">Real-time availability monitoring.</p>
                </div>

                <div className="bg-surfaceHighlight p-1.5 rounded-xl inline-flex border border-white/5">
                    {(['all', 'available', 'occupied'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-background text-white shadow-sm ring-1 ring-white/10'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card title="Total Lockers" value={stats.total} />
                <Card title="Available" value={stats.available} className="text-green-400" />
                <Card title="Occupied" value={stats.occupied} className="text-red-400" />
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 animate-pulse">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="aspect-[100/160] bg-surfaceHighlight rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8">
                    {filteredLockers.map(locker => (
                        <LockerVisual
                            key={locker.id}
                            status={locker.status}
                            lockerNumber={locker.locker_number}
                            assigneeName={locker.assigned_to}
                            className="w-full hover:scale-105 transition-transform duration-300 cursor-pointer"
                        // onClick={() => { /* Future feature: Click to see details/rent */ }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function Card({ title, value, className = "" }: { title: string, value: number, className?: string }) {
    return (
        <div className="rounded-2xl border border-white/5 bg-surface p-6 shadow-xl shadow-black/20">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
            <div className={`mt-2 text-4xl font-bold tracking-tight ${className || 'text-white'}`}>{value}</div>
        </div>
    );
}
