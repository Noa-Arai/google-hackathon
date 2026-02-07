'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, AnnouncementDetail } from '@/lib/api';
import { useUser } from '@/lib/user-context';
import AttendanceForm from '@/components/AttendanceForm';
import PaymentInfo from '@/components/PaymentInfo';
import Image from 'next/image';

// Sample data for MVP
const sampleDetail: AnnouncementDetail = {
    announcement: {
        id: '1',
        title: '🎉 新歓パーティー開催！',
        body: `4月10日に新入生歓迎パーティーを開催します！

【日時】4月10日（水）18:00〜21:00
【場所】大学近くのカフェ「Circle Cafe」
【参加費】1,500円（飲み物・軽食代込み）

新入生の皆さんと在校生の交流を深める楽しいイベントです。
ゲームやクイズ大会も予定しています。

みんなで楽しく過ごしましょう！🎊`,
        imageUrl: '',
        targetUserIds: ['user1', 'user2', 'user3'],
        createdAt: '2024-04-01T10:00:00Z',
    },
    attendance: undefined,
    payments: [
        {
            id: 'p1',
            announcementId: '1',
            userId: 'user1',
            amount: 1500,
            isPaid: false,
            description: '新歓パーティー参加費',
            bankInfo: '三菱UFJ銀行 渋谷支店\n普通 1234567\nサークル カイケイ',
            paypayInfo: 'circle_accounting',
        }
    ],
    isTarget: true,
};

export default function AnnouncementDetailPage() {
    const params = useParams();
    const { userId } = useUser();
    const [detail, setDetail] = useState<AnnouncementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await api.getAnnouncement(params.id as string, userId);
                setDetail(data);
                setError(null);
            } catch {
                // Use sample data when API is not available
                if (params.id === '1') {
                    setDetail(sampleDetail);
                } else {
                    setDetail({
                        ...sampleDetail,
                        announcement: {
                            ...sampleDetail.announcement,
                            id: params.id as string,
                            title: 'サンプルお知らせ',
                            body: 'これはサンプルデータです。',
                        },
                    });
                }
                setError('API接続エラー - サンプルデータを表示中');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [params.id, userId]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6 space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="text-center py-16">
                <span className="text-6xl mb-4 block">😢</span>
                <p className="text-gray-500">お知らせが見つかりませんでした</p>
                <Link href="/" className="text-indigo-600 hover:underline mt-4 inline-block">
                    ← 一覧に戻る
                </Link>
            </div>
        );
    }

    const { announcement, attendance, payments, isTarget } = detail;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link href="/" className="text-indigo-600 hover:underline mb-6 inline-flex items-center gap-1">
                ← お知らせ一覧に戻る
            </Link>

            {error && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Announcement Content */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                {/* Image */}
                <div className="relative h-64 bg-gradient-to-br from-indigo-100 to-purple-100">
                    {announcement.imageUrl ? (
                        <Image
                            src={announcement.imageUrl}
                            alt={announcement.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-8xl">📢</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{announcement.title}</h1>
                    <p className="text-sm text-gray-400 mb-4">
                        {new Date(announcement.createdAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <div className="prose prose-gray max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700">{announcement.body}</p>
                    </div>
                </div>
            </div>

            {/* Target User Content */}
            {isTarget ? (
                <div className="space-y-6">
                    {/* Attendance Form */}
                    <AttendanceForm
                        announcementId={announcement.id}
                        initialAttendance={attendance}
                    />

                    {/* Payment Info */}
                    {payments && payments.length > 0 && (
                        <PaymentInfo payments={payments} />
                    )}
                </div>
            ) : (
                <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
                    <span className="text-4xl mb-2 block">🔒</span>
                    <p>このお知らせの出欠・清算情報は対象者のみ表示されます</p>
                </div>
            )}
        </div>
    );
}
