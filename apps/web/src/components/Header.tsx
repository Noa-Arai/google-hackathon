'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserSwitcher from './UserSwitcher';

interface HeaderProps {
    circleName?: string;
}

export default function Header({ circleName = 'CIRCLE' }: HeaderProps) {
    const pathname = usePathname();


    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-8 py-5">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/announcements" className="group">
                        <span className="text-2xl font-black tracking-wider text-white">
                            {circleName}
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-8">
                        {/* Event List / Calendar */}
                        <Link
                            href="/events"
                            className={`relative text-sm font-medium tracking-wide transition-all ${pathname.startsWith('/events')
                                ? 'text-white'
                                : 'text-[#8b98b0] hover:text-white'
                                }`}
                        >
                            イベント一覧
                            {pathname.startsWith('/events') && (
                                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#3b82f6]" />
                            )}
                        </Link>

                        {/* Practices */}
                        <Link
                            href="/practices"
                            className={`relative text-sm font-medium tracking-wide transition-all ${pathname.startsWith('/practices')
                                ? 'text-white'
                                : 'text-[#8b98b0] hover:text-white'
                                }`}
                        >
                            練習
                            {pathname.startsWith('/practices') && (
                                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#3b82f6]" />
                            )}
                        </Link>

                        {/* Payments */}
                        <Link
                            href="/payments"
                            className={`relative text-sm font-medium tracking-wide transition-all ${pathname.startsWith('/payments')
                                ? 'text-white'
                                : 'text-[#8b98b0] hover:text-white'
                                }`}
                        >
                            精算
                            {pathname.startsWith('/payments') && (
                                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#3b82f6]" />
                            )}
                        </Link>

                        {/* My Page */}
                        <Link
                            href="/profile"
                            className={`relative text-sm font-medium tracking-wide transition-all ${pathname.startsWith('/profile')
                                ? 'text-white'
                                : 'text-[#8b98b0] hover:text-white'
                                }`}
                        >
                            マイページ
                            {pathname.startsWith('/profile') && (
                                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#3b82f6]" />
                            )}
                        </Link>

                        {/* User Switcher */}
                        <div className="ml-4 pl-4 border-l border-white/10">
                            <UserSwitcher />
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
