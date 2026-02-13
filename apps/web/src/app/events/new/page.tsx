'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { DEFAULT_CIRCLE_ID, DEFAULT_USER_ID } from '@/lib/constants';
import Link from 'next/link';

export default function CreateEventPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [eventType, setEventType] = useState<'practice' | 'special'>('practice');
    const [titleInput, setTitleInput] = useState('');
    const [formData, setFormData] = useState({
        startAt: '',
        location: '',
        coverImageUrl: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titleInput || !formData.startAt) {
            setError('タイトルと日時は必須です');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Auto-prefix title based on type
        const finalTitle = eventType === 'practice'
            ? `【通常練習】${titleInput}`
            : `【特別イベント】${titleInput}`;

        try {
            const result = await api.createEvent({
                circleId: DEFAULT_CIRCLE_ID,
                title: finalTitle,
                startAt: new Date(formData.startAt).toISOString(),
                location: formData.location || undefined,
                coverImageUrl: formData.coverImageUrl || undefined,
                rsvpTargetUserIds: [DEFAULT_USER_ID],
                createdBy: DEFAULT_USER_ID,
            });
            router.push(`/events/${result.id}`);
        } catch (err) {
            setError('作成に失敗しました。APIが起動しているか確認してください。');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back Link */}
            <Link href="/events" className="text-[#8b98b0] hover:text-[#3b82f6] inline-flex items-center gap-2 transition-colors animate-slide-in mb-8">
                <span>←</span> イベント一覧に戻る
            </Link>

            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <p className="section-title mb-3">新規作成</p>
                <h1 className="text-4xl font-black text-white tracking-tight">イベント作成</h1>
                <div className="accent-bar mt-4" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card p-8 animate-fade-in space-y-6">
                {/* Event Type */}
                <div>
                    <label className="block text-sm font-medium text-[#8b98b0] mb-3">
                        イベント種別 <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setEventType('practice')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${eventType === 'practice'
                                    ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                                    : 'bg-[#0a0f1c] border-[#2a3548] text-[#8b98b0] hover:border-[#3b82f6]'
                                }`}
                        >
                            <span className="text-2xl">🎾</span>
                            <span className="font-bold">通常練習</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setEventType('special')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${eventType === 'special'
                                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#8b5cf6]'
                                    : 'bg-[#0a0f1c] border-[#2a3548] text-[#8b98b0] hover:border-[#3b82f6]'
                                }`}
                        >
                            <span className="text-2xl">🎉</span>
                            <span className="font-bold">特別イベント</span>
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-[#8b98b0] mb-2">
                        タイトル <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="例: 春季テニス大会"
                        className="w-full px-5 py-4 rounded-xl bg-[#0a0f1c] border border-[#2a3548] text-white placeholder-[#5a6580] focus:outline-none focus:border-[#3b82f6]"
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-[#8b98b0] mb-2">
                        日時 <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.startAt}
                        onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-[#0a0f1c] border border-[#2a3548] text-white focus:outline-none focus:border-[#3b82f6]"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-[#8b98b0] mb-2">
                        場所
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="例: 東京都立公園テニスコート"
                        className="w-full px-5 py-4 rounded-xl bg-[#0a0f1c] border border-[#2a3548] text-white placeholder-[#5a6580] focus:outline-none focus:border-[#3b82f6]"
                    />
                </div>

                {/* Cover Image URL */}
                <div>
                    <label className="block text-sm font-medium text-[#8b98b0] mb-2">
                        カバー画像URL
                    </label>
                    <input
                        type="url"
                        value={formData.coverImageUrl}
                        onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-5 py-4 rounded-xl bg-[#0a0f1c] border border-[#2a3548] text-white placeholder-[#5a6580] focus:outline-none focus:border-[#3b82f6]"
                    />
                    <p className="text-xs text-[#5a6580] mt-2">
                        ヒント: <code>https://picsum.photos/seed/任意の文字/400/300</code> で適当な画像が使えます
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-xl bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-[#3b82f6] text-white font-semibold hover:bg-[#2563eb] transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? '作成中...' : 'イベントを作成'}
                </button>
            </form>
        </div>
    );
}
