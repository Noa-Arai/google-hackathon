'use client';

import { useState, useEffect } from 'react';
import { api, Event } from '@/lib/api';
import { DEFAULT_CIRCLE_ID } from '@/lib/constants';
import Link from 'next/link';

export default function CalendarPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getEvents(DEFAULT_CIRCLE_ID);
                const sortedEvents = (data || []).sort(
                    (a: Event, b: Event) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
                );
                setEvents(sortedEvents);
            } catch (err) {
                setError('APIサーバーに接続できません');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const eventsByMonth = events.reduce<Record<string, Event[]>>((acc, event) => {
        if (!event.startAt) return acc;
        const date = new Date(event.startAt);
        const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(event);
        return acc;
    }, {});

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        return { day, weekday };
    };

    return (
        <div className="max-w-3xl mx-auto relative">
            {/* Big outline text */}
            <div className="outline-text select-none hidden lg:block">CALENDAR</div>

            {/* Header */}
            <div className="mb-12 animate-slide-in relative z-10">
                <p className="section-title mb-3">スケジュール</p>
                <h1 className="text-4xl font-black text-white tracking-tight">カレンダー</h1>
                <div className="accent-bar mt-4" />
            </div>

            {isLoading ? (
                <div className="space-y-8">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-5 bg-[#1a2438] rounded w-24 mb-4"></div>
                            <div className="space-y-3">
                                <div className="card h-20"></div>
                                <div className="card h-20"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="card p-12 text-center animate-fade-in">
                    <span className="text-5xl mb-6 block opacity-30">⚠️</span>
                    <p className="text-[#8b98b0]">{error}</p>
                </div>
            ) : Object.keys(eventsByMonth).length === 0 ? (
                <div className="card p-16 text-center animate-fade-in">
                    <span className="text-6xl mb-6 block opacity-20">📅</span>
                    <h2 className="text-xl font-semibold text-white mb-2">予定はまだありません</h2>
                    <p className="text-[#8b98b0]">イベントが作成されると、ここに表示されます</p>
                </div>
            ) : (
                <div className="space-y-10 relative z-10">
                    {Object.entries(eventsByMonth).map(([month, monthEvents], monthIndex) => (
                        <div key={month} className="animate-fade-in" style={{ animationDelay: `${monthIndex * 100}ms` }}>
                            <h2 className="text-sm font-bold text-[#3b82f6] mb-4 tracking-wider uppercase">
                                {month}
                            </h2>
                            <div className="space-y-3">
                                {monthEvents.map((event) => {
                                    const { day, weekday } = formatDate(event.startAt);
                                    return (
                                        <Link key={event.id} href={`/events/${event.id}`}>
                                            <div className="card p-5 flex items-center gap-5 group cursor-pointer">
                                                <div className="w-14 h-14 rounded-xl bg-[#1a2438] flex flex-col items-center justify-center flex-shrink-0 border border-[#2a3548] group-hover:border-[#3b82f6] transition-colors">
                                                    <span className="text-xl font-bold text-white">{day}</span>
                                                    <span className="text-xs text-[#5a6580]">{weekday}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-white group-hover:text-[#3b82f6] transition-colors truncate">
                                                        {event.title}
                                                    </h3>
                                                    {event.location && (
                                                        <p className="text-sm text-[#8b98b0] truncate mt-1 flex items-center gap-2">
                                                            <span className="text-[#3b82f6]">●</span> {event.location}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-[#5a6580] group-hover:text-[#3b82f6] transition-colors text-xl">→</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
