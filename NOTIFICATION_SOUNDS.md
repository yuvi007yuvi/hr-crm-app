# Notification Sound System

## Overview
The HR CRM application now includes a comprehensive notification sound system that plays different audio tones for different types of notifications.

## Features

### 🔊 Sound Types
- **Leave Request**: Higher frequency (800Hz) with moderate pattern
- **Leave Approved**: Mid frequency (600Hz) with triple beep pattern  
- **Leave Rejected**: Lower frequency (400Hz) with single beep
- **Attendance Reminder**: Mid-low frequency (500Hz) with double beep
- **System Announcement**: Mid-high frequency (700Hz) with quintuple beep pattern
- **Task Assigned**: Mid frequency (650Hz) with triple beep pattern
- **Birthday**: High frequency (800Hz) with celebration pattern
- **Policy Update**: Low-mid frequency (550Hz) with double beep

### 🎚️ Volume Control
Sound volume is automatically adjusted based on notification priority:
- **Low Priority**: 30% volume
- **Medium Priority**: 50% volume  
- **High Priority**: 70% volume
- **Urgent Priority**: 90% volume

### ⚙️ User Controls
- **Sound Toggle**: Users can enable/disable notification sounds via the bell icon in the header
- **Sound Preference**: Settings are saved per user and persist across sessions
- **Test Functions**: Admins can test sounds and create test notifications

### 🔧 Technical Implementation

#### Web Audio API
- Primary sound generation using Web Audio API with oscillator nodes
- Dynamic frequency and pattern generation for different notification types
- Gain control for volume management

#### Fallback System
- HTML5 Audio fallback for browsers without Web Audio API support
- Base64 encoded audio data for simple beep sounds

#### Sound Patterns
Each notification type has a unique pattern:
```javascript
pattern: [1, 0.5, 1] // Full volume, half volume, full volume
```

### 📱 Integration Points

#### Automatic Sound Triggers
Sounds automatically play when:
- New leave requests are submitted (notifies managers)
- Leave requests are approved/rejected (notifies employees)
- System announcements are created
- Attendance reminders are sent
- Birthday notifications are triggered

#### Manual Testing (Admin Only)
- **Test Sound**: Plays default notification sound
- **Test Notification**: Creates random test notification with sound

### 🎯 Usage Guidelines

#### For Users
1. Click the speaker icon (🔊/🔇) in the notification dropdown to toggle sounds
2. Sounds will play automatically for new notifications
3. Sound preferences are saved automatically

#### For Administrators
1. Access sound testing via notification dropdown (admin only)
2. Use "Test Sound" to check audio functionality
3. Use "Test Notification" to verify full notification flow

### 🔒 Privacy & Performance
- Sounds are generated client-side (no external audio files)
- Minimal bandwidth usage
- User preferences stored locally
- Graceful fallback if audio APIs are unavailable

### 🚀 Browser Compatibility
- **Full Support**: Modern browsers with Web Audio API
- **Fallback Support**: Older browsers with HTML5 Audio
- **Graceful Degradation**: Silent notifications if audio unavailable

## Code Structure

### Key Files
- `src/context/NotificationContext.jsx` - Core sound generation logic
- `src/components/layout/Header.jsx` - Sound controls UI
- `src/pages/LeaveRequests.jsx` - Leave notification integration

### Main Functions
- `playNotificationSound()` - Advanced Web Audio API sound generation
- `playFallbackSound()` - Simple HTML5 Audio fallback
- `toggleNotificationSound()` - User preference management
- `createNotification()` - Notification creation with sound trigger

## Future Enhancements
- Custom sound uploads for organizations
- Different sound themes
- Volume slider control
- Do Not Disturb time periods
- Sound notification history