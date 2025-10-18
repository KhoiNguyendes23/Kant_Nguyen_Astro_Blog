---
title: "TCP Socket Cơ bản - Server và Client đầu tiên"
description: "Học cách tạo ServerSocket và Socket để thiết lập kết nối TCP, gửi nhận dữ liệu cơ bản"
date: 2025-09-11
tags: ["Java", "TCP", "Socket", "Networking"]
series: "Lập trình mạng với Java"
prev: "./00-intro-environment.md"
next: "./02-tcp-multithreaded-server.md"
---

---

## 📚 Series Overview

<div class="series-table">

|  #  | Bài viết                         | Liên kết                                                        |
| :-: | :------------------------------- | :-------------------------------------------------------------- |
| 00  | Giới thiệu & Chuẩn bị môi trường | [00-intro-environment](./00-intro-environment.md)               |
| 01  | TCP Socket cơ bản                | [01-tcp-socket-basic](./01-tcp-socket-basic.md)                 |
| 02  | TCP Server đa luồng              | [02-tcp-multithreaded-server](./02-tcp-multithreaded-server.md) |
| 03  | Lập trình mạng với UDP           | [03-udp-datagram](./03-udp-datagram.md)                         |
| 04  | Java 11 HttpClient               | [04-httpclient-api](./04-httpclient-api.md)                     |
| 05  | HTTPS và TLS                     | [05-https-tls](./05-https-tls.md)                               |
| 06  | WebSocket trong Java             | [06-websocket-java](./06-websocket-java.md)                     |
| 07  | Ứng dụng chat mini               | [07-chat-mini-project](./07-chat-mini-project.md)               |
| 08  | Tổng kết & Feynman Review        | [08-summary-feynman](./08-summary-feynman.md)                   |

</div>

# 🧠 Giới thiệu

Trong bài này, chúng ta sẽ tạo ra server và client đầu tiên sử dụng TCP Socket - nền tảng của mọi ứng dụng mạng. Bạn sẽ hiểu cách Java thiết lập kết nối, gửi và nhận dữ liệu qua mạng.

TCP (Transmission Control Protocol) đảm bảo dữ liệu được truyền một cách đáng tin cậy, có thứ tự và không bị mất. Đây là giao thức được sử dụng rộng rãi nhất trên Internet.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**Server.java - Tạo server đơn giản:**

```java
import java.io.*;
import java.net.*;

public class Server {
    public static void main(String[] args) {
        try {
            // Tạo ServerSocket lắng nghe port 8080
            ServerSocket serverSocket = new ServerSocket(8080);
            System.out.println("🚀 Server đang chạy trên port 8080...");

            // Chờ client kết nối
            Socket clientSocket = serverSocket.accept();
            System.out.println("✅ Client đã kết nối: " + clientSocket.getInetAddress());

            // Tạo BufferedReader để đọc dữ liệu từ client
            BufferedReader in = new BufferedReader(
                new InputStreamReader(clientSocket.getInputStream())
            );

            // Tạo PrintWriter để gửi dữ liệu đến client
            PrintWriter out = new PrintWriter(
                clientSocket.getOutputStream(), true
            );

            // Đọc tin nhắn từ client
            String message = in.readLine();
            System.out.println("📨 Nhận được: " + message);

            // Gửi phản hồi về client
            out.println("Server đã nhận được: " + message);

            // Đóng kết nối
            clientSocket.close();
            serverSocket.close();

        } catch (IOException e) {
            System.err.println("❌ Lỗi server: " + e.getMessage());
        }
    }
}
```

**Client.java - Tạo client kết nối:**

```java
import java.io.*;
import java.net.*;

public class Client {
    public static void main(String[] args) {
        try {
            // Kết nối đến server localhost port 8080
            Socket socket = new Socket("localhost", 8080);
            System.out.println("🔗 Đã kết nối đến server");

            // Tạo BufferedReader để đọc phản hồi từ server
            BufferedReader in = new BufferedReader(
                new InputStreamReader(socket.getInputStream())
            );

            // Tạo PrintWriter để gửi dữ liệu đến server
            PrintWriter out = new PrintWriter(
                socket.getOutputStream(), true
            );

            // Gửi tin nhắn đến server
            String message = "Xin chào từ Client!";
            out.println(message);
            System.out.println("📤 Đã gửi: " + message);

            // Đọc phản hồi từ server
            String response = in.readLine();
            System.out.println("📥 Nhận được: " + response);

            // Đóng kết nối
            socket.close();

        } catch (IOException e) {
            System.err.println("❌ Lỗi client: " + e.getMessage());
        }
    }
}
```

**Cách chạy:**

```bash
# Terminal 1 - Chạy server
javac Server.java
java Server

# Terminal 2 - Chạy client
javac Client.java
java Client
```

# ⚙️ Phân tích & Giải thích

**ServerSocket và Socket:**

1. **ServerSocket**: Là "cổng" mà server lắng nghe

   - `new ServerSocket(8080)`: Tạo server lắng nghe port 8080
   - `serverSocket.accept()`: Chờ và chấp nhận kết nối từ client
   - Phương thức này **blocking** - chương trình sẽ dừng lại chờ client

2. **Socket**: Đại diện cho kết nối giữa client và server
   - `new Socket("localhost", 8080)`: Kết nối đến server
   - `getInputStream()`: Luồng để đọc dữ liệu từ đối phương
   - `getOutputStream()`: Luồng để gửi dữ liệu đến đối phương

**I/O Streams:**

- **BufferedReader**: Đọc dữ liệu dạng text theo dòng
- **PrintWriter**: Ghi dữ liệu dạng text, tự động flush
- **InputStreamReader**: Chuyển đổi byte stream thành character stream

**Luồng hoạt động:**

1. Server tạo ServerSocket và chờ kết nối
2. Client tạo Socket và kết nối đến server
3. Server chấp nhận kết nối và tạo Socket mới
4. Hai bên trao đổi dữ liệu qua InputStream/OutputStream
5. Đóng kết nối và giải phóng tài nguyên

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng TCP Socket:**

- **Web Servers**: HTTP được xây dựng trên TCP
- **Database Connections**: MySQL, PostgreSQL
- **Email**: SMTP, POP3, IMAP
- **File Transfer**: FTP, SFTP
- **Remote Desktop**: SSH, RDP
- **Gaming**: Multiplayer games
- **Chat Applications**: WhatsApp, Telegram

**Debugging Tips:**

- Luôn đóng Socket và ServerSocket trong finally block
- Sử dụng try-with-resources để tự động đóng resources
- Kiểm tra port có bị chiếm dụng không: `netstat -an | grep 8080`
- Sử dụng timeout để tránh blocking vô hạn

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng TCP Socket như một cuộc gọi điện thoại:

**ServerSocket** giống như tổng đài điện thoại:

- Bạn đăng ký số điện thoại (port 8080)
- Tổng đài sẽ chờ cuộc gọi đến
- Khi có người gọi, tổng đài kết nối hai bên lại với nhau

**Socket** như chiếc điện thoại của bạn:

- Bạn có thể nghe (InputStream) và nói (OutputStream)
- Cuộc trò chuyện có thứ tự, không bị mất từ
- Cả hai bên phải đồng ý mới có thể kết thúc cuộc gọi

**accept()** như việc nhấc máy:

- Khi điện thoại reo, bạn phải nhấc máy để nghe
- Nếu không nhấc máy, cuộc gọi sẽ bị từ chối

# 🧩 Tổng kết ngắn

- ✅ TCP Socket là nền tảng của mọi ứng dụng mạng
- ✅ ServerSocket lắng nghe kết nối, Socket đại diện cho kết nối
- ✅ InputStream/OutputStream để trao đổi dữ liệu
- ✅ Luôn nhớ đóng kết nối để giải phóng tài nguyên
- ✅ Blocking I/O có thể làm chương trình chậm

**Xem bài tiếp theo →** [TCP Server Đa luồng](./02-tcp-multithreaded-server.md)
