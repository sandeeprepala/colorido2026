# COLORIDO '26 — RBAC Repository Summary

This document analyzes the current state of authentication, authorization, and roles in the COLORIDO '26 codebase, and provides a practical blueprint for introducing a 3-role Role-Based Access Control (RBAC) model: **USER**, **VOLUNTEER**, and **ADMIN**.

---

## 1. Project Structure

Relevant files and directories for authentication, authorization, and access control:

```text
colorido2026/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js                      # JWT secret, client URL, server port
│   │   ├── controllers/
│   │   │   ├── authController.js             # Register, login, getMe, updateProfile
│   │   │   ├── adminController.js            # Admin stats & dashboard metrics
│   │   │   ├── eventsController.js           # Event CRUD
│   │   │   ├── registrationsController.js    # Register, get registrations, QR verify, status updates
│   │   │   ├── stallsController.js           # Stalls & vendor applications
│   │   │   ├── leaderboardsController.js     # Sports match tracking & scoring
│   │   │   ├── certificatesController.js     # Certificate issuance & verification
│   │   │   ├── emailController.js            # Broadcast & test emails
│   │   │   └── discussionController.js       # Community message board
│   │   ├── data/
│   │   │   ├── db.js                         # In-memory store + PostgreSQL synchronization
│   │   │   ├── migrate-pg.js                 # PostgreSQL schema migrations & seed users
│   │   │   ├── seedData.js                   # Initial static seed datasets
│   │   │   └── store.json                    # Local JSON fallback store
│   │   ├── middleware/
│   │   │   └── auth.js                       # JWT verification, requireAuth, requireAdmin
│   │   ├── routes/
│   │   │   └── index.js                      # Express route definitions & middleware attachments
│   │   └── server.js                         # Express server entry point
│   ├── supabase_schema.sql                   # SQL schema definition for profiles & festival data
│   └── .env                                  # Environment variables (JWT_SECRET, PG credentials)
│
└── frontend/
    └── src/
        ├── App.jsx                           # Route registrations (React Router)
        ├── contexts/
        │   └── AuthContext.jsx               # Auth state provider, token management, isAdmin flag
        ├── services/
        │   └── api.js                        # Axios instance, JWT Bearer interceptor, API calls
        ├── components/
        │   └── common/
        │       ├── Navbar.jsx                # Navigation bar & role-filtered links
        │       └── ProfileMorphMenu.jsx      # User profile dropdown with role-conditional links
        └── pages/
            ├── LoginPage.jsx                 # Login form & role-based post-login redirection
            ├── RegisterPage.jsx              # Student registration form
            ├── ProfilePage.jsx               # User profile edit page
            ├── MyFestivalPage.jsx            # Student passes, registrations, certificates, inbox
            ├── CertificatesPage.jsx          # Public & student certificate registry
            ├── AdminDashboard.jsx            # Full festival administration console
            ├── VerifyRegistrationPage.jsx    # Gate QR scan & verification portal
            └── VerifyCertificatePage.jsx     # Certificate authenticity verification portal
```

---

## 2. Authentication

### How Registration Works
1. Frontend form at `frontend/src/pages/RegisterPage.jsx` submits `{ name, email, password, phone, college, department, year, student_id }`.
2. Handled by `authController.register` in `backend/src/controllers/authController.js`.
3. Password is encrypted using `bcrypt.hashSync(password, 10)`.
4. User record is created with default `role: 'student'`.
5. A signed JWT is returned along with the sanitized user object (excluding password).

### How Login Works
1. Frontend form at `frontend/src/pages/LoginPage.jsx` submits `{ identifier, password }` (`identifier` can be username or email).
2. Handled by `authController.login` in `backend/src/controllers/authController.js`.
3. Looks up user via `db.findUserByIdentifier`.
4. Verifies password with `bcrypt.compareSync(password, user.password)` (with fallback check against master password `colorido@2026` or matching username).
5. Returns JWT and user profile object.
6. Frontend redirects admins to `/admin` and regular users to `/my-festival`.

### How JWT / Authentication Works
- Token generator in `backend/src/middleware/auth.js` (`generateToken`):
  ```javascript
  jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, config.jwtSecret, { expiresIn: '7d' })
  ```
- Backend requests are validated using `requireAuth` in `backend/src/middleware/auth.js`, which inspects the `Authorization: Bearer <token>` header, decodes the payload, retrieves the user from DB, and attaches `req.user`.

### Where the Token is Stored
- Browser `localStorage` under the key: `colorido_token`.
- Automatically attached to every HTTP request via Axios interceptor in `frontend/src/services/api.js`.

### Where Authenticated User Information is Stored
- In React Context state `user` inside `frontend/src/contexts/AuthContext.jsx`.
- Verified and refreshed on app mount by calling `GET /api/auth/me`.

### Files Handling Authentication
- `backend/src/controllers/authController.js`
- `backend/src/middleware/auth.js`
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/services/api.js`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/RegisterPage.jsx`

---

## 3. User Model

### Current Structure (`profiles` table / user object)

| Field | Type | Description |
|---|---|---|
| `id` | `TEXT` / `UUID` | Unique identifier (e.g. `usr-...` or `user-student-01`) |
| `username` | `TEXT` | Unique username identifier |
| `name` | `TEXT` | Full name |
| `email` | `TEXT` | Unique email address |
| `password` | `TEXT` | Bcrypt hashed password |
| `phone` | `TEXT` | Mobile contact number |
| `college` | `TEXT` | College / institution name |
| `department` | `TEXT` | Department / major (e.g. Computer Science) |
| `year` | `TEXT` | Academic year (e.g. 2nd Year) |
| `student_id` | `TEXT` | College roll number or student ID |
| `role` | `TEXT` | Current values: `'student'` or `'admin'` |
| `created_at` | `TIMESTAMPTZ` | Account registration timestamp |

### Role Field Status
- **Is there already a `role` field?** **YES**.
- **Where is it defined?**
  - Database schema: `backend/supabase_schema.sql` (line 16: `role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'))`)
  - Migration script: `backend/src/data/migrate-pg.js` (line 36: `role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'))`)
  - Default assignment on register: `backend/src/controllers/authController.js` (line 30: `role: 'student'`)
  - Seed admin: `backend/src/data/migrate-pg.js` (line 202: `role: 'admin'`)
- **Limitation**: Currently restricted to only `'student'` and `'admin'` via SQL `CHECK` constraints and frontend checks (`user?.role === 'admin'`).

---

## 4. Current Admin System

### Admin Login / Authentication Method
- Admin logs in through the same `/login` route using identifier `admin` (or `admin@colorido.fest`) and password `colorido@2026`.
- The issued JWT contains `{ role: 'admin' }`.

### Admin Dashboard File
- `frontend/src/pages/AdminDashboard.jsx` (Single comprehensive management console containing 8 tabs).

### Admin Routes
- Frontend Route: `/admin` (registered in `frontend/src/App.jsx`).
- Backend Routes: All prefixed with `/admin/...` in `backend/src/routes/index.js`.

### Admin Middleware
- `backend/src/middleware/auth.js`:
  ```javascript
  export const requireAdmin = (req, res, next) => {
    requireAuth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
      }
      next();
    });
  };
  ```

### How Admin APIs are Protected
- By attaching `requireAdmin` to Express router endpoints in `backend/src/routes/index.js`.
- If `req.user.role !== 'admin'`, returns HTTP `403 Forbidden`.

### Major Admin Features in `AdminDashboard.jsx`

1. **Dashboard Overview**: Festival KPI counters (registrations, total revenue, event counts, stall occupancy).
2. **Event Management**: Create, edit, and delete events across Technical, Cultural, and Sports categories; define competition rounds and prize pools.
3. **Stall Management**: Review student stall applications (Approve / Reject with feedback); edit stall allocations and interactive grid map.
4. **Registration Management**: View all registrations across all events, search by student name/ID, mark attendance status (`confirmed`, `attended`, `cancelled`), and export CSV.
5. **Sports Leaderboard**: Create tournament leaderboards, toggle live match status (`UPCOMING`, `LIVE`, `COMPLETED`), update team scores and points.
6. **Certificate System**: Generate cryptographic certificates per event, trigger automatic email dispatch, preview certificate modal, copy public verification links.
7. **Email Broadcast**: Broadcast rich-text email announcements to all students or event-filtered participants; live test email delivery.
8. **Discussion Board Moderation**: Delete inappropriate messages from the global festival chat board.

---

## 5. Main API Routes

| Method | Route | Purpose | Current Protection |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login and obtain JWT | Public |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | `requireAuth` |
| `PUT` | `/api/auth/profile` | Update personal profile | `requireAuth` |
| `GET` | `/api/events` | List all festival events | Public |
| `GET` | `/api/events/:id` | Event details | `optionalAuth` |
| `POST` | `/api/events` | Create new event | `requireAdmin` |
| `PUT` | `/api/events/:id` | Update event details | `requireAdmin` |
| `DELETE` | `/api/events/:id` | Delete event | `requireAdmin` |
| `POST` | `/api/events/:eventId/register` | Register for an event | `requireAuth` |
| `GET` | `/api/registrations/my` | View own event registrations | `requireAuth` |
| `GET` | `/api/registrations/verify/:token` | Public gate QR pass verification | Public |
| `GET` | `/api/registrations/:id` | View specific registration | `requireAuth` (Own / Admin) |
| `GET` | `/api/admin/registrations` | View all registrations | `requireAdmin` |
| `PUT` | `/api/admin/registrations/:id/status` | Mark attendance (`attended`, `cancelled`) | `requireAdmin` |
| `DELETE` | `/api/registrations/:id` | Cancel own registration | `requireAuth` |
| `GET` | `/api/stalls` | View all festival stalls & lots | `optionalAuth` |
| `POST` | `/api/stalls/apply` | Submit stall application | `requireAuth` |
| `GET` | `/api/stalls/my` | View own stall applications | `requireAuth` |
| `GET` | `/api/admin/stalls/applications` | View all stall applications | `requireAdmin` |
| `PUT` | `/api/admin/stalls/applications/:id/status` | Approve or reject stall application | `requireAdmin` |
| `PUT` | `/api/admin/stalls/:stallId` | Update stall allocation details | `requireAdmin` |
| `GET` | `/api/leaderboards` | View all sports leaderboards | Public |
| `GET` | `/api/leaderboards/:eventId` | View event leaderboard | Public |
| `POST` | `/api/admin/leaderboards` | Create leaderboard for sport | `requireAdmin` |
| `PUT` | `/api/admin/leaderboards/:id/status` | Change match status (`LIVE`, `COMPLETED`) | `requireAdmin` |
| `PUT` | `/api/admin/leaderboards/:id/entry` | Add/update team score entry | `requireAdmin` |
| `PUT` | `/api/admin/leaderboards/:id/teams/:entryId/points` | Adjust points/score | `requireAdmin` |
| `DELETE` | `/api/admin/leaderboards/:id/entry/:entryId` | Remove leaderboard entry | `requireAdmin` |
| `GET` | `/api/certificates` | Search & list public certificates | Public |
| `GET` | `/api/certificates/my` | View own issued certificates | `requireAuth` |
| `GET` | `/api/certificates/verify/:certificateId` | Verify authentic certificate ID | Public |
| `GET` | `/api/admin/certificates` | View all issued certificates | `requireAdmin` |
| `POST` | `/api/admin/certificates/generate` | Generate certificates & email students | `requireAdmin` |
| `POST` | `/api/admin/email/send` | Broadcast announcement emails | `requireAdmin` |
| `POST` | `/api/admin/email/test` | Dispatch test email | `requireAdmin` |
| `GET` | `/api/admin/email/logs` | View email delivery logs | `requireAdmin` |
| `GET` | `/api/email/inbox/my` | View own received festival emails | `requireAuth` |
| `GET` | `/api/admin/stats` | Festival analytics & metric counters | `requireAdmin` |
| `GET` | `/api/discussion` | View discussion messages | Public |
| `POST` | `/api/discussion` | Post discussion message | `requireAuth` |
| `DELETE` | `/api/admin/discussion/:id` | Delete discussion message | `requireAdmin` |

---

## 6. Frontend Pages

| Page | File | Current Access |
|---|---|---|
| Home | `frontend/src/pages/HomePage.jsx` | Public |
| Events Directory | `frontend/src/pages/EventsPage.jsx` | Public |
| Event Details | `frontend/src/pages/EventDetailPage.jsx` | Public (Registration requires login) |
| Stalls Directory & Map | `frontend/src/pages/StallsPage.jsx` | Public (Application requires login) |
| Festival Schedule | `frontend/src/pages/SchedulePage.jsx` | Public |
| Sports Leaderboard | `frontend/src/pages/LeaderboardPage.jsx` | Public |
| Discussion Forum | `frontend/src/pages/DiscussionPage.jsx` | Public (Posting requires login) |
| Gallery | `frontend/src/pages/GalleryPage.jsx` | Public |
| Certificates Portal | `frontend/src/pages/CertificatesPage.jsx` | Public search / User login for own certs |
| Certificate Verification | `frontend/src/pages/VerifyCertificatePage.jsx` | Public |
| Gate Pass QR Verification | `frontend/src/pages/VerifyRegistrationPage.jsx` | Public read-only scan |
| User Profile | `frontend/src/pages/ProfilePage.jsx` | Authenticated users |
| User Festival Pass & Dashboard | `frontend/src/pages/MyFestivalPage.jsx` | Authenticated users |
| Admin Dashboard | `frontend/src/pages/AdminDashboard.jsx` | Authenticated Admin only |

---

## 7. Volunteer Possibilities

### CURRENTLY EXISTS
1. **Public QR Pass Verification Screen** (`frontend/src/pages/VerifyRegistrationPage.jsx`):
   - Anyone scanning a participant's QR code can view the registration status, participant name, event name, and venue.
2. **Attendance Status Update API** (`backend/src/controllers/registrationsController.js`):
   - Method `updateRegistrationStatus` can switch status to `'attended'`, but is currently locked behind `requireAdmin`.
3. **Sports Scoring API** (`backend/src/controllers/leaderboardsController.js`):
   - APIs to set match status (`LIVE`, `COMPLETED`) and update team points/scores (`saveLeaderboardEntry`, `adjustLeaderboardPoints`), but currently locked behind `requireAdmin`.
4. **Registrations Listing & Search** (`backend/src/controllers/registrationsController.js`):
   - `getAdminRegistrations` filters registrations by event, date, and search term, but is currently locked behind `requireAdmin`.
5. **Stall Status View** (`backend/src/controllers/stallsController.js`):
   - Stalls list and layout map can be read publicly, but updating stall state is locked behind `requireAdmin`.

### COULD BE GIVEN TO VOLUNTEER
1. **Gate Check-In & Attendance Scanner**:
   - Allow volunteers to scan a QR code at gate/venue entrance and **click a button to mark the pass as "Attended"**.
2. **Event Attendance Desk View**:
   - Allow volunteers assigned to an event to view the participant checklist for that event without full admin privileges.
3. **Live Sports Scorekeeping**:
   - Allow sports volunteers on the field to update live scores and match status (`UPCOMING` → `LIVE` → `COMPLETED`) without allowing them to delete the tournament or modify festival settings.
4. **On-Ground Stall Coordination**:
   - Allow stall volunteers to check stall manager credentials and mark booths as occupied/active on festival day.
5. **Discussion Board Moderation (Light)**:
   - Allow volunteers to flag or remove offensive comments during live events.

---

## 8. Simple Role Permission Table

| Feature / Action | USER | VOLUNTEER | ADMIN |
|---|---|---|---|
| View events, schedule & gallery | ✅ | ✅ | ✅ |
| Register for events | ✅ | ✅ | ✅ |
| Manage events (create, edit, delete) | ❌ | ❌ | ✅ |
| View own registrations & passes | ✅ | ✅ | ✅ |
| View event attendee lists | ❌ | ✅ (Assigned / Read-only) | ✅ (All) |
| Scan QR & check in participants (`attended`) | ❌ | ✅ | ✅ |
| Apply for stalls | ✅ | ✅ | ✅ |
| Approve / reject stall applications | ❌ | ❌ | ✅ |
| View stall layout & manager contacts | Limited | ✅ | ✅ |
| View sports leaderboards | ✅ | ✅ | ✅ |
| Update live sports scores & match status | ❌ | ✅ | ✅ |
| Create or delete sports leaderboards | ❌ | ❌ | ✅ |
| View & download own certificates | ✅ | ✅ | ✅ |
| Public certificate registry lookup | ✅ | ✅ | ✅ |
| Generate & email official certificates | ❌ | ❌ | ✅ |
| Send broadcast emails & announcements | ❌ | ❌ | ✅ |
| Post in discussion forum | ✅ | ✅ | ✅ |
| Delete discussion messages | ❌ (Own only) | ✅ (Moderation) | ✅ (All) |
| Access Admin Dashboard (`/admin`) | ❌ | ❌ | ✅ |
| Access Volunteer Portal (`/volunteer`) | ❌ | ✅ | ✅ |

---

## 9. Files That Need RBAC Changes

### Backend

#### Authentication Files
- `backend/src/controllers/authController.js`: Support role mapping (`USER`, `VOLUNTEER`, `ADMIN` instead of hardcoded `'student'`).
- `backend/src/data/seedData.js`: Include a demo volunteer user.

#### Middleware
- `backend/src/middleware/auth.js`:
  - Add `requireVolunteer` (allows `volunteer` and `admin`).
  - Add parameterized role checker: `requireRole(['admin', 'volunteer'])`.

#### Routes
- `backend/src/routes/index.js`:
  - Change `/admin/registrations/:id/status` to allow `requireVolunteer`.
  - Add `/volunteer/checkin/:token` or allow volunteers to update check-in status.
  - Allow volunteers to update leaderboard scores (`/admin/leaderboards/:id/teams/:entryId/points` and `/admin/leaderboards/:id/status`).

#### Controllers
- `backend/src/controllers/registrationsController.js`: Allow volunteers to query attendee lists and execute gate check-ins.
- `backend/src/controllers/leaderboardsController.js`: Allow volunteers to record match scores.

### Frontend

#### Auth Context & Interceptors
- `frontend/src/contexts/AuthContext.jsx`:
  - Add `isVolunteer: user?.role === 'volunteer' || user?.role === 'admin'`.
  - Add `role` helper methods.

#### Route Protection & Navigation
- `frontend/src/App.jsx`: Add protected route guards for `/admin` and a new `/volunteer` route.
- `frontend/src/components/common/Navbar.jsx`: Conditionally show a "Volunteer Portal" link if `isVolunteer`.
- `frontend/src/components/common/ProfileMorphMenu.jsx`: Add Volunteer Portal quick shortcut.

#### Admin & Volunteer Pages
- `frontend/src/pages/LoginPage.jsx`: Update credentials helper to show student, volunteer, and admin logins; redirect volunteer to `/volunteer`.
- `frontend/src/pages/VerifyRegistrationPage.jsx`: Add an interactive **"Mark Attendance / Check-In"** button when scanned by an authenticated volunteer or admin.
- `frontend/src/pages/VolunteerDashboard.jsx` *(New)*: Lightweight portal for QR check-in, event participant lists, and live sports scoring.

### Database

- `backend/supabase_schema.sql`:
  - Update `profiles` table `CHECK` constraint: `CHECK (role IN ('user', 'volunteer', 'admin'))` (or `'student', 'volunteer', 'admin'`).
- `backend/src/data/migrate-pg.js`:
  - Update table constraint and seed a default volunteer user (e.g. `volunteer` / `colorido@2026`).

---

## 10. Important Problems

1. **Strict Database Check Constraint**:
   - `profiles.role` has `CHECK (role IN ('student', 'admin'))` in both `supabase_schema.sql` and `migrate-pg.js`.
   - Attempting to insert `role = 'volunteer'` or `role = 'USER'` will throw a database constraint error unless an `ALTER TABLE` / migration is performed.

2. **Hardcoded Role String in Controller**:
   - `authController.register` hardcodes `role: 'student'`. There is no role selection or administrative assignment workflow.

3. **Insecure Password Bypass Logic**:
   - In `backend/src/controllers/authController.js` (lines 76-80), any user can log in if they enter password `'colorido@2026'` or their own username, completely bypassing bcrypt hash validation.

4. **Insecure Admin Fallback in Token Verification**:
   - In `backend/src/middleware/auth.js` (lines 31-33), if a user is not found in the DB and the token has `decoded.role === 'admin'` or the ID/email contains `'admin'`, it automatically falls back to finding the first admin in the database.

5. **No Frontend Route Guards**:
   - Routes in `frontend/src/App.jsx` are not wrapped in `<ProtectedRoute>` or `<RoleRoute>`. Unauthorized users can access `/admin` URLs, relying solely on in-component `if (!isAdmin)` checks.

6. **Gate QR Check-in Disconnect**:
   - `VerifyRegistrationPage.jsx` is public and read-only.
   - The actual attendance status update endpoint (`PUT /api/admin/registrations/:id/status`) requires full `admin` rights, meaning ground volunteers cannot mark attendance without full superuser admin credentials.

---

## 11. Final Summary

### Current Authentication
- Handled via JWT tokens signed with `config.jwtSecret` and stored in client `localStorage` (`colorido_token`).
- Token payload contains `{ id, email, role, name }`.
- Default registered account role is `'student'`.

### Current Admin System
- Single role `'admin'` access control protected by `requireAdmin` middleware on the backend and `isAdmin` flag in React `AuthContext`.
- Admin console is located at `frontend/src/pages/AdminDashboard.jsx` and controls all events, registrations, stalls, scores, certificates, and broadcasts.

### Missing RBAC Parts
- No `VOLUNTEER` role defined in the database or authorization middleware.
- No `requireVolunteer` or role-hierarchy middleware.
- No volunteer portal or gate check-in workflow for on-ground team members.
- Hardcoded database check constraints preventing new roles.

### Recommended USER Permissions
- Browse events, schedule, stalls, and leaderboard.
- Register for events and view own passes / QR codes.
- Apply for stalls and view own stall applications.
- View and download own certificates; lookup authentic certificates.
- Post in discussion forums and view festival inbox.

### Recommended VOLUNTEER Permissions
- All **USER** permissions.
- Scan participant gate QR codes and mark attendance (`attended`).
- View attendee lists and registration rosters for assigned events.
- Update live sports match scores and match states (`LIVE` / `COMPLETED`).
- Flag or moderate live discussion board comments.

### Recommended ADMIN Permissions
- Full superuser permissions across all festival modules.
- Create, edit, and delete events.
- Approve or reject stall applications and alter booth mapping.
- Generate and dispatch official certificates.
- Broadcast emails to participants.
- Manage user roles and view system analytics.

### Files to Change
- **Backend**:
  - `backend/src/middleware/auth.js` (add `requireVolunteer` / `requireRole`)
  - `backend/src/routes/index.js` (apply volunteer permissions to check-in & score endpoints)
  - `backend/src/controllers/authController.js` (support volunteer role)
  - `backend/src/controllers/registrationsController.js` (allow volunteer check-in)
  - `backend/src/data/seedData.js` & `backend/src/data/migrate-pg.js` (seed volunteer account)
- **Frontend**:
  - `frontend/src/contexts/AuthContext.jsx` (add `isVolunteer` helper)
  - `frontend/src/App.jsx` (add volunteer route & route guards)
  - `frontend/src/components/common/Navbar.jsx` (show volunteer navigation link)
  - `frontend/src/pages/VerifyRegistrationPage.jsx` (add check-in action button for volunteers)
  - `frontend/src/pages/VolunteerDashboard.jsx` (new volunteer portal page)

### Database Changes
- Update `profiles` table check constraint:
  ```sql
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'user', 'volunteer', 'admin'));
  ```
- Seed a default volunteer user:
  ```sql
  INSERT INTO profiles (id, username, name, email, password, role)
  VALUES ('usr-vol-01', 'volunteer', 'Festival Volunteer', 'volunteer@colorido.fest', '<hash>', 'volunteer')
  ON CONFLICT (username) DO NOTHING;
  ```
