import { Link, Outlet } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import Logo from './Logo';

export default function Layout() {
    const { isAdmin } = useIsAdmin();

    return (
        <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-blue-500/30">
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                            <Logo />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link to="/dashboard" className="text-gray-400 transition-colors hover:text-white">Dashboard</Link>
                            <Link to="/assign" className="text-gray-400 transition-colors hover:text-white">New Assignment</Link>
                            {isAdmin && (
                                <Link to="/admin" className="text-red-400 transition-colors hover:text-red-300 font-semibold">Admin</Link>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 border-2 border-white/20"
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>
                </div>
            </header>
            <main className="container mx-auto py-10 px-4">
                <Outlet />
            </main>
        </div>
    );
}
