'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    circleName?: string;
}

export default function Header({ circleName = 'CIRCLE' }: HeaderProps) {
    const pathname = usePathname();

    const navItems = [
        { href: '/announcements', label: 'ホーム' },
        { href: '/calendar', label: 'カレンダー' },
        { href: '/payments', label: '支払い' },
    ];

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
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative text-sm font-medium tracking-wide transition-all ${isActive
                                        ? 'text-white'
                                        : 'text-[#8b98b0] hover:text-white'
                                        }`}
                                >
                                    {item.label}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#3b82f6]" />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Create Event Button */}
                        <Link
                            href="/events/new"
                            className="ml-4 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors flex items-center gap-2"
                        >
                            <span>+</span> 新規作成
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
