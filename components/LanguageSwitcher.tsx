'use client';

import { useRouter } from 'next/navigation';
import { getCookie, setCookie } from 'cookies-next';
import { useState, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' }
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('fr');
  const router = useRouter();

  useEffect(() => {
    const cookieLocale = getCookie('NEXT_LOCALE')?.toString();
    setCurrentLocale(cookieLocale || 'fr');
  }, []);

  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    setCookie('NEXT_LOCALE', newLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    window.location.reload();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden min-w-[160px] z-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                currentLang.code === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {currentLang.code === lang.code && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
