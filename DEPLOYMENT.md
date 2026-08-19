# Deployment

Neon (database) → Railway (API) → Vercel (web). **Do them in that order** — Vercel
needs the Railway URL, and Railway needs the Vercel URL only at the very end.

Budget ~30 minutes. Everything below is free tier.

---

## Before you start

Push the current state to GitHub. The repository must be **public** and stay public,
along with the deployment, for **45 days** after submission.

```bash
git add -A
git commit -m "chore: add deployment configuration for Vercel and Railway"
git push
```

---

## 1. Neon — database

1. Sign up at [neon.tech](https://neon.tech) and create a project.
   Pick the region closest to where you'll deploy the API (Railway defaults to US West).
2. On the project dashboard, open **Connection Details**.
3. Copy **two** connection strings:

   | Toggle | Use as | Looks like |
   |---|---|---|
   | Connection pooling **on** | `DATABASE_URL` | `...-pooler.region.aws.neon.tech/...` |
   | Connection pooling **off** | `DIRECT_URL` | `...region.aws.neon.tech/...` (no `-pooler`) |

   Both end in `?sslmode=require`. Keep that.

**Why two.** The app uses the pooled connection because it opens many short-lived
connections. Migrations take advisory locks and issue DDL, neither of which survives a
transaction pooler — run them through the pooler and `migrate deploy` can hang or fail.
Prisma's `directUrl` exists for exactly this, and it does **not** fall back if unset.

---

## 2. Railway — API

1. Sign up at [railway.app](https://railway.app) with GitHub.
2. **New Project → Deploy from GitHub repo →** select this repository.

3. **Railway will detect the npm workspaces and offer to create two services —
   `@pyramid/api` and `@pyramid/web`. You only want the API here.** Delete the
   `web` service (its ⋮ menu → Remove). The frontend goes to Vercel in step 3;
   running it on Railway too would just burn credits on a build you never use.

4. Open the `@pyramid/api` service → **Settings** and set these explicitly. The
   dashboard overrides `railway.json`, and Railway's monorepo autodetection
   usually pre-fills the wrong values:

   | Setting | Value |
   |---|---|
   | Root Directory | *(empty — the repository root)* |
   | Install Command | `npm ci --include=dev` |
   | Build Command | `npm run build --workspace=apps/api` |
   | Start Command | `npm run start:prod --workspace=apps/api` |

   `--include=dev` is not optional. `NODE_ENV=production` makes npm skip
   devDependencies, and the Nest CLI that compiles the app lives there — without it
   the build produces no `dist/` and the container crashes on boot with
   `Cannot find module '/app/apps/api/dist/main'`.

5. Open **Variables** and add:

   ```
   DATABASE_URL          = <Neon pooled string>
   DIRECT_URL            = <Neon direct string>
   JWT_SECRET            = <see below>
   NODE_ENV              = production
   NPM_CONFIG_PRODUCTION = false
   ```

   `NPM_CONFIG_PRODUCTION=false` is a second guard on the same devDependency
   problem, for any install path that ignores the explicit command above.

   Generate a real secret — do not reuse the local one:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   Leave `PORT` alone. Railway injects it and the app reads it.
   `WEB_ORIGIN` comes later, in step 4.

5. **Settings → Networking → Generate Domain.** Copy the URL, e.g.
   `https://pyramid-api-production.up.railway.app`.

6. Watch the deploy log. On first boot `start:prod` runs `prisma migrate deploy`, which
   creates the schema. Then confirm:

   ```
   https://<your-railway-url>/api/health
   ```

   Expected:

   ```json
   { "status": "ok", "database": "up", "latencyMs": 12, ... }
   ```

   `"database": "down"` means the API is running but cannot reach Neon — check
   `DATABASE_URL`. Do not continue until this returns `ok`.

   Swagger is at `/api/docs` if you want to poke at endpoints directly.

---

## 3. Vercel — web

1. Sign up at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project →** import the same repository.
3. Leave the root directory as `./`. `vercel.json` scopes the build to `apps/web`.
4. Add **one** environment variable:

   ```
   API_URL = https://<your-railway-url>
   ```

   **No trailing slash.** `next.config.ts` appends `/api/:path*` itself, so a trailing
   slash produces `//api/...` and every request 404s.

5. Deploy, then copy the resulting URL, e.g. `https://pyramid-xyz.vercel.app`.

> **Do not set `NEXT_PUBLIC_API_URL`.** It bypasses the proxy, puts the session cookie
> on the API's domain where middleware cannot read it, and produces an infinite
> redirect loop between `/login` and `/tasks`. See the note at the end of this file.

---

## 4. Back to Railway — close the loop

Add one more variable:

```
WEB_ORIGIN = https://<your-vercel-url>
```

Redeploy. This only affects direct browser access to the API (Swagger); normal traffic
is proxied and same-origin, so CORS never applies. Setting it correctly is still worth
doing.

---

## 5. Smoke test — the part that actually matters

Open the **Vercel URL** in a fresh incognito window and walk through:

- [ ] `/` redirects to `/login`
- [ ] **Continue as Guest** lands you on `/tasks` and **stays there** — no bounce back to `/login`
- [ ] Starter tasks are visible (a guest session seeds its own content)
- [ ] Create a task from the inline **+ Add Task** row
- [ ] Switch to **Board** view, drag a card to another column, refresh — it stayed
- [ ] Open a task, add a comment, change priority
- [ ] Change theme and colour mode from the user menu
- [ ] **Hard refresh (Ctrl+Shift+R)** — theme holds with no white flash
- [ ] Close the browser, reopen the URL — still logged in
- [ ] Open DevTools → Network: requests go to your **Vercel** domain, not Railway
- [ ] Resize to a phone width — sidebar becomes a drawer, tables become cards

The second and last checks are the ones that prove the cookie fix. Neither can be
tested locally, because `localhost:3000` and `localhost:4000` are the same site and
share cookies.

---

## 6. Keep it alive for 45 days

Railway's free tier does not sleep the way Render's does, but a monitor gives you an
alert if something breaks while you're not watching.

Sign up at [uptimerobot.com](https://uptimerobot.com), add an **HTTP(s)** monitor
pointing at `https://<railway-url>/api/health` every 5 minutes, with your email as the
alert contact.

Also worth doing: put the live URL at the top of the README before you submit.

---

## Troubleshooting

**Vercel build fails on `prisma generate` / "Environment variable not found: DATABASE_URL"**
The build isn't using `vercel.json`. Check Project Settings → Build & Development
Settings and confirm the build command is `npm run build --workspace=apps/web`, not
the root `npm run build`. Vercel never needs Prisma.

**`Error: Cannot find module '/app/apps/api/dist/main'`**
The build produced no output. Almost always devDependencies were skipped, so the Nest
CLI was missing and `nest build` never ran. Set the install command to
`npm ci --include=dev` and add `NPM_CONFIG_PRODUCTION=false`, then redeploy. Check the
**build** log — not the deploy log — for a line running `nest build`. If the build log
only shows `npm install` and nothing else, the build command isn't set.

**Deploy log shows `npm run start` instead of `start:prod`**
The dashboard's start command is empty, so Railway fell back to the default. Set it to
`npm run start:prod --workspace=apps/api`. As a safety net the repo's `start` script
now also runs migrations, so either command works — but set it explicitly anyway.

**Railway deploy fails during `prisma migrate deploy`**
`DIRECT_URL` is missing or points at the pooled endpoint. It must be the string
**without** `-pooler` in the host.

**Infinite redirect between `/login` and `/tasks`**
`NEXT_PUBLIC_API_URL` is set on Vercel. Delete it and redeploy. The client must call
its own origin so the session cookie stays first-party.

**All API requests 404 on the deployed site**
Trailing slash on `API_URL`. Remove it and redeploy.

**Login works but every request 401s**
`JWT_SECRET` changed between deploys, invalidating existing tokens. Clear cookies and
sign in again. Set it once and leave it alone.

**Health check says `"database": "down"`**
`DATABASE_URL` is wrong, or the Neon project is paused. Neon suspends idle databases on
the free tier; the first request wakes it and may take a few seconds.

**Theme flashes white on load**
The theme cookie isn't reaching the server component. Confirm you're loading the Vercel
URL rather than hitting the Railway API directly.

---

## Why the API is proxied rather than called directly

The session is an httpOnly cookie set by the API. Cookies are stored against the domain
that sets them.

Called cross-origin, the browser stores the cookie under `railway.app`. Next middleware
runs on `vercel.app` and calls `request.cookies.get('pyramid_token')` — which is empty,
always. Guest login succeeds, redirects to `/tasks`, middleware finds nothing, bounces
to `/login`, and loops. Both `.vercel.app` and `.up.railway.app` are on the Public
Suffix List, so a shared parent cookie domain isn't available either.

`next.config.ts` rewrites `/api/*` to the API service. The browser sees one origin, the
cookie is first-party, middleware can read it, CORS preflights disappear, and the API's
real address never reaches the client.
