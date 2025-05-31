# Backend API Server

A Node.js backend server that integrates with Slack and Gmail APIs to provide unified messaging and email management for the Electron React app.

## Features

- **Slack Integration**: Real-time access to Slack channels, messages, and user information
- **Gmail Integration**: Email fetching, threading, and OAuth authentication
- **WebSocket Support**: Real-time updates for messages and notifications
- **Security**: Rate limiting, CORS protection, and secure authentication
- **TypeScript**: Full type safety throughout the codebase

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment example file and configure your API credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual credentials:

```bash
# Backend Server Configuration
PORT=3001
NODE_ENV=development

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_SIGNING_SECRET=your-slack-signing-secret-here
SLACK_APP_TOKEN=xapp-your-slack-app-token-here

# Gmail Configuration  
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
GOOGLE_REFRESH_TOKEN=your-google-refresh-token-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Slack Setup

1. Create a Slack App at https://api.slack.com/apps
2. Enable Socket Mode and generate an App Token
3. Add Bot Token Scopes:
   - `channels:history`
   - `channels:read`
   - `chat:write`
   - `groups:history`
   - `groups:read`
   - `im:history`
   - `im:read`
   - `mpim:history`
   - `mpim:read`
   - `users:read`
4. Install the app to your workspace
5. Copy the Bot User OAuth Token and App Token to your `.env` file

### 4. Gmail Setup

1. Go to the Google Cloud Console
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/gmail/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### 5. Run the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `GET /api/auth/status` - Get authentication status for all services
- `GET /api/auth/test` - Test connections to Slack and Gmail
- `GET /api/auth/gmail/auth-url` - Get Gmail OAuth URL
- `POST /api/auth/gmail/callback` - Handle Gmail OAuth callback

### Slack
- `GET /api/slack/channels` - Get all Slack channels
- `GET /api/slack/channels/:channelId` - Get channel information
- `GET /api/slack/channels/:channelId/messages` - Get messages from a channel
- `POST /api/slack/channels/:channelId/messages` - Send message to channel
- `GET /api/slack/users?userIds=id1,id2` - Get user information
- `GET /api/slack/test` - Test Slack connection

### Gmail
- `GET /api/gmail/messages` - Get Gmail messages
- `GET /api/gmail/threads` - Get Gmail threads
- `GET /api/gmail/labels` - Get Gmail labels
- `GET /api/gmail/unread-count` - Get unread message count
- `GET /api/gmail/search?query=term` - Search messages
- `GET /api/gmail/test` - Test Gmail connection

### Health Check
- `GET /health` - Server health status

## WebSocket Events

The server provides real-time updates via WebSocket connections on the same port as the HTTP server.

### Client Events
- `ping` - Keep connection alive
- `auth` - Authenticate WebSocket connection

### Server Events
- `connection` - Connection established
- `pong` - Response to ping
- `slack_message` - New Slack message received
- `gmail_message` - New Gmail message received

## Development

### File Structure
```
backend/
├── src/
│   ├── middleware/          # Express middleware
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   └── server.ts            # Main server file
├── dist/                    # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### Logging
The server uses Winston for structured logging. Logs are output to console in development and can be configured to write to files in production.

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Request validation using Joi
- **Error Handling**: Centralized error handling with appropriate logging

## Troubleshooting

### Common Issues

1. **Slack Connection Failed**
   - Verify bot token and signing secret
   - Check that the Slack app has required permissions
   - Ensure the app is installed in your workspace

2. **Gmail Authentication Failed**
   - Verify OAuth credentials in Google Cloud Console
   - Check redirect URI configuration
   - Ensure Gmail API is enabled

3. **WebSocket Connection Issues**
   - Check firewall settings
   - Verify port 3001 is available
   - Check browser WebSocket support

### Debug Mode
Set `LOG_LEVEL=debug` in your `.env` file for detailed logging.

## Performance

- Messages are cached in memory for quick access
- WebSocket connections are managed efficiently with automatic cleanup
- Rate limiting prevents abuse and ensures stable performance
- Pagination support for large message sets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 