# Frontend Backend Integration

This document outlines how the frontend has been connected to the backend API based on the documentation.

## 🔗 Connected Features

### 1. **WebSocket Chat Integration**

- **File**: `src/hooks/useWebSocket.ts`
- **URL**: `ws://localhost:8080`
- **Features**:
  - Real-time messaging
  - Automatic reconnection with exponential backoff
  - Typing indicators
  - Connection status monitoring
  - Event-based message handling

### 2. **Conversation Management**

- **File**: `src/services/api.ts` - `conversationAPI`
- **Base URL**: `http://127.0.0.1:8000/api`
- **Features**:
  - Create new conversations
  - List all conversations with pagination
  - Get conversation details with message history
  - Send messages via HTTP (fallback)
  - Generate event briefs from conversations
  - Get AI-powered vendor recommendations

### 3. **Vendor Management System**

- **File**: `src/pages/VendorsPage.tsx`
- **Add Vendor**: `src/pages/AddVendorPage.tsx`
- **API**: `src/services/api.ts` - `vendorAPI`
- **Features**:
  - Browse vendors with advanced filtering
  - Search by category, location, rating
  - Pagination support
  - Create, update, delete vendors
  - Add new vendors with comprehensive form
  - View vendor statistics and categories
  - Contact vendor directly (phone, email, website)

### 4. **Health Monitoring**

- **File**: `src/hooks/useHealthCheck.ts`
- **Features**:
  - Real-time backend health monitoring
  - Connection status indicator in navigation
  - Automatic retry on connection failure
  - Online/offline detection

### 5. **Bot Configuration**

- **File**: `src/pages/BotConfigPage.tsx`
- **API**: `src/services/api.ts` - `botConfigAPI`
- **Features**:
  - Get/update bot configuration
  - Modify system prompts and personality
  - Reset to default configuration
  - Manage context data and personality traits
  - Real-time configuration updates

## 🚀 Quick Start

1. **Start the backend services**:

   ```bash
   # Backend API (port 8000)
   # WebSocket server (port 8080)
   ```

2. **Start the frontend**:

   ```bash
   npm install
   npm start
   ```

3. **Navigate to different sections**:
   - `/` - Chat interface with real-time messaging
   - `/vendors` - Browse and manage event vendors
   - `/vendors/add` - Add new vendors to the platform
   - `/bot-config` - Configure bot settings and personality
   - `/event-form` - Add new event centers
   - `/about` - About page

## 📁 File Structure

```
src/
├── components/
│   ├── Navigation.tsx          # Navigation with health status
│   └── ArrayInput.tsx          # Reusable array input component
├── hooks/
│   ├── useWebSocket.ts         # WebSocket connection management
│   └── useHealthCheck.ts       # Backend health monitoring
├── pages/
│   ├── ChatPage.tsx            # Real-time chat interface
│   ├── VendorsPage.tsx         # Vendor management interface
│   ├── AddVendorPage.tsx       # Add new vendor form
│   ├── BotConfigPage.tsx       # Bot configuration interface
│   ├── AddEventsPage.tsx       # Event center form
│   └── ...
├── services/
│   └── api.ts                  # Complete API service layer
└── App.tsx                     # Main app with routing
```

## 🔌 API Integration Details

### WebSocket Events

- **Send**: `message`, `join_conversation`, `typing`
- **Receive**: `connected`, `response`, `bot-typing`, `conversation_joined`, `error`

### HTTP Endpoints

- **Conversations**: Create, list, get details, send messages, generate briefs
- **Vendors**: CRUD operations, filtering, pagination, statistics
- **Bot Config**: Get, update, reset configuration
- **Health**: Status monitoring

### Data Types

All TypeScript interfaces match the backend API exactly:

- `Conversation`, `Message`, `Vendor`, `EventBrief`
- Proper error handling with `ApiResponse<T>` wrapper
- Pagination support with `PaginationResponse<T>`

## 🎨 Features Showcase

### Chat Interface

- Real-time messaging with WebSocket
- Conversation history
- Message timestamps
- Typing indicators
- Connection status
- Automatic message history loading

### Vendor Management

- Advanced filtering (category, location, rating)
- Responsive card layout
- Contact integration (tel:, mailto:, web links)
- Pagination
- Search functionality
- Rating display
- Specialty tags
- **Add Vendor Form** with comprehensive vendor details
- Form validation and error handling
- Real-time vendor creation

### Bot Configuration

- Complete configuration interface
- System prompt customization
- Context data management
- Personality traits configuration
- Real-time updates with backend API
- Reset to defaults functionality

### Event Management

- Comprehensive event center form
- Toast notifications for success/error
- Form validation
- Nested data structures (pricing, location, features)

### Health Monitoring

- Real-time backend status
- Visual indicators in navigation
- Automatic reconnection attempts
- Online/offline detection

## 🔧 Configuration

Update these URLs in the respective files if your backend runs on different ports:

```typescript
// ChatPage.tsx & api.ts
export const SOCKET_SERVER_URL = "http://127.0.0.1:8000/api";
export const WS_SERVER_URL = "ws://localhost:8080";
```

## 🚨 Error Handling

- All API calls include proper error handling
- Toast notifications for user feedback
- Graceful fallbacks for offline scenarios
- Retry logic for failed connections
- TypeScript for compile-time error prevention

## 📱 Responsive Design

- Mobile-friendly layouts
- Responsive navigation
- Adaptive grid systems
- Touch-friendly interfaces
- Progressive Web App ready
