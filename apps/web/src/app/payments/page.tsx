'use client';

import { useState, useEffect } from 'react';
import { api, SettlementWithPayment } from '@/lib/api';
import Link from 'next/link';

export default function PaymentsPage() {
    const [unpaidSettlements, setUnpaidSettlements] = useState<SettlementWithPayment[]>([]);
    const [paidSettlements, setPaidSettlements] = useState<SettlementWithPayment[]>([]);
    const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettlements = async () => {
            try {
                const data = await api.getMySettlements();
                setUnpaidSettlements(data.unpaid || []);
                setPaidSettlements(data.paid || []);
            } catch (err) {
                setError('APIサーバーに接続できません');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettlements();
    }, []);

    const settlements = activeTab === 'unpaid' ? unpaidSettlements : paidSettlements;

    return (
        <div className="max-w-2xl mx-auto relative">
            {/* Big outline text */}
            <div className="outline-text select-none hidden lg:block">PAYMENT</div>

            {/* Header */}
            <div className="mb-12 animate-slide-in relative z-10">
                <p className="section-title mb-3">清算管理</p>
                <h1 className="text-4xl font-black text-white tracking-tight">支払い</h1>
                <div className="accent-bar mt-4" />
            </div>

            {/* Tabs */}
            <div className="bg-[#151d2e] rounded-xl p-1.5 mb-8 flex gap-1 animate-fade-in border border-[#2a3548]">
                <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'unpaid'
                            ? 'bg-[#0a0f1c] text-[#ef4444]'
                            : 'text-[#8b98b0] hover:text-white'
                        }`}
                >
                    <span>💸</span> 未払い
                    {unpaidSettlements.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-[#ef4444] text-white rounded-full">
                            {unpaidSettlements.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'paid'
                            ? 'bg-[#0a0f1c] text-[#22c55e]'
                            : 'text-[#8b98b0] hover:text-white'
                        }`}
                >
                    <span>✅</span> 済み
                    {paidSettlements.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-[#22c55e] text-white rounded-full">
                            {paidSettlements.length}
                        </span>
                    )}
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-4 bg-[#1a2438] rounded w-1/2 mb-3"></div>
                            <div className="h-6 bg-[#1a2438] rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="card p-12 text-center animate-fade-in">
                    <span className="text-5xl mb-6 block opacity-30">⚠️</span>
                    <p className="text-[#8b98b0]">{error}</p>
                </div>
            ) : settlements.length === 0 ? (
                <div className="card p-16 text-center animate-fade-in">
                    <span className="text-6xl mb-6 block opacity-20">{activeTab === 'unpaid' ? '✨' : '📝'}</span>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {activeTab === 'unpaid' ? '未払いの清算はありません' : '支払い履歴はありません'}
                    </h2>
                    <p className="text-[#8b98b0]">
                        {activeTab === 'unpaid' ? 'すべての支払いが完了しています！' : '支払いを完了すると、ここに表示されます'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4 relative z-10">
                    {settlements.map((item, index) => (
                        <div key={item.settlement.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <PaymentCard item={item} isPaid={activeTab === 'paid'} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PaymentCard({ item, isPaid }: { item: SettlementWithPayment; isPaid: boolean }) {
    const { settlement, payment } = item;

    return (
        <div className="card p-6">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-white text-lg">{settlement.title}</h3>
                    <p className="text-sm text-[#8b98b0] mt-1">
                        期限: {new Date(settlement.dueAt).toLocaleDateString('ja-JP')}
                    </p>
                </div>
                <span className={`text-2xl font-bold ${isPaid ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    ¥{settlement.amount.toLocaleString()}
                </span>
            </div>

            {isPaid && payment && (
                <div className="mt-4 pt-4 border-t border-[#2a3548]">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#22c55e]/20 text-[#22c55e] rounded-lg text-sm">
                        <span>✓</span>
                        {payment.method === 'BANK' ? '銀行振込' : 'PayPay'}で報告済み
                    </span>
                </div>
            )}

            {!isPaid && settlement.eventId && (
                <Link
                    href={`/events/${settlement.eventId}`}
                    className="mt-4 inline-flex items-center gap-2 text-[#3b82f6] hover:underline"
                >
                    <span>イベント詳細で支払う</span>
                    <span>→</span>
                </Link>
            )}
        </div>
    );
}
