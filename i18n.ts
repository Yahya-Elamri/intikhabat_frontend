import { getRequestConfig } from 'next-intl/server';

const locales = ['fr', 'ar'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as Locale)) {
    // Instead of throwing notFound, fallback to default locale
    locale = 'fr';
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
