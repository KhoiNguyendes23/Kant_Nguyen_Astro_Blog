---
title: "WebSocket với Java - Kết nối realtime"
description: "Học cách tạo WebSocket server và client với Java, xây dựng ứng dụng chat realtime"
date: 2025-09-16
tags: ["Java", "WebSocket", "Realtime", "Chat", "Spring Boot"]
series: "Lập trình mạng với Java"
prev: "/Kant_Nguyen_Astro_Blog/blog/05-https-tls/"
next: "/Kant_Nguyen_Astro_Blog/blog/07-chat-mini-project/"
---

## 📚 Series Overview

<div class="series-table">

|  #  | Bài viết                         | Liên kết                                                                                 |
| :-: | :------------------------------- | :--------------------------------------------------------------------------------------- |
| 00  | Giới thiệu & Chuẩn bị môi trường | [00-intro-environment](/Kant_Nguyen_Astro_Blog/blog/00-intro-environment/)               |
| 01  | TCP Socket cơ bản                | [01-tcp-socket-basic](/Kant_Nguyen_Astro_Blog/blog/01-tcp-socket-basic/)                 |
| 02  | TCP Server đa luồng              | [02-tcp-multithreaded-server](/Kant_Nguyen_Astro_Blog/blog/02-tcp-multithreaded-server/) |
| 03  | Lập trình mạng với UDP           | [03-udp-datagram](/Kant_Nguyen_Astro_Blog/blog/03-udp-datagram/)                         |
| 04  | Java 11 HttpClient               | [04-httpclient-api](/Kant_Nguyen_Astro_Blog/blog/04-httpclient-api/)                     |
| 05  | HTTPS và TLS                     | [05-https-tls](/Kant_Nguyen_Astro_Blog/blog/05-https-tls/)                               |
| 06  | WebSocket trong Java             | [06-websocket-java](/Kant_Nguyen_Astro_Blog/blog/06-websocket-java/)                     |
| 07  | Ứng dụng chat mini               | [07-chat-mini-project](/Kant_Nguyen_Astro_Blog/blog/07-chat-mini-project/)               |
| 08  | Tổng kết & Feynman Review        | [08-summary-feynman](/Kant_Nguyen_Astro_Blog/blog/08-summary-feynman/)                   |

</div>

# 🧠 Giới thiệu

WebSocket là giao thức cho phép giao tiếp hai chiều realtime giữa client và server. Khác với HTTP request/response, WebSocket duy trì kết nối persistent và cho phép server push dữ liệu đến client mà không cần client phải request.

Trong bài này, chúng ta sẽ học cách tạo WebSocket server với Spring Boot và WebSocket client với Java, xây dựng ứng dụng chat realtime hoàn chỉnh.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**WebSocketConfig.java - Cấu hình WebSocket:**

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Đăng ký WebSocket handler cho endpoint /chat
        registry.addHandler(new ChatWebSocketHandler(), "/chat")
                .setAllowedOrigins("*"); // Cho phép tất cả origins (chỉ dùng cho dev)
    }
}
```

**ChatWebSocketHandler.java - WebSocket Handler:**

```java
import org.springframework.web.socket.*;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class ChatWebSocketHandler implements WebSocketHandler {

    // Map để lưu trữ các session đang kết nối
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Khi client kết nối thành công
        String sessionId = session.getId();
        sessions.put(sessionId, session);

        System.out.println("✅ Client kết nối: " + sessionId);
        System.out.println("👥 Tổng số client: " + sessions.size());

        // Gửi thông báo chào mừng
        sendMessage(session, "Chào mừng bạn đến với chat room!");

        // Thông báo cho các client khác
        broadcast("Người dùng mới đã tham gia chat room!", sessionId);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        // Xử lý tin nhắn từ client
        String sessionId = session.getId();
        String messageText = (String) message.getPayload();

        System.out.println("💬 Tin nhắn từ " + sessionId + ": " + messageText);

        // Broadcast tin nhắn đến tất cả client khác
        broadcast(sessionId + ": " + messageText, sessionId);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("❌ Lỗi transport: " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        // Khi client ngắt kết nối
        String sessionId = session.getId();
        sessions.remove(sessionId);

        System.out.println("👋 Client ngắt kết nối: " + sessionId);
        System.out.println("👥 Còn lại: " + sessions.size() + " client");

        // Thông báo cho các client khác
        broadcast("Người dùng đã rời khỏi chat room!", sessionId);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    // Gửi tin nhắn đến một session cụ thể
    private void sendMessage(WebSocketSession session, String message) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(message));
            }
        } catch (IOException e) {
            System.err.println("❌ Lỗi gửi tin nhắn: " + e.getMessage());
        }
    }

    // Broadcast tin nhắn đến tất cả client khác
    private void broadcast(String message, String excludeSessionId) {
        sessions.values().stream()
            .filter(session -> !session.getId().equals(excludeSessionId))
            .forEach(session -> sendMessage(session, message));
    }
}
```

**WebSocketClient.java - Java WebSocket Client:**

```java
import java.net.URI;
import java.util.Scanner;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

public class WebSocketClient extends WebSocketClient {

    public WebSocketClient(URI serverUri) {
        super(serverUri);
    }

    @Override
    public void onOpen(ServerHandshake handshake) {
        System.out.println("🔗 Đã kết nối đến WebSocket server");
        System.out.println("Status: " + handshake.getHttpStatus());
    }

    @Override
    public void onMessage(String message) {
        System.out.println("📥 Nhận được: " + message);
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("👋 Kết nối đã đóng");
        System.out.println("Code: " + code + ", Reason: " + reason);
    }

    @Override
    public void onError(Exception ex) {
        System.err.println("❌ Lỗi WebSocket: " + ex.getMessage());
    }

    public static void main(String[] args) {
        try {
            // Kết nối đến WebSocket server
            WebSocketClient client = new WebSocketClient(
                new URI("ws://localhost:8080/chat")
            );

            client.connect();

            // Chờ kết nối thành công
            Thread.sleep(1000);

            Scanner scanner = new Scanner(System.in);

            while (true) {
                System.out.print("Nhập tin nhắn (hoặc 'quit' để thoát): ");
                String message = scanner.nextLine();

                if (message.equals("quit")) {
                    client.close();
                    break;
                }

                // Gửi tin nhắn đến server
                client.send(message);
            }

            scanner.close();

        } catch (Exception e) {
            System.err.println("❌ Lỗi client: " + e.getMessage());
        }
    }
}
```

**ChatApplication.java - Spring Boot Application:**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatApplication.class, args);
        System.out.println("🚀 WebSocket Chat Server đang chạy!");
        System.out.println("Truy cập: ws://localhost:8080/chat");
    }
}
```

**pom.xml - Maven Dependencies:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>websocket-chat</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>

        <dependency>
            <groupId>org.java-websocket</groupId>
            <artifactId>Java-WebSocket</artifactId>
            <version>1.5.3</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
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

**Spring WebSocket Architecture:**

- **WebSocketConfigurer**: Cấu hình WebSocket endpoints
- **WebSocketHandler**: Xử lý WebSocket messages
- **WebSocketSession**: Đại diện cho kết nối WebSocket
- **WebSocketMessage**: Tin nhắn WebSocket (Text, Binary, Ping, Pong)

**Message Types:**

- **TextMessage**: Tin nhắn dạng text
- **BinaryMessage**: Tin nhắn dạng binary
- **PingMessage**: Ping frame để keep-alive
- **PongMessage**: Pong frame để response ping

**Session Management:**

- Sử dụng `ConcurrentHashMap` để thread-safe
- Mỗi session có unique ID
- Track sessions để broadcast messages
- Cleanup khi session đóng

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
- **Memory Leaks**: Không cleanup sessions properly
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

**Session Management** như quản lý cuộc gọi:

- Mỗi cuộc gọi có một số điện thoại riêng
- Có thể có nhiều cuộc gọi cùng lúc
- Khi ai đó cúp máy, xóa khỏi danh sách
- Broadcast như hội nghị điện thoại

**Message Types** như các loại âm thanh:

- **Text**: Nói chuyện bình thường
- **Binary**: Gửi hình ảnh, file
- **Ping**: "Bạn còn nghe không?"
- **Pong**: "Tôi vẫn nghe được"

# 🧩 Tổng kết ngắn

- ✅ WebSocket cho phép giao tiếp realtime hai chiều
- ✅ Spring Boot cung cấp WebSocket support mạnh mẽ
- ✅ Session management quan trọng cho multi-client
- ✅ Cần xử lý connection drops và reconnection
- ✅ Phù hợp cho chat, gaming, và real-time applications

**Xem bài tiếp theo →** [Dự án Chat Mini](/Kant_Nguyen_Astro_Blog/blog/07-chat-mini-project/)
