# CTF Dashboard

A modern, customizable dashboard for Capture The Flag (CTF) competitions with draggable modules, real-time collaboration, and comprehensive tracking features.

## Features

### 🎯 CTF Tracking
- **Upcoming CTFs**: Automatically fetches events from CTFTime API with full details (name, date, time in CDT, duration, description)
- **Clickable Events**: Click any CTF card to open the event URL
- **Smart Truncation**: Long descriptions are automatically truncated with "..." for better display

### 📊 Progress Management
- **Personal Progress Tracking**: Track your progress on different CTFs (Planned/In Progress/Completed)
- **User-Specific Data**: Each user sees only their own progress data
- **Add/Remove CTFs**: Easily add new CTFs to track or delete existing ones
- **Real-time Updates**: Changes sync instantly across sessions

### 📝 Notes System
- **Personal Notes**: Private note-taking with Firebase authentication
- **Click to Delete**: Hover over notes (turns red) and click to delete with confirmation
- **Real-time Sync**: Notes update instantly across devices

### 🤝 Collaborative Notes
- **Team Collaboration**: Create or join team note-taking sessions with username/password
- **Real-time Editing**: Multiple users can edit simultaneously with live updates
- **Snapshot System**: Save named snapshots of collaborative notes at any time
- **Load Snapshots**: Restore previous versions from saved snapshots
- **Secure Access**: Team-based authentication with Firebase storage

### 🎨 Customizable Interface
- **Draggable Modules**: Move any module anywhere on the screen with grid snapping
- **Resizable Modules**: Resize modules using handles in bottom-right corners
- **Layout Persistence**: Your custom layout is saved to Firebase and restored on login
- **Grid Snapping**: All movements snap to a 20px grid for clean alignment
- **Full-Screen Workspace**: Modules can be positioned across the entire screen width

### 🌙 Theme System
- **Dark/Light Mode**: Toggle between Ayu Dark and Ayu Light themes
- **Theme Persistence**: Your theme preference is saved locally
- **Consistent Styling**: All modules and elements adapt to theme changes

### 🔐 Authentication & Security
- **Google Authentication**: Secure login with Google accounts
- **User-Specific Data**: All data is isolated per user
- **Firebase Security**: Proper Firestore rules for data protection

## Files Structure

- `index.html` - Main dashboard interface with modular sections
- `script.js` - Complete JavaScript functionality with Firebase integration
- `style.css` - Responsive styling with dark/light theme support
- `firestore.rules` - Firebase security rules for proper data access

## Setup Instructions

1. **Open the Dashboard**
   - Open `index.html` in a web browser
   - Enable popups if prompted (required for CTF links)

2. **Authentication**
   - Sign in with your Google account
   - Your email will appear below the title

3. **Customize Layout**
   - Drag modules by clicking and dragging anywhere on the module
   - Resize modules using the orange handles in bottom-right corners
   - Your layout automatically saves and restores on next login

4. **Use Features**
   - Click CTF events to visit their websites
   - Add/edit personal notes and progress tracking
   - Create/join collaborative team notes
   - Save snapshots of collaborative work
   - Toggle between light/dark themes

## Module Details

### Upcoming CTFs Module
- Displays 5 upcoming CTF events from CTFTime
- Shows: Event name, full date/time in CDT, duration, description
- Scrollable content area for long lists
- Click any event to open in new tab

### Team Progress Module
- Personal CTF progress tracking
- Add new CTFs with the "+" button
- Change status via dropdown (Planned/In Progress/Completed)
- Delete CTFs by clicking the name (turns red on hover)

### Notes Module
- Personal note-taking system
- Add notes with text input and "Add" button
- Delete notes by clicking them (turns red on hover)
- Confirmation dialog prevents accidental deletion

### Collaborative Notes Module
- Team-based real-time note editing
- Create new teams or join existing ones with team name/password
- Live collaborative editing with multiple users
- Save named snapshots of current content
- Load previous snapshots from dropdown
- Leave team to return to join/create interface

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6 modules)
- **Backend**: Firebase (Authentication & Firestore)
- **APIs**: CTFTime API with CORS proxy
- **Styling**: Custom CSS with Ayu theme colors
- **Features**: Drag & drop, real-time collaboration, responsive design

## Firebase Configuration

### Collections Used
- `notes` - Personal user notes (uid-based)
- `progress` - Individual CTF progress tracking (uid-based)
- `teams` - Collaborative team notes (team name-based)
- `snapshots` - Saved snapshots of team notes
- `layouts` - User layout preferences (uid-based)

### Security Rules Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ac1dd4ddy-ctf-dashboard`
3. Navigate to **Firestore Database** > **Rules**
4. Replace existing rules with content from `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

## Usage Tips

- **Layout**: Arrange modules however you prefer - your layout persists between sessions
- **Collaboration**: Share team names/passwords securely with team members
- **Snapshots**: Use descriptive names for snapshots to easily identify them later
- **Themes**: Dark mode is great for extended use, light mode for presentations
- **Mobile**: Dashboard is responsive and works on mobile devices
- **Performance**: All data syncs in real-time without page refreshes

## Troubleshooting

- **Layout not saving**: Ensure you're logged in and Firestore rules are configured
- **CTFs not loading**: Check internet connection and CORS proxy availability
- **Collaboration issues**: Verify team name/password and Firebase rules
- **Theme not persisting**: Check browser local storage permissions
- **Popup blocked**: Enable popups for CTF links to work properly