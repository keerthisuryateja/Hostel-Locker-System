import React from 'react';

interface Item {
    item_type: string;
    model?: string;
    color?: string;
}

interface LockerVisualProps {
    status: 'available' | 'occupied' | 'maintenance' | 'my-locker';
    lockerNumber?: number;
    items?: Item[];
    isOpen?: boolean;
    className?: string;
    onClick?: () => void;
    assigneeName?: string | null;
}

const LockerVisual: React.FC<LockerVisualProps> = ({ status, lockerNumber, items = [], isOpen = false, className = "", onClick, assigneeName }) => {

    // Base colors
    const metalDark = "#334155"; // Slate 700
    const metalLight = "#475569"; // Slate 600

    const isAvailable = status === 'available';
    const isOccupied = status === 'occupied' || status === 'my-locker';
    const isMaintenance = status === 'maintenance';

    // Status colors
    let doorColor = metalLight;
    let stressColor = metalDark;

    if (isAvailable) {
        doorColor = "#059669"; // Emerald 600
        stressColor = "#047857"; // Emerald 700
    } else if (status === 'occupied') {
        doorColor = "#dc2626"; // Red 600
        stressColor = "#b91c1c"; // Red 700
    } else if (status === 'my-locker') {
        doorColor = "#2563eb"; // Blue 600
        stressColor = "#1d4ed8"; // Blue 700
    } else if (isMaintenance) {
        doorColor = "#d97706"; // Amber 600
        stressColor = "#b45309"; // Amber 700
    }

    const Container = ({ color, index }: { color?: string, index: number }) => {
        // Generate a deterministic random color if none provided, based on index
        const defaultColors = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"];
        const boxColor = color || defaultColors[index % defaultColors.length];

        return (
            <g transform={`translate(${15 + (index % 2) * 35}, ${55 - (Math.floor(index / 2) * 25)})`}>
                {/* Box Body */}
                <rect x="0" y="0" width="30" height="20" fill={boxColor} stroke="rgba(0,0,0,0.2)" rx="2" />
                {/* Lid/Crease */}
                <line x1="0" y1="5" x2="30" y2="5" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                {/* Label hint */}
                <rect x="8" y="8" width="14" height="8" fill="rgba(255,255,255,0.3)" rx="1" />
            </g>
        );
    };

    return (
        <div className={`relative ${className}`} onClick={onClick}>
            <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-xl" style={{ filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.3))' }}>
                <defs>
                    <linearGradient id={`grad-${lockerNumber}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={stressColor} />
                        <stop offset="50%" stopColor={doorColor} />
                        <stop offset="100%" stopColor={stressColor} />
                    </linearGradient>
                    <filter id="inner-shadow">
                        <feOffset dx="0" dy="2" />
                        <feGaussianBlur stdDeviation="2" result="offset-blur" />
                        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                        <feFlood floodColor="black" floodOpacity="0.5" result="color" />
                        <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                        <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                    </filter>
                </defs>

                {/* Main Locker Body (Outer Frame) */}
                <rect x="5" y="5" width="90" height="150" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

                {/* Locker Interior (Visible if open) */}
                <rect x="10" y="10" width="80" height="140" fill="#0f172a" />
                {/* Shelves */}
                <line x1="10" y1="50" x2="90" y2="50" stroke="#334155" strokeWidth="2" />
                <line x1="10" y1="100" x2="90" y2="100" stroke="#334155" strokeWidth="2" />

                {/* Items/Containers inside */}
                {isOpen && items && items.length > 0 && (
                    <g>
                        {items.map((item, i) => (
                            <Container key={i} index={i} color={item.color && item.color.startsWith('#') ? item.color : undefined} />
                        ))}
                    </g>
                )}
                {isOpen && items && items.length === 0 && (
                    <text x="50" y="80" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">EMPTY</text>
                )}


                {/* Locker Door Group */}
                <g className={`transition-transform duration-700 origin-left ${isOpen ? 'rotate-y-open' : ''}`} style={{ transformOrigin: '5px 5px', transform: isOpen ? 'perspective(1000px) rotateY(-110deg)' : 'none' }}>

                    {/* Door Shape */}
                    <rect x="5" y="5" width="90" height="150" rx="2" fill={`url(#grad-${lockerNumber})`} stroke={stressColor} strokeWidth="1" />

                    {/* Vents */}
                    <g fill="rgba(0,0,0,0.2)">
                        <rect x="25" y="15" width="50" height="3" rx="1.5" />
                        <rect x="25" y="21" width="50" height="3" rx="1.5" />
                        <rect x="25" y="27" width="50" height="3" rx="1.5" />

                        <rect x="25" y="130" width="50" height="3" rx="1.5" />
                        <rect x="25" y="136" width="50" height="3" rx="1.5" />
                        <rect x="25" y="142" width="50" height="3" rx="1.5" />
                    </g>

                    {/* Number Plate */}
                    <rect x="35" y="40" width="30" height="12" rx="1" fill="#e2e8f0" stroke="#94a3b8" />
                    <text x="50" y="49" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#0f172a">{lockerNumber}</text>

                    {/* Admin Visibility: Assignee Name Tag */}
                    {assigneeName && (
                        <g transform="translate(15, 95)">
                            <rect x="0" y="0" width="70" height="14" rx="2" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
                            <circle cx="8" cy="7" r="3" fill="#3b82f6" />
                            <text x="15" y="10" fontSize="7" fontWeight="bold" fill="#334155" fontFamily="sans-serif">
                                {assigneeName.length > 12 ? assigneeName.substring(0, 10) + '..' : assigneeName}
                            </text>
                        </g>
                    )}

                    {/* Digital Keypad */}
                    <g transform="translate(35, 65)">
                        <rect x="0" y="0" width="30" height="40" rx="2" fill="#1e293b" stroke="#334155" />
                        {/* Screen */}
                        <rect x="5" y="5" width="20" height="8" rx="1" fill="#0f172a" />
                        <text x="15" y="11" textAnchor="middle" fontSize="5" fill="#10b981" fontFamily="monospace">{isOpen ? "OPEN" : "LOCKED"}</text>
                        {/* Buttons Grid */}
                        <g transform="translate(5, 18)" fill="#cbd5e1">
                            <circle cx="2" cy="2" r="1.5" /> <circle cx="10" cy="2" r="1.5" /> <circle cx="18" cy="2" r="1.5" />
                            <circle cx="2" cy="8" r="1.5" /> <circle cx="10" cy="8" r="1.5" /> <circle cx="18" cy="8" r="1.5" />
                            <circle cx="2" cy="14" r="1.5" /> <circle cx="10" cy="14" r="1.5" /> <circle cx="18" cy="14" r="1.5" />
                            <circle cx="10" cy="20" r="1.5" />
                        </g>
                    </g>

                    {/* Handle/Lock Mechanism */}
                    <rect x="75" y="70" width="8" height="20" rx="1" fill="#cbd5e1" stroke="#94a3b8" />

                    {/* Status Indicator (Padlock or Open) */}
                    {status === 'occupied' && !isOpen && (
                        <g transform="translate(73, 76) scale(0.8)">
                            <path d="M6 2C6 0.9 6.9 0 8 0C9.1 0 10 0.9 10 2V4H6V2ZM4 4V2C4 0 6 0 8 0C10 0 12 0 12 2V4H13C13.6 4 14 4.4 14 5V10C14 10.6 13.6 11 13 11H3C2.4 11 2 10.6 2 10V5C2 4.4 2.4 4 3 4H4Z" fill="#1e293b" />
                        </g>
                    )}
                </g>
            </svg>

            {/* Status Label below (Optional) */}
            <div className={`mt-2 text-center text-xs font-bold uppercase tracking-wider ${isOpen ? 'text-blue-400' : isAvailable ? 'text-green-400' : isOccupied ? 'text-red-400' : 'text-gray-500'}`}>
                {status === 'my-locker' ? 'My Locker' : status}
            </div>
        </div>
    );
};

export default LockerVisual;
