'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api, Event, Announcement, Settlement } from '@/lib/api';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { useUser } from '@/components/providers/UserContext';
import RSVPPanel from '@/features/rsvp/RSVPPanel';
import SettlementPanel from '@/features/settlement/SettlementPanel';
import CreateAnnouncementForm from '@/features/announcement/CreateAnnouncementForm';
import CreateSettlementForm from '@/features/settlement/CreateSettlementForm';
import ChatPanel from '@/components/ChatPanel';
import Link from 'next/link';

function SettlementCard({ settlement, onUpdated }: { settlement: Settlement; onUpdated: () => void }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(settlement.title);
    const [amount, setAmount] = useState(settlement.amount);
    const [dueAt, setDueAt] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settlement.dueAt) {
            const d = new Date(settlement.dueAt);
            setDueAt(d.toISOString().slice(0, 10));
        }
    }, [settlement.dueAt]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateSettlement(settlement.id, {
                title,
                amount,
                dueAt: new Date(dueAt).toISOString(),
            });
            setEditing(false);
            onUpdated();
        } catch (e) {
            console.error('Failed to update settlement:', e);
            alert('更新に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    if (editing) {
        return (
            <div className="p-5 rounded-xl bg-[#0a0f1c] border border-[#3b82f6]/50 space-y-3">
                <input
                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#3b82f6]"
                    placeholder="タイトル"
                />
                <div className="flex gap-3">
                    <input
                        type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#3b82f6]"
                        placeholder="金額"
                    />
                    <input
                        type="date" value={dueAt} onChange={e => setDueAt(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#3b82f6]"
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-[#8b98b0] hover:text-white">キャンセル</button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-4 py-1.5 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-50">
                        {saving ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 rounded-xl bg-[#0a0f1c] border border-[#2a3548] group/card">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-white">{settlement.title}</h3>
                    <p className="text-sm text-[#8b98b0] mt-1">
                        期限: {new Date(settlement.dueAt).toLocaleDateString('ja-JP')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">
                        ¥{settlement.amount.toLocaleString()}
                    </span>
                    <button onClick={() => setEditing(true)}
                        className="text-sm text-[#8b98b0] hover:text-[#3b82f6] transition-all">
                        編集
                    </button>
                </div>
            </div>
        </div>
    );
} export default function EventDetailPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { currentUser } = useUser();

    const [event, setEvent] = useState<Event | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [eventData, announcementsData, settlementsData] = await Promise.all([
                api.getEvent(eventId),
                api.getEventAnnouncements(eventId),
                api.getEventSettlements(eventId),
            ]);
            setEvent(eventData);
            setAnnouncements(announcementsData || []);
            setSettlements(settlementsData || []);
        } catch (err) {
            setError('APIサーバーに接続できません');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData();
    };

    const isTarget = event?.rsvpTargetUserIds?.includes(DEFAULT_USER_ID) || false;

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto animate-pulse">
                <div className="h-6 bg-[#1a2438] rounded w-32 mb-8"></div>
                <div className="card h-80 mb-6"></div>
                <div className="card h-48"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="card p-12 text-center animate-fade-in">
                    <span className="text-5xl mb-6 block opacity-30">⚠️</span>
                    <p className="text-[#8b98b0] mb-4">{error || 'イベントが見つかりませんでした'}</p>
                    <Link href="/announcements" className="text-[#3b82f6] hover:underline">
                        ← お知らせ一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Link */}
                <Link href="/announcements" className="text-[#8b98b0] hover:text-[#3b82f6] inline-flex items-center gap-2 transition-colors animate-slide-in">
                    <span>←</span> お知らせ一覧に戻る
                </Link>

                {/* Event Header */}
                <div className="card overflow-hidden animate-fade-in">
                    {event.coverImageUrl ? (
                        <div className="relative h-80">
                            <img
                                src={event.coverImageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/50 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-3xl font-black text-white">{event.title}</h1>
                                    <Link href={`/events/${eventId}/edit`}
                                        className="text-sm text-[#8b98b0] hover:text-[#3b82f6] transition-colors">
                                        編集
                                    </Link>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {event.startAt && (
                                        <span className="flex items-center gap-2 text-sm text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                            <span>📅</span> {formatDate(event.startAt)}
                                        </span>
                                    )}
                                    {event.location && (
                                        <span className="flex items-center gap-2 text-sm text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                            <span>📍</span> {event.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="w-full h-56 bg-gradient-to-br from-[#151d2e] to-[#1a2438] rounded-xl flex items-center justify-center mb-6">
                                <span className="text-8xl opacity-20">📢</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-3xl font-black text-white">{event.title}</h1>
                                <Link href={`/events/${eventId}/edit`}
                                    className="text-sm text-[#8b98b0] hover:text-[#3b82f6] transition-colors">
                                    編集
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {event.startAt && (
                                    <span className="flex items-center gap-2 text-sm text-[#8b98b0]">
                                        <span className="text-[#3b82f6]">●</span> {formatDate(event.startAt)}
                                    </span>
                                )}
                                {event.location && (
                                    <span className="flex items-center gap-2 text-sm text-[#8b98b0]">
                                        <span className="text-[#3b82f6]">●</span> {event.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Announcements */}
                <div className="card p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">📝</span>
                        お知らせ詳細
                    </h2>

                    {announcements.length > 0 ? (
                        <div className="space-y-6 mb-6">
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className="border-l-2 border-[#3b82f6] pl-5">
                                    <h3 className="font-semibold text-white">{announcement.title}</h3>
                                    <p className="text-[#8b98b0] mt-3 whitespace-pre-wrap leading-relaxed">{announcement.body}</p>
                                    <p className="text-xs text-[#5a6580] mt-3">
                                        {new Date(announcement.createdAt).toLocaleDateString('ja-JP')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[#5a6580] mb-6">お知らせはまだありません</p>
                    )}

                    {/* Create Announcement Form */}
                    <CreateAnnouncementForm eventId={eventId} onCreated={handleRefresh} />
                </div>

                {/* RSVP Panel - 全員表示（ハッカソン用） */}
                <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <RSVPPanel eventId={eventId} isTarget={true} />
                </div>

                {/* Settlement Section */}
                <div className="card p-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">💰</span>
                        清算
                    </h2>

                    {settlements.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            {settlements.map((settlement) => (
                                <SettlementCard key={settlement.id} settlement={settlement} onUpdated={handleRefresh} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-[#5a6580] mb-6">清算はまだありません</p>
                    )}

                    {/* Create Settlement Form */}
                    <CreateSettlementForm eventId={eventId} onCreated={handleRefresh} />
                </div>

                {/* Settlement Panel (for payment reporting) - 全員表示（ハッカソン用） */}
                {settlements.length > 0 && (
                    <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <SettlementPanel eventId={eventId} isTarget={true} />
                    </div>
                )}
            </div>

            <ChatPanel />
        </>
    );
}
