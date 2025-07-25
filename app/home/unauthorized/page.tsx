'use client';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminDashboardPage() {
  const t = useTranslations('unauth');
  return (
       <div className="min-h-[calc(100vh-170px)] flex items-start justify-start px-6 py-8 container mx-auto">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full border-l-4 border-red-400">
          <div className="flex items-center gap-5 mb-3">
            <div className="p-2 rounded-full bg-red-100 hover:bg-red-200 cursor-pointer transition-colors">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{t('description')}</p>
        </div>
      </div>
  );
}