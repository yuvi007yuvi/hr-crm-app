# User Profile Page

## Overview
The User Profile page provides a comprehensive interface for users to view and manage their personal information, work details, security settings, and preferences within the HR CRM system.

## Features

### 📋 **Personal Information Tab**
- **Contact Details**: Email address, phone number, emergency contact
- **Personal Info**: Date of birth, address
- **Editable Fields**: Users can update their personal information
- **Validation**: Form validation for required fields and data formats

### 💼 **Work Information Tab**
- **Employment Details**: Department, designation, role, employee ID
- **Timeline Info**: Joining date, experience calculation, reporting head
- **Role-based Display**: Visual role indicators with color coding
- **Experience Calculator**: Automatic calculation of work experience

### 🔐 **Security Tab**
- **Password Management**: Change password functionality with authentication
- **Account Information**: Creation date, last sign-in, email verification status
- **Authentication**: Re-authentication required for password changes
- **Security Indicators**: Visual status indicators for account security

### ⚙️ **Preferences Tab**
- **Notification Settings**: Enable/disable notification sounds
- **Data Export**: Download profile data in JSON format
- **User Preferences**: Customizable user settings
- **Privacy Controls**: Control over personal data

## Technical Implementation

### 🎯 **Core Components**
```javascript
// Main profile component with tabbed interface
const Profile = () => {
  // Tab management for different sections
  const [currentTab, setCurrentTab] = useState(0);
  
  // Modal states for editing
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({...});
  const [passwordForm, setPasswordForm] = useState({...});
}
```

### 🔧 **Key Functions**

#### Profile Updates
- **handleUpdateProfile()**: Updates user profile information
- **handleChangePassword()**: Secure password change with re-authentication
- **exportProfileData()**: Exports user data as downloadable JSON

#### Data Management
- **calculateExperience()**: Computes work experience from joining date
- **getInitials()**: Generates user initials for avatar display
- **getRoleColor()**: Returns role-based color coding

### 🗂️ **Data Structure**

#### Edit Form Schema
```javascript
const editForm = {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  emergencyContact: string,
  department: string,
  designation: string,
  dateOfBirth: string,
  joiningDate: string
}
```

#### Password Form Schema
```javascript
const passwordForm = {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}
```

## Access Control

### 📍 **Navigation Access**
- **Sidebar**: "My Profile" link available to all user roles
- **Header Menu**: Profile option in user dropdown menu
- **Direct URL**: `/profile` route accessible to authenticated users

### 🔒 **Permission Levels**
- **All Users**: Can view and edit their own profile
- **Personal Data**: Users can only modify their own information
- **Work Information**: Some fields may be read-only based on role
- **Security Settings**: Full control over password and preferences

## User Interface

### 🎨 **Design Elements**
- **Profile Header**: Large avatar, name, role chips, department info
- **Tab Navigation**: Clean tabbed interface for different sections
- **Form Modals**: Overlay modals for editing information
- **Status Indicators**: Visual feedback for account status
- **Action Buttons**: Clear call-to-action buttons for updates

### 📱 **Responsive Design**
- **Mobile Friendly**: Responsive layout for all screen sizes
- **Touch Optimized**: Mobile-friendly form controls
- **Accessible**: Proper ARIA labels and keyboard navigation

### 🎯 **User Experience**
- **Auto-save**: Form data persistence during editing
- **Success Feedback**: Clear success messages for updates
- **Error Handling**: Comprehensive error messaging
- **Loading States**: Visual feedback during operations

## Integration Points

### 🔌 **Context Dependencies**
- **AuthContext**: User authentication and profile updates
- **EmployeeContext**: Employee data management
- **NotificationContext**: Sound preferences and settings

### 🌐 **API Connections**
- **updateProfile()**: Updates user profile in database
- **updatePassword()**: Secure password change with Firebase Auth
- **updateEmployee()**: Updates employee-specific information

### 📊 **Data Sources**
- **User Authentication**: Firebase Auth user object
- **Employee Data**: Firestore employee collection
- **Preferences**: localStorage for user settings

## Security Features

### 🛡️ **Password Security**
- **Re-authentication**: Current password required for changes
- **Validation**: Minimum length and complexity requirements
- **Secure Storage**: Passwords handled by Firebase Auth
- **Error Handling**: Secure error messages without exposing details

### 🔐 **Data Protection**
- **Input Validation**: All form inputs validated
- **Permission Checks**: Users can only access their own data
- **Secure Updates**: All updates go through authenticated endpoints
- **Privacy Controls**: Users control their data visibility

## Future Enhancements

### 🚀 **Planned Features**
- **Profile Photo Upload**: Avatar image upload and management
- **Two-Factor Authentication**: Enhanced security options
- **Privacy Settings**: Granular privacy controls
- **Activity Log**: User activity tracking and history
- **Backup & Restore**: Profile data backup functionality
- **Theme Preferences**: Dark/light mode selection
- **Language Settings**: Multi-language support
- **Custom Fields**: Organization-specific profile fields

### 📈 **Improvements**
- **Real-time Updates**: Live sync of profile changes
- **Advanced Validation**: More sophisticated form validation
- **Audit Trail**: Track all profile changes
- **Integration Options**: Third-party service connections

## Usage Guide

### 👤 **For End Users**
1. **Access Profile**: Click "My Profile" in sidebar or header menu
2. **View Information**: Browse different tabs to see various details
3. **Edit Profile**: Click "Edit Profile" button to modify information
4. **Update Password**: Use Security tab to change password
5. **Manage Preferences**: Adjust notification and export settings

### 🔧 **For Administrators**
- **Profile Management**: Users self-manage their profiles
- **Data Oversight**: Monitor profile completion and accuracy
- **Security Monitoring**: Track password changes and security events
- **Export Control**: Manage data export permissions