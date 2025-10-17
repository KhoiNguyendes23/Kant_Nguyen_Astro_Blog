---
title: "HTTPS và TLS - Bảo mật kết nối mạng"
description: "Học cách thiết lập HTTPS, hiểu TLS handshake, và xử lý SSL certificates trong Java"
date: 2025-10-27
tags: ["Java", "HTTPS", "TLS", "SSL", "Security", "Certificates"]
series: "Lập trình mạng với Java"
prev: "./04-httpclient-api.md"
next: "./06-websocket-java.md"
---

# 🧠 Giới thiệu

Trong thời đại số, bảo mật thông tin là ưu tiên hàng đầu. HTTPS (HTTP Secure) sử dụng TLS (Transport Layer Security) để mã hóa dữ liệu truyền qua mạng, đảm bảo tính bảo mật và toàn vẹn dữ liệu.

Bài này sẽ dạy bạn cách thiết lập HTTPS client/server, hiểu TLS handshake process, và xử lý SSL certificates trong Java.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**HttpsClientExample.java - HTTPS Client cơ bản:**

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;
import java.io.IOException;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

public class HttpsClientExample {
    public static void main(String[] args) {
        try {
            // Tạo SSLContext với custom TrustManager (chỉ dùng cho testing)
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            }, new java.security.SecureRandom());
            
            // Tạo HttpClient với custom SSLContext
            HttpClient client = HttpClient.newBuilder()
                .sslContext(sslContext)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
            
            // Tạo HTTPS request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://httpbin.org/get"))
                .timeout(Duration.ofSeconds(30))
                .header("User-Agent", "Java HTTPS Client")
                .GET()
                .build();
            
            // Gửi request
            HttpResponse<String> response = client.send(request, 
                HttpResponse.BodyHandlers.ofString());
            
            System.out.println("🔒 HTTPS Request thành công!");
            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Response Body: " + response.body());
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi HTTPS request: " + e.getMessage());
        }
    }
}
```

**CertificateValidationExample.java - Xử lý certificates:**

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;
import java.io.IOException;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import java.security.KeyStore;
import java.io.FileInputStream;

public class CertificateValidationExample {
    public static void main(String[] args) {
        try {
            // Load custom truststore (nếu có)
            KeyStore trustStore = KeyStore.getInstance("JKS");
            FileInputStream trustStoreFile = new FileInputStream("truststore.jks");
            trustStore.load(trustStoreFile, "password".toCharArray());
            trustStoreFile.close();
            
            // Tạo TrustManagerFactory
            TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
            tmf.init(trustStore);
            
            // Tạo SSLContext với custom truststore
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, tmf.getTrustManagers(), null);
            
            // Tạo HttpClient
            HttpClient client = HttpClient.newBuilder()
                .sslContext(sslContext)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
            
            // Test với self-signed certificate
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://self-signed.badssl.com/"))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
            
            HttpResponse<String> response = client.send(request, 
                HttpResponse.BodyHandlers.ofString());
            
            System.out.println("✅ Certificate validation thành công!");
            System.out.println("Status Code: " + response.statusCode());
            
        } catch (Exception e) {
            System.err.println("❌ Certificate validation failed: " + e.getMessage());
        }
    }
}
```

**HttpsServerExample.java - HTTPS Server đơn giản:**

```java
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.InetSocketAddress;
import javax.net.ssl.SSLContext;
import javax.net.ssl.KeyManagerFactory;
import java.security.KeyStore;
import java.io.FileInputStream;

public class HttpsServerExample {
    public static void main(String[] args) {
        try {
            // Load keystore với server certificate
            KeyStore keyStore = KeyStore.getInstance("JKS");
            FileInputStream keyStoreFile = new FileInputStream("keystore.jks");
            keyStore.load(keyStoreFile, "password".toCharArray());
            keyStoreFile.close();
            
            // Tạo KeyManagerFactory
            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
            kmf.init(keyStore, "password".toCharArray());
            
            // Tạo SSLContext
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(kmf.getKeyManagers(), null, null);
            
            // Tạo HTTPS server
            HttpsServer server = HttpsServer.create(new InetSocketAddress(8443), 0);
            server.setHttpsConfigurator(new HttpsConfigurator(sslContext));
            
            // Tạo context và handler
            server.createContext("/", new HttpsHandler());
            
            // Bắt đầu server
            server.start();
            System.out.println("🔒 HTTPS Server đang chạy trên port 8443");
            System.out.println("Truy cập: https://localhost:8443/");
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi HTTPS server: " + e.getMessage());
        }
    }
    
    static class HttpsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = """
                <html>
                <head><title>HTTPS Server</title></head>
                <body>
                    <h1>🔒 HTTPS Server hoạt động!</h1>
                    <p>Kết nối này đã được mã hóa bằng TLS.</p>
                    <p>Thời gian: """ + new java.util.Date() + """</p>
                </body>
                </html>
                """;
            
            exchange.getResponseHeaders().set("Content-Type", "text/html");
            exchange.sendResponseHeaders(200, response.getBytes().length);
            
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}
```

**TlsHandshakeDebug.java - Debug TLS handshake:**

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;
import java.io.IOException;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.HttpsURLConnection;
import java.net.URL;

public class TlsHandshakeDebug {
    public static void main(String[] args) {
        try {
            // Enable SSL debugging
            System.setProperty("javax.net.debug", "ssl:handshake");
            
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.google.com"))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
            
            HttpResponse<String> response = client.send(request, 
                HttpResponse.BodyHandlers.ofString());
            
            System.out.println("✅ TLS handshake thành công!");
            System.out.println("Status Code: " + response.statusCode());
            
            // In thông tin SSL session
            URL url = new URL("https://www.google.com");
            HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
            SSLSession session = connection.getSSLSession();
            
            System.out.println("\n🔍 SSL Session Info:");
            System.out.println("Protocol: " + session.getProtocol());
            System.out.println("Cipher Suite: " + session.getCipherSuite());
            System.out.println("Peer Host: " + session.getPeerHost());
            System.out.println("Peer Port: " + session.getPeerPort());
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi TLS handshake: " + e.getMessage());
        }
    }
}
```

# ⚙️ Phân tích & Giải thích

**TLS Handshake Process:**

1. **Client Hello**: Client gửi supported cipher suites và TLS version
2. **Server Hello**: Server chọn cipher suite và gửi certificate
3. **Certificate Verification**: Client verify server certificate
4. **Key Exchange**: Client và server trao đổi keys
5. **Finished**: Cả hai bên confirm handshake thành công

**SSLContext Configuration:**

- `SSLContext.getInstance("TLS")`: Tạo SSL context với TLS protocol
- `init(keyManagers, trustManagers, secureRandom)`: Initialize với managers
- KeyManager: Quản lý client certificates
- TrustManager: Quản lý server certificates để trust

**Certificate Types:**

- **Self-signed**: Certificate tự ký (không được CA verify)
- **CA-signed**: Certificate được Certificate Authority verify
- **Wildcard**: Certificate cho nhiều subdomains (*.example.com)
- **SAN**: Subject Alternative Name certificate

**Security Best Practices:**

- Sử dụng TLS 1.2 hoặc 1.3 (tránh SSL 3.0, TLS 1.0/1.1)
- Validate certificate chain properly
- Implement certificate pinning cho mobile apps
- Sử dụng strong cipher suites
- Regular certificate renewal

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng HTTPS:**

- **E-commerce**: Payment processing, customer data
- **Banking**: Online banking, financial transactions
- **Healthcare**: Patient data, medical records
- **Government**: Citizen services, tax filing
- **Social Media**: User authentication, private messages
- **Cloud Services**: API authentication, data transfer

**Certificate Management:**

- **Let's Encrypt**: Free SSL certificates
- **Commercial CAs**: DigiCert, Comodo, Symantec
- **Internal CAs**: Enterprise certificate authorities
- **Certificate Monitoring**: Expiry alerts, renewal automation

**Common Issues:**

- **Certificate Expiry**: Certificates có thời hạn sử dụng
- **Chain Issues**: Missing intermediate certificates
- **Hostname Mismatch**: Certificate không match với domain
- **Weak Cipher Suites**: Sử dụng cipher suites không an toàn

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng HTTPS như một cuộc trò chuyện bí mật:

**HTTP** như nói chuyện bình thường:
- Mọi người xung quanh đều nghe được
- Không có mã hóa gì cả
- Như nói chuyện trong quán cà phê đông người

**HTTPS** như nói chuyện bằng mã Morse:
- Chỉ hai người biết cách giải mã
- Người khác nghe được nhưng không hiểu
- Cần có "chìa khóa" để giải mã

**TLS Handshake** như việc thỏa thuận mã Morse:
- Hai bên phải đồng ý về cách mã hóa
- Kiểm tra danh tính của nhau (certificate)
- Trao đổi "chìa khóa" để mã hóa/giải mã
- Xác nhận cả hai đều hiểu cách thức

**Certificate** như giấy tờ tùy thân:
- Chứng minh bạn là ai
- Được cơ quan có thẩm quyền cấp (CA)
- Có thể kiểm tra tính hợp lệ
- Có thời hạn sử dụng

**Trust Store** như danh sách cơ quan có thẩm quyền:
- Danh sách các CA đáng tin cậy
- Chỉ tin tưởng certificates từ các CA này
- Như danh sách các cơ quan cấp giấy tờ hợp lệ

# 🧩 Tổng kết ngắn

- ✅ HTTPS sử dụng TLS để mã hóa dữ liệu truyền qua mạng
- ✅ TLS handshake thiết lập kết nối bảo mật giữa client và server
- ✅ Certificate validation đảm bảo danh tính của server
- ✅ SSLContext quản lý SSL/TLS configuration
- ✅ Cần xử lý certificate errors và security best practices

**Xem bài tiếp theo →** [WebSocket với Java](./06-websocket-java.md)
