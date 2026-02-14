'use client';

import { useState, useEffect } from 'react';
import { api, Event } from '@/lib/api/client';
import { DEFAULT_CIRCLE_ID } from '@/lib/constants';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserContext';
import CalendarView from '@/components/CalendarView';

type RSVPFilter = 'ALL' | 'GO' | 'NO' | 'NONE';

interface EventWithRSVP extends Event {
    myRsvpStatus: string | null;
}

export default function SingleEventList() {
    const { currentUser } = useUser();
    const [events, setEvents] = useState<EventWithRSVP[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rsvpFilter, setRsvpFilter] = useState<RSVPFilter>('ALL');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const data = await api.getEvents(DEFAULT_CIRCLE_ID);
                const eventsWithRsvp: EventWithRSVP[] = await Promise.all(
                    data.map(async (event) => {
                        let myRsvpStatus: string | null = null;
                        try {
                            const rsvp = await api.getMyRSVP(event.id);
                            myRsvpStatus = rsvp?.status || null;
                        } catch { /* no RSVP */ }
                        return { ...event, myRsvpStatus };
                    })
                );
                const sorted = eventsWithRsvp.sort(
                    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
                );
                setEvents(sorted);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [currentUser.id]);

    const filteredEvents = events.filter(event => {
        if (rsvpFilter === 'GO' && !['GO', 'LATE', 'EARLY'].includes(event.myRsvpStatus || '')) return false;
        if (rsvpFilter === 'NO' && event.myRsvpStatus !== 'NO') return false;
        if (rsvpFilter === 'NONE' && event.myRsvpStatus !== null) return false;
        return true;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        return { month, day, weekday };
    };

    const getRsvpLabel = (status: string | null) => {
        switch (status) {
            case 'GO': return { text: '出席', cls: 'text-emerald-400 bg-emerald-400/10' };
            case 'LATE': return { text: '遅刻', cls: 'text-amber-400 bg-amber-400/10' };
            case 'EARLY': return { text: '早退', cls: 'text-blue-400 bg-blue-400/10' };
            case 'NO': return { text: '欠席', cls: 'text-white/30 bg-white/[0.04]' };
            default: return { text: '未登録', cls: 'text-white/20 bg-white/[0.03] border border-dashed border-white/10' };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                            }`}
                    >リスト</button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                            }`}
                    >カレンダー</button>
                </div>
                <Link
                    href="/events/new"
                    className="flex items-center justify-center px-4 py-1.5 rounded-lg bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors"
                >+ 新規イベント</Link>
            </div>

            {/* Filters */}
            <div className="flex gap-1 mb-5">
                {[
                    { id: 'ALL', label: 'すべて' },
                    { id: 'GO', label: '出席' },
                    { id: 'NO', label: '欠席' },
                    { id: 'NONE', label: '未登録' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setRsvpFilter(tab.id as RSVPFilter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rsvpFilter === tab.id
                            ? 'bg-white/10 text-white'
                            : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
                            }`}
                    >{tab.label}</button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-white/30 text-sm">該当するイベントはありません</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-1">
                    {filteredEvents.map(event => {
                        const { month, day, weekday } = formatDate(event.startAt);
                        const rsvp = getRsvpLabel(event.myRsvpStatus);

                        return (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                                    {/* Date */}
                                    <div className="flex flex-col items-center w-10 shrink-0">
                                        <span className="text-[10px] text-white/30">{month}月</span>
                                        <span className="text-xl font-semibold text-white leading-tight">{day}</span>
                                        <span className="text-[10px] text-white/30">{weekday}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                                            {event.title}
                                        </h3>
                                        {event.location && (
                                            <p className="text-xs text-white/25 mt-0.5 truncate">{event.location}</p>
                                        )}
                                    </div>

                                    {/* RSVP Tag */}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 ${rsvp.cls}`}>
                                        {rsvp.text}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="animate-fade-in">
                    <CalendarView items={filteredEvents.map(event => ({
                        id: event.id,
                        title: event.title,
                        start: event.startAt,
                        type: 'event',
                        url: `/events/${event.id}`
                    }))} />
                </div>
            )}
        </div>
    );
}
