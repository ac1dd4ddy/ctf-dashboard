# PseudoSudo CTF Dashboard

A comprehensive, modular dashboard designed for Capture The Flag (CTF) teams and individual competitors. This platform combines event tracking, team collaboration, challenge management, cryptographic tools, and support systems into a unified, customizable workspace.

## Core Features

### 🎯 CTF Event Tracking
- **Live CTF Feed**: Automatically pulls upcoming competitions from CTFTime API
- **Detailed Information**: View event names, dates/times (CDT), duration, and descriptions
- **Quick Access**: Click any event to instantly open the competition website
- **Smart Display**: Long descriptions are truncated for clean presentation

### 📊 Team Progress Management
- **Team-based Tracking**: Monitor team progress across multiple CTFs
- **Status Management**: Track competitions as Planned/In Progress/Completed
- **Team Authentication**: Secure team access with password protection
- **Real-time Sync**: Changes are instantly saved and synchronized across team members

### 📝 Personal Notes System
- **Private Workspace**: Keep personal strategies, solutions, and observations
- **Quick Actions**: Add notes instantly, delete with click confirmation
- **Persistent Storage**: Notes are saved across sessions using Firebase
- **User-specific**: Only you can see your personal notes

### 🤝 Collaborative Notes
- **Real-time Editing**: Multiple team members can edit shared documents simultaneously
- **Team Rooms**: Create or join password-protected collaboration spaces
- **Version Control**: Save named snapshots of important collaborative work
- **History Management**: Load previous versions when needed
- **Live Updates**: See changes from teammates in real-time

### 🎫 Support Ticket System
- **Issue Tracking**: Create tickets for team members to address problems or requests
- **Two-way Communication**: Full conversation threads with comments
- **Status Management**: Track tickets from creation through resolution
- **Email Integration**: Assign tickets to team members by email
- **Clean Resolution**: Delete resolved tickets to maintain organization

### 🧩 Team Challenge Management
- **Challenge Assignment**: Assign specific challenges to team members
- **Status Tracking**: Monitor challenge completion (Open/Completed)
- **Team Coordination**: See who's working on what challenges
- **Real-time Updates**: Instant synchronization across team members

### 📚 Knowledge Base
- **Quick Links**: Direct access to Discord server and documentation
- **CTF Resources**: Links to introduction guides and tool repositories
- **Payload References**: Quick access to PayloadsAllTheThings
- **Team Resources**: Centralized access to important references

### 🔓 Cryptographic Tools
- **Multi-format Decoder**: Support for Hex, Base64, Base32, ROT13, and URL decoding
- **Vigenère Cipher Solver**: Decrypt Vigenère ciphers with known keys or brute force
- **Instant Processing**: Real-time encoding/decoding without external tools
- **CTF-focused**: Common formats used in CTF competitions

### 🎨 Fully Customizable Workspace
- **Drag & Drop Interface**: Position all 9 modules anywhere on your screen
- **Resizable Modules**: Adjust module sizes to fit your workflow
- **Grid Alignment**: Automatic 20px grid snapping for clean layouts
- **Layout Memory**: Your custom arrangement is saved to Firebase and restored automatically
- **Minimize/Restore**: Minimize modules to save space, restore with click
- **Full-screen Workspace**: Utilize your entire screen real estate

### 🌙 Adaptive Theme System
- **Dual Themes**: Switch between Ayu Light and Ayu Dark color schemes
- **Eye Comfort**: Dark mode reduces strain during long competition sessions
- **Consistent Design**: All modules adapt seamlessly to theme changes
- **Local Storage**: Theme preferences persist across sessions

## How It Works

The dashboard uses modern web technologies to provide a seamless experience:

- **Real-time Database**: Firebase Firestore ensures instant synchronization across all team members
- **Google Authentication**: Secure, hassle-free login using existing Google accounts
- **API Integration**: Direct connection to CTFTime API via CORS proxy for competition data
- **Cloud Storage**: Layout preferences and team data stored in Firestore
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modular Architecture**: 9 independent modules that can be arranged and resized

## Perfect for CTF Teams

### During Competitions
- **Centralized Information**: All team members see the same up-to-date information
- **Real-time Collaboration**: Work together on solutions without conflicts
- **Challenge Assignment**: Distribute challenges among team members efficiently
- **Instant Tools**: Built-in decoders and cipher solvers for quick analysis
- **Quick Communication**: Use tickets for urgent requests or clarifications

### Between Competitions
- **Event Planning**: Track upcoming competitions and plan participation
- **Knowledge Preservation**: Save successful strategies and solutions in snapshots
- **Team Coordination**: Assign preparation tasks and track completion
- **Skill Development**: Use notes to document learning and improvement areas

### For Individual Competitors
- **Personal Organization**: Track your own progress across multiple CTFs
- **Tool Integration**: Access common cryptographic tools without switching applications
- **Knowledge Base**: Quick access to resources and documentation
- **Custom Layout**: Arrange modules to match your personal workflow

## Quick Start

1. **Access**: Open the dashboard in any modern web browser
2. **Authenticate**: Sign in with your Google account
3. **Customize**: Drag and resize the 9 modules to your preferred layout
4. **Team Setup**: Create or join teams using the top-right team controls
5. **Collaborate**: Use real-time collaborative notes and challenge management
6. **Compete**: Leverage built-in tools and team coordination during CTFs

## Module Overview

### 1. Upcoming CTFs
Stay informed about competition opportunities with automatic updates from CTFTime, complete with scheduling information and direct links to registration.

### 2. Team Progress
Track team participation across multiple competitions, from initial planning through completion, with easy status updates and team-based management.

### 3. Personal Notes
Maintain private documentation of strategies, solutions, and observations that persist across sessions using Firebase storage.

### 4. Collaborative Notes
Work together in real-time on shared documents, with version control through snapshots and secure team-based access.

### 5. Support Tickets
Manage team communication and issue resolution through a structured ticket system with full conversation threads and email-based assignment.

### 6. Team Challenges
Assign and track specific CTF challenges among team members, with real-time status updates and completion tracking.

### 7. Knowledge Base
Quick access to essential CTF resources including Discord server, documentation, tools, and payload references.

### 8. Decoder Tools
Built-in support for common encoding formats (Hex, Base64, Base32, ROT13, URL) with instant decoding capabilities.

### 9. Vigenère Cipher Solver
Specialized tool for decrypting Vigenère ciphers with known keys or brute force capabilities for CTF challenges.

## File Structure

- `index.html` - Main dashboard interface with all 9 modules
- `script.js` - Complete functionality with Firebase integration and real-time features
- `style.css` - Responsive styling with Ayu theme system and dark mode
- `help.html` - Comprehensive user guide and documentation
- `firestore.rules` - Firebase security rules for data access
- `.gitignore` - Git ignore configuration

## Technical Foundation

- **Frontend**: Modern HTML5, CSS3, and JavaScript (ES6 modules)
- **Backend**: Firebase ecosystem (Authentication, Firestore database)
- **APIs**: CTFTime integration via CORS proxy for live competition data
- **Design**: Custom CSS with professional Ayu Light/Dark color schemes
- **Features**: 
  - Advanced drag-and-drop with 20px grid snapping
  - Real-time collaboration with Firebase listeners
  - Responsive layout with mobile support
  - Modular architecture with 9 independent components
  - Built-in cryptographic tools
  - Team-based authentication and data isolation

## Key Features Summary

✅ **9 Customizable Modules** - Drag, resize, and arrange to fit your workflow  
✅ **Real-time Team Collaboration** - Live editing and instant synchronization  
✅ **Built-in CTF Tools** - Decoders and cipher solvers integrated  
✅ **Team Management** - Challenge assignment and progress tracking  
✅ **Support System** - Ticket-based communication with full threads  
✅ **Live CTF Feed** - Automatic updates from CTFTime API  
✅ **Dark/Light Themes** - Ayu color schemes for comfortable viewing  
✅ **Mobile Responsive** - Works on all devices and screen sizes  
✅ **Secure Authentication** - Google OAuth with Firebase backend  

This dashboard transforms how CTF teams organize, collaborate, and compete by providing a unified platform with integrated tools that grows with your team's needs.