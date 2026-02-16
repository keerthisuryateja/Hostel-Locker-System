export default function Logo() {
    return (
        <div className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-20 blur-lg transition-all duration-300 group-hover:opacity-40 group-hover:blur-xl"></div>

                {/* Sharp Geometric Icon */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative h-8 w-8 text-blue-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                >
                    <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                    />
                    <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                    />
                    <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                    />
                    <path
                        d="M12 22V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                    />
                </svg>
            </div>

            <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white leading-none">
                    HOSTEL
                </span>
                <span className="text-sm font-bold tracking-[0.2em] text-blue-500 leading-none group-hover:text-blue-400 transition-colors">
                    LOCKERS
                </span>
            </div>
        </div>
    );
}
