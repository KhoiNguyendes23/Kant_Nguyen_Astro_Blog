---
title: "SSE vs WebSocket - So sánh mô hình realtime"
description: "So sánh Server-Sent Events (SSE) và WebSocket, khi nào nên dùng cái nào cho ứng dụng realtime"
date: 2025-09-23
tags: ["JavaScript", "SSE", "WebSocket", "Realtime", "Comparison"]
series: "Lập trình mạng với JavaScript"
prev: "/Kant_Nguyen_Astro_Blog/blog/03-websocket-intro/"
next: "/Kant_Nguyen_Astro_Blog/blog/05-service-worker/"
---

## 📚 Series Overview

<div class="series-table">

|  #  | Bài viết                         | Liên kết                                                                           |
| :-: | :------------------------------- | :--------------------------------------------------------------------------------- |
| 00  | Giới thiệu & Chuẩn bị môi trường | [00-intro-environment](/Kant_Nguyen_Astro_Blog/blog/00-intro-environment/)         |
| 01  | Fetch API cơ bản                 | [01-fetch-basic](/Kant_Nguyen_Astro_Blog/blog/01-fetch-basic/)                     |
| 02  | Fetch với AbortController        | [02-fetch-abortcontroller](/Kant_Nguyen_Astro_Blog/blog/02-fetch-abortcontroller/) |
| 03  | WebSocket giới thiệu             | [03-websocket-intro](/Kant_Nguyen_Astro_Blog/blog/03-websocket-intro/)             |
| 04  | SSE vs WebSocket                 | [04-sse-vs-websocket](/Kant_Nguyen_Astro_Blog/blog/04-sse-vs-websocket/)           |
| 05  | Service Worker                   | [05-service-worker](/Kant_Nguyen_Astro_Blog/blog/05-service-worker/)               |
| 06  | PWA Manifest                     | [06-pwa-manifest](/Kant_Nguyen_Astro_Blog/blog/06-pwa-manifest/)                   |
| 07  | DevTools Network                 | [07-devtools-network](/Kant_Nguyen_Astro_Blog/blog/07-devtools-network/)           |
| 08  | Tổng kết & Feynman Review        | [08-summary-feynman](/Kant_Nguyen_Astro_Blog/blog/08-summary-feynman/)             |

</div>

# 🧠 Giới thiệu

Khi xây dựng ứng dụng realtime, bạn có hai lựa chọn chính: Server-Sent Events (SSE) và WebSocket. Mỗi công nghệ có ưu nhược điểm riêng và phù hợp với các use case khác nhau.

Bài này sẽ so sánh chi tiết SSE và WebSocket, giúp bạn hiểu khi nào nên sử dụng cái nào và cách implement cả hai trong JavaScript.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**sse-server.js - Server-Sent Events Server:**

```javascript
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

// Store SSE connections
const sseConnections = new Set();
let connectionId = 0;

// Middleware để parse JSON
app.use(express.json());

// SSE endpoint
app.get("/events", (req, res) => {
  const id = ++connectionId;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Store connection
  const connection = { id, res };
  sseConnections.add(connection);

  console.log(`✅ SSE Client ${id} đã kết nối`);
  console.log(`👥 Tổng số SSE connections: ${sseConnections.size}`);

  // Send welcome message
  res.write(
    `data: ${JSON.stringify({
      type: "welcome",
      message: `Chào mừng đến với SSE! ID: ${id}`,
      clientId: id,
    })}\n\n`
  );

  // Send initial data
  res.write(
    `data: ${JSON.stringify({
      type: "initial_data",
      message: "Dữ liệu ban đầu từ SSE server",
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Handle client disconnect
  req.on("close", () => {
    console.log(`👋 SSE Client ${id} đã ngắt kết nối`);
    sseConnections.delete(connection);
    console.log(`👥 Còn lại: ${sseConnections.size} SSE connections`);
  });

  req.on("error", (err) => {
    console.error(`❌ SSE Client ${id} error:`, err.message);
    sseConnections.delete(connection);
  });
});

// API endpoint để trigger SSE events
app.post("/trigger-event", (req, res) => {
  const { message, type = "notification" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const eventData = {
    type: type,
    message: message,
    timestamp: new Date().toISOString(),
  };

  // Broadcast đến tất cả SSE connections
  broadcastSSE(eventData);

  res.json({ success: true, message: "Event sent to all SSE clients" });
});

// Broadcast function cho SSE
function broadcastSSE(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  sseConnections.forEach((connection) => {
    try {
      connection.res.write(message);
    } catch (error) {
      console.error(
        `❌ Lỗi gửi SSE đến client ${connection.id}:`,
        error.message
      );
      sseConnections.delete(connection);
    }
  });
}

// Periodic data broadcast
setInterval(() => {
  const data = {
    type: "periodic_update",
    message: "Cập nhật định kỳ từ SSE server",
    timestamp: new Date().toISOString(),
    connections: sseConnections.size,
  };

  broadcastSSE(data);
}, 10000); // Mỗi 10 giây

// Serve static files
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 SSE Server đang chạy trên port ${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/events`);
  console.log(`🌐 HTTP endpoint: http://localhost:${PORT}`);
});
```

**sse-client.js - SSE Client:**

```javascript
class SSEClient {
  constructor(url) {
    this.url = url;
    this.eventSource = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageHandlers = new Map();
  }

  // Kết nối đến SSE server
  connect() {
    try {
      console.log(`🔗 Đang kết nối đến SSE server: ${this.url}`);

      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = (event) => {
        console.log("✅ SSE kết nối thành công!");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit("connected", event);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Nhận được SSE message:", data);
          this.handleMessage(data);
        } catch (error) {
          console.error("❌ Lỗi parse SSE message:", error.message);
        }
      };

      this.eventSource.onerror = (event) => {
        console.error("❌ SSE error:", event);
        this.isConnected = false;
        this.emit("error", event);

        // Tự động reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      };

      // Custom event listeners
      this.eventSource.addEventListener("custom-event", (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("❌ Lỗi parse custom event:", error.message);
        }
      });
    } catch (error) {
      console.error("❌ Lỗi tạo SSE connection:", error.message);
    }
  }

  // Xử lý tin nhắn từ server
  handleMessage(data) {
    switch (data.type) {
      case "welcome":
        console.log("🎉 Chào mừng:", data.message);
        this.emit("welcome", data);
        break;
      case "initial_data":
        console.log("📊 Dữ liệu ban đầu:", data.message);
        this.emit("initial_data", data);
        break;
      case "notification":
        console.log("🔔 Thông báo:", data.message);
        this.emit("notification", data);
        break;
      case "periodic_update":
        console.log("⏰ Cập nhật định kỳ:", data.message);
        this.emit("periodic_update", data);
        break;
      default:
        console.log("❓ SSE message không xác định:", data);
        this.emit("message", data);
    }
  }

  // Đóng kết nối
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log("👋 SSE kết nối đã đóng");
    }
  }

  // Tự động reconnect
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Đã đạt giới hạn reconnect attempts");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 SSE Reconnect attempt ${this.reconnectAttempts} sau ${delay}ms...`
    );

    setTimeout(() => {
      this.disconnect();
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
      this.messageHandlers.get(event).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Lỗi event handler cho ${event}:`, error.message);
        }
      });
    }
  }
}

// Test SSE Client
function testSSEClient() {
  const sseClient = new SSEClient("http://localhost:3000/events");

  // Event handlers
  sseClient.on("connected", () => {
    console.log("🎉 SSE Client đã kết nối!");
  });

  sseClient.on("welcome", (data) => {
    console.log(`🎉 Welcome: ${data.message}`);
  });

  sseClient.on("notification", (data) => {
    console.log(`🔔 Notification: ${data.message}`);
  });

  sseClient.on("periodic_update", (data) => {
    console.log(`⏰ Periodic Update: ${data.message}`);
  });

  sseClient.on("error", (error) => {
    console.error("❌ SSE Client error:", error);
  });

  // Kết nối
  sseClient.connect();

  return sseClient;
}

// Chạy test nếu file được chạy trực tiếp
if (require.main === module) {
  testSSEClient();
}

module.exports = SSEClient;
```

**comparison-demo.html - Demo so sánh SSE vs WebSocket:**

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSE vs WebSocket Comparison</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      .comparison-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .technology {
        border: 1px solid #ccc;
        border-radius: 10px;
        padding: 20px;
      }
      .technology h2 {
        margin-top: 0;
        text-align: center;
      }
      .sse {
        border-color: #4caf50;
      }
      .websocket {
        border-color: #2196f3;
      }
      .status {
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        text-align: center;
      }
      .status.connected {
        background-color: #c8e6c9;
        color: #2e7d32;
      }
      .status.disconnected {
        background-color: #ffcdd2;
        color: #c62828;
      }
      .messages {
        height: 300px;
        overflow-y: auto;
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 10px;
      }
      .message {
        margin-bottom: 5px;
        padding: 5px;
        border-radius: 3px;
      }
      .message.system {
        background-color: #f0f0f0;
        font-style: italic;
      }
      .message.data {
        background-color: #e3f2fd;
      }
      .controls {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }
      .controls button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .connect-btn {
        background-color: #4caf50;
        color: white;
      }
      .disconnect-btn {
        background-color: #f44336;
        color: white;
      }
      .send-btn {
        background-color: #2196f3;
        color: white;
      }
      .comparison-table {
        margin-top: 30px;
        border-collapse: collapse;
        width: 100%;
      }
      .comparison-table th,
      .comparison-table td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      .comparison-table th {
        background-color: #f2f2f2;
      }
      .pros {
        color: #4caf50;
      }
      .cons {
        color: #f44336;
      }
    </style>
  </head>
  <body>
    <h1>🔄 SSE vs WebSocket Comparison</h1>

    <div class="comparison-container">
      <!-- SSE Section -->
      <div class="technology sse">
        <h2>📡 Server-Sent Events (SSE)</h2>

        <div id="sseStatus" class="status disconnected">❌ Chưa kết nối</div>

        <div class="controls">
          <button class="connect-btn" onclick="connectSSE()">
            Kết nối SSE
          </button>
          <button class="disconnect-btn" onclick="disconnectSSE()">
            Ngắt kết nối
          </button>
          <button class="send-btn" onclick="triggerSSEEvent()">
            Trigger Event
          </button>
        </div>

        <div id="sseMessages" class="messages">
          <div class="message system">SSE Messages sẽ hiển thị ở đây...</div>
        </div>
      </div>

      <!-- WebSocket Section -->
      <div class="technology websocket">
        <h2>🔌 WebSocket</h2>

        <div id="wsStatus" class="status disconnected">❌ Chưa kết nối</div>

        <div class="controls">
          <button class="connect-btn" onclick="connectWebSocket()">
            Kết nối WebSocket
          </button>
          <button class="disconnect-btn" onclick="disconnectWebSocket()">
            Ngắt kết nối
          </button>
          <button class="send-btn" onclick="sendWebSocketMessage()">
            Gửi tin nhắn
          </button>
        </div>

        <div id="wsMessages" class="messages">
          <div class="message system">
            WebSocket Messages sẽ hiển thị ở đây...
          </div>
        </div>
      </div>
    </div>

    <!-- Comparison Table -->
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Tiêu chí</th>
          <th>Server-Sent Events (SSE)</th>
          <th>WebSocket</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Hướng giao tiếp</strong></td>
          <td>Chỉ server → client</td>
          <td>Hai chiều (bidirectional)</td>
        </tr>
        <tr>
          <td><strong>Protocol</strong></td>
          <td>HTTP</td>
          <td>WebSocket</td>
        </tr>
        <tr>
          <td><strong>Reconnection</strong></td>
          <td class="pros">Tự động</td>
          <td class="cons">Cần implement</td>
        </tr>
        <tr>
          <td><strong>Browser Support</strong></td>
          <td class="pros">Rộng rãi</td>
          <td class="pros">Rộng rãi</td>
        </tr>
        <tr>
          <td><strong>Firewall/Proxy</strong></td>
          <td class="pros">Dễ dàng</td>
          <td class="cons">Có thể gặp vấn đề</td>
        </tr>
        <tr>
          <td><strong>Overhead</strong></td>
          <td class="pros">Thấp</td>
          <td class="pros">Rất thấp</td>
        </tr>
        <tr>
          <td><strong>Use Cases</strong></td>
          <td>Notifications, live updates, logs</td>
          <td>Chat, gaming, collaboration</td>
        </tr>
      </tbody>
    </table>

    <script>
      // SSE Client
      let sseEventSource = null;

      function connectSSE() {
        try {
          sseEventSource = new EventSource("http://localhost:3000/events");

          sseEventSource.onopen = () => {
            console.log("✅ SSE kết nối thành công!");
            updateSSEStatus("✅ Đã kết nối SSE", "connected");
          };

          sseEventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              addSSEMessage(data);
            } catch (error) {
              console.error("❌ Lỗi parse SSE message:", error.message);
            }
          };

          sseEventSource.onerror = (error) => {
            console.error("❌ SSE error:", error);
            updateSSEStatus("❌ Lỗi kết nối SSE", "disconnected");
          };
        } catch (error) {
          console.error("❌ Lỗi tạo SSE connection:", error.message);
        }
      }

      function disconnectSSE() {
        if (sseEventSource) {
          sseEventSource.close();
          sseEventSource = null;
          updateSSEStatus("❌ Đã ngắt kết nối SSE", "disconnected");
        }
      }

      function addSSEMessage(data) {
        const messagesContainer = document.getElementById("sseMessages");
        const messageDiv = document.createElement("div");
        messageDiv.className = "message data";
        messageDiv.textContent = `[${data.type}] ${data.message}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      function updateSSEStatus(message, type) {
        const statusDiv = document.getElementById("sseStatus");
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
      }

      function triggerSSEEvent() {
        fetch("http://localhost:3000/trigger-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Event được trigger từ client!",
            type: "notification",
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("✅ Event triggered:", data);
          })
          .catch((error) => {
            console.error("❌ Lỗi trigger event:", error.message);
          });
      }

      // WebSocket Client
      let wsConnection = null;

      function connectWebSocket() {
        try {
          wsConnection = new WebSocket("ws://localhost:3000");

          wsConnection.onopen = () => {
            console.log("✅ WebSocket kết nối thành công!");
            updateWebSocketStatus("✅ Đã kết nối WebSocket", "connected");
          };

          wsConnection.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              addWebSocketMessage(data);
            } catch (error) {
              console.error("❌ Lỗi parse WebSocket message:", error.message);
            }
          };

          wsConnection.onclose = () => {
            console.log("👋 WebSocket kết nối đã đóng");
            updateWebSocketStatus(
              "❌ Đã ngắt kết nối WebSocket",
              "disconnected"
            );
          };

          wsConnection.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            updateWebSocketStatus("❌ Lỗi kết nối WebSocket", "disconnected");
          };
        } catch (error) {
          console.error("❌ Lỗi tạo WebSocket connection:", error.message);
        }
      }

      function disconnectWebSocket() {
        if (wsConnection) {
          wsConnection.close();
          wsConnection = null;
          updateWebSocketStatus("❌ Đã ngắt kết nối WebSocket", "disconnected");
        }
      }

      function addWebSocketMessage(data) {
        const messagesContainer = document.getElementById("wsMessages");
        const messageDiv = document.createElement("div");
        messageDiv.className = "message data";
        messageDiv.textContent = `[${data.type}] ${data.message}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      function updateWebSocketStatus(message, type) {
        const statusDiv = document.getElementById("wsStatus");
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
      }

      function sendWebSocketMessage() {
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          const message = {
            type: "chat",
            message: "Tin nhắn từ WebSocket client!",
            username: "Demo User",
          };

          wsConnection.send(JSON.stringify(message));
          console.log("📤 Đã gửi WebSocket message");
        } else {
          console.error("❌ WebSocket chưa kết nối!");
        }
      }
    </script>
  </body>
</html>
```

# ⚙️ Phân tích & Giải thích

**SSE (Server-Sent Events):**

1. **Unidirectional**: Chỉ server có thể gửi data đến client
2. **HTTP-based**: Sử dụng HTTP protocol
3. **Auto-reconnection**: Browser tự động reconnect
4. **Simple**: Dễ implement và debug
5. **Firewall-friendly**: Hoạt động tốt qua firewall/proxy

**WebSocket:**

1. **Bidirectional**: Cả client và server có thể gửi data
2. **Custom Protocol**: Sử dụng WebSocket protocol
3. **Manual Reconnection**: Cần implement reconnection logic
4. **Complex**: Phức tạp hơn để implement
5. **Firewall Issues**: Có thể gặp vấn đề với firewall/proxy

**When to Use SSE:**

- **Notifications**: Push notifications từ server
- **Live Updates**: Real-time data updates
- **Log Streaming**: Streaming logs từ server
- **Status Updates**: Cập nhật trạng thái
- **One-way Communication**: Chỉ cần server → client

**When to Use WebSocket:**

- **Chat Applications**: Two-way communication
- **Gaming**: Real-time multiplayer
- **Collaboration**: Real-time collaboration tools
- **Trading**: Real-time trading platforms
- **Interactive Applications**: Cần user input real-time

**Performance Comparison:**

- **SSE**: Overhead thấp, dễ scale
- **WebSocket**: Overhead rất thấp, khó scale
- **Memory Usage**: SSE sử dụng ít memory hơn
- **CPU Usage**: WebSocket sử dụng ít CPU hơn

# 🧭 Ứng dụng thực tế

**SSE Use Cases:**

- **Social Media**: Live notifications
- **News Websites**: Breaking news updates
- **Stock Tickers**: Real-time stock prices
- **System Monitoring**: Server status updates
- **Live Blogs**: Live event coverage

**WebSocket Use Cases:**

- **Chat Applications**: WhatsApp, Discord
- **Gaming**: Multiplayer games
- **Collaboration**: Google Docs, Figma
- **Trading**: Real-time trading
- **IoT**: Device communication

**Hybrid Approach:**

- Sử dụng SSE cho notifications
- Sử dụng WebSocket cho interactive features
- Combine cả hai trong một ứng dụng

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng SSE và WebSocket như hai loại điện thoại khác nhau:

**SSE** như điện thoại chỉ nghe:

- Chỉ có thể nghe, không thể nói
- Như radio hoặc TV
- Tự động kết nối lại khi mất tín hiệu
- Đơn giản, chỉ cần bật lên là nghe được

**WebSocket** như điện thoại hai chiều:

- Có thể nghe và nói
- Như điện thoại thật
- Cần tự gọi lại khi bị cúp máy
- Phức tạp hơn, cần biết cách sử dụng

**SSE Use Cases** như nghe radio:

- Nghe tin tức, thời tiết
- Nghe nhạc, podcast
- Nghe thông báo từ trạm phát
- Không cần tương tác, chỉ cần nghe

**WebSocket Use Cases** như gọi điện thoại:

- Nói chuyện với bạn bè
- Họp trực tuyến
- Chơi game cùng nhau
- Cần tương tác hai chiều

**Performance** như chất lượng cuộc gọi:

- **SSE**: Như radio, chất lượng ổn định
- **WebSocket**: Như điện thoại, chất lượng cao hơn
- **Memory**: SSE như radio, tiết kiệm pin
- **CPU**: WebSocket như điện thoại, cần nhiều năng lượng hơn

**Firewall** như cổng vào nhà:

- **SSE**: Như thư, dễ dàng qua cổng
- **WebSocket**: Như khách lạ, có thể bị chặn
- **Proxy**: SSE như thư bưu điện, WebSocket như gói hàng đặc biệt

# 🧩 Tổng kết ngắn

- ✅ SSE phù hợp cho one-way communication (server → client)
- ✅ WebSocket phù hợp cho two-way communication (bidirectional)
- ✅ SSE tự động reconnect, WebSocket cần implement
- ✅ SSE dễ implement, WebSocket phức tạp hơn
- ✅ Chọn công nghệ dựa trên use case cụ thể

**Xem bài tiếp theo →** [Service Worker](/Kant_Nguyen_Astro_Blog/blog/05-service-worker/)
