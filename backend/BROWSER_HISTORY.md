# Browser History Vector Database

This feature integrates a vector database (ChromaDB) to store browser history with semantic search capabilities, optimized for AI retrieval.

## Features

- Stores browser history entries with full-text content
- Automatically categorizes pages by topic using AI
- Filters out search engine pages
- Provides semantic similarity search
- Supports filtering by time range and topic
- Generates usage statistics and insights

## Requirements

- Node.js 16+
- ChromaDB running locally or remotely
- OpenAI API key for embeddings and topic classification
- Puppeteer for content extraction

## Setup

1. Install the required dependencies:
   ```bash
   npm install chromadb openai puppeteer
   ```

2. Set up environment variables in your `.env` file:
   ```
   CHROMA_URL=http://localhost:8000
   OPENAI_API_KEY=your-openai-api-key
   ```

3. Run ChromaDB locally (Docker recommended):
   ```bash
   docker run -p 8000:8000 chromadb/chroma:latest
   ```

## API Endpoints

### Store a browser history entry
```
POST /api/history
```
Request body:
```json
{
  "url": "https://example.com/article",
  "title": "Example Article",
  "timestamp": 1622548800000,
  "userId": "user123"
}
```

### Query browser history
```
POST /api/history/query
```
Request body:
```json
{
  "userId": "user123",
  "timeRange": {
    "start": 1622548800000,
    "end": 1625140800000
  },
  "topics": ["Technology", "Finance"],
  "similarity": {
    "text": "machine learning applications",
    "minScore": 0.7
  },
  "limit": 10
}
```

### Get history statistics
```
GET /api/history/stats/:userId
```

### Delete history entries
```
DELETE /api/history/:userId?ids=id1,id2,id3
```

### Bulk store browser history entries
```
POST /api/history/bulk
```
Request body:
```json
{
  "entries": [
    {
      "url": "https://example.com/article1",
      "title": "Example Article 1",
      "timestamp": 1622548800000,
      "userId": "user123"
    },
    {
      "url": "https://example.com/article2",
      "title": "Example Article 2",
      "timestamp": 1622635200000,
      "userId": "user123"
    }
  ]
}
```

## Electron Integration

To integrate this feature with Electron:

1. Add a function to capture browser history in the renderer process:

```typescript
// In your Electron renderer process
const capturePageVisit = async () => {
  const url = window.location.href;
  const title = document.title;
  const timestamp = Date.now();
  const userId = currentUser.id; // Get from your auth system
  
  await window.electronAPI.storeHistoryEntry({ url, title, timestamp, userId });
};

// Call this when page loads or when appropriate
window.addEventListener('load', capturePageVisit);
```

2. Add a preload script function to bridge renderer and main process:

```typescript
// In your preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  storeHistoryEntry: (entry) => ipcRenderer.invoke('store-history-entry', entry)
});
```

3. Add an IPC handler in the main process:

```typescript
// In your main.js
ipcMain.handle('store-history-entry', async (event, entry) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to store history entry:', error);
    return { error: error.message };
  }
});
```

## Cloud Deployment

For cloud deployment:

1. Deploy ChromaDB to a cloud server or use a managed vector database service
2. Update the `CHROMA_URL` environment variable to point to your cloud instance
3. Deploy the backend service to a cloud provider (AWS, GCP, Azure, etc.)
4. Update your Electron app to connect to the cloud backend

## Security Considerations

- Ensure HTTPS for all communications
- Implement proper authentication for all API endpoints
- Consider encrypting sensitive data stored in the vector database
- Use API keys with minimal permissions for OpenAI 