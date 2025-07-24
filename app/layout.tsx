import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // force fresh data on every request

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("NEXT_LOCALE")?.value;

  const safeLocale = localeFromCookie || "fr";

  const messages = (await import(`../messages/${safeLocale}.json`)).default;

  return (
    <html lang={safeLocale} dir={safeLocale === "ar" ? "rtl" : "ltr"}>
      <body>
        <NextIntlClientProvider locale={safeLocale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
