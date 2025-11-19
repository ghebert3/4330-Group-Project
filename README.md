# 🐯 Whirl – LSU Campus Social App

Whirl is a mobile application built for **Louisiana State University (LSU)** students to meet new people, join student activities, and stay connected with campus life.  
Our mission is to create a **private, LSU-exclusive communication and discovery platform** that supports friendships, clubs, meetups, and campus engagement.

---

## 👥 Team & Roles

| Member            | Role / Responsibilities                                   |
| ----------------- | --------------------------------------------------------- |
| **Carter Mauer**  | Supabase Integration, Authentication, Backend Structure   |
| **Thomas Lee**    | Profile Screen & Home Feed UI                             |
| **Gerald Hebert** | Events / Meetups System & Booking Workflow                |
| **Nguyen Vu**     | Social Feed Swipe (Discovery Page)                        |
| **Cole Heausler** | Search Screen & Meetup Application / Event Signup Flow    |

---

## 🌊 Project Overview

Whirl is being developed with **React Native (Expo)** on the frontend and **Supabase** for backend services including:

- Authentication  
- Database  
- Row-Level Security  
- Storage buckets  

The app architecture supports onboarding, discovery, posting, swiping, event creation, and messaging.

---

## 🧠 Core Features (Active Development)

### 🔐 Authentication
- LSU-restricted login/signup (`@lsu.edu`)
- Secure session token handling
- Auto-reauthentication on app reload  
- Auth-based routing using RootNavigator

### 👤 Profiles & User Data
- Editable profile (bio, avatar, interests, major)
- Auto-profile creation on sign-up (planned trigger)

### 🏠 Home Feed
- Story bubbles (24-hour stories)
- Posts feed UI with image viewer

### 💬 Discovery (Swipe System)
- Swipe left/right on other students  
- Mutual matches create connections

### 📅 Events & Meetups
- Browse events and student meetups  
- RSVP/booking system (in progress)

### 🛡️ Safety & Controls
- Report user/report content modal  
- Privacy toggle for public/private profile  
- Moderation logs in Supabase

### ✉️ Messaging (Planned)
- One-to-one chat between matched users  

---

## 🧩 Tech Stack

| Layer    | Technology                    | Purpose                                      |
| -------- | ----------------------------- | -------------------------------------------- |
| Frontend | **React Native (Expo)**       | Mobile UI framework for iOS & Android        |
| Backend  | **Supabase**                  | Auth, database, storage, and RLS             |
| Database | **PostgreSQL (Supabase)**     | All app data (profiles, events, posts, etc.) |
| Auth     | **Supabase Auth**             | LSU email/password login                     |
| Storage  | **Supabase Storage**          | Avatars, posts, stories, event media         |
| Language | **TypeScript**                | Strongly-typed codebase                      |

---

## 🗂️ Project Structure
```
4330-Group-Project/
│
├── App.tsx
├── src/
│ ├── lib/
│ │ └── supabase.ts # Supabase client setup
│ ├── navigation/
│ │ └── RootNavigator.tsx # Auth flow + tab navigation
│ ├── screens/
│ │ ├── LoginScreen.tsx
│ │ ├── SignUpScreen.tsx
│ │ ├── HomeScreen.tsx # Stories + feed UI
│ │ └── (future screens)
│ ├── types.ts
│ └── tokens.ts # Colors + spacing tokens
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

> 🌊 _Built with React Native, Supabase, and LSU spirit._ 🌊