---
title: "UDP Datagram - Giao thức không kết nối"
description: "Khám phá UDP - giao thức nhanh nhưng không đảm bảo độ tin cậy, phù hợp cho streaming và gaming"
date: 2025-10-27
tags: ["Java", "UDP", "Datagram", "Networking"]
series: "Lập trình mạng với Java"
prev: "./02-tcp-multithreaded-server.md"
next: "./04-httpclient-api.md"
---

# 🧠 Giới thiệu

Sau khi học TCP - giao thức đáng tin cậy nhưng chậm, chúng ta sẽ khám phá UDP (User Datagram Protocol) - giao thức nhanh nhưng không đảm bảo dữ liệu đến đích. UDP phù hợp cho các ứng dụng cần tốc độ cao như streaming video, gaming, hoặc DNS queries.

UDP là "fire-and-forget" protocol - gửi đi và không quan tâm kết quả. Điều này làm cho nó nhanh hơn TCP nhưng có thể mất dữ liệu.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**UDPServer.java - Server nhận UDP packets:**

```java
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class UDPServer {
    private static final int PORT = 8080;
    private static final int BUFFER_SIZE = 1024;
    
    public static void main(String[] args) {
        try {
            // Tạo DatagramSocket để lắng nghe UDP packets
            DatagramSocket socket = new DatagramSocket(PORT);
            System.out.println("🚀 UDP Server đang chạy trên port " + PORT);
            
            // Buffer để nhận dữ liệu
            byte[] buffer = new byte[BUFFER_SIZE];
            
            while (true) {
                // Tạo DatagramPacket để nhận dữ liệu
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                
                // Chờ nhận packet (blocking)
                socket.receive(packet);
                
                // Chuyển đổi byte array thành String
                String message = new String(packet.getData(), 0, packet.getLength(), StandardCharsets.UTF_8);
                String clientAddress = packet.getAddress().getHostAddress();
                int clientPort = packet.getPort();
                
                System.out.println("📨 Nhận từ " + clientAddress + ":" + clientPort + " - " + message);
                
                // Tạo phản hồi
                String response = "Server đã nhận được: " + message;
                byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
                
                // Tạo DatagramPacket để gửi phản hồi
                DatagramPacket responsePacket = new DatagramPacket(
                    responseBytes, 
                    responseBytes.length,
                    packet.getAddress(), 
                    packet.getPort()
                );
                
                // Gửi phản hồi về client
                socket.send(responsePacket);
                System.out.println("📤 Đã gửi phản hồi về " + clientAddress + ":" + clientPort);
            }
            
        } catch (IOException e) {
            System.err.println("❌ Lỗi UDP server: " + e.getMessage());
        }
    }
}
```

**UDPClient.java - Client gửi UDP packets:**

```java
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class UDPClient {
    private static final String SERVER_HOST = "localhost";
    private static final int SERVER_PORT = 8080;
    private static final int BUFFER_SIZE = 1024;
    
    public static void main(String[] args) {
        try {
            // Tạo DatagramSocket cho client
            DatagramSocket socket = new DatagramSocket();
            System.out.println("🔗 UDP Client đã sẵn sàng");
            
            Scanner scanner = new Scanner(System.in);
            
            while (true) {
                System.out.print("Nhập tin nhắn (hoặc 'quit' để thoát): ");
                String message = scanner.nextLine();
                
                if (message.equals("quit")) {
                    break;
                }
                
                // Chuyển đổi String thành byte array
                byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
                
                // Tạo DatagramPacket để gửi
                DatagramPacket packet = new DatagramPacket(
                    messageBytes,
                    messageBytes.length,
                    InetAddress.getByName(SERVER_HOST),
                    SERVER_PORT
                );
                
                // Gửi packet
                socket.send(packet);
                System.out.println("📤 Đã gửi: " + message);
                
                // Buffer để nhận phản hồi
                byte[] buffer = new byte[BUFFER_SIZE];
                DatagramPacket responsePacket = new DatagramPacket(buffer, buffer.length);
                
                // Nhận phản hồi (có timeout)
                socket.setSoTimeout(5000); // 5 giây timeout
                try {
                    socket.receive(responsePacket);
                    String response = new String(responsePacket.getData(), 0, responsePacket.getLength(), StandardCharsets.UTF_8);
                    System.out.println("📥 Nhận được: " + response);
                } catch (SocketTimeoutException e) {
                    System.out.println("⏰ Timeout - không nhận được phản hồi");
                }
            }
            
            socket.close();
            scanner.close();
            
        } catch (IOException e) {
            System.err.println("❌ Lỗi UDP client: " + e.getMessage());
        }
    }
}
```

**BroadcastSender.java - Gửi broadcast message:**

```java
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class BroadcastSender {
    public static void main(String[] args) {
        try {
            // Tạo DatagramSocket với broadcast enabled
            DatagramSocket socket = new DatagramSocket();
            socket.setBroadcast(true);
            
            String message = "Hello từ Broadcast Sender!";
            byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
            
            // Broadcast đến tất cả máy trong mạng local
            DatagramPacket packet = new DatagramPacket(
                messageBytes,
                messageBytes.length,
                InetAddress.getByName("255.255.255.255"), // Broadcast address
                8080
            );
            
            socket.send(packet);
            System.out.println("📡 Đã gửi broadcast message");
            
            socket.close();
            
        } catch (IOException e) {
            System.err.println("❌ Lỗi broadcast: " + e.getMessage());
        }
    }
}
```

# ⚙️ Phân tích & Giải thích

**DatagramSocket vs Socket:**

1. **DatagramSocket**: Không có kết nối persistent
   - Không cần `accept()` như ServerSocket
   - Mỗi packet độc lập với nhau
   - Có thể gửi đến bất kỳ địa chỉ nào

2. **DatagramPacket**: Chứa dữ liệu và địa chỉ đích
   - `getData()`: Lấy dữ liệu dạng byte array
   - `getAddress()`: Địa chỉ IP của sender/receiver
   - `getPort()`: Port của sender/receiver

**UDP Characteristics:**

- **Connectionless**: Không thiết lập kết nối trước
- **Unreliable**: Không đảm bảo packet đến đích
- **No ordering**: Packets có thể đến không đúng thứ tự
- **No flow control**: Không kiểm soát tốc độ gửi/nhận

**Buffer Management:**

- UDP có giới hạn kích thước packet (thường 64KB)
- Cần quản lý buffer size phù hợp
- `StandardCharsets.UTF_8` để encode/decode text

**Timeout Handling:**

- `setSoTimeout()` để tránh blocking vô hạn
- `SocketTimeoutException` khi không nhận được packet
- Quan trọng cho client applications

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng UDP:**

- **DNS**: Domain name resolution
- **DHCP**: Dynamic IP assignment
- **Streaming**: Video/audio streaming (RTSP, RTP)
- **Gaming**: Real-time multiplayer games
- **VoIP**: Voice over IP calls
- **SNMP**: Network management
- **TFTP**: Trivial file transfer

**UDP vs TCP Decision:**

**Chọn UDP khi:**
- Cần tốc độ cao, latency thấp
- Mất một vài packet không quan trọng
- Real-time applications
- Broadcasting/multicasting

**Chọn TCP khi:**
- Cần đảm bảo dữ liệu đến đích
- File transfer, web browsing
- Database connections
- Email, messaging

**Performance Tips:**

- Sử dụng buffer size phù hợp
- Implement application-level reliability nếu cần
- Monitor packet loss rate
- Sử dụng multicast cho group communication

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng UDP như việc gửi thư không có mã theo dõi:

**TCP** như gửi bưu kiện có mã theo dõi:
- Bưu điện đảm bảo gói hàng đến đúng nơi
- Nếu mất, sẽ gửi lại
- Thư đến đúng thứ tự
- Nhưng chậm và tốn kém

**UDP** như ném thư qua hàng rào:
- Nhanh và đơn giản
- Không biết thư có đến không
- Có thể mất hoặc đến sai thứ tự
- Nhưng rất nhanh và hiệu quả

**DatagramPacket** như phong bì thư:
- Có địa chỉ người nhận
- Có nội dung bên trong
- Mỗi thư độc lập với nhau
- Không cần thiết lập kết nối trước

**Broadcast** như hét to trong sân vận động:
- Tất cả mọi người đều nghe được
- Không cần biết ai đang nghe
- Nhanh nhưng không chắc chắn ai nghe được
- Phù hợp cho thông báo chung

# 🧩 Tổng kết ngắn

- ✅ UDP nhanh hơn TCP nhưng không đảm bảo độ tin cậy
- ✅ DatagramSocket và DatagramPacket là core classes
- ✅ Không cần thiết lập kết nối trước
- ✅ Phù hợp cho real-time applications
- ✅ Cần xử lý timeout và packet loss

**Xem bài tiếp theo →** [HTTP Client API](./04-httpclient-api.md)
