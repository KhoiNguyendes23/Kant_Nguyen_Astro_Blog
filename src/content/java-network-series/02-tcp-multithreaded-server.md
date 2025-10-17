---
title: "TCP Server Đa luồng - Xử lý nhiều client đồng thời"
description: "Học cách tạo server đa luồng để xử lý nhiều client cùng lúc, xây dựng ứng dụng chat cơ bản"
date: 2025-10-27
tags: ["Java", "Multithreading", "TCP", "Chat Server"]
series: "Lập trình mạng với Java"
prev: "./01-tcp-socket-basic.md"
next: "./03-udp-datagram.md"
---

# 🧠 Giới thiệu

Trong bài trước, server chỉ có thể xử lý một client tại một thời điểm. Trong thực tế, chúng ta cần server có thể phục vụ nhiều client đồng thời. Bài này sẽ dạy bạn cách sử dụng Thread để tạo server đa luồng và xây dựng ứng dụng chat đơn giản.

Multithreading cho phép server xử lý nhiều kết nối song song, mỗi client được phục vụ bởi một thread riêng biệt.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**MultiThreadedServer.java - Server đa luồng:**

```java
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

public class MultiThreadedServer {
    private static final int PORT = 8080;
    private static final int MAX_CLIENTS = 10;
    private static Set<ClientHandler> clients = ConcurrentHashMap.newKeySet();
    private static ExecutorService threadPool = Executors.newFixedThreadPool(MAX_CLIENTS);
    
    public static void main(String[] args) {
        try {
            ServerSocket serverSocket = new ServerSocket(PORT);
            System.out.println("🚀 Multi-threaded Server đang chạy trên port " + PORT);
            System.out.println("👥 Tối đa " + MAX_CLIENTS + " client đồng thời");
            
            while (true) {
                // Chờ client kết nối
                Socket clientSocket = serverSocket.accept();
                System.out.println("✅ Client mới kết nối: " + clientSocket.getInetAddress());
                
                // Tạo ClientHandler cho client này
                ClientHandler clientHandler = new ClientHandler(clientSocket);
                clients.add(clientHandler);
                
                // Chạy client handler trong thread riêng
                threadPool.execute(clientHandler);
            }
            
        } catch (IOException e) {
            System.err.println("❌ Lỗi server: " + e.getMessage());
        }
    }
    
    // Broadcast tin nhắn đến tất cả client
    public static void broadcast(String message, ClientHandler sender) {
        for (ClientHandler client : clients) {
            if (client != sender) {
                client.sendMessage(message);
            }
        }
    }
    
    // Xóa client khỏi danh sách
    public static void removeClient(ClientHandler client) {
        clients.remove(client);
        System.out.println("👋 Client đã ngắt kết nối. Còn lại: " + clients.size());
    }
}
```

**ClientHandler.java - Xử lý từng client:**

```java
import java.io.*;
import java.net.*;

public class ClientHandler implements Runnable {
    private Socket socket;
    private BufferedReader in;
    private PrintWriter out;
    private String clientName;
    
    public ClientHandler(Socket socket) {
        this.socket = socket;
    }
    
    @Override
    public void run() {
        try {
            // Tạo I/O streams
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out = new PrintWriter(socket.getOutputStream(), true);
            
            // Nhận tên client
            clientName = in.readLine();
            System.out.println("👤 Client đăng nhập: " + clientName);
            
            // Gửi thông báo đến các client khác
            MultiThreadedServer.broadcast(clientName + " đã tham gia chat!", this);
            
            String message;
            // Đọc tin nhắn từ client
            while ((message = in.readLine()) != null) {
                if (message.equals("/quit")) {
                    break;
                }
                
                String fullMessage = clientName + ": " + message;
                System.out.println("💬 " + fullMessage);
                
                // Broadcast tin nhắn đến tất cả client khác
                MultiThreadedServer.broadcast(fullMessage, this);
            }
            
        } catch (IOException e) {
            System.err.println("❌ Lỗi client handler: " + e.getMessage());
        } finally {
            // Dọn dẹp khi client ngắt kết nối
            try {
                MultiThreadedServer.broadcast(clientName + " đã rời khỏi chat!", this);
                MultiThreadedServer.removeClient(this);
                
                if (in != null) in.close();
                if (out != null) out.close();
                if (socket != null) socket.close();
                
            } catch (IOException e) {
                System.err.println("❌ Lỗi đóng kết nối: " + e.getMessage());
            }
        }
    }
    
    // Gửi tin nhắn đến client này
    public void sendMessage(String message) {
        if (out != null) {
            out.println(message);
        }
    }
}
```

**ChatClient.java - Client đơn giản:**

```java
import java.io.*;
import java.net.*;
import java.util.Scanner;

public class ChatClient {
    public static void main(String[] args) {
        try {
            Socket socket = new Socket("localhost", 8080);
            System.out.println("🔗 Đã kết nối đến chat server");
            
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            Scanner scanner = new Scanner(System.in);
            
            // Nhập tên
            System.out.print("Nhập tên của bạn: ");
            String name = scanner.nextLine();
            out.println(name);
            
            // Thread để đọc tin nhắn từ server
            Thread readThread = new Thread(() -> {
                try {
                    String message;
                    while ((message = in.readLine()) != null) {
                        System.out.println(message);
                    }
                } catch (IOException e) {
                    System.out.println("❌ Mất kết nối với server");
                }
            });
            readThread.start();
            
            // Đọc tin nhắn từ user và gửi đến server
            String message;
            while (true) {
                message = scanner.nextLine();
                if (message.equals("/quit")) {
                    out.println("/quit");
                    break;
                }
                out.println(message);
            }
            
            socket.close();
            scanner.close();
            
        } catch (IOException e) {
            System.err.println("❌ Lỗi client: " + e.getMessage());
        }
    }
}
```

# ⚙️ Phân tích & Giải thích

**Thread Pool và ExecutorService:**

1. **ExecutorService**: Quản lý pool các thread
   - `Executors.newFixedThreadPool(10)`: Tạo pool với tối đa 10 thread
   - `execute(Runnable)`: Chạy task trong thread từ pool
   - Tự động tái sử dụng thread, tránh tạo/xóa thread liên tục

2. **ConcurrentHashMap**: Thread-safe collection
   - `ConcurrentHashMap.newKeySet()`: Tạo Set thread-safe
   - Nhiều thread có thể truy cập đồng thời mà không bị lỗi

**ClientHandler Pattern:**

- Mỗi client được xử lý bởi một ClientHandler riêng
- ClientHandler implement Runnable để chạy trong thread
- Tách biệt logic xử lý client khỏi server chính

**Broadcast Mechanism:**

- Server giữ danh sách tất cả client đang kết nối
- Khi có tin nhắn mới, gửi đến tất cả client khác
- Loại trừ người gửi để tránh echo

**Thread Safety:**

- Sử dụng ConcurrentHashMap thay vì ArrayList
- Synchronized methods hoặc concurrent collections
- Cẩn thận với shared state giữa các thread

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng Multithreaded Server:**

- **Chat Applications**: WhatsApp, Discord, Slack
- **Gaming Servers**: Multiplayer games
- **Web Servers**: Apache, Nginx, Tomcat
- **Database Servers**: MySQL, PostgreSQL
- **File Servers**: FTP, SFTP servers
- **Streaming Services**: Live chat, comments

**Performance Considerations:**

- Thread pool size phù hợp với CPU cores
- Monitor memory usage khi có nhiều client
- Sử dụng NIO (Non-blocking I/O) cho high-performance
- Load balancing khi cần scale horizontal

**Common Mistakes:**

- Không giới hạn số thread → OutOfMemoryError
- Quên đóng resources trong finally block
- Race conditions khi truy cập shared data
- Blocking operations trong main thread

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng server đa luồng như một nhà hàng:

**Single-threaded Server** như nhà hàng chỉ có 1 nhân viên:
- Phải phục vụ từng khách một cách tuần tự
- Khách phải chờ đợi rất lâu
- Không thể phục vụ nhiều bàn cùng lúc

**Multi-threaded Server** như nhà hàng có nhiều nhân viên:
- Mỗi nhân viên phục vụ một bàn riêng
- Tất cả bàn được phục vụ đồng thời
- Khách không phải chờ đợi lâu

**Thread Pool** như việc quản lý nhân viên:
- Có sẵn một số nhân viên nhất định
- Khi có khách mới, giao cho nhân viên rảnh
- Không thuê/fire nhân viên liên tục

**Broadcast** như hệ thống loa trong nhà hàng:
- Khi có thông báo quan trọng, phát cho tất cả bàn
- Mỗi bàn đều nghe được thông báo
- Tạo cảm giác cộng đồng trong nhà hàng

# 🧩 Tổng kết ngắn

- ✅ Multithreading cho phép server xử lý nhiều client đồng thời
- ✅ Thread Pool quản lý hiệu quả các thread
- ✅ ClientHandler pattern tách biệt logic xử lý client
- ✅ Broadcast mechanism gửi tin nhắn đến nhiều client
- ✅ Thread safety quan trọng khi có shared data

**Xem bài tiếp theo →** [UDP Datagram](./03-udp-datagram.md)
