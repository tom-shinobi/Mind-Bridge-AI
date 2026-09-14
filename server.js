/**
 * MindBridge AI - Production HTTP & WebSocket Server for Railway & Cloud Deployments
 * Serves compiled Vite SPA frontend from dist/ and provides full duplex WebSocket
 * real-time communication for Community Hub (Posts, Comments, Likes, DMs, Squads, RTSC Signaling).
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// MIME types for static asset serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav'
};

// ============================================================================
// IN-MEMORY REAL-TIME COMMUNITY HUB STATE
// ============================================================================

// Initial seed posts to guarantee community is populated
const activePosts = [
  {
    id: 'post_seed_1',
    authorId: 'std_alex_chen',
    authorName: 'Alex Chen',
    authorHandle: '@alex_chen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorCollege: 'Stanford University',
    authorCourse: 'M.S. Artificial Intelligence',
    authorLevel: 14,
    content: 'Just cracked B+ Tree node split propagation with horizontal doubly-linked pointers. Here is my amortized O(log N) verification script!',
    mediaType: 'code',
    codeSnippet: `// Amortized B+ Tree Node Balancing\ninterface BPlusNode<K, V> {\n  keys: K[];\n  values?: V[];\n  children?: BPlusNode<K, V>[];\n  next?: BPlusNode<K, V>;\n  isLeaf: boolean;\n}`,
    codeLanguage: 'typescript',
    tags: ['DBMS', 'DataStructures', 'Optimization'],
    likesCount: 28,
    likedBy: ['std_priya_sharma'],
    repostsCount: 7,
    repostedBy: [],
    bookmarksCount: 14,
    bookmarkedBy: [],
    commentsCount: 2,
    comments: [
      {
        id: 'c_101',
        postId: 'post_seed_1',
        authorId: 'std_priya_sharma',
        authorName: 'Priya Sharma',
        authorHandle: '@priya_sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'Clean invariant expression! How does your delete handler handle sibling borrowing under high concurrency?',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    visibility: 'public'
  },
  {
    id: 'post_seed_2',
    authorId: 'user_elena_rostova',
    authorName: 'Elena Rostova',
    authorHandle: '@elena_rostova',
    authorCollege: 'UC Berkeley',
    authorCourse: 'B.S. Electrical Eng & CS',
    authorLevel: 17,
    content: 'Studying Distributed Systems consensus protocols tonight. Raft leader election state transitions are finally clicking! Remember that terms act as logical clocks.',
    mediaType: 'none',
    tags: ['DistributedSystems', 'Raft', 'Consensus'],
    likesCount: 16,
    likedBy: [],
    repostsCount: 4,
    repostedBy: [],
    bookmarksCount: 8,
    bookmarkedBy: [],
    commentsCount: 1,
    comments: [
      {
        id: 'c_201',
        postId: 'post_seed_2',
        authorId: 'std_marcus_vance',
        authorName: 'Marcus Vance',
        authorHandle: '@marcus_vance',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Check out Ongaro’s Raft visualization paper, especially the randomized timer election loop. Super intuitive!',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    visibility: 'public'
  }
];

// Active channel messages map: channelId -> ChatMessage[]
const activeChannelMessages = new Map();

// Active direct messages map: conversationId -> DirectMessage[]
const activeDirectMessages = new Map();

// Online connected sockets: socket -> user profile info
const clientsMap = new Map();

// ============================================================================
// MUSIC RESOLUTION & SEARCH HELPERS
// ============================================================================

async function searchItunesMusic(query) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((t) => ({
      id: String(t.trackId),
      title: t.trackName,
      artist: t.artistName,
      album: t.collectionName,
      duration: formatDuration(t.trackTimeMillis),
      durationMs: t.trackTimeMillis,
      previewUrl: t.previewUrl,
      artwork: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '300x300bb') : undefined,
      genre: t.primaryGenreName
    }));
  } catch (err) {
    console.error('iTunes search error:', err.message);
    return [];
  }
}

async function resolveSongVideoId(query) {
  try {
    // 1. First get metadata from iTunes for clean artist & title
    const itunesTracks = await searchItunesMusic(query);
    const topTrack = itunesTracks[0];
    const searchTerm = topTrack
      ? `${topTrack.artist} ${topTrack.title} audio`
      : `${query} audio`;

    // 2. Fetch YouTube search results page
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
    const ytRes = await fetch(ytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    let videoId = null;
    if (ytRes.ok) {
      const html = await ytRes.text();
      // Match first /watch?v=...
      const match1 = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (match1 && match1[1]) {
        videoId = match1[1];
      } else {
        const match2 = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match2 && match2[1]) videoId = match2[1];
      }
    }

    return {
      query,
      videoId: videoId || '4NRXx6U8ABQ', // Fallback to The Weeknd - Blinding Lights
      title: topTrack ? topTrack.title : query,
      artist: topTrack ? topTrack.artist : 'Popular Artist',
      artwork: topTrack?.artwork,
      previewUrl: topTrack?.previewUrl,
      duration: topTrack?.duration || '3:30'
    };
  } catch (err) {
    console.error('Resolve song error:', err.message);
    return {
      query,
      videoId: '4NRXx6U8ABQ',
      title: query,
      artist: 'Music',
      duration: '3:30'
    };
  }
}

function formatDuration(millis) {
  if (!millis) return '3:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// ============================================================================
// HTTP SERVER (STATIC ASSETS + API)
// ============================================================================

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers for all API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 1. Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        status: 'online',
        server: 'MindBridge-AI-Production',
        uptime: process.uptime(),
        onlineSockets: clientsMap.size,
        postsCount: activePosts.length,
        timestamp: new Date().toISOString()
      })
    );
  }

  // 2. Music Search API endpoint: /api/music/search?q=...
  if (pathname === '/api/music/search') {
    const q = parsedUrl.searchParams.get('q') || '';
    if (!q.trim()) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ results: [] }));
    }
    const results = await searchItunesMusic(q);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ results }));
  }

  // 3. Music Resolve API endpoint: /api/music/resolve?q=...
  if (pathname === '/api/music/resolve') {
    const q = parsedUrl.searchParams.get('q') || '';
    if (!q.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Query parameter q is required' }));
    }
    const resolved = await resolveSongVideoId(q);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(resolved));
  }

  // 4. Serve Static Frontend Files from dist/
  if (req.method === 'GET' || req.method === 'HEAD') {
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
      safePath = '/index.html';
    }

    let filePath = path.join(DIST_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // SPA Fallback: serve index.html for client-side routing
        const indexPath = path.join(DIST_DIR, 'index.html');
        fs.readFile(indexPath, (indexErr, content) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Dist not found. Please run npm run build first.');
          }
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
          });
          res.end(content);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const isImmutable = filePath.includes('assets');

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': isImmutable ? 'public, max-age=31536000, immutable' : 'no-cache'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

// ============================================================================
// WEBSOCKET SERVER ATTACHED TO HTTP PORT (/ws)
// ============================================================================

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const parsed = new URL(request.url, `http://${request.headers.host}`);
  if (parsed.pathname === '/ws' || parsed.pathname === '/ws/') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Helper: Broadcast to all connected clients
function broadcast(payload, excludeWs = null) {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// Helper: Send to specific user by ID or Handle
function sendToUser(targetUserId, payload) {
  if (!targetUserId) return false;
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const targetClean = targetUserId.replace('@', '').toLowerCase().trim();
  let delivered = false;
  for (const [client, user] of clientsMap.entries()) {
    if (user) {
      const uId = (user.id || '').replace('@', '').toLowerCase().trim();
      const uHandle = (user.handle || '').replace('@', '').toLowerCase().trim();
      if (uId === targetClean || uHandle === targetClean) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
          delivered = true;
        }
      }
    }
  }
  return delivered;
}

wss.on('connection', (ws, req) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  ws.isAlive = true;
  clientsMap.set(ws, { id: 'anon_' + Math.random().toString(36).slice(2, 9), online: true });

  // 1. Immediately send initial synchronization payload to newly connected device
  ws.send(
    JSON.stringify({
      type: 'sync',
      posts: activePosts,
      onlineCount: clientsMap.size,
      serverTime: Date.now()
    })
  );

  // Broadcast updated presence count
  broadcast({
    type: 'presence',
    onlineCount: clientsMap.size
  });

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (!msg || !msg.type) return;

      switch (msg.type) {
        // User identity registration & presence
        case 'identify': {
          if (msg.user) {
            clientsMap.set(ws, {
              id: msg.user.id,
              name: msg.user.name,
              handle: msg.user.handle,
              avatarUrl: msg.user.avatarUrl,
              college: msg.user.college,
              online: true
            });
            broadcast({
              type: 'presence',
              onlineCount: clientsMap.size,
              user: msg.user
            });
          }
          break;
        }

        // Campus Pulse: Post Created
        case 'post_create': {
          if (msg.post) {
            const exists = activePosts.some((p) => p.id === msg.post.id);
            if (!exists) {
              activePosts.unshift(msg.post);
              // Cap memory to last 150 posts
              if (activePosts.length > 150) activePosts.pop();
            }
            // Broadcast to ALL clients (including sender for acknowledgment)
            broadcast({
              type: 'post_created',
              post: msg.post
            });
          }
          break;
        }

        // Campus Pulse: Post Liked / Unliked
        case 'post_like': {
          const { postId, userId } = msg;
          const target = activePosts.find((p) => p.id === postId);
          if (target) {
            const hasLiked = target.likedBy.includes(userId);
            if (hasLiked) {
              target.likedBy = target.likedBy.filter((id) => id !== userId);
              target.likesCount = Math.max(0, target.likesCount - 1);
            } else {
              target.likedBy.push(userId);
              target.likesCount += 1;
            }
            broadcast({
              type: 'post_liked',
              postId,
              likesCount: target.likesCount,
              likedBy: target.likedBy
            });
          }
          break;
        }

        // Campus Pulse: Comment Added
        case 'post_comment': {
          const { postId, comment } = msg;
          const target = activePosts.find((p) => p.id === postId);
          if (target && comment) {
            target.comments.push(comment);
            target.commentsCount += 1;
            broadcast({
              type: 'post_comment',
              postId,
              comment,
              commentsCount: target.commentsCount
            });
          }
          break;
        }

        // Campus Pulse: Post Deleted
        case 'post_delete': {
          const { postId } = msg;
          const idx = activePosts.findIndex((p) => p.id === postId);
          if (idx !== -1) {
            activePosts.splice(idx, 1);
            broadcast({
              type: 'post_deleted',
              postId
            });
          }
          break;
        }

        // Study Squad: Channel Chat Message
        case 'channel_message': {
          const { serverId, channelId, message } = msg;
          if (channelId && message) {
            const list = activeChannelMessages.get(channelId) || [];
            list.push(message);
            if (list.length > 200) list.shift();
            activeChannelMessages.set(channelId, list);

            broadcast({
              type: 'channel_message',
              serverId,
              channelId,
              message
            });
          }
          break;
        }

        // Direct Message: 1-on-1 Chat
        case 'dm_message': {
          const { conversationId, message } = msg;
          if (conversationId && message) {
            const list = activeDirectMessages.get(conversationId) || [];
            if (!list.some((m) => m.id === message.id)) {
              list.push(message);
              if (list.length > 200) list.shift();
              activeDirectMessages.set(conversationId, list);
            }

            // Target recipient explicitly if recipientId or recipientHandle is set
            if (message.recipientId) {
              sendToUser(message.recipientId, {
                type: 'dm_message',
                conversationId,
                message
              });
            }
            if (message.recipientHandle && message.recipientHandle !== message.recipientId) {
              sendToUser(message.recipientHandle, {
                type: 'dm_message',
                conversationId,
                message
              });
            }

            // Broadcast to other connected devices/browsers (excluding sender ws to avoid doubling)
            broadcast(
              {
                type: 'dm_message',
                conversationId,
                message
              },
              ws
            );
          }
          break;
        }

        // Typing indicator
        case 'typing': {
          broadcast(
            {
              type: 'typing',
              scope: msg.scope, // 'channel' | 'dm'
              targetId: msg.targetId, // channelId or conversationId
              userId: msg.userId,
              userName: msg.userName,
              userHandle: msg.userHandle,
              isTyping: msg.isTyping
            },
            ws
          );
          break;
        }

        // Real-Time Streaming Communication (RTSC / WebRTC Voice & Video Signaling)
        case 'rtsc_signal': {
          const { targetUserId, targetHandle, signalData, fromUserId } = msg;
          const sender = clientsMap.get(ws);
          const target = targetHandle || targetUserId;
          if (target) {
            const delivered = sendToUser(target, {
              type: 'rtsc_signal',
              fromUserId: fromUserId || sender?.id,
              fromHandle: msg.fromHandle || sender?.handle,
              fromName: msg.fromName || sender?.name,
              fromAvatar: msg.fromAvatar || sender?.avatarUrl,
              signalData
            });

            // If not found directly, broadcast to other connected clients so matching handles receive it
            if (!delivered) {
              broadcast(
                {
                  type: 'rtsc_signal',
                  targetUserId,
                  targetHandle,
                  fromUserId: fromUserId || sender?.id,
                  fromHandle: msg.fromHandle || sender?.handle,
                  fromName: msg.fromName || sender?.name,
                  fromAvatar: msg.fromAvatar || sender?.avatarUrl,
                  signalData
                },
                ws
              );
            }
          } else {
            // Broadcast signal to room/channel
            broadcast(
              {
                type: 'rtsc_signal',
                fromUserId: fromUserId || sender?.id,
                fromHandle: msg.fromHandle || sender?.handle,
                fromName: msg.fromName || sender?.name,
                fromAvatar: msg.fromAvatar || sender?.avatarUrl,
                channelId: msg.channelId,
                signalData
              },
              ws
            );
          }
          break;
        }

        default:
          break;
      }
    } catch (e) {
      console.warn('Malformed WS message from client:', e.message);
    }
  });

  ws.on('close', () => {
    clientsMap.delete(ws);
    broadcast({
      type: 'presence',
      onlineCount: clientsMap.size
    });
  });

  ws.on('error', (err) => {
    console.warn('WS Client error:', err.message);
  });
});

// Periodic Heartbeat / Ping to keep mobile connections open through Railway and cellular proxies
const pingInterval = setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) {
      clientsMap.delete(client);
      client.terminate();
      continue;
    }
    client.isAlive = false;
    client.ping();
  }
}, 30000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

// Start listening
server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 MindBridge AI Server running at http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket Real-Time Server active at ws://${HOST}:${PORT}/ws`);
  console.log(`🎵 Music API available at /api/music/search & /api/music/resolve`);
  console.log(`📁 Serving static assets from: ${DIST_DIR}`);
  console.log(`====================================================`);
});
