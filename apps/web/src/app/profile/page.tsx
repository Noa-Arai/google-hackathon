'use client';

import { useUser } from '@/components/providers/UserContext';
import { api, Event } from '@/lib/api/client';
import { DEFAULT_CIRCLE_ID } from '@/lib/constants';
import { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import CalendarView from '@/components/CalendarView';
import GamificationDashboard from '@/features/gamification/GamificationDashboard';

export default function ProfilePage() {
    const { currentUser } = useUser();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    useEffect(() => {
        const fetchMyEvents = async () => {
            setLoading(true);
            try {
                // Fetch events where user has RSVP'd as GO/LATE/EARLY
                // This function is implemented in client.ts
                const myEvents = await api.getEventsByUser(DEFAULT_CIRCLE_ID, currentUser.id);

                // Sort by date (descending)
                myEvents.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

                setEvents(myEvents);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, [currentUser.id]);

    const upcomingEvents = events.filter(e => new Date(e.startAt) > new Date());
    const pastEvents = events.filter(e => new Date(e.startAt) <= new Date()).reverse(); // Most recent past event first

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-32 h-32 rounded-full border-4 border-[#3b82f6]/20"
                />
                <div className="text-center md:text-left space-y-2 flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <h1 className="text-3xl font-bold text-white">{currentUser.name}</h1>
                        <a
                            href="/profile/edit"
                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors"
                        >
                            編集
                        </a>
                    </div>
                    <p className="text-[#8b98b0]">
                        {currentUser.role === 'admin' ? '管理者' : 'メンバー'}
                    </p>
                    <div className="flex justify-center md:justify-start gap-4 mt-4">
                        <div className="text-center bg-black/20 px-4 py-2 rounded-lg">
                            <p className="text-xs text-[#8b98b0]">参加予定</p>
                            <p className="text-xl font-bold text-white">{upcomingEvents.length}</p>
                        </div>
                        <div className="text-center bg-black/20 px-4 py-2 rounded-lg">
                            <p className="text-xs text-[#8b98b0]">参加履歴</p>
                            <p className="text-xl font-bold text-white">{pastEvents.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gamification Dashboard */}
            <GamificationDashboard />

            {/* My Schedule */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">マイ・スケジュール</h2>
                <div className="flex bg-[#1a1f2e] p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-[#8b98b0] hover:text-white'
                            }`}
                    >
                        リスト
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar'
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-[#8b98b0] hover:text-white'
                            }`}
                    >
                        カレンダー
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[#8b98b0]">読み込み中...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-[#1a1f2e] rounded-2xl border border-white/10">
                    <p className="text-[#8b98b0]">参加予定のイベントはありません</p>
                    <a href="/events" className="text-[#3b82f6] hover:underline mt-2 inline-block">
                        イベント一覧を見る
                    </a>
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-8">
                    {upcomingEvents.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-[#8b98b0] uppercase tracking-wider mb-4">今後の予定</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}

                    {pastEvents.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-[#8b98b0] uppercase tracking-wider mb-4">過去のイベント</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                                {pastEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in">
                    <CalendarView events={events} />
                </div>
            )}
        </div>
    );
}
