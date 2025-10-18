---
title: "Fetch với AbortController - Timeout và hủy request"
description: "Học cách sử dụng AbortController để hủy requests, implement timeout và xử lý race conditions"
date: 2025-09-21
tags:
  [
    "JavaScript",
    "AbortController",
    "Timeout",
    "Race Conditions",
    "Error Handling",
  ]
series: "Lập trình mạng với JavaScript"
prev: "/Kant_Nguyen_Astro_Blog/blog/01-fetch-basic/"
next: "/Kant_Nguyen_Astro_Blog/blog/03-websocket-intro/"
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

Trong thực tế, không phải lúc nào HTTP requests cũng thành công ngay lập tức. Có thể server phản hồi chậm, network bị lag, hoặc user muốn hủy request đang chạy. AbortController là API cho phép bạn hủy Fetch requests một cách graceful.

Bài này sẽ dạy bạn cách sử dụng AbortController để implement timeout, hủy requests khi cần thiết, và xử lý race conditions trong ứng dụng thực tế.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**abort-controller-basic.js - AbortController cơ bản:**

```javascript
// AbortController cơ bản
async function fetchWithAbortController() {
  try {
    console.log("🧪 Testing AbortController...");

    // Tạo AbortController
    const controller = new AbortController();
    const signal = controller.signal;

    // Fetch request với signal
    const fetchPromise = fetch("https://httpbin.org/delay/3", {
      signal: signal,
    });

    // Hủy request sau 2 giây
    setTimeout(() => {
      console.log("⏰ Hủy request sau 2 giây...");
      controller.abort();
    }, 2000);

    const response = await fetchPromise;
    const data = await response.json();

    console.log("✅ Request thành công!");
    console.log("📊 Data:", data);
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("❌ Request đã bị hủy!");
    } else {
      console.error("❌ Lỗi khác:", error.message);
    }
  }
}

// Fetch với timeout
async function fetchWithTimeout(url, timeout = 5000) {
  try {
    console.log(`🧪 Fetching với timeout ${timeout}ms...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout! Hủy request...");
      controller.abort();
    }, timeout);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    // Clear timeout nếu request thành công
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Request thành công!");
    console.log("📊 Data:", data);

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("❌ Request timeout!");
    } else {
      console.error("❌ Lỗi request:", error.message);
    }
  }
}

// Chạy examples
fetchWithAbortController();
fetchWithTimeout("https://httpbin.org/delay/2");
```

**race-conditions.js - Xử lý race conditions:**

```javascript
// Xử lý race conditions
class RequestManager {
  constructor() {
    this.activeRequests = new Map();
  }

  // Fetch với race condition protection
  async fetchWithRaceProtection(key, url, options = {}) {
    try {
      // Hủy request cũ nếu có
      if (this.activeRequests.has(key)) {
        console.log(`🔄 Hủy request cũ cho key: ${key}`);
        this.activeRequests.get(key).abort();
      }

      // Tạo AbortController mới
      const controller = new AbortController();
      this.activeRequests.set(key, controller);

      // Fetch request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      // Xóa khỏi active requests
      this.activeRequests.delete(key);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Request thành công cho key: ${key}`);
      console.log("📊 Data:", data);

      return data;
    } catch (error) {
      // Xóa khỏi active requests
      this.activeRequests.delete(key);

      if (error.name === "AbortError") {
        console.log(`❌ Request bị hủy cho key: ${key}`);
      } else {
        console.error(`❌ Lỗi request cho key: ${key}:`, error.message);
      }
      throw error;
    }
  }

  // Hủy tất cả requests
  abortAll() {
    console.log("🛑 Hủy tất cả requests...");
    for (const [key, controller] of this.activeRequests) {
      controller.abort();
    }
    this.activeRequests.clear();
  }

  // Hủy request cụ thể
  abortRequest(key) {
    if (this.activeRequests.has(key)) {
      console.log(`🛑 Hủy request cho key: ${key}`);
      this.activeRequests.get(key).abort();
      this.activeRequests.delete(key);
    }
  }
}

// Test race conditions
async function testRaceConditions() {
  const requestManager = new RequestManager();

  try {
    // Gửi nhiều requests cùng lúc với cùng key
    const promises = [
      requestManager.fetchWithRaceProtection(
        "search",
        "https://httpbin.org/delay/1"
      ),
      requestManager.fetchWithRaceProtection(
        "search",
        "https://httpbin.org/delay/2"
      ),
      requestManager.fetchWithRaceProtection(
        "search",
        "https://httpbin.org/delay/3"
      ),
    ];

    // Chỉ request cuối cùng sẽ thành công
    const result = await Promise.race(promises);
    console.log("🏆 Request thắng:", result);
  } catch (error) {
    console.error("❌ Lỗi race conditions:", error.message);
  }
}

// Chạy test
testRaceConditions();
```

**search-with-debounce.js - Search với debounce:**

```javascript
// Search với debounce và AbortController
class SearchManager {
  constructor() {
    this.searchController = null;
    this.searchTimeout = null;
  }

  // Search với debounce
  async search(query, delay = 300) {
    try {
      // Clear timeout cũ
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Hủy request cũ
      if (this.searchController) {
        this.searchController.abort();
      }

      // Tạo AbortController mới
      this.searchController = new AbortController();

      // Debounce search
      return new Promise((resolve, reject) => {
        this.searchTimeout = setTimeout(async () => {
          try {
            console.log(`🔍 Searching for: "${query}"`);

            const response = await fetch(
              `https://httpbin.org/get?q=${encodeURIComponent(query)}`,
              {
                signal: this.searchController.signal,
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Search thành công!");
            console.log("📊 Results:", data);

            resolve(data);
          } catch (error) {
            if (error.name === "AbortError") {
              console.log("❌ Search bị hủy");
            } else {
              console.error("❌ Lỗi search:", error.message);
            }
            reject(error);
          }
        }, delay);
      });
    } catch (error) {
      console.error("❌ Lỗi search manager:", error.message);
    }
  }

  // Hủy search hiện tại
  cancelSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    if (this.searchController) {
      this.searchController.abort();
      this.searchController = null;
    }

    console.log("🛑 Đã hủy search");
  }
}

// Test search với debounce
async function testSearchWithDebounce() {
  const searchManager = new SearchManager();

  try {
    // Simulate user typing
    const queries = ["a", "ab", "abc", "abcd"];

    for (const query of queries) {
      console.log(`\n📝 User typing: "${query}"`);
      await searchManager.search(query);

      // Wait a bit between keystrokes
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error("❌ Lỗi test search:", error.message);
  }
}

// Chạy test
testSearchWithDebounce();
```

**file-upload-with-progress.js - Upload file với progress:**

```javascript
// Upload file với progress và AbortController
class FileUploadManager {
  constructor() {
    this.uploadController = null;
  }

  // Upload file với progress
  async uploadFile(file, onProgress = null) {
    try {
      // Hủy upload cũ nếu có
      if (this.uploadController) {
        this.uploadController.abort();
      }

      // Tạo AbortController mới
      this.uploadController = new AbortController();

      // Tạo FormData
      const formData = new FormData();
      formData.append("file", file);

      console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`);

      // Upload với fetch
      const response = await fetch("https://httpbin.org/post", {
        method: "POST",
        body: formData,
        signal: this.uploadController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Upload thành công!");
      console.log("📊 Response:", data);

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("❌ Upload bị hủy!");
      } else {
        console.error("❌ Lỗi upload:", error.message);
      }
      throw error;
    }
  }

  // Hủy upload
  cancelUpload() {
    if (this.uploadController) {
      console.log("🛑 Hủy upload...");
      this.uploadController.abort();
      this.uploadController = null;
    }
  }
}

// Test upload file
async function testFileUpload() {
  const uploadManager = new FileUploadManager();

  try {
    // Tạo file test
    const file = new File(["Hello World!"], "test.txt", { type: "text/plain" });

    // Upload file
    await uploadManager.uploadFile(file);
  } catch (error) {
    console.error("❌ Lỗi test upload:", error.message);
  }
}

// Chạy test
testFileUpload();
```

# ⚙️ Phân tích & Giải thích

**AbortController API:**

1. **AbortController**: Controller để hủy operations

   - `new AbortController()`: Tạo controller mới
   - `controller.signal`: Signal để pass vào fetch
   - `controller.abort()`: Hủy operation

2. **AbortSignal**: Signal object
   - `signal.aborted`: Boolean cho biết đã bị hủy chưa
   - `signal.addEventListener('abort', handler)`: Listen abort event

**Use Cases:**

- **Timeout**: Hủy request sau thời gian nhất định
- **Race Conditions**: Hủy request cũ khi có request mới
- **User Cancellation**: Cho phép user hủy request
- **Cleanup**: Hủy requests khi component unmount

**Error Handling:**

- **AbortError**: Khi request bị hủy
- **Network Error**: Khi không thể kết nối
- **HTTP Error**: Khi server trả về error status

**Best Practices:**

- Luôn check `error.name === 'AbortError'`
- Clear timeouts khi request thành công
- Implement cleanup trong component lifecycle
- Use unique keys cho request management

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng AbortController:**

- **Search**: Debounce search requests
- **File Upload**: Hủy upload khi cần
- **Data Fetching**: Hủy requests cũ khi có data mới
- **Navigation**: Hủy requests khi user navigate away
- **Real-time Updates**: Hủy polling khi không cần

**Common Patterns:**

- **Request Manager**: Quản lý multiple requests
- **Debounce**: Delay requests để tránh spam
- **Race Protection**: Hủy request cũ khi có request mới
- **Timeout**: Hủy request sau thời gian nhất định

**Performance Benefits:**

- Giảm network traffic
- Tránh memory leaks
- Cải thiện user experience
- Tối ưu resource usage

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng AbortController như một công tắc điện:

**AbortController** như công tắc điện thông minh:

- Có thể bật/tắt bất kỳ lúc nào
- Khi tắt, tất cả thiết bị đều dừng hoạt động
- Như công tắc tổng trong nhà

**Fetch Request** như thiết bị điện:

- Chạy khi có điện (signal)
- Dừng ngay khi mất điện (abort)
- Như máy tính chạy khi có điện

**Timeout** như đồng hồ báo thức:

- Tự động tắt sau thời gian nhất định
- Như đồng hồ báo thức tự tắt sau 5 phút
- Tránh để thiết bị chạy quá lâu

**Race Conditions** như nhiều người cùng bật TV:

- Chỉ một người có thể bật TV
- Người sau sẽ tắt TV của người trước
- Như remote control chỉ điều khiển một TV

**Debounce** như công tắc có độ trễ:

- Không phản hồi ngay lập tức
- Chờ một lúc rồi mới hoạt động
- Như công tắc đèn có độ trễ 3 giây

**Request Manager** như tổng đài điện:

- Quản lý tất cả cuộc gọi
- Có thể hủy cuộc gọi bất kỳ lúc nào
- Như tổng đài có thể ngắt cuộc gọi

**Error Handling** như hệ thống báo động:

- Báo khi có sự cố
- Xử lý các tình huống khác nhau
- Như hệ thống báo động báo cháy, trộm

# 🧩 Tổng kết ngắn

- ✅ AbortController cho phép hủy Fetch requests một cách graceful
- ✅ Có thể implement timeout và race condition protection
- ✅ Hữu ích cho search, upload, và data fetching
- ✅ Cần xử lý AbortError properly
- ✅ Cải thiện performance và user experience

**Xem bài tiếp theo →** [WebSocket Giới thiệu](/Kant_Nguyen_Astro_Blog/blog/03-websocket-intro/)
