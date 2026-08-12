# Pyramid — Task Management

Full-stack task management application built for the AbleSpace Full Stack Developer
assessment, implemented from the provided Figma design.

**Live demo:** _(deploying — link goes here)_
**API docs:** _(deployed API)_`/api/docs`
**Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md) — system design, data model,
auth and tenancy, runtime flows

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 with CSS-variable theming |
| Components | shadcn/ui conventions on Radix primitives |
| Data | TanStack Query with optimistic updates |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL (Neon) via Prisma 6 |
| Auth | Guest login, JWT in an httpOnly cookie |
| Hosting | Vercel (web) · Railway (API) · Neon (database) |

The Figma file is built from the **shadcn/ui block library** — its layers are named
`Blocks / Login-01`, `Blocks / Sidebar-02`, `DropdownMenu / Menu`. The implementation
follows the same conventions and token architecture, which is both the most accurate
and the most honest way to match it.

---

## Features

**Tasks**
- List view grouped by status, with collapsible sections
- Board view — four columns, drag and drop between them
- Inline add at the foot of every group and column
- Task detail page: description, properties, labels, resources, subtasks, comments,
  details rail, and an activity feed
- Subtasks, rendered with the same table component as top-level tasks
- Priority (5 levels), status (5 states), start and end dates, assignees, labels

**Views and filtering**
- List / Board toggle, persisted per account
- Fields dropdown — show or hide any column, persisted
- Filter by status and priority
- Search with a `⌘F` / `Ctrl+F` shortcut, debounced

**Projects**
- Table with priority, lead, due date
- Inline create, delete, task counts

**Theming**
- Light and Dark × six accent colours = 12 combinations
- Switchable from the user dropdown and from Settings
- Persisted, and rendered server-side so there is no flash on load

**Settings**
- Profile: name, title, username, with validation
- Theme and Colour sections

**Throughout**
- Fully responsive: sidebar becomes a drawer, tables become cards, board scroll-snaps
- Loading skeletons, empty states, error states, toasts
- Keyboard accessible, with focus management from Radix primitives

---

## Getting started

**Prerequisites:** Node 20+, a PostgreSQL connection string (Neon's free tier works).

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
#    Set DATABASE_URL and JWT_SECRET in apps/api/.env

# 3. Database
npm run db:generate
npm run db:migrate
npm run db:seed        # optional demo content matching the design

# 4. Run
npm run dev:api        # http://localhost:4000  (docs at /api/docs)
npm run dev:web        # http://localhost:3000
```

---

## Project structure

```
apps/
├── api/                          NestJS
│   ├── prisma/
│   │   ├── schema.prisma         Data model
│   │   └── seed.ts               Demo content
│   └── src/
│       ├── auth/                 Guest login, JWT strategy, global guard
│       ├── users/                Profile + persisted UI preferences
│       ├── tasks/                CRUD, grouping, filtering, reordering
│       ├── projects/             CRUD
│       ├── comments/             Comments and replies
│       ├── labels/               Label CRUD
│       └── common/               Exception filter, decorators
└── web/                          Next.js
    └── src/
        ├── app/
        │   ├── globals.css       Theme system — 2 modes × 6 accents
        │   ├── layout.tsx        Server-side theme injection (no flash)
        │   ├── (auth)/login/
        │   ├── (app)/            Sidebar shell: tasks, task detail, projects
        │   └── settings/         Own shell, per the design
        ├── components/
        │   ├── ui/               Reusable primitives — no domain knowledge
        │   ├── task/             Task-specific components
        │   └── layout/           Sidebar, page header, user menu
        └── lib/                  API client, query hooks, types, formatting
```

`components/ui/` contains nothing task-specific — no imports from `lib/types`
beyond generic user shapes. Everything that knows about tasks lives in
`components/task/`. That boundary is what makes the primitives genuinely reusable
rather than reusable in name.

---

## Theming

The design exposes two independent controls in the user dropdown:

- **Change Theme** → Light / Dark
- **Color Mode** → Amber, Blue, Pink, Rose, Emerald, Black

That is **12 combinations**, implemented as two axes rather than 12 palettes:

- The neutral scale (backgrounds, borders, text) lives in `:root` and `.dark`.
- Only accent tokens change per colour mode, in `[data-accent="…"]` blocks.

**Persistence and no flash.** The preference is written to a cookie and mirrored to
`localStorage`. The root layout is a server component that reads the cookie and puts
the correct `class` and `data-accent` on `<html>` in the first response — so the
browser never paints the wrong theme, not even for one frame. The preference is also
written to the user record, so it follows the account rather than the browser.

---

## Authentication

Guest login only, per the brief.

```
POST /api/auth/guest   → creates a guest user, sets an httpOnly JWT cookie, seeds starter tasks
GET  /api/auth/me      → current session
POST /api/auth/logout  → clears the cookie
```

Log out is in the user dropdown. It calls `/auth/logout`, clears the React Query
cache so the next account on this browser cannot read the previous one's tasks from
memory, and returns to `/login`.

The token is httpOnly, so client JavaScript cannot read it. Next.js middleware does a
presence check for routing only; the API is the authority and rejects invalid tokens
with a 401. Every task and project query is scoped by `ownerId` **at the service
layer**, so no controller can forget to do it and one guest can never see another's
data.

---

## API

Full interactive reference at `/api/docs`.

```
POST   /api/auth/guest
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/users/me
PATCH  /api/users/me                  profile
PATCH  /api/users/me/preferences      theme, colour mode, view mode, column visibility

GET    /api/tasks                     ?status= &priority= &search= &projectId= &page= &limit=
GET    /api/tasks/grouped             grouped by status — powers list and board views
POST   /api/tasks
GET    /api/tasks/:id                 includes subtasks, comments, activity, resources
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/reorder             bulk move/reorder

GET    /api/projects                  ?search=
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

GET    /api/tasks/:taskId/comments
POST   /api/tasks/:taskId/comments
DELETE /api/comments/:id

GET    /api/labels
POST   /api/labels
DELETE /api/labels/:id
```

Validation is global (`whitelist`, `forbidNonWhitelisted`, `transform`), every endpoint
has an explicit DTO, and all errors return one shape:

```json
{ "statusCode": 404, "error": "NotFound", "message": "Task abc not found",
  "path": "/api/tasks/abc", "timestamp": "2026-08-08T12:00:00.000Z" }
```

---

## Notable implementation decisions

**Optimistic updates.** Changing a priority, status, or due date writes to the query
cache immediately and rolls back precisely on failure by restoring the snapshot taken
in `onMutate`. Dragging a card between columns feels instant because the network round
trip happens behind the change, not in front of it.

**Drag and drop without a library.** The board uses the native HTML5 drag API. It adds
no dependency and covers desktop; because native DnD is unreliable on touch, every move
is also available from the card's `…` menu, which is what touch and keyboard users get.

**Subtasks are Tasks.** The design renders subtasks with the identical table component
as top-level tasks, which is a strong hint they are the same entity. The schema models
them as a self-relation rather than a parallel model.

**Hand-written calendar and toasts.** Both are small, single-purpose, and fully
understood — preferable to two more dependencies for ~150 lines of behaviour.

---

## Intentional deviations from the design

1. **Login copy.** The Figma subtitle reads "Enter your email below to login to your
   account", but the card has no email field — leftover copy from the shadcn `login-01`
   block. Rewritten to describe what the screen actually does.

2. **Google sign-in.** Present in the design, but the brief specifies guest login only.
   The button is rendered for visual fidelity and disabled with an explanatory tooltip,
   rather than shipped half-working.

3. **Duplicate "Members" entry.** The Fields dropdown lists Members twice. Implemented
   once.

4. **Comments section heading.** The task detail page labels the comments area
   "Subtasks", directly below the actual subtasks table. Relabelled to "Comments".

5. **Primary button colour.** The main call-to-action renders neutral black in light
   mode even when the colour mode is Blue, so `--primary` is kept neutral and the accent
   drives selected states, focus rings and links. This matches the frames rather than
   the assumption that colour mode recolours everything.

6. **Leave Workspace.** Multi-user workspaces are out of scope. The control is rendered
   per the design and opens a dialog explaining why, rather than doing nothing.

7. **Mobile tables.** The design only specifies desktop frames. Below `md`, six-column
   tables become stacked rows — horizontal scrolling through six columns on a phone
   would be unusable.

8. **Backlog group in List view.** The design shows three sections — To Do, Doing,
   Completed. But `BACKLOG` is offered in the task detail Status menu and in the
   Filter dropdown, and every new account is seeded with one Backlog task, so with
   only three sections that task rendered nowhere and filtering by Backlog returned
   an empty list. List view now leads with a Backlog group. The board is unchanged.

9. **Log out.** Not in the design, which has no session controls at all. The session
   has to be endable from somewhere, so it sits at the foot of the user dropdown
   next to the account it ends.

---

## Known limitations

- Assignee and label pickers are read-only in the UI; the API supports writing both
  (`assigneeIds`, `labelIds` on task create/update).
- Board column order is fixed; columns are not reorderable.
- No test suite. With more time: unit tests on `TasksService` scoping and the theme
  cookie round trip, plus a Playwright pass over guest login → create → move → theme.
