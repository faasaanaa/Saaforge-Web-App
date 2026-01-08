# Saaforge – Startup Site & Internal Dashboard

Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4 + Firebase (Auth, Firestore, Hosting).

## Key Features

### Owner Dashboard
- **Team Management**: View, approve, set roles, manage team members
- **Projects**: Create, publish, assign to team members
- **Orders**: Review and convert client requests to projects
- **Applications**: Manage project join applications
- **Tasks**: Assign and track team tasks
- **Ideas & Feedback**: Approve/reject project ideas and feedback
- **Content Editor**: Manage site content sections
- **Audit Logs**: Track activity across the platform
- **Team Chat**: Real-time messaging with unread badges

### Team Member Dashboard (Approval Required)
- **Profile Management**: Full profile with visibility controls
- **Assigned Projects**: View and manage assigned projects
- **Tasks**: View assigned tasks and update status
- **Feedback & Ideas**: Submit project feedback and ideas
- **Team Chat**: Chat with owner and team with unread badges

### Public Pages
- **Home**: Landing page with team overview
- **Projects**: Browse published projects with community feedback
- **Team**: View publicly visible team members
- **Onboarding**: Google Sign-in onboarding flow
- **Auth**: Login, register with invite code

## Architecture

- **Next.js 16** (Turbopack): Static export to `out/` directory
- **React 19** + **TypeScript**: Type-safe components
- **Tailwind CSS v4**: Responsive design
- **Framer Motion**: Smooth animations
- **Firebase Auth**: Email/password and Google authentication
- **Firestore**: Real-time database with security rules
- **Firebase Hosting**: Static site with clean URLs and redirects

## Project Structure

```
app/                          # Next.js pages (App Router)
  dashboard/
    owner/                    # Owner dashboard pages
    team/                     # Team dashboard pages (approval-gated)
  (public)/
    project/                  # Project detail (query param: ?id=)
    projects/                 # Projects list
    team/                     # Team page
    team-profile/             # Team member profile (query param: ?id=)
components/
  auth/ProtectedRoute.tsx    # Route protection + approval gating
  layout/                     # Navbar, Footer
  ui/                         # Reusable UI components
  dashboard/                  # Dashboard layout
lib/
  firebase/config.ts         # Firebase init (in .gitignore)
  contexts/AuthContext.tsx   # Auth state & role management
  hooks/useFirestore.ts      # Firestore CRUD utilities
  types.ts                   # TypeScript interfaces
  utils/                     # Helpers
```

## Firestore Collections

- `users`: User profile with role (owner | team)
- `teamProfiles`: Team member details (UID or email-based, with isApproved flag)
- `projects`: Published projects with tech stack, demos, etc.
- `projectFeedback`: Community feedback on projects
- `joinRequests`: Team member join requests
- `orders`: Client service requests
- `projectApplications`: Applications to join projects
- `tasks`: Team tasks
- `messages`: Chat messages
- `siteContent`: CMS content for hero, about, services sections
- `auditLogs`: Activity logs
- `userNotifications`: Notification badges (lastViewed per section)

## Environment Setup

### `.env.local` (Not tracked – add your Firebase credentials)
```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

## Install & Run

```bash
# Install dependencies
npm install

# Development server
npm run dev
# http://localhost:3000

# Build for static export
npm run build
# Output: out/

# Deploy to Firebase
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

## Key Features

### Authentication Flow
1. **New Users**: Default role `team`, require approval to access dashboard
2. **Team Members**: Access granted via `teamProfiles[uid].isApproved === true`
3. **Owners**: Email-based (hardcoded in AuthContext), instant access to `/dashboard/owner`
4. **Redirect Logic**:
   - Owner login → `/dashboard/owner`
   - Non-owner login → `/` (homepage)
   - Unapproved team accessing team routes → `/` (homepage)

### Routing Strategy
- **Static Export**: All pages pre-rendered to HTML
- **Query Parameters**: Project and team member details use `?id=` for dynamic content
- **Redirects**: Legacy `/projects/:id` → `/project?id=:id` (301 redirect in firebase.json)
- **Clean URLs**: Firebase `cleanUrls: true` strips `.html`

### Team Approval Gating
- `ProtectedRoute` with `requireTeamApproval` prop gates team dashboard
- Unapproved team members redirected to homepage (not join page)
- Owners bypass approval checks entirely

## Deployment

```bash
# Build static site
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Full deployment (hosting + Firestore rules/indexes)
firebase deploy
```

### Firebase Hosting Config
- Public directory: `out/` (static export)
- Clean URLs: enabled
- Redirects: `/projects/:id` → `/project?id=:id`, `/team/:id` → `/team-profile?id=:id`
- No global SPA rewrite (each page served as static HTML)

## Security

- **Credentials Not Tracked**: `.env.local` and `lib/firebase/config.ts` in `.gitignore`
- **Firestore Rules**: Security rules in `firestore.rules` enforce role-based access
- **Auth Context**: Role promotion and approval logic in `AuthContext.tsx`
- **ProtectedRoute**: Client-side route protection with approval checking

## Notes

- Firestore security rules must be deployed via `firebase deploy` to take effect
- Team members require owner approval via the Team Management page
- Invite codes required for team registration
- Owner emails hardcoded; can be updated in `AuthContext.tsx` OWNER_EMAILS array
- All pages are statically exported; dynamic data loaded via Firestore listeners

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Runtime | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Backend | Firebase (Auth, Firestore) |
| Hosting | Firebase Hosting |
| Icons | Emoji + SVG |

## Future Enhancements

- Video/image uploads to Cloud Storage
- Advanced filtering and search on projects/tasks
- Export reports (audit logs, project status)
- Integration with third-party APIs
- Mobile app (React Native)

## Developer

Built by the Saaforge Owner [Muhammad Saad]. For issues or contributions, please contact the project owner.
