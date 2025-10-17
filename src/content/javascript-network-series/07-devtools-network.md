---
title: "DevTools Network - Phân tích và debug network"
description: "Học cách sử dụng Chrome DevTools Network tab để phân tích requests, timing, headers và debug network issues"
date: 2025-09-26
tags: ["JavaScript", "DevTools", "Network", "Debugging", "Performance"]
series: "Lập trình mạng với JavaScript"
prev: "./06-pwa-manifest.md"
next: "./08-summary-feynman.md"
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

Chrome DevTools Network tab là công cụ mạnh mẽ để phân tích và debug các vấn đề về network trong ứng dụng web. Nó cho phép bạn monitor tất cả HTTP requests, phân tích timing, headers, response data, và identify performance bottlenecks.

Bài này sẽ dạy bạn cách sử dụng Network tab hiệu quả để debug network issues, optimize performance, và hiểu rõ hơn về cách ứng dụng web giao tiếp với server.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**network-debug-demo.html - Demo page để test Network tab:**

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Network Debug Demo</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .section {
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      .section h3 {
        margin-top: 0;
        color: #2196f3;
      }
      .button {
        background: #2196f3;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
      }
      .button:hover {
        background: #1976d2;
      }
      .button.danger {
        background: #f44336;
      }
      .button.danger:hover {
        background: #d32f2f;
      }
      .button.success {
        background: #4caf50;
      }
      .button.success:hover {
        background: #45a049;
      }
      .log {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 5px;
        padding: 15px;
        margin: 10px 0;
        font-family: monospace;
        font-size: 14px;
        max-height: 200px;
        overflow-y: auto;
      }
      .status {
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        font-weight: bold;
      }
      .status.success {
        background: #d4edda;
        color: #155724;
      }
      .status.error {
        background: #f8d7da;
        color: #721c24;
      }
      .status.info {
        background: #d1ecf1;
        color: #0c5460;
      }
      .form-group {
        margin: 10px 0;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      }
      .timing-info {
        background: #e3f2fd;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
      }
      .timing-info h4 {
        margin-top: 0;
        color: #1976d2;
      }
      .timing-bar {
        background: #f0f0f0;
        height: 20px;
        border-radius: 10px;
        margin: 5px 0;
        position: relative;
        overflow: hidden;
      }
      .timing-segment {
        height: 100%;
        position: absolute;
        top: 0;
      }
      .timing-dns {
        background: #ff9800;
      }
      .timing-tcp {
        background: #4caf50;
      }
      .timing-ssl {
        background: #9c27b0;
      }
      .timing-request {
        background: #2196f3;
      }
      .timing-response {
        background: #f44336;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🔍 Network Debug Demo</h1>
      <p>
        Mở Chrome DevTools (F12) và chuyển đến tab Network để xem các requests
        được gửi đi.
      </p>

      <!-- Basic Requests Section -->
      <div class="section">
        <h3>📡 Basic Requests</h3>
        <p>Test các loại HTTP requests cơ bản:</p>
        <button class="button" onclick="testGetRequest()">GET Request</button>
        <button class="button" onclick="testPostRequest()">POST Request</button>
        <button class="button" onclick="testPutRequest()">PUT Request</button>
        <button class="button" onclick="testDeleteRequest()">
          DELETE Request
        </button>
        <div id="basic-log" class="log"></div>
      </div>

      <!-- Error Handling Section -->
      <div class="section">
        <h3>❌ Error Handling</h3>
        <p>Test các trường hợp lỗi network:</p>
        <button class="button danger" onclick="test404Error()">
          404 Error
        </button>
        <button class="button danger" onclick="test500Error()">
          500 Error
        </button>
        <button class="button danger" onclick="testTimeout()">Timeout</button>
        <button class="button danger" onclick="testNetworkError()">
          Network Error
        </button>
        <div id="error-log" class="log"></div>
      </div>

      <!-- Performance Section -->
      <div class="section">
        <h3>⚡ Performance Testing</h3>
        <p>Test performance với nhiều requests:</p>
        <button class="button" onclick="testSequentialRequests()">
          Sequential Requests
        </button>
        <button class="button" onclick="testParallelRequests()">
          Parallel Requests
        </button>
        <button class="button" onclick="testLargeResponse()">
          Large Response
        </button>
        <button class="button" onclick="testSlowResponse()">
          Slow Response
        </button>
        <div id="performance-log" class="log"></div>
      </div>

      <!-- Custom Requests Section -->
      <div class="section">
        <h3>🔧 Custom Requests</h3>
        <div class="form-group">
          <label for="custom-url">URL:</label>
          <input
            type="text"
            id="custom-url"
            value="https://httpbin.org/get"
            placeholder="Enter URL"
          />
        </div>
        <div class="form-group">
          <label for="custom-method">Method:</label>
          <select id="custom-method">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div class="form-group">
          <label for="custom-headers">Headers (JSON):</label>
          <textarea
            id="custom-headers"
            rows="3"
            placeholder='{"Content-Type": "application/json"}'
          ></textarea>
        </div>
        <div class="form-group">
          <label for="custom-body">Body:</label>
          <textarea
            id="custom-body"
            rows="3"
            placeholder='{"key": "value"}'
          ></textarea>
        </div>
        <button class="button success" onclick="testCustomRequest()">
          Send Custom Request
        </button>
        <div id="custom-log" class="log"></div>
      </div>

      <!-- Timing Analysis Section -->
      <div class="section">
        <h3>⏱️ Timing Analysis</h3>
        <p>Phân tích timing của requests:</p>
        <button class="button" onclick="analyzeTiming()">
          Analyze Request Timing
        </button>
        <div id="timing-analysis" class="timing-info" style="display: none;">
          <h4>Request Timing Breakdown</h4>
          <div id="timing-breakdown"></div>
        </div>
      </div>

      <!-- WebSocket Section -->
      <div class="section">
        <h3>🔌 WebSocket Testing</h3>
        <p>Test WebSocket connections:</p>
        <button class="button" onclick="testWebSocket()">
          Connect WebSocket
        </button>
        <button class="button" onclick="sendWebSocketMessage()">
          Send Message
        </button>
        <button class="button danger" onclick="closeWebSocket()">
          Close Connection
        </button>
        <div id="websocket-log" class="log"></div>
      </div>

      <!-- Service Worker Section -->
      <div class="section">
        <h3>👷 Service Worker Testing</h3>
        <p>Test Service Worker requests:</p>
        <button class="button" onclick="testServiceWorker()">
          Test Service Worker
        </button>
        <button class="button" onclick="testOfflineMode()">
          Test Offline Mode
        </button>
        <div id="sw-log" class="log"></div>
      </div>
    </div>

    <script>
      // Logging utility
      function log(elementId, message, type = "info") {
        const logElement = document.getElementById(elementId);
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement("div");
        logEntry.className = `status ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;
      }

      // Basic Requests
      async function testGetRequest() {
        try {
          log("basic-log", "Sending GET request...", "info");
          const response = await fetch("https://httpbin.org/get");
          const data = await response.json();
          log("basic-log", `GET success: ${response.status}`, "success");
          log(
            "basic-log",
            `Response: ${JSON.stringify(data).substring(0, 100)}...`,
            "info"
          );
        } catch (error) {
          log("basic-log", `GET error: ${error.message}`, "error");
        }
      }

      async function testPostRequest() {
        try {
          log("basic-log", "Sending POST request...", "info");
          const response = await fetch("https://httpbin.org/post", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Hello from POST request",
              timestamp: new Date().toISOString(),
            }),
          });
          const data = await response.json();
          log("basic-log", `POST success: ${response.status}`, "success");
          log(
            "basic-log",
            `Response: ${JSON.stringify(data).substring(0, 100)}...`,
            "info"
          );
        } catch (error) {
          log("basic-log", `POST error: ${error.message}`, "error");
        }
      }

      async function testPutRequest() {
        try {
          log("basic-log", "Sending PUT request...", "info");
          const response = await fetch("https://httpbin.org/put", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Hello from PUT request",
              timestamp: new Date().toISOString(),
            }),
          });
          const data = await response.json();
          log("basic-log", `PUT success: ${response.status}`, "success");
          log(
            "basic-log",
            `Response: ${JSON.stringify(data).substring(0, 100)}...`,
            "info"
          );
        } catch (error) {
          log("basic-log", `PUT error: ${error.message}`, "error");
        }
      }

      async function testDeleteRequest() {
        try {
          log("basic-log", "Sending DELETE request...", "info");
          const response = await fetch("https://httpbin.org/delete", {
            method: "DELETE",
          });
          const data = await response.json();
          log("basic-log", `DELETE success: ${response.status}`, "success");
          log(
            "basic-log",
            `Response: ${JSON.stringify(data).substring(0, 100)}...`,
            "info"
          );
        } catch (error) {
          log("basic-log", `DELETE error: ${error.message}`, "error");
        }
      }

      // Error Handling
      async function test404Error() {
        try {
          log("error-log", "Testing 404 error...", "info");
          const response = await fetch("https://httpbin.org/status/404");
          log("error-log", `404 error: ${response.status}`, "error");
        } catch (error) {
          log("error-log", `404 error: ${error.message}`, "error");
        }
      }

      async function test500Error() {
        try {
          log("error-log", "Testing 500 error...", "info");
          const response = await fetch("https://httpbin.org/status/500");
          log("error-log", `500 error: ${response.status}`, "error");
        } catch (error) {
          log("error-log", `500 error: ${error.message}`, "error");
        }
      }

      async function testTimeout() {
        try {
          log("error-log", "Testing timeout...", "info");
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 1000);

          const response = await fetch("https://httpbin.org/delay/5", {
            signal: controller.signal,
          });
          log("error-log", `Timeout test: ${response.status}`, "success");
        } catch (error) {
          log("error-log", `Timeout error: ${error.message}`, "error");
        }
      }

      async function testNetworkError() {
        try {
          log("error-log", "Testing network error...", "info");
          const response = await fetch("https://nonexistent-domain-12345.com");
          log("error-log", `Network error: ${response.status}`, "success");
        } catch (error) {
          log("error-log", `Network error: ${error.message}`, "error");
        }
      }

      // Performance Testing
      async function testSequentialRequests() {
        log("performance-log", "Testing sequential requests...", "info");
        const startTime = performance.now();

        for (let i = 0; i < 5; i++) {
          try {
            const response = await fetch(`https://httpbin.org/delay/1`);
            log(
              "performance-log",
              `Sequential ${i + 1}: ${response.status}`,
              "success"
            );
          } catch (error) {
            log(
              "performance-log",
              `Sequential ${i + 1} error: ${error.message}`,
              "error"
            );
          }
        }

        const endTime = performance.now();
        log(
          "performance-log",
          `Sequential requests completed in ${(endTime - startTime).toFixed(
            2
          )}ms`,
          "info"
        );
      }

      async function testParallelRequests() {
        log("performance-log", "Testing parallel requests...", "info");
        const startTime = performance.now();

        try {
          const promises = Array.from({ length: 5 }, (_, i) =>
            fetch(`https://httpbin.org/delay/1`)
          );

          const responses = await Promise.all(promises);
          responses.forEach((response, i) => {
            log(
              "performance-log",
              `Parallel ${i + 1}: ${response.status}`,
              "success"
            );
          });

          const endTime = performance.now();
          log(
            "performance-log",
            `Parallel requests completed in ${(endTime - startTime).toFixed(
              2
            )}ms`,
            "info"
          );
        } catch (error) {
          log(
            "performance-log",
            `Parallel requests error: ${error.message}`,
            "error"
          );
        }
      }

      async function testLargeResponse() {
        try {
          log("performance-log", "Testing large response...", "info");
          const response = await fetch("https://httpbin.org/bytes/1048576"); // 1MB
          const data = await response.arrayBuffer();
          log(
            "performance-log",
            `Large response: ${data.byteLength} bytes`,
            "success"
          );
        } catch (error) {
          log(
            "performance-log",
            `Large response error: ${error.message}`,
            "error"
          );
        }
      }

      async function testSlowResponse() {
        try {
          log("performance-log", "Testing slow response...", "info");
          const response = await fetch("https://httpbin.org/delay/3");
          log(
            "performance-log",
            `Slow response: ${response.status}`,
            "success"
          );
        } catch (error) {
          log(
            "performance-log",
            `Slow response error: ${error.message}`,
            "error"
          );
        }
      }

      // Custom Requests
      async function testCustomRequest() {
        try {
          const url = document.getElementById("custom-url").value;
          const method = document.getElementById("custom-method").value;
          const headersText = document.getElementById("custom-headers").value;
          const bodyText = document.getElementById("custom-body").value;

          log("custom-log", `Sending ${method} request to ${url}...`, "info");

          const options = {
            method: method,
          };

          if (headersText) {
            try {
              options.headers = JSON.parse(headersText);
            } catch (error) {
              log(
                "custom-log",
                `Invalid headers JSON: ${error.message}`,
                "error"
              );
              return;
            }
          }

          if (bodyText && (method === "POST" || method === "PUT")) {
            options.body = bodyText;
          }

          const response = await fetch(url, options);
          const data = await response.text();

          log("custom-log", `${method} success: ${response.status}`, "success");
          log("custom-log", `Response: ${data.substring(0, 200)}...`, "info");
        } catch (error) {
          log("custom-log", `Custom request error: ${error.message}`, "error");
        }
      }

      // Timing Analysis
      async function analyzeTiming() {
        try {
          log("timing-analysis", "Analyzing request timing...", "info");

          const startTime = performance.now();
          const response = await fetch("https://httpbin.org/get");
          const endTime = performance.now();

          const totalTime = endTime - startTime;

          // Simulate timing breakdown (in real app, you'd get this from DevTools)
          const timingBreakdown = {
            dns: Math.random() * 10,
            tcp: Math.random() * 20,
            ssl: Math.random() * 30,
            request: Math.random() * 40,
            response: Math.random() * 50,
          };

          const breakdownElement = document.getElementById("timing-breakdown");
          breakdownElement.innerHTML = `
                    <p><strong>Total Time:</strong> ${totalTime.toFixed(
                      2
                    )}ms</p>
                    <div class="timing-bar">
                        <div class="timing-segment timing-dns" style="left: 0%; width: ${
                          timingBreakdown.dns
                        }%"></div>
                        <div class="timing-segment timing-tcp" style="left: ${
                          timingBreakdown.dns
                        }%; width: ${timingBreakdown.tcp}%"></div>
                        <div class="timing-segment timing-ssl" style="left: ${
                          timingBreakdown.dns + timingBreakdown.tcp
                        }%; width: ${timingBreakdown.ssl}%"></div>
                        <div class="timing-segment timing-request" style="left: ${
                          timingBreakdown.dns +
                          timingBreakdown.tcp +
                          timingBreakdown.ssl
                        }%; width: ${timingBreakdown.request}%"></div>
                        <div class="timing-segment timing-response" style="left: ${
                          timingBreakdown.dns +
                          timingBreakdown.tcp +
                          timingBreakdown.ssl +
                          timingBreakdown.request
                        }%; width: ${timingBreakdown.response}%"></div>
                    </div>
                    <p><strong>DNS Lookup:</strong> ${timingBreakdown.dns.toFixed(
                      2
                    )}ms</p>
                    <p><strong>TCP Connection:</strong> ${timingBreakdown.tcp.toFixed(
                      2
                    )}ms</p>
                    <p><strong>SSL Handshake:</strong> ${timingBreakdown.ssl.toFixed(
                      2
                    )}ms</p>
                    <p><strong>Request:</strong> ${timingBreakdown.request.toFixed(
                      2
                    )}ms</p>
                    <p><strong>Response:</strong> ${timingBreakdown.response.toFixed(
                      2
                    )}ms</p>
                `;

          document.getElementById("timing-analysis").style.display = "block";
        } catch (error) {
          log(
            "timing-analysis",
            `Timing analysis error: ${error.message}`,
            "error"
          );
        }
      }

      // WebSocket Testing
      let wsConnection = null;

      function testWebSocket() {
        try {
          log("websocket-log", "Connecting to WebSocket...", "info");
          wsConnection = new WebSocket("wss://echo.websocket.org/");

          wsConnection.onopen = () => {
            log("websocket-log", "WebSocket connected", "success");
          };

          wsConnection.onmessage = (event) => {
            log("websocket-log", `Received: ${event.data}`, "info");
          };

          wsConnection.onclose = () => {
            log("websocket-log", "WebSocket closed", "info");
          };

          wsConnection.onerror = (error) => {
            log("websocket-log", `WebSocket error: ${error}`, "error");
          };
        } catch (error) {
          log(
            "websocket-log",
            `WebSocket connection error: ${error.message}`,
            "error"
          );
        }
      }

      function sendWebSocketMessage() {
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          const message = `Hello WebSocket! ${new Date().toISOString()}`;
          wsConnection.send(message);
          log("websocket-log", `Sent: ${message}`, "info");
        } else {
          log("websocket-log", "WebSocket not connected", "error");
        }
      }

      function closeWebSocket() {
        if (wsConnection) {
          wsConnection.close();
          wsConnection = null;
          log("websocket-log", "WebSocket connection closed", "info");
        }
      }

      // Service Worker Testing
      async function testServiceWorker() {
        try {
          log("sw-log", "Testing Service Worker...", "info");

          if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;
            log("sw-log", "Service Worker is ready", "success");

            // Test cached request
            const response = await fetch("/");
            log(
              "sw-log",
              `Service Worker request: ${response.status}`,
              "success"
            );
          } else {
            log("sw-log", "Service Worker not supported", "error");
          }
        } catch (error) {
          log("sw-log", `Service Worker error: ${error.message}`, "error");
        }
      }

      async function testOfflineMode() {
        try {
          log("sw-log", "Testing offline mode...", "info");

          // Simulate offline by using a non-existent URL
          const response = await fetch("https://offline-test.com");
          log("sw-log", `Offline test: ${response.status}`, "success");
        } catch (error) {
          log("sw-log", `Offline test error: ${error.message}`, "error");
        }
      }

      // Initialize
      console.log("🔍 Network Debug Demo initialized");
      console.log("📱 Open Chrome DevTools (F12) and go to Network tab");
    </script>
  </body>
</html>
```

**network-analysis.js - Network Analysis Utility:**

```javascript
class NetworkAnalyzer {
  constructor() {
    this.requests = [];
    this.performanceObserver = null;
    this.init();
  }

  init() {
    // Monitor network requests
    this.monitorRequests();

    // Monitor performance
    this.monitorPerformance();

    console.log("🔍 Network Analyzer initialized");
  }

  // Monitor network requests
  monitorRequests() {
    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function (...args) {
      const startTime = performance.now();
      const url = args[0];
      const options = args[1] || {};

      console.log(`🌐 Fetch request: ${url}`);

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();

        const requestInfo = {
          url: url,
          method: options.method || "GET",
          status: response.status,
          statusText: response.statusText,
          duration: endTime - startTime,
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(response.headers.entries()),
          size: response.headers.get("content-length") || "unknown",
        };

        self.requests.push(requestInfo);
        self.logRequest(requestInfo);

        return response;
      } catch (error) {
        const endTime = performance.now();

        const requestInfo = {
          url: url,
          method: options.method || "GET",
          status: "error",
          statusText: error.message,
          duration: endTime - startTime,
          timestamp: new Date().toISOString(),
          error: true,
        };

        self.requests.push(requestInfo);
        self.logRequest(requestInfo);

        throw error;
      }
    };
  }

  // Monitor performance
  monitorPerformance() {
    if ("PerformanceObserver" in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            this.analyzeNavigationTiming(entry);
          } else if (entry.entryType === "resource") {
            this.analyzeResourceTiming(entry);
          }
        }
      });

      this.performanceObserver.observe({
        entryTypes: ["navigation", "resource"],
      });
    }
  }

  // Analyze navigation timing
  analyzeNavigationTiming(entry) {
    const timing = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart
        ? entry.connectEnd - entry.secureConnectionStart
        : 0,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      dom: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      load: entry.loadEventEnd - entry.loadEventStart,
    };

    console.log("📊 Navigation Timing:", timing);
    this.displayTimingChart("navigation", timing);
  }

  // Analyze resource timing
  analyzeResourceTiming(entry) {
    const timing = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart
        ? entry.connectEnd - entry.secureConnectionStart
        : 0,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
    };

    console.log(`📊 Resource Timing (${entry.name}):`, timing);
  }

  // Log request info
  logRequest(requestInfo) {
    const status = requestInfo.error ? "❌" : "✅";
    const method = requestInfo.method;
    const url = requestInfo.url;
    const duration = requestInfo.duration.toFixed(2);
    const statusCode = requestInfo.status;

    console.log(`${status} ${method} ${url} - ${statusCode} (${duration}ms)`);
  }

  // Display timing chart
  displayTimingChart(type, timing) {
    const chartContainer = document.getElementById("timing-chart");
    if (!chartContainer) return;

    const totalTime = Object.values(timing).reduce(
      (sum, time) => sum + time,
      0
    );

    let chartHTML = `<h4>${type} Timing Breakdown</h4>`;
    chartHTML += `<div class="timing-chart">`;

    Object.entries(timing).forEach(([key, time]) => {
      const percentage = (time / totalTime) * 100;
      const color = this.getTimingColor(key);

      chartHTML += `
                <div class="timing-row">
                    <span class="timing-label">${key.toUpperCase()}</span>
                    <div class="timing-bar">
                        <div class="timing-segment" style="width: ${percentage}%; background-color: ${color};"></div>
                    </div>
                    <span class="timing-value">${time.toFixed(2)}ms</span>
                </div>
            `;
    });

    chartHTML += `</div>`;
    chartContainer.innerHTML = chartHTML;
  }

  // Get timing color
  getTimingColor(type) {
    const colors = {
      dns: "#ff9800",
      tcp: "#4caf50",
      ssl: "#9c27b0",
      request: "#2196f3",
      response: "#f44336",
      dom: "#795548",
      load: "#607d8b",
    };
    return colors[type] || "#666";
  }

  // Get request statistics
  getStatistics() {
    const stats = {
      totalRequests: this.requests.length,
      successfulRequests: this.requests.filter((r) => !r.error).length,
      failedRequests: this.requests.filter((r) => r.error).length,
      averageDuration:
        this.requests.reduce((sum, r) => sum + r.duration, 0) /
        this.requests.length,
      totalDuration: this.requests.reduce((sum, r) => sum + r.duration, 0),
      methods: this.getMethodStats(),
      statusCodes: this.getStatusStats(),
    };

    return stats;
  }

  // Get method statistics
  getMethodStats() {
    const methods = {};
    this.requests.forEach((request) => {
      methods[request.method] = (methods[request.method] || 0) + 1;
    });
    return methods;
  }

  // Get status code statistics
  getStatusStats() {
    const statuses = {};
    this.requests.forEach((request) => {
      const status = request.status;
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return statuses;
  }

  // Export data
  exportData() {
    const data = {
      requests: this.requests,
      statistics: this.getStatistics(),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `network-analysis-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Clear data
  clearData() {
    this.requests = [];
    console.log("🗑️ Network data cleared");
  }

  // Destroy analyzer
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    console.log("🔍 Network Analyzer destroyed");
  }
}

// Initialize Network Analyzer
const networkAnalyzer = new NetworkAnalyzer();

// Make available globally
window.networkAnalyzer = networkAnalyzer;
```

# ⚙️ Phân tích & Giải thích

**Network Tab Features:**

1. **Request List**: Danh sách tất cả requests
2. **Timing**: Phân tích timing của từng request
3. **Headers**: Request và response headers
4. **Response**: Response data và preview
5. **Cookies**: Cookies được gửi/nhận
6. **Security**: SSL/TLS information

**Request Timing Breakdown:**

- **DNS Lookup**: Thời gian resolve domain name
- **TCP Connection**: Thời gian thiết lập TCP connection
- **SSL Handshake**: Thời gian SSL handshake (HTTPS)
- **Request**: Thời gian gửi request
- **Response**: Thời gian nhận response

**Network Tab Filters:**

- **All**: Tất cả requests
- **XHR**: XMLHttpRequest và Fetch requests
- **JS**: JavaScript files
- **CSS**: CSS files
- **Img**: Images
- **Font**: Fonts
- **Doc**: HTML documents
- **WS**: WebSocket connections

**Performance Analysis:**

- **Waterfall Chart**: Hiển thị timing của requests
- **Request Size**: Kích thước request/response
- **Load Time**: Thời gian load
- **Blocking Time**: Thời gian bị block

**Common Issues:**

- **Slow Requests**: Requests mất nhiều thời gian
- **Failed Requests**: Requests bị lỗi
- **Large Responses**: Responses quá lớn
- **Duplicate Requests**: Requests bị duplicate

# 🧭 Ứng dụng thực tế

**Debugging Use Cases:**

- **API Issues**: Debug API requests và responses
- **Performance Issues**: Identify slow requests
- **CORS Issues**: Debug cross-origin requests
- **Authentication Issues**: Debug auth headers
- **Cache Issues**: Debug caching behavior

**Optimization Use Cases:**

- **Bundle Size**: Analyze JavaScript bundle size
- **Image Optimization**: Analyze image loading
- **CDN Performance**: Analyze CDN requests
- **Third-party Scripts**: Analyze external scripts

**Monitoring Use Cases:**

- **Error Tracking**: Monitor failed requests
- **Performance Monitoring**: Track request timing
- **User Experience**: Monitor loading times
- **Resource Usage**: Monitor resource consumption

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng Network tab như một hệ thống giám sát giao thông:

**Network Tab** như camera giám sát giao thông:

- Quan sát tất cả phương tiện đi qua
- Ghi lại thông tin chi tiết
- Như camera giao thông trên đường

**Request List** như danh sách phương tiện:

- Liệt kê tất cả phương tiện đã đi qua
- Có thông tin về từng phương tiện
- Như danh sách xe đã qua trạm thu phí

**Timing Analysis** như phân tích thời gian:

- Đo thời gian từng giai đoạn
- Phân tích bottleneck
- Như phân tích thời gian di chuyển

**Headers** như giấy tờ xe:

- Có thông tin về xe và tài xế
- Có thông tin về hàng hóa
- Như giấy tờ xe và vận đơn

**Response** như hàng hóa được giao:

- Nội dung thực tế được giao
- Có thể kiểm tra chất lượng
- Như hàng hóa trong container

**Waterfall Chart** như biểu đồ giao thông:

- Hiển thị thời gian di chuyển
- Cho thấy bottleneck
- Như biểu đồ mật độ giao thông

**Filters** như phân loại phương tiện:

- Xe tải, xe con, xe máy
- Theo loại hàng hóa
- Như phân loại phương tiện

**Performance Issues** như tắc đường:

- Xác định nguyên nhân chậm
- Tìm cách tối ưu
- Như phân tích nguyên nhân tắc đường

# 🧩 Tổng kết ngắn

- ✅ Network tab là công cụ mạnh mẽ để debug và optimize network
- ✅ Có thể phân tích timing, headers, và response data
- ✅ Hỗ trợ filter và search requests
- ✅ Có thể export data để phân tích sâu hơn
- ✅ Essential tool cho web development và performance optimization

**Xem bài tiếp theo →** [Tổng kết Feynman](./08-summary-feynman.md)
