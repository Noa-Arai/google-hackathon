'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Event } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './CalendarView.css';

interface CalendarViewProps {
    events: Event[];
}

export default function CalendarView({ events }: CalendarViewProps) {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const calendarEvents = events.map(event => {
        const isPractice = event.title.includes('通常練習');
        return {
            id: event.id,
            title: event.title,
            start: event.startAt,
            backgroundColor: isPractice ? '#10b981' : '#8b5cf6', // Green for practice, Purple for special
            borderColor: isPractice ? '#059669' : '#7c3aed',
            textColor: '#ffffff',
            extendedProps: {
                location: event.location
            }
        };
    });

    const handleEventClick = (info: any) => {
        router.push(`/events/${info.event.id}`);
    };

    return (
        <div className="calendar-container bg-[#1a1f2e] p-4 rounded-xl border border-white/10">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView={isMobile ? "listMonth" : "dayGridMonth"}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: isMobile ? 'listMonth,dayGridMonth' : 'dayGridMonth,timeGridWeek'
                }}
                locale="ja"
                events={calendarEvents}
                eventClick={handleEventClick}
                height="auto"
                aspectRatio={isMobile ? 0.8 : 1.35}
                dayMaxEvents={true}
                moreLinkClick="popover"
                buttonText={{
                    today: '今日',
                    month: '月',
                    week: '週',
                    day: '日',
                    list: 'リスト'
                }}
                noEventsContent="予定はありません"
            />
        </div>
    );
}
