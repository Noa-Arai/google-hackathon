'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { DEFAULT_CIRCLE_ID, DEFAULT_USER_ID } from '@/lib/constants';
import { useUser } from '@/components/providers/UserContext';
import Link from 'next/link';

export default function NewAnnouncementPage() {
    const router = useRouter();
    const { currentUser } = useUser();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            setError('タイトルと本文を入力してください');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await api.createAnnouncement({
                circleId: DEFAULT_CIRCLE_ID,
                eventId: '', // General announcement
                title: title.trim(),
                body: body.trim(),
                createdBy: currentUser?.id || DEFAULT_USER_ID,
            });
            router.push('/announcements');
            router.refresh();
        } catch (err) {
            console.error(err);
            setError('お知らせの作成に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 pb-20">
            <div className="mb-8">
                <Link href="/announcements" className="text-sm text-[#8b98b0] hover:text-white transition-colors flex items-center gap-1 mb-4">
                    <span>←</span> お知らせ一覧に戻る
                </Link>
                <h1 className="text-3xl font-bold text-white">お知らせ作成</h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-[#8b98b0]">
                        タイトル
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="例: 夏合宿のお知らせ"
                        className="w-full bg-[#151d2e] border border-[#2a3548] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="body" className="block text-sm font-medium text-[#8b98b0]">
                        本文
                    </label>
                    <textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="お知らせの内容を入力してください..."
                        className="w-full bg-[#151d2e] border border-[#2a3548] text-white rounded-xl px-4 py-3 h-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20 resize-none"
                        required
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <Link
                        href="/announcements"
                        className="flex-1 py-3 bg-[#151d2e] hover:bg-[#1f2937] text-white rounded-xl font-medium transition-all text-center"
                    >
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            '作成する'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
