---
title: "Fetch API Cơ bản - Giao tiếp với REST APIs"
description: "Học cách sử dụng Fetch API để gửi HTTP requests, xử lý JSON và làm việc với REST APIs"
date: 2025-09-20
tags: ["JavaScript", "Fetch API", "HTTP", "REST API", "JSON"]
series: "Lập trình mạng với JavaScript"
prev: "./00-intro-environment.md"
next: "./02-fetch-abortcontroller.md"
---

## 📚 Series Overview

<div class="series-table">

| # | Bài viết | Liên kết |
|:-:|:---------------------------|:------------------------------|
| 00 | Giới thiệu & Chuẩn bị môi trường | [00-intro-environment](./00-intro-environment.md) |
| 01 | Fetch API cơ bản | [01-fetch-basic](./01-fetch-basic.md) |
| 02 | Fetch với AbortController | [02-fetch-abortcontroller](./02-fetch-abortcontroller.md) |
| 03 | WebSocket giới thiệu | [03-websocket-intro](./03-websocket-intro.md) |
| 04 | SSE vs WebSocket | [04-sse-vs-websocket](./04-sse-vs-websocket.md) |
| 05 | Service Worker | [05-service-worker](./05-service-worker.md) |
| 06 | PWA Manifest | [06-pwa-manifest](./06-pwa-manifest.md) |
| 07 | DevTools Network | [07-devtools-network](./07-devtools-network.md) |
| 08 | Tổng kết & Feynman Review | [08-summary-feynman](./08-summary-feynman.md) |

</div>

# 🧠 Giới thiệu

Fetch API là cách hiện đại để thực hiện HTTP requests trong JavaScript. Nó thay thế XMLHttpRequest cũ kỹ và cung cấp API đơn giản, dễ sử dụng hơn với Promise-based approach.

Trong bài này, chúng ta sẽ học cách sử dụng Fetch API để gửi GET, POST, PUT, DELETE requests, xử lý JSON data, và làm việc với REST APIs một cách hiệu quả.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**basic-fetch.js - Fetch API cơ bản:**

```javascript
// GET request - Lấy dữ liệu
async function fetchData() {
    try {
        console.log('🧪 Đang gửi GET request...');
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        
        // Kiểm tra status code
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ GET thành công!');
        console.log('📊 Dữ liệu:', data);
        
        return data;
        
    } catch (error) {
        console.error('❌ Lỗi GET request:', error.message);
    }
}

// POST request - Gửi dữ liệu
async function postData() {
    try {
        console.log('🧪 Đang gửi POST request...');
        
        const postData = {
            title: 'Bài viết mới từ JavaScript',
            body: 'Nội dung bài viết được tạo từ Fetch API',
            userId: 1
        };
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ POST thành công!');
        console.log('📊 Kết quả:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi POST request:', error.message);
    }
}

// PUT request - Cập nhật dữ liệu
async function updateData() {
    try {
        console.log('🧪 Đang gửi PUT request...');
        
        const updateData = {
            id: 1,
            title: 'Bài viết đã được cập nhật',
            body: 'Nội dung mới được cập nhật từ Fetch API',
            userId: 1
        };
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ PUT thành công!');
        console.log('📊 Kết quả:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi PUT request:', error.message);
    }
}

// DELETE request - Xóa dữ liệu
async function deleteData() {
    try {
        console.log('🧪 Đang gửi DELETE request...');
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ DELETE thành công!');
        console.log('📊 Status:', response.status);
        
        return response.status;
        
    } catch (error) {
        console.error('❌ Lỗi DELETE request:', error.message);
    }
}

// Chạy tất cả examples
async function runExamples() {
    console.log('🚀 Bắt đầu Fetch API Examples...\n');
    
    await fetchData();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await postData();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await updateData();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await deleteData();
    
    console.log('\n🎉 Hoàn thành tất cả examples!');
}

// Chạy examples
runExamples();
```

**fetch-with-headers.js - Fetch với custom headers:**

```javascript
// Fetch với custom headers
async function fetchWithHeaders() {
    try {
        console.log('🧪 Đang gửi request với custom headers...');
        
        const response = await fetch('https://httpbin.org/headers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-token-here',
                'User-Agent': 'JavaScript Fetch API Client',
                'X-Custom-Header': 'Custom Value'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Request với headers thành công!');
        console.log('📊 Response:', data);
        
        return data;
        
    } catch (error) {
        console.error('❌ Lỗi request với headers:', error.message);
    }
}

// Fetch với query parameters
async function fetchWithQueryParams() {
    try {
        console.log('🧪 Đang gửi request với query parameters...');
        
        const params = new URLSearchParams({
            page: '1',
            limit: '10',
            sort: 'date',
            order: 'desc'
        });
        
        const url = `https://httpbin.org/get?${params}`;
        console.log('🔗 URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Request với query params thành công!');
        console.log('📊 Response:', data);
        
        return data;
        
    } catch (error) {
        console.error('❌ Lỗi request với query params:', error.message);
    }
}

// Chạy examples
fetchWithHeaders();
fetchWithQueryParams();
```

**fetch-error-handling.js - Xử lý lỗi nâng cao:**

```javascript
// Xử lý lỗi nâng cao
async function fetchWithErrorHandling() {
    try {
        console.log('🧪 Testing error handling...');
        
        // Test với URL không tồn tại
        const response = await fetch('https://httpbin.org/status/404');
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Không tìm thấy resource (404)');
            } else if (response.status === 500) {
                throw new Error('Lỗi server (500)');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log('✅ Request thành công!');
        console.log('📊 Data:', data);
        
    } catch (error) {
        if (error.name === 'TypeError') {
            console.error('❌ Network error:', error.message);
        } else if (error.name === 'SyntaxError') {
            console.error('❌ JSON parse error:', error.message);
        } else {
            console.error('❌ HTTP error:', error.message);
        }
    }
}

// Fetch với timeout
async function fetchWithTimeout(url, timeout = 5000) {
    try {
        console.log(`🧪 Fetching với timeout ${timeout}ms...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Request thành công!');
        console.log('📊 Data:', data);
        
        return data;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ Request timeout!');
        } else {
            console.error('❌ Request error:', error.message);
        }
    }
}

// Chạy examples
fetchWithErrorHandling();
fetchWithTimeout('https://httpbin.org/delay/2');
```

# ⚙️ Phân tích & Giải thích

**Fetch API vs XMLHttpRequest:**

1. **Fetch API**: Modern, Promise-based
   - Sử dụng async/await
   - Cleaner syntax
   - Better error handling
   - Stream support

2. **XMLHttpRequest**: Legacy, callback-based
   - Complex syntax
   - Callback hell
   - Limited error handling
   - No stream support

**Fetch Request Options:**

- **method**: HTTP method (GET, POST, PUT, DELETE)
- **headers**: Custom headers object
- **body**: Request body (string, FormData, Blob)
- **mode**: CORS mode (cors, no-cors, same-origin)
- **cache**: Cache strategy (no-cache, reload, force-cache)
- **credentials**: Include cookies (omit, same-origin, include)

**Response Methods:**

- **response.json()**: Parse JSON response
- **response.text()**: Get text response
- **response.blob()**: Get binary response
- **response.formData()**: Parse form data
- **response.arrayBuffer()**: Get array buffer

**Error Handling:**

- **Network errors**: TypeError khi không thể kết nối
- **HTTP errors**: Kiểm tra response.ok
- **Parse errors**: SyntaxError khi parse JSON
- **Timeout errors**: Sử dụng AbortController

**Best Practices:**

- Luôn kiểm tra response.ok
- Sử dụng try-catch để handle errors
- Implement timeout cho requests
- Validate response data
- Use appropriate headers

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng Fetch API:**

- **REST API Clients**: Giao tiếp với backend services
- **Data Fetching**: Lấy dữ liệu từ APIs
- **Form Submissions**: Gửi form data
- **File Uploads**: Upload files to server
- **Authentication**: Login/logout requests
- **Real-time Updates**: Polling for updates

**Common Use Cases:**

- **User Authentication**: Login, logout, token refresh
- **CRUD Operations**: Create, read, update, delete data
- **File Operations**: Upload, download, delete files
- **Search**: Search APIs với query parameters
- **Pagination**: Load more data với page parameters

**Performance Tips:**

- Sử dụng Promise.all() cho parallel requests
- Implement request caching
- Use appropriate HTTP methods
- Minimize request size
- Implement retry logic

**Security Considerations:**

- Validate input data
- Sanitize user input
- Use HTTPS for sensitive data
- Implement rate limiting
- Handle CORS properly

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng Fetch API như một người đưa thư thông minh:

**Fetch API** như người đưa thư có nhiều kỹ năng:
- Biết cách gửi thư đến đúng địa chỉ
- Có thể gửi nhiều loại thư khác nhau (GET, POST, PUT, DELETE)
- Biết cách đóng gói thư đúng cách
- Có thể gửi thư đồng thời đến nhiều nơi

**GET Request** như gửi thư hỏi thông tin:
- Gửi thư hỏi "Bạn có thông tin gì không?"
- Chờ thư phản hồi với thông tin
- Như gửi thư hỏi thời tiết

**POST Request** như gửi thư với nội dung:
- Gửi thư có nội dung quan trọng
- Chờ xác nhận đã nhận được
- Như gửi thư đăng ký khóa học

**PUT Request** như gửi thư cập nhật:
- Gửi thư để thay đổi thông tin cũ
- Chờ xác nhận đã cập nhật
- Như gửi thư thay đổi địa chỉ

**DELETE Request** như gửi thư hủy bỏ:
- Gửi thư để xóa thông tin
- Chờ xác nhận đã xóa
- Như gửi thư hủy đăng ký

**Headers** như tem và dấu bưu điện:
- Có thông tin về người gửi
- Có thông tin về loại thư
- Có thông tin về cách xử lý
- Như tem bưu điện có mã vạch

**Error Handling** như xử lý thư không đến:
- Kiểm tra thư có đến đúng nơi không
- Xử lý khi thư bị thất lạc
- Xử lý khi thư bị từ chối
- Như hệ thống bưu điện xử lý thư lỗi

# 🧩 Tổng kết ngắn

- ✅ Fetch API là cách hiện đại để thực hiện HTTP requests
- ✅ Sử dụng Promise-based approach với async/await
- ✅ Hỗ trợ tất cả HTTP methods (GET, POST, PUT, DELETE)
- ✅ Có thể gửi custom headers và query parameters
- ✅ Cần xử lý errors và implement timeout properly

**Xem bài tiếp theo →** [Fetch với AbortController](./02-fetch-abortcontroller.md)
