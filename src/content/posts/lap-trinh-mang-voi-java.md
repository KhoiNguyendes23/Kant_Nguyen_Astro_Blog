---
title: "Lập trình mạng với Java"
description: "Hướng dẫn chi tiết về lập trình mạng sử dụng Java, từ cơ bản đến nâng cao"
date: 2024-01-15
author: "Kant Nguyễn"
tags: ["Java", "Networking", "Backend", "Programming"]
---

# Lập trình mạng với Java

Lập trình mạng là một kỹ năng quan trọng trong việc phát triển các ứng dụng hiện đại. Với Java, chúng ta có thể xây dựng các ứng dụng mạng mạnh mẽ và hiệu quả.

## Giới thiệu

Java cung cấp một bộ API phong phú cho việc lập trình mạng thông qua package `java.net`. Từ việc tạo kết nối HTTP đơn giản đến xây dựng các ứng dụng client-server phức tạp.

## Các khái niệm cơ bản

### 1. Socket Programming

Socket là điểm cuối của kết nối hai chiều giữa hai chương trình chạy trên mạng. Java cung cấp hai loại socket chính:

- **Socket**: Cho client
- **ServerSocket**: Cho server

```java
// Server
ServerSocket serverSocket = new ServerSocket(8080);
Socket clientSocket = serverSocket.accept();

// Client
Socket socket = new Socket("localhost", 8080);
```

### 2. HTTP Client

Java 11+ cung cấp HttpClient API hiện đại:

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
```

## Kỹ thuật nâng cao

### 1. NIO (Non-blocking I/O)

NIO cho phép xử lý nhiều kết nối đồng thời mà không cần tạo thread riêng cho mỗi kết nối.

### 2. WebSocket

Cho các ứng dụng real-time:

```java
@ServerEndpoint("/websocket")
public class WebSocketServer {
    @OnOpen
    public void onOpen(Session session) {
        // Xử lý kết nối mới
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        // Xử lý tin nhắn
    }
}
```

## Kết luận

Lập trình mạng với Java mở ra nhiều cơ hội để xây dựng các ứng dụng mạnh mẽ và hiệu quả. Việc nắm vững các khái niệm cơ bản và kỹ thuật nâng cao sẽ giúp bạn trở thành một developer giỏi hơn.

---

_Bài viết này là một phần trong series về lập trình mạng. Hãy theo dõi để không bỏ lỡ các bài viết tiếp theo!_
