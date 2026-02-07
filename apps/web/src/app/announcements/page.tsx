'use client';

import { useState, useEffect } from 'react';
import { api, Event } from '@/lib/api';
import { DEFAULT_CIRCLE_ID } from '@/lib/constants';
import EventCard from '@/components/EventCard';
import ChatPanel from '@/components/ChatPanel';

export default function AnnouncementsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getEvents(DEFAULT_CIRCLE_ID);
                setEvents(data || []);
            } catch (err) {
                setError('APIサーバーに接続できません');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <>
            <div className="max-w-6xl mx-auto relative">
                {/* Big outline text */}
                <div className="outline-text select-none hidden lg:block">EVENTS</div>

                {/* Header */}
                <div className="mb-12 animate-slide-in relative z-10">
                    <p className="section-title mb-3">お知らせ</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">最新イベント</h1>
                    <div className="accent-bar mt-4" />
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card h-72 animate-pulse">
                                <div className="h-48 bg-[#1a2438]"></div>
                                <div className="p-5">
                                    <div className="h-4 bg-[#1a2438] rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="card p-12 text-center animate-fade-in">
                        <span className="text-5xl mb-6 block opacity-30">⚠️</span>
                        <p className="text-[#8b98b0] mb-2">{error}</p>
                        <p className="text-sm text-[#5a6580]">APIサーバー（Go）を起動してください</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="card p-16 text-center animate-fade-in">
                        <span className="text-6xl mb-6 block opacity-20">📭</span>
                        <h2 className="text-xl font-semibold text-white mb-2">お知らせはまだありません</h2>
                        <p className="text-[#8b98b0]">イベントが作成されると、ここに表示されます</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {events.map((event, index) => (
                            <div key={event.id} style={{ animationDelay: `${index * 100}ms` }}>
                                <EventCard event={event} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ChatPanel />
        </>
    );
}
