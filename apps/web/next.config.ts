import type { NextConfig } from 'next';

/**
 * The API is proxied through Next rather than called cross-origin.
 *
 * Why: the session is an httpOnly cookie set by the API. If the browser talks
 * to the API on its own domain (Railway) while the app is served from another
 * (Vercel), the cookie is stored against the API domain — so Next middleware,
 * which runs on the app domain, can never read it. Guest login would succeed,
 * redirect to /tasks, get bounced back to /login, and loop forever. Locally
 * this is invisible, because localhost:3000 and localhost:4000 are the same
 * site and share cookies.
 *
 * Proxying makes every request same-origin, which means:
 *   - the session cookie is first-party, so middleware can read it
 *   - no CORS preflight, and no SameSite=None requirement
 *   - one public URL to configure
 *
 * API_URL is server-only (no NEXT_PUBLIC_ prefix) — the upstream address is
 * never shipped to the browser.
 */
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
