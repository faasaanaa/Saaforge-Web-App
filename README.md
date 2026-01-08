# Saaforge – Startup Site & Internal Dashboard

Next.js (App Router) + TypeScript + Tailwind + Firebase (Auth, Firestore, Hosting).

## Features (owner)
- Requests: approve/reject join requests
- Team: manage members and profiles
- Projects: CRUD, assignments
- Tasks: assign and track
- Orders: review client requests
- Applications: project applications
- Ideas: approve/reject project ideas
- Feedback: review project feedback
- Content: site content editor
- Audit: activity logs
- Chat: team chat with unread badges

## Features (team)
- Profile management and visibility
- Assigned projects overview
- Tasks: view and update status
- Ideas & feedback submission
- Chat with owner with unread badges

## Functions/architecture
- Next.js App Router + React Server Components
- Firebase Auth (email/password, Google) with role enforcement
- Firestore collections: users, teamProfiles, ownerProfiles, joinRequests, projects, tasks, orders, projectApplications, projectIdeas, projectFeedback, messages, siteContent, auditLogs, userNotifications
- Notification badges via `useNotifications` (lastViewed timestamps per section)
- Firestore security rules in `firestore.rules`

## Prerequisites
- Node 18+ (Next 16 / React 19)
- Firebase project (Auth + Firestore)

## Env vars (`.env.local`)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Install & run
```bash
npm install
npm run dev
```
App: http://localhost:3000

## Quality checks
```bash
npm run lint
npm run build
```

## Deploy (Firebase)
```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

## Notes
- Firestore rules live in `firestore.rules` and require deploy to take effect.
- Use invite codes for team registration; owner emails are enforced in auth context.

## Developer & Credits
- Built by the Saaforge team (owner + approved team roles)
- Tech: Next.js, React, Tailwind, Firebase Auth/Firestore
- Icons/emoji per UI; gradients and motion via Tailwind/Framer Motion
