'use client';

import { useState, useEffect } from 'react';
import { api, Event, PracticeSeries, PracticeSession } from '@/lib/api/client';
import { DEFAULT_CIRCLE_ID } from '@/lib/constants';
import CalendarView, { CalendarItem } from '@/components/CalendarView';

export default function CalendarPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [practiceSeries, setPracticeSeries] = useState<PracticeSeries[]>([]);
    const [practiceSessions, setPracticeSessions] = useState<{ series: PracticeSeries, session: PracticeSession }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // 1. Fetch Events
                const eventsData = await api.getEvents(DEFAULT_CIRCLE_ID);
                setEvents(eventsData);

                // 2. Fetch Practice Series
                const seriesData = await api.getPracticeSeries(DEFAULT_CIRCLE_ID);
                setPracticeSeries(seriesData);

                // 3. Fetch Sessions for each Series (N+1 but acceptable for MVP/Mock)
                const allSessions: { series: PracticeSeries, session: PracticeSession }[] = [];
                await Promise.all(seriesData.map(async (series) => {
                    try {
                        const detail = await api.getPracticeSeriesDetail(series.id);
                        if (detail && detail.sessions) {
                            detail.sessions.forEach(session => {
                                allSessions.push({ series, session });
                            });
                        }
                    } catch (e) {
                        console.error(`Failed to load sessions for series ${series.id}`, e);
                    }
                }));
                setPracticeSessions(allSessions);

            } catch (error) {
                console.error('Failed to load calendar data', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Transform to CalendarItems
    const calendarItems: CalendarItem[] = [
        ...events.map(event => ({
            id: event.id,
            title: `【イベント】${event.title}`,
            start: event.startAt,
            type: 'event' as const,
            url: `/events/${event.id}`,
        })),
        ...practiceSessions.map(({ series, session }) => ({
            id: session.id,
            title: `【練習】${series.name}`,
            start: session.date,
            type: 'practice' as const,
            url: `/practices/${series.id}`, // Link to series detail
        }))
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-end justify-between">
                <h1 className="text-2xl font-semibold text-white">カレンダー</h1>
            </div>

            <div className="animate-fade-in">
                <CalendarView items={calendarItems} />
            </div>
        </div>
    );
}
