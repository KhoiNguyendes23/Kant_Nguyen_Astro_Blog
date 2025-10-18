---
title: "WebSocket Giới thiệu - Kết nối realtime"
description: "Học cách tạo WebSocket server với Node.js và client với JavaScript, xây dựng ứng dụng chat realtime"
date: 2025-09-22
tags: ["JavaScript", "WebSocket", "Realtime", "Chat", "Node.js"]
series: "Lập trình mạng với JavaScript"
prev: "/Kant_Nguyen_Astro_Blog/blog/02-fetch-abortcontroller/"
next: "/Kant_Nguyen_Astro_Blog/blog/04-sse-vs-websocket/"
---

## 📚 Series Overview

<div class="series-table">

| # | Bài viết | Liên kết |
|:-:|:---------------------------|:------------------------------|
| 00 | Giới thiệu & Chuẩn bị môi trường | [00-intro-environment](/Kant_Nguyen_Astro_Blog/blog/00-intro-environment/) |
| 01 | Fetch API cơ bản | [01-fetch-basic](/Kant_Nguyen_Astro_Blog/blog/01-fetch-basic/) |
| 02 | Fetch với AbortController | [02-fetch-abortcontroller](/Kant_Nguyen_Astro_Blog/blog/02-fetch-abortcontroller/) |
| 03 | WebSocket giới thiệu | [03-websocket-intro](/Kant_Nguyen_Astro_Blog/blog/03-websocket-intro/) |
| 04 | SSE vs WebSocket | [04-sse-vs-websocket](/Kant_Nguyen_Astro_Blog/blog/04-sse-vs-websocket/) |
| 05 | Service Worker | [05-service-worker](/Kant_Nguyen_Astro_Blog/blog/05-service-worker/) |
| 06 | PWA Manifest | [06-pwa-manifest](/Kant_Nguyen_Astro_Blog/blog/06-pwa-manifest/) |
| 07 | DevTools Network | [07-devtools-network](/Kant_Nguyen_Astro_Blog/blog/07-devtools-network/) |
| 08 | Tổng kết & Feynman Review | [08-summary-feynman](/Kant_Nguyen_Astro_Blog/blog/08-summary-feynman/) |

</div>

# 🧠 Giới thiệu

WebSocket là giao thức cho phép giao tiếp hai chiều realtime giữa client và server. Khác với HTTP request/response, WebSocket duy trì kết nối persistent và cho phép server push dữ liệu đến client mà không cần client phải request.

Trong bài này, chúng ta sẽ học cách tạo WebSocket server với Node.js và WebSocket client với JavaScript, xây dựng ứng dụng chat realtime hoàn chỉnh.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**websocket-server.js - WebSocket Server với Node.js:**

```javascript
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

// Tạo Express app
const app = express();
const server = http.createServer(app);

// Tạo WebSocket server
const wss = new WebSocket.Server({ server });

// Lưu trữ các kết nối
const clients = new Map();
let clientId = 0;

// Xử lý WebSocket connections
wss.on('connection', function connection(ws, req) {
    const id = ++clientId;
    const clientInfo = {
        id: id,
        ws: ws,
        ip: req.socket.remoteAddress,
        connectedAt: new Date()
    };
    
    clients.set(id, clientInfo);
    
    console.log(`✅ Client ${id} đã kết nối từ ${clientInfo.ip}`);
    console.log(`👥 Tổng số client: ${clients.size}`);
    
    // Gửi thông báo chào mừng
    ws.send(JSON.stringify({
        type: 'welcome',
        message: `Chào mừng bạn đến với chat room! ID: ${id}`,
        clientId: id
    }));
    
    // Broadcast thông báo client mới
    broadcast({
        type: 'user_joined',
        message: `Client ${id} đã tham gia chat room`,
        clientId: id,
        timestamp: new Date().toISOString()
    }, id);
    
    // Xử lý tin nhắn từ client
    ws.on('message', function incoming(message) {
        try {
            const data = JSON.parse(message);
            console.log(`💬 Tin nhắn từ client ${id}:`, data);
            
            // Xử lý các loại tin nhắn khác nhau
            switch (data.type) {
                case 'chat':
                    handleChatMessage(id, data);
                    break;
                case 'typing':
                    handleTyping(id, data);
                    break;
                case 'ping':
                    handlePing(id, data);
                    break;
                default:
                    console.log(`❓ Loại tin nhắn không xác định: ${data.type}`);
            }
            
        } catch (error) {
            console.error('❌ Lỗi parse message:', error.message);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Lỗi parse tin nhắn'
            }));
        }
    });
    
    // Xử lý khi client ngắt kết nối
    ws.on('close', function close() {
        console.log(`👋 Client ${id} đã ngắt kết nối`);
        clients.delete(id);
        console.log(`👥 Còn lại: ${clients.size} client`);
        
        // Broadcast thông báo client rời khỏi
        broadcast({
            type: 'user_left',
            message: `Client ${id} đã rời khỏi chat room`,
            clientId: id,
            timestamp: new Date().toISOString()
        });
    });
    
    // Xử lý lỗi
    ws.on('error', function error(err) {
        console.error(`❌ Lỗi WebSocket client ${id}:`, err.message);
    });
});

// Xử lý tin nhắn chat
function handleChatMessage(clientId, data) {
    const client = clients.get(clientId);
    if (!client) return;
    
    const message = {
        type: 'chat',
        clientId: clientId,
        message: data.message,
        timestamp: new Date().toISOString(),
        username: data.username || `Client ${clientId}`
    };
    
    console.log(`💬 Chat từ ${message.username}: ${message.message}`);
    
    // Broadcast tin nhắn đến tất cả client khác
    broadcast(message, clientId);
}

// Xử lý typing indicator
function handleTyping(clientId, data) {
    const client = clients.get(clientId);
    if (!client) return;
    
    const typingMessage = {
        type: 'typing',
        clientId: clientId,
        username: data.username || `Client ${clientId}`,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString()
    };
    
    // Broadcast typing indicator đến tất cả client khác
    broadcast(typingMessage, clientId);
}

// Xử lý ping
function handlePing(clientId, data) {
    const client = clients.get(clientId);
    if (!client) return;
    
    // Gửi pong response
    client.ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
    }));
}

// Broadcast tin nhắn đến tất cả client
function broadcast(message, excludeClientId = null) {
    const messageStr = JSON.stringify(message);
    
    clients.forEach((client, id) => {
        if (id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
            try {
                client.ws.send(messageStr);
            } catch (error) {
                console.error(`❌ Lỗi gửi tin nhắn đến client ${id}:`, error.message);
            }
        }
    });
}

// Ping tất cả client để kiểm tra kết nối
setInterval(() => {
    clients.forEach((client, id) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            try {
                client.ws.ping();
            } catch (error) {
                console.error(`❌ Lỗi ping client ${id}:`, error.message);
                clients.delete(id);
            }
        }
    });
}, 30000); // Ping mỗi 30 giây

// Serve static files
app.use(express.static('public'));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket Server đang chạy trên port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`🌐 HTTP endpoint: http://localhost:${PORT}`);
});
```

**websocket-client.js - WebSocket Client:**

```javascript
class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.messageHandlers = new Map();
        this.typingTimeout = null;
    }
    
    // Kết nối đến WebSocket server
    connect() {
        try {
            console.log(`🔗 Đang kết nối đến ${this.url}...`);
            
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = (event) => {
                console.log('✅ WebSocket kết nối thành công!');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected', event);
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 Nhận được tin nhắn:', data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Lỗi parse message:', error.message);
                }
            };
            
            this.ws.onclose = (event) => {
                console.log('👋 WebSocket kết nối đã đóng');
                this.isConnected = false;
                this.emit('disconnected', event);
                
                // Tự động reconnect nếu không phải close code 1000
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnect();
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.emit('error', error);
            };
            
        } catch (error) {
            console.error('❌ Lỗi tạo WebSocket:', error.message);
        }
    }
    
    // Xử lý tin nhắn từ server
    handleMessage(data) {
        switch (data.type) {
            case 'welcome':
                console.log('🎉 Chào mừng:', data.message);
                this.emit('welcome', data);
                break;
            case 'chat':
                console.log(`💬 ${data.username}: ${data.message}`);
                this.emit('chat', data);
                break;
            case 'user_joined':
                console.log('👤 Người dùng mới:', data.message);
                this.emit('user_joined', data);
                break;
            case 'user_left':
                console.log('👋 Người dùng rời khỏi:', data.message);
                this.emit('user_left', data);
                break;
            case 'typing':
                this.emit('typing', data);
                break;
            case 'pong':
                console.log('🏓 Pong received');
                this.emit('pong', data);
                break;
            case 'error':
                console.error('❌ Server error:', data.message);
                this.emit('error', data);
                break;
            default:
                console.log('❓ Tin nhắn không xác định:', data);
        }
    }
    
    // Gửi tin nhắn chat
    sendChatMessage(message, username = 'Anonymous') {
        if (!this.isConnected) {
            console.error('❌ WebSocket chưa kết nối!');
            return;
        }
        
        const data = {
            type: 'chat',
            message: message,
            username: username
        };
        
        this.ws.send(JSON.stringify(data));
        console.log(`📤 Đã gửi tin nhắn: ${message}`);
    }
    
    // Gửi typing indicator
    sendTyping(isTyping, username = 'Anonymous') {
        if (!this.isConnected) return;
        
        const data = {
            type: 'typing',
            isTyping: isTyping,
            username: username
        };
        
        this.ws.send(JSON.stringify(data));
    }
    
    // Gửi ping
    sendPing() {
        if (!this.isConnected) return;
        
        const data = {
            type: 'ping',
            timestamp: new Date().toISOString()
        };
        
        this.ws.send(JSON.stringify(data));
    }
    
    // Đóng kết nối
    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
    }
    
    // Tự động reconnect
    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Đã đạt giới hạn reconnect attempts');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`🔄 Reconnect attempt ${this.reconnectAttempts} sau ${delay}ms...`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    // Event handling
    on(event, handler) {
        if (!this.messageHandlers.has(event)) {
            this.messageHandlers.set(event, []);
        }
        this.messageHandlers.get(event).push(handler);
    }
    
    emit(event, data) {
        if (this.messageHandlers.has(event)) {
            this.messageHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`❌ Lỗi event handler cho ${event}:`, error.message);
                }
            });
        }
    }
}

// Test WebSocket Client
function testWebSocketClient() {
    const client = new WebSocketClient('ws://localhost:3000');
    
    // Event handlers
    client.on('connected', () => {
        console.log('🎉 Client đã kết nối!');
    });
    
    client.on('chat', (data) => {
        console.log(`💬 Chat: ${data.username}: ${data.message}`);
    });
    
    client.on('user_joined', (data) => {
        console.log(`👤 User joined: ${data.message}`);
    });
    
    client.on('user_left', (data) => {
        console.log(`👋 User left: ${data.message}`);
    });
    
    client.on('typing', (data) => {
        console.log(`⌨️ Typing: ${data.username} đang gõ...`);
    });
    
    client.on('error', (error) => {
        console.error('❌ Client error:', error);
    });
    
    // Kết nối
    client.connect();
    
    // Test gửi tin nhắn sau 2 giây
    setTimeout(() => {
        client.sendChatMessage('Xin chào từ client!', 'TestUser');
    }, 2000);
    
    // Test typing indicator
    setTimeout(() => {
        client.sendTyping(true, 'TestUser');
        setTimeout(() => {
            client.sendTyping(false, 'TestUser');
        }, 2000);
    }, 3000);
    
    // Test ping
    setTimeout(() => {
        client.sendPing();
    }, 4000);
    
    return client;
}

// Chạy test nếu file được chạy trực tiếp
if (require.main === module) {
    testWebSocketClient();
}

module.exports = WebSocketClient;
```

**chat-app.html - Chat App với WebSocket:**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket Chat App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .chat-container {
            border: 1px solid #ccc;
            height: 400px;
            overflow-y: auto;
            padding: 10px;
            margin-bottom: 10px;
        }
        .message {
            margin-bottom: 10px;
            padding: 5px;
            border-radius: 5px;
        }
        .message.system {
            background-color: #f0f0f0;
            font-style: italic;
        }
        .message.chat {
            background-color: #e3f2fd;
        }
        .message.typing {
            background-color: #fff3e0;
            font-style: italic;
        }
        .input-container {
            display: flex;
            gap: 10px;
        }
        .input-container input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .input-container button {
            padding: 10px 20px;
            background-color: #2196f3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .input-container button:hover {
            background-color: #1976d2;
        }
        .status {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
        }
        .status.connected {
            background-color: #c8e6c9;
            color: #2e7d32;
        }
        .status.disconnected {
            background-color: #ffcdd2;
            color: #c62828;
        }
    </style>
</head>
<body>
    <h1>💬 WebSocket Chat App</h1>
    
    <div id="status" class="status disconnected">
        ❌ Chưa kết nối
    </div>
    
    <div id="chatContainer" class="chat-container">
        <div class="message system">
            Chào mừng đến với WebSocket Chat App!
        </div>
    </div>
    
    <div class="input-container">
        <input type="text" id="usernameInput" placeholder="Tên của bạn" value="Anonymous">
        <input type="text" id="messageInput" placeholder="Nhập tin nhắn...">
        <button onclick="sendMessage()">Gửi</button>
    </div>
    
    <script>
        // WebSocket Client
        class ChatApp {
            constructor() {
                this.ws = null;
                this.isConnected = false;
                this.username = 'Anonymous';
                this.typingTimeout = null;
            }
            
            connect() {
                try {
                    this.ws = new WebSocket('ws://localhost:3000');
                    
                    this.ws.onopen = () => {
                        console.log('✅ WebSocket kết nối thành công!');
                        this.isConnected = true;
                        this.updateStatus('✅ Đã kết nối', 'connected');
                    };
                    
                    this.ws.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            this.handleMessage(data);
                        } catch (error) {
                            console.error('❌ Lỗi parse message:', error.message);
                        }
                    };
                    
                    this.ws.onclose = () => {
                        console.log('👋 WebSocket kết nối đã đóng');
                        this.isConnected = false;
                        this.updateStatus('❌ Mất kết nối', 'disconnected');
                    };
                    
                    this.ws.onerror = (error) => {
                        console.error('❌ WebSocket error:', error);
                        this.updateStatus('❌ Lỗi kết nối', 'disconnected');
                    };
                    
                } catch (error) {
                    console.error('❌ Lỗi tạo WebSocket:', error.message);
                }
            }
            
            handleMessage(data) {
                switch (data.type) {
                    case 'welcome':
                        this.addMessage(data.message, 'system');
                        break;
                    case 'chat':
                        this.addMessage(`${data.username}: ${data.message}`, 'chat');
                        break;
                    case 'user_joined':
                        this.addMessage(data.message, 'system');
                        break;
                    case 'user_left':
                        this.addMessage(data.message, 'system');
                        break;
                    case 'typing':
                        this.showTyping(data.username, data.isTyping);
                        break;
                }
            }
            
            addMessage(message, type) {
                const chatContainer = document.getElementById('chatContainer');
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${type}`;
                messageDiv.textContent = message;
                chatContainer.appendChild(messageDiv);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            
            showTyping(username, isTyping) {
                // Implement typing indicator
                console.log(`⌨️ ${username} ${isTyping ? 'đang gõ...' : 'đã dừng gõ'}`);
            }
            
            sendMessage(message, username) {
                if (!this.isConnected) {
                    console.error('❌ WebSocket chưa kết nối!');
                    return;
                }
                
                const data = {
                    type: 'chat',
                    message: message,
                    username: username
                };
                
                this.ws.send(JSON.stringify(data));
            }
            
            updateStatus(message, type) {
                const statusDiv = document.getElementById('status');
                statusDiv.textContent = message;
                statusDiv.className = `status ${type}`;
            }
        }
        
        // Tạo chat app instance
        const chatApp = new ChatApp();
        
        // Kết nối khi trang load
        window.onload = () => {
            chatApp.connect();
        };
        
        // Gửi tin nhắn
        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const usernameInput = document.getElementById('usernameInput');
            
            const message = messageInput.value.trim();
            const username = usernameInput.value.trim() || 'Anonymous';
            
            if (message) {
                chatApp.sendMessage(message, username);
                messageInput.value = '';
            }
        }
        
        // Gửi tin nhắn khi nhấn Enter
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>
```

# ⚙️ Phân tích & Giải thích

**WebSocket vs HTTP:**

1. **HTTP**: Request/Response pattern
   - Client gửi request, server trả response
   - Không có kết nối persistent
   - Server không thể push data đến client

2. **WebSocket**: Full-duplex communication
   - Kết nối persistent sau handshake
   - Cả client và server có thể gửi data bất kỳ lúc nào
   - Overhead thấp hơn HTTP

**WebSocket Handshake:**

1. Client gửi HTTP request với `Upgrade: websocket`
2. Server trả response với `101 Switching Protocols`
3. Kết nối được upgrade thành WebSocket
4. Cả hai bên có thể gửi frames

**Message Types:**

- **Text**: Tin nhắn dạng text
- **Binary**: Tin nhắn dạng binary
- **Ping**: Ping frame để keep-alive
- **Pong**: Pong frame để response ping

**Connection Management:**

- **Heartbeat**: Ping/pong để detect dead connections
- **Reconnection**: Tự động reconnect khi mất kết nối
- **Error Handling**: Xử lý lỗi connection và message

**Security Considerations:**

- **CORS**: Cross-origin requests
- **Authentication**: User authentication
- **Rate Limiting**: Tránh spam
- **Input Validation**: Validate message content

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng WebSocket:**

- **Real-time Chat**: WhatsApp, Discord, Slack
- **Gaming**: Multiplayer online games
- **Trading Platforms**: Real-time stock prices
- **Collaboration Tools**: Google Docs, Figma
- **Live Streaming**: Chat trong live streams
- **IoT Dashboards**: Real-time sensor data
- **Notifications**: Push notifications

**WebSocket Best Practices:**

- Implement heartbeat/ping-pong để detect dead connections
- Sử dụng connection pooling cho high-load applications
- Implement rate limiting để tránh spam
- Handle reconnection logic ở client side
- Sử dụng message queuing cho reliability

**Common Issues:**

- **Connection Drops**: Network issues, proxy problems
- **Memory Leaks**: Không cleanup connections properly
- **Scalability**: Single server không scale được
- **Security**: Cần authentication và authorization

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng WebSocket như một cuộc gọi điện thoại:

**HTTP** như gửi thư:
- Gửi thư đi, chờ thư phản hồi
- Mỗi lần gửi thư là một lần mới
- Không thể gửi thư liên tục
- Như gửi thư qua bưu điện

**WebSocket** như cuộc gọi điện thoại:
- Kết nối một lần, nói chuyện liên tục
- Cả hai bên có thể nói bất kỳ lúc nào
- Không cần "gọi lại" mỗi lần muốn nói
- Như nói chuyện trực tiếp

**WebSocket Handshake** như việc nhấc máy:
- Client "gọi" server (HTTP request)
- Server "nhấc máy" (HTTP response)
- Bắt đầu cuộc trò chuyện (WebSocket connection)
- Cả hai bên có thể nói chuyện tự do

**Message Types** như các loại âm thanh:
- **Text**: Nói chuyện bình thường
- **Binary**: Gửi hình ảnh, file
- **Ping**: "Bạn còn nghe không?"
- **Pong**: "Tôi vẫn nghe được"

**Connection Management** như quản lý cuộc gọi:
- **Heartbeat**: Kiểm tra xem còn nghe được không
- **Reconnection**: Gọi lại khi bị cúp máy
- **Error Handling**: Xử lý khi có sự cố
- **Cleanup**: Dọn dẹp khi kết thúc cuộc gọi

# 🧩 Tổng kết ngắn

- ✅ WebSocket cho phép giao tiếp realtime hai chiều
- ✅ Node.js WebSocket server dễ dàng setup và quản lý
- ✅ JavaScript WebSocket client có thể handle events và reconnect
- ✅ Cần implement heartbeat và error handling
- ✅ Phù hợp cho chat, gaming, và real-time applications

**Xem bài tiếp theo →** [SSE vs WebSocket](/Kant_Nguyen_Astro_Blog/blog/04-sse-vs-websocket/)
