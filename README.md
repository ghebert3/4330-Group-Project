# 🐯 Whirl - LSU Campus Social App

Whirl is a mobile application designed to help **Louisiana State University (LSU)** students meet new friends, find clubs, and join campus events.  
Our mission is to make it easier for students to connect, explore LSU life, and stay informed all while using a secure, LSU-exclusive space.

---

## 👥 Team & Roles

| Member            | Role                                            |
| ----------------- | ----------------------------------------------- |
| **Carter Mauer**  | Backend Developer –> Supabase Integration & Auth |
| **Thomas Lee**    | Frontend Developer –> Navigation & UI Components |
| **Gerald Hebert** | Frontend Developer –> Events & Discovery         |
| **Nguyen Vu**     | UX Designer –> Layouts & Prototypes              |
| **Cole Heausler** | Frontend & Backend Developer                    |

---

## 🌊 Overview

This app is being built with **React Native (Expo)** for the frontend and **Supabase** for backend services (authentication, database, and storage).

### 🧠 Key Features (In Progress)

- 🔐 **Secure Login / Signup** using LSU email accounts (`@lsu.edu`)
- 👤 **User Profiles** with bio, avatar, and interests
- 🏠 **Home Feed** for posts and stories
- 💬 **Discovery** page to meet new people through swiping
- 📅 **Events & Booking** for LSU clubs or student activities
- ✉️ **Private Messaging** (planned)
- 🛡️ **Safety Controls** like privacy toggle and report system

---

## 🧩 Tech Stack

| Layer    | Technology                    | Purpose                                      |
| -------- | ----------------------------- | -------------------------------------------- |
| Frontend | **React Native (Expo)**       | Mobile UI framework for iOS & Android        |
| Backend  | **Supabase**                  | Authentication, database, file storage       |
| Database | **PostgreSQL (via Supabase)** | Stores user data, posts, events, and matches |
| Auth     | **Supabase Auth**             | Email + password (restricted to LSU emails)  |
| Storage  | **Supabase Storage**          | User avatars, posts, and stories             |
| Language | **TypeScript**                | Strongly-typed React Native code             |

---

## 🗂️ Project Structure

```
4330-Group-Project/
│
├── App.tsx                # Entry point
├── src/
│   ├── lib/
│   │   └── supabase.ts    # Supabase client setup
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── (more screens soon)
│   ├── types.ts
│   └── tokens.ts
│
├── package.json
├── tsconfig.json
├── app.json
└── README.md
```

---

## ⚙️ Setup & Run (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/ghebert3/4330-Group-Project.git
cd 4330-Group-Project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App

```bash
npx expo start
```

Then:

- Scan the QR code with your phone using the **Expo Go** app, or
- Press **“Run on Android/iOS Emulator”** in the terminal to test locally.

---

## 🔒 Authentication Logic

- Users can **sign up or log in** only with an `@lsu.edu` email.
- Supabase handles session tokens and automatic reauthentication.
- Once logged in, the app stores the session locally and redirects to the Home screen.
- If no session is found, users see the Login/SignUp screen.

---

## 💾 Database Schema (In Progress)

| Table      | Purpose                                            |
| ---------- | -------------------------------------------------- |
| `profiles` | Basic user info (id, email, username, bio, avatar) |
| `posts`    | Feed posts (caption, image, author)                |
| `stories`  | 24-hour temporary stories                          |
| `swipes`   | Swipe left/right interactions                      |
| `matches`  | Mutual right swipes between users                  |
| `events`   | Campus meetups or club events                      |
| `reports`  | User safety and moderation logs                    |

> The schema and Row-Level Security (RLS) policies are managed directly in Supabase.

---

## 🧠 Current Implementation

✅ Supabase authentication (Login / Sign Up)  
✅ Navigation setup (RootNavigator + Tabs)  
✅ Basic Home feed UI (stories & posts layout)  
✅ Connected Supabase client  
🕓 In Progress: database integration, profile onboarding, and event creation

---

## 🏗️ Planned Next Steps

- [ ] Enforce LSU email domain check on sign-up
- [ ] Add `profiles` table & automatic creation trigger
- [ ] Create Supabase storage buckets (avatars, stories, posts)
- [ ] Fetch feed data from Supabase
- [ ] Implement “Discover” swipe screen + mutual matches
- [ ] Create “Events” system for meetups and clubs
- [ ] Add privacy toggle & report functionality
- [ ] Improve UI animations and navigation polish

---

> 🌊 _Built with React Native, Supabase, and LSU spirit._ 🌊
