'use client';

import { useUser } from '@/components/providers/UserContext';
import { api, SettlementWithPayment } from '@/lib/api/client';
import { DEFAULT_CIRCLE_ID } from '@/lib/constants';
import { MOCK_USERS } from '@/lib/constants/users';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ChatPanel from '@/components/ChatPanel';

interface GamificationStats {
    totalCoins: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    paidCount: number;
}

interface AlertItem {
    type: 'rsvp' | 'payment';
    eventId: string;
    eventTitle: string;
    settlementTitle?: string;
    amount?: number;
}

function calculateStats(paid: SettlementWithPayment[]): GamificationStats {
    let totalCoins = 0;
    let totalXP = 0;

    for (const item of paid) {
        totalCoins += item.settlement.amount;
        const reportedAt = item.payment?.reportedAt;
        const dueAt = item.settlement.dueAt;
        const createdAt = item.settlement.createdAt;

        if (reportedAt && dueAt && createdAt) {
            const dueDate = new Date(dueAt).getTime();
            const reportedDate = new Date(reportedAt).getTime();
            const createdDate = new Date(createdAt).getTime();
            if (!isNaN(dueDate) && !isNaN(reportedDate) && !isNaN(createdDate)) {
                const totalWindow = Math.max(dueDate - createdDate, 1);
                const timeTaken = Math.max(reportedDate - createdDate, 0);
                const speedRatio = 1 - Math.min(timeTaken / totalWindow, 1);
                totalXP += 50 + Math.floor(speedRatio * 100);
            } else { totalXP += 50; }
        } else { totalXP += 50; }
    }

    const xpPerLevel = 200;
    const level = Math.floor(totalXP / xpPerLevel) + 1;
    const xp = totalXP % xpPerLevel;

    return { totalCoins, level, xp, xpToNextLevel: xpPerLevel, paidCount: paid.length };
}

export default function ProfilePage() {
    const { currentUser } = useUser();
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [allUsersStats, setAllUsersStats] = useState<{ name: string; avatarUrl: string; coins: number; level: number }[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const mySettlements = await api.getMySettlements();
                const calculatedStats = calculateStats(mySettlements.paid || []);
                setStats(calculatedStats);

                const events = await api.getEvents(DEFAULT_CIRCLE_ID);
                const alertItems: AlertItem[] = [];

                for (const event of events) {
                    try {
                        const rsvp = await api.getMyRSVP(event.id);
                        if (!rsvp) {
                            alertItems.push({ type: 'rsvp', eventId: event.id, eventTitle: event.title });
                        }
                    } catch {
                        alertItems.push({ type: 'rsvp', eventId: event.id, eventTitle: event.title });
                    }
                }

                for (const item of (mySettlements.unpaid || [])) {
                    alertItems.push({
                        type: 'payment', eventId: item.settlement.eventId,
                        eventTitle: item.settlement.title, settlementTitle: item.settlement.title,
                        amount: item.settlement.amount,
                    });
                }
                setAlerts(alertItems);

                const rankingData = MOCK_USERS.map((u) => ({
                    name: u.name, avatarUrl: u.avatarUrl,
                    coins: u.id === currentUser.id ? calculatedStats.totalCoins : Math.floor(Math.random() * 5000),
                    level: u.id === currentUser.id ? calculatedStats.level : Math.floor(Math.random() * 5) + 1,
                }));
                rankingData.sort((a, b) => b.coins - a.coins);
                setAllUsersStats(rankingData);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            } finally { setLoading(false); }
        };
        fetchAll();
    }, [currentUser.id]);

    if (loading) {
        return (
            <div className="max-w-lg mx-auto space-y-4">
                {[28, 48, 40].map((h, i) => (
                    <div key={i} className={`h-${h} bg-white/[0.03] rounded-2xl animate-pulse`} />
                ))}
            </div>
        );
    }

    const xpPercent = stats ? Math.min((stats.xp / stats.xpToNextLevel) * 100, 100) : 0;
    const rsvpAlerts = alerts.filter(a => a.type === 'rsvp');
    const paymentAlerts = alerts.filter(a => a.type === 'payment');

    return (
        <>
            <div className="max-w-lg mx-auto space-y-4">
                {/* Profile Card */}
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-14 h-14 rounded-full ring-2 ring-white/10"
                        />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-white">{currentUser.name}</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs text-white/50">Lv.{stats?.level}</span>
                                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${xpPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold text-white">{stats?.totalCoins.toLocaleString()}</p>
                            <p className="text-[11px] text-white/30">coin</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {(rsvpAlerts.length > 0 || paymentAlerts.length > 0) && (
                    <div className="space-y-3 animate-fade-in" style={{ animationDelay: '80ms' }}>
                        {rsvpAlerts.length > 0 && (
                            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                                    出欠未登録 · {rsvpAlerts.length}
                                </p>
                                <div className="space-y-1">
                                    {rsvpAlerts.slice(0, 5).map((alert, i) => (
                                        <Link
                                            key={`rsvp-${i}`}
                                            href={`/events/${alert.eventId}`}
                                            className="flex items-center justify-between py-2.5 px-3 -mx-1 rounded-lg hover:bg-white/[0.04] transition-colors group"
                                        >
                                            <span className="text-sm text-white/80 truncate">{alert.eventTitle}</span>
                                            <span className="text-xs text-white/20 group-hover:text-blue-400 transition-colors shrink-0 ml-3">→</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {paymentAlerts.length > 0 && (
                            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                                    未払い · {paymentAlerts.length}
                                </p>
                                <div className="space-y-1">
                                    {paymentAlerts.map((alert, i) => (
                                        <Link
                                            key={`pay-${i}`}
                                            href={`/events/${alert.eventId}`}
                                            className="flex items-center justify-between py-2.5 px-3 -mx-1 rounded-lg hover:bg-white/[0.04] transition-colors group"
                                        >
                                            <span className="text-sm text-white/80 truncate">{alert.settlementTitle}</span>
                                            <span className="text-sm font-medium text-white/50 shrink-0 ml-3">¥{alert.amount?.toLocaleString()}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Ranking */}
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '160ms' }}>
                    <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">ランキング</p>
                    <div className="space-y-1">
                        {allUsersStats.map((user, index) => {
                            const isMe = user.name === currentUser.name;
                            return (
                                <div
                                    key={user.name}
                                    className={`flex items-center gap-3 py-2.5 px-3 -mx-1 rounded-lg ${isMe ? 'bg-blue-500/[0.08]' : ''
                                        }`}
                                >
                                    <span className={`text-sm font-medium w-5 text-center ${index === 0 ? 'text-white' : 'text-white/30'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
                                    <span className={`flex-1 text-sm ${isMe ? 'text-white font-medium' : 'text-white/60'}`}>
                                        {user.name}
                                    </span>
                                    <span className="text-sm text-white/40 tabular-nums">
                                        {user.coins.toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '240ms' }}>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                        <p className="text-2xl font-semibold text-white">{stats?.paidCount || 0}</p>
                        <p className="text-xs text-white/30 mt-1">支払い完了</p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                        <p className="text-2xl font-semibold text-white">{paymentAlerts.length}</p>
                        <p className="text-xs text-white/30 mt-1">未払い</p>
                    </div>
                </div>
            </div>

            <ChatPanel />
        </>
    );
}
