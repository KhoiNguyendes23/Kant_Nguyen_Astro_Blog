---
title: "HTTP Client API - Giao tiếp với REST APIs"
description: "Học cách sử dụng Java 11 HttpClient để gửi HTTP requests, xử lý JSON và làm việc với REST APIs"
date: 2025-09-14
tags: ["Java", "HTTP", "REST API", "JSON", "HttpClient"]
series: "Lập trình mạng với Java"
prev: "/Kant_Nguyen_Astro_Blog/blog/03-udp-datagram/"
next: "/Kant_Nguyen_Astro_Blog/blog/05-https-tls/"
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

Trong thời đại microservices và REST APIs, việc giao tiếp với các web services là kỹ năng thiết yếu. Java 11 đã giới thiệu HttpClient API mới, thay thế cho HttpURLConnection cũ kỹ và cung cấp API hiện đại, async và dễ sử dụng hơn.

HttpClient hỗ trợ HTTP/2, async operations, và tích hợp tốt với CompletableFuture và Stream API.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**BasicHttpClient.java - HTTP Client cơ bản:**

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;
import java.io.IOException;

public class BasicHttpClient {
    public static void main(String[] args) {
        try {
            // Tạo HttpClient với configuration
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

            // Tạo GET request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://jsonplaceholder.typicode.com/posts/1"))
                .timeout(Duration.ofSeconds(30))
                .header("User-Agent", "Java HttpClient")
                .GET()
                .build();

            // Gửi request và nhận response
            HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

            // In kết quả
            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Headers: " + response.headers().map());
            System.out.println("Body: " + response.body());

        } catch (IOException | InterruptedException e) {
            System.err.println("❌ Lỗi HTTP request: " + e.getMessage());
        }
    }
}
```

**PostRequestExample.java - Gửi POST request với JSON:**

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;
import java.io.IOException;

public class PostRequestExample {
    public static void main(String[] args) {
        try {
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

            // JSON data để gửi
            String jsonData = """
                {
                    "title": "Bài viết mới từ Java",
                    "body": "Nội dung bài viết được tạo từ HttpClient",
                    "userId": 1
                }
                """;

            // Tạo POST request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://jsonplaceholder.typicode.com/posts"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("User-Agent", "Java HttpClient")
                .POST(HttpRequest.BodyPublishers.ofString(jsonData))
                .build();

            // Gửi request
            HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Response Body: " + response.body());

        } catch (IOException | InterruptedException e) {
            System.err.println("❌ Lỗi POST request: " + e.getMessage());
        }
    }
}
```

**AsyncHttpClient.java - Async HTTP requests:**

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.List;

public class AsyncHttpClient {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        // Danh sách URLs để fetch
        List<String> urls = List.of(
            "https://jsonplaceholder.typicode.com/posts/1",
            "https://jsonplaceholder.typicode.com/posts/2",
            "https://jsonplaceholder.typicode.com/posts/3"
        );

        // Tạo async requests
        List<CompletableFuture<HttpResponse<String>>> futures = urls.stream()
            .map(url -> {
                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(30))
                    .GET()
                    .build();

                return client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
            })
            .toList();

        // Chờ tất cả requests hoàn thành
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenRun(() -> {
                System.out.println("✅ Tất cả requests đã hoàn thành!");

                futures.forEach(future -> {
                    try {
                        HttpResponse<String> response = future.get();
                        System.out.println("Status: " + response.statusCode() +
                                         " - Body length: " + response.body().length());
                    } catch (Exception e) {
                        System.err.println("❌ Lỗi async request: " + e.getMessage());
                    }
                });
            });

        // Chờ để chương trình không kết thúc sớm
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

**WeatherApiClient.java - Ví dụ thực tế với OpenWeatherMap:**

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;
import java.io.IOException;

public class WeatherApiClient {
    private static final String API_KEY = "your_api_key_here";
    private static final String BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: java WeatherApiClient <city_name>");
            return;
        }

        String city = args[0];

        try {
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

            // Tạo URL với query parameters
            String url = BASE_URL + "?q=" + city + "&appid=" + API_KEY + "&units=metric";

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("User-Agent", "Java Weather Client")
                .GET()
                .build();

            HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("🌤️ Thông tin thời tiết cho " + city + ":");
                System.out.println(response.body());
            } else {
                System.out.println("❌ Lỗi API: " + response.statusCode());
                System.out.println(response.body());
            }

        } catch (IOException | InterruptedException e) {
            System.err.println("❌ Lỗi weather API: " + e.getMessage());
        }
    }
}
```

# ⚙️ Phân tích & Giải thích

**HttpClient Configuration:**

1. **HttpClient.newBuilder()**: Tạo client với custom configuration

   - `connectTimeout()`: Timeout cho việc kết nối
   - `followRedirects()`: Tự động follow redirects
   - `proxy()`: Cấu hình proxy nếu cần

2. **HttpRequest.newBuilder()**: Tạo request với các options
   - `uri()`: URL đích
   - `timeout()`: Timeout cho request
   - `header()`: Thêm HTTP headers
   - `GET()`, `POST()`, `PUT()`, `DELETE()`: HTTP methods

**Body Handlers:**

- `BodyHandlers.ofString()`: Nhận response dạng String
- `BodyHandlers.ofByteArray()`: Nhận response dạng byte array
- `BodyHandlers.ofFile()`: Lưu response vào file
- `BodyHandlers.ofInputStream()`: Nhận response dạng InputStream

**Async Operations:**

- `sendAsync()`: Gửi request bất đồng bộ
- Trả về `CompletableFuture<HttpResponse<T>>`
- Có thể chain với `.thenApply()`, `.thenAccept()`
- `CompletableFuture.allOf()` để chờ nhiều requests

**Error Handling:**

- `IOException`: Lỗi network hoặc I/O
- `InterruptedException`: Request bị interrupt
- Kiểm tra `statusCode()` để xử lý HTTP errors
- Timeout handling với `Duration`

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng HttpClient:**

- **REST API Clients**: Giao tiếp với microservices
- **Web Scraping**: Lấy dữ liệu từ websites
- **Data Integration**: Đồng bộ dữ liệu giữa systems
- **Monitoring**: Health checks và metrics
- **Third-party APIs**: Payment, social media, weather
- **Mobile Backend**: API cho mobile apps

**Best Practices:**

- Sử dụng connection pooling để tái sử dụng connections
- Implement retry logic cho failed requests
- Sử dụng async operations cho better performance
- Validate và sanitize input data
- Log requests/responses cho debugging

**Common Mistakes:**

- Không set timeout → có thể hang forever
- Không handle exceptions properly
- Sử dụng blocking calls trong async context
- Không validate response status codes
- Hardcode API keys trong source code

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng HttpClient như một người đưa thư thông minh:

**HttpClient** như người đưa thư có nhiều kỹ năng:

- Biết cách gửi thư đến đúng địa chỉ
- Có thể gửi nhiều loại thư khác nhau (GET, POST, PUT)
- Biết cách đóng gói thư đúng cách
- Có thể gửi thư đồng thời đến nhiều nơi

**HttpRequest** như phong bì thư:

- Có địa chỉ người nhận (URI)
- Có nội dung bên trong (body)
- Có tem và dấu bưu điện (headers)
- Có thời hạn gửi (timeout)

**HttpResponse** như thư phản hồi:

- Có mã trạng thái (status code) - thư có đến không?
- Có nội dung phản hồi (body)
- Có thông tin về người gửi (headers)

**Async Operations** như gửi thư không cần chờ:

- Gửi thư đi và làm việc khác
- Khi có phản hồi, người đưa thư sẽ báo
- Có thể gửi nhiều thư cùng lúc
- Hiệu quả hơn việc gửi từng thư một

# 🧩 Tổng kết ngắn

- ✅ HttpClient API hiện đại và dễ sử dụng hơn HttpURLConnection
- ✅ Hỗ trợ async operations với CompletableFuture
- ✅ Có thể gửi GET, POST, PUT, DELETE requests
- ✅ Tích hợp tốt với Java Stream API
- ✅ Cần xử lý exceptions và timeouts properly

**Xem bài tiếp theo →** [HTTPS và TLS](/Kant_Nguyen_Astro_Blog/blog/05-https-tls/)
