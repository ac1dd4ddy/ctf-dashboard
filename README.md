# CTF Dashboard

A comprehensive, customizable dashboard designed specifically for Capture The Flag (CTF) teams. This platform combines event tracking, team collaboration, progress management, and support systems into a unified workspace that adapts to your team's workflow.

## Why CTF Teams Need This Dashboard

CTF competitions require coordination, planning, and real-time collaboration. This dashboard addresses common challenges:
- **Event Discovery**: Never miss important CTF competitions
- **Team Coordination**: Collaborate in real-time during competitions
- **Progress Tracking**: Monitor individual and team progress across multiple events
- **Knowledge Management**: Preserve strategies, notes, and solutions
- **Support System**: Handle team issues and requests efficiently

## Core Features

### 🎯 CTF Event Tracking
- **Live CTF Feed**: Automatically pulls upcoming competitions from CTFTime API
- **Detailed Information**: View event names, dates/times (CDT), duration, and descriptions
- **Quick Access**: Click any event to instantly open the competition website
- **Smart Display**: Long descriptions are truncated for clean presentation

### 📊 Individual Progress Management
- **Personal Tracking**: Monitor your progress across multiple CTFs (Planned/In Progress/Completed)
- **Dynamic Management**: Add new competitions or remove completed ones
- **Status Updates**: Easily change your participation status
- **Real-time Sync**: Changes are instantly saved and synchronized

### 📝 Personal Notes System
- **Private Workspace**: Keep personal strategies, solutions, and observations
- **Quick Actions**: Add notes instantly, delete with hover-and-click
- **Persistent Storage**: Notes are saved across sessions and devices
- **Instant Sync**: Changes appear immediately across all your devices

### 🤝 Team Collaboration Hub
- **Real-time Editing**: Multiple team members can edit shared documents simultaneously
- **Team Rooms**: Create or join password-protected collaboration spaces
- **Version Control**: Save named snapshots of important collaborative work
- **History Management**: Load previous versions when needed
- **Live Updates**: See changes from teammates in real-time

### 🎫 Support Ticket System
- **Issue Tracking**: Create tickets for team members to address problems or requests
- **Two-way Communication**: Both ticket creator and assignee can communicate
- **Status Management**: Track tickets from creation to resolution
- **Clean Resolution**: Delete resolved tickets to maintain organization

### 🎨 Fully Customizable Workspace
- **Drag & Drop Interface**: Position modules anywhere on your screen
- **Resizable Modules**: Adjust module sizes to fit your workflow
- **Grid Alignment**: Automatic snapping ensures clean, organized layouts
- **Layout Memory**: Your custom arrangement is saved and restored automatically
- **Full-screen Workspace**: Utilize your entire screen real estate

### 🌙 Adaptive Theme System
- **Dual Themes**: Switch between Ayu Light and Ayu Dark color schemes
- **Eye Comfort**: Dark mode reduces strain during long competition sessions
- **Consistent Design**: All modules adapt seamlessly to theme changes
- **Personal Preference**: Theme choice is remembered across sessions

## How It Works

The dashboard uses modern web technologies to provide a seamless experience:

- **Real-time Database**: Firebase Firestore ensures instant synchronization across all team members
- **Google Authentication**: Secure, hassle-free login using existing Google accounts
- **API Integration**: Direct connection to CTFTime for up-to-date competition information
- **Client-side Storage**: Layout preferences and themes are stored locally for instant loading
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Perfect for CTF Teams Because

### During Competitions
- **Centralized Information**: All team members see the same up-to-date information
- **Real-time Collaboration**: Work together on solutions without conflicts
- **Quick Communication**: Use tickets for urgent requests or clarifications
- **Progress Visibility**: Everyone knows who's working on what

### Between Competitions
- **Event Planning**: Track upcoming competitions and plan participation
- **Knowledge Preservation**: Save successful strategies and solutions
- **Team Coordination**: Assign preparation tasks and track completion
- **Skill Development**: Use notes to document learning and improvement areas

### For Team Management
- **Individual Accountability**: Each member tracks their own progress
- **Support System**: Handle team issues through the ticket system
- **Flexible Workspace**: Each member can customize their interface
- **Historical Records**: Snapshots preserve important collaborative work

## Quick Start

1. **Access**: Open `index.html` in any modern web browser
2. **Authenticate**: Sign in with your Google account
3. **Customize**: Drag modules to your preferred positions and sizes
4. **Collaborate**: Create or join team collaboration spaces
5. **Compete**: Use during CTF competitions for real-time coordination

## Module Overview

### Upcoming CTFs
Stay informed about competition opportunities with automatic updates from CTFTime, complete with scheduling information and direct links to registration.

### Team Progress
Track individual participation across multiple competitions, from initial planning through completion, with easy status updates and management.

### Personal Notes
Maintain private documentation of strategies, solutions, and observations that persist across sessions and sync across devices.

### Collaborative Notes
Work together in real-time on shared documents, with version control through snapshots and secure team-based access.

### Support Tickets
Manage team communication and issue resolution through a structured ticket system with full conversation history.

## Files Structure

- `index.html` - Main dashboard interface with all modules
- `script.js` - Complete functionality with real-time features
- `style.css` - Responsive styling with theme system
- `help.html` - Comprehensive user guide and documentation

## Technical Foundation

- **Frontend**: Modern HTML5, CSS3, and JavaScript (ES6 modules)
- **Backend**: Firebase ecosystem (Authentication, Firestore database)
- **APIs**: CTFTime integration via CORS proxy
- **Design**: Custom CSS with professional Ayu color schemes
- **Features**: Advanced drag-and-drop, real-time collaboration, responsive layout

This dashboard transforms how CTF teams organize, collaborate, and compete by providing a unified platform that grows with your team's needs.