# CTF Dashboard

A clean, modern dashboard for tracking Capture The Flag (CTF) competitions and team progress.

## Features

- **Upcoming CTFs**: Automatically fetches upcoming CTF events from CTFTime API
- **Team Progress**: Track progress on different CTFs with status updates (Planned/In Progress/Completed)
- **Notes**: Personal note-taking system with Firebase authentication
- **Google Authentication**: Secure login with Google accounts

## Files

- `index.html` - Main dashboard interface
- `script.js` - JavaScript functionality with Firebase integration
- `style.css` - Modern, responsive styling

## Setup

1. Open `index.html` in a web browser
2. Sign in with your Google account
3. Start tracking your CTF progress and adding notes

## Technologies Used

- HTML5, CSS3, JavaScript (ES6 modules)
- Firebase (Authentication & Firestore)
- CTFTime API for upcoming events
- CORS proxy for API access

## Firebase Configuration

The app is configured to use Firebase for:
- User authentication via Google
- Storing user notes in Firestore
- Team progress tracking

### Fixing Permission Errors

If you see "Missing or insufficient permissions" errors:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ac1dd4ddy-ctf-dashboard`
3. Navigate to **Firestore Database** > **Rules**
4. Replace the existing rules with the content from `firestore.rules`
5. Click **Publish**

### Required Collections

The app uses these Firestore collections:
- `notes` - User notes with uid field
- `progress` - Team progress tracking