import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Providers } from '@/components/providers';
import { parseTheme, THEME_COOKIE } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pyramid',
  description: 'Task management',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read the theme on the server and put it straight onto <html>. This is the
  // whole no-flash mechanism: the very first byte the browser receives already
  // carries the correct mode and accent.
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={theme.mode === 'dark' ? 'dark' : undefined}
      data-accent={theme.accent}
      style={{ colorScheme: theme.mode }}
      suppressHydrationWarning
    >
      <body>
        <Providers initialTheme={theme}>{children}</Providers>
      </body>
    </html>
  );
}
