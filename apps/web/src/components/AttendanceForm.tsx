'use client';

import { useState } from 'react';
import { Attendance, api } from '@/lib/api';
import { useUser } from '@/lib/user-context';

interface Props {
    announcementId: string;
    initialAttendance?: Attendance;
    onUpdate?: (attendance: Attendance) => void;
}

export default function AttendanceForm({ announcementId, initialAttendance, onUpdate }: Props) {
    const { userId } = useUser();
    const [status, setStatus] = useState<'yes' | 'no' | ''>(initialAttendance?.status || '');
    const [lateLeaveEarly, setLateLeaveEarly] = useState(initialAttendance?.lateLeaveEarly || '');
    const [memo, setMemo] = useState(initialAttendance?.memo || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!status) return;

        setIsSubmitting(true);
        setMessage('');

        try {
            const result = await api.updateAttendance({
                announcementId,
                status,
                lateLeaveEarly,
                memo,
            }, userId);

            setMessage('出欠を登録しました！');
            onUpdate?.(result);
        } catch (error) {
            setMessage('エラーが発生しました');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📋 出欠登録
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Status Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">参加可否</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setStatus('yes')}
                            className={`flex-1 py-3 rounded-lg text-lg font-bold transition-all ${status === 'yes'
                                    ? 'bg-green-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            ⭕️ 参加
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('no')}
                            className={`flex-1 py-3 rounded-lg text-lg font-bold transition-all ${status === 'no'
                                    ? 'bg-red-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            ❌ 不参加
                        </button>
                    </div>
                </div>

                {/* Late/Leave Early */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">遅刻/早退</label>
                    <input
                        type="text"
                        value={lateLeaveEarly}
                        onChange={(e) => setLateLeaveEarly(e.target.value)}
                        placeholder="例: 30分遅刻します"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Memo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="その他連絡事項があれば"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!status || isSubmitting}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? '登録中...' : '出欠を登録する'}
                </button>

                {message && (
                    <p className={`text-center text-sm ${message.includes('エラー') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
