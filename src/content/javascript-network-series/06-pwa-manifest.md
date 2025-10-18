---
title: "PWA Manifest - Biến web app thành native app"
description: "Học cách tạo PWA Manifest để biến web app thành Progressive Web App với khả năng cài đặt và offline"
date: 2025-09-25
tags: ["JavaScript", "PWA", "Manifest", "Progressive Web App", "Installation"]
series: "Lập trình mạng với JavaScript"
prev: "/Kant_Nguyen_Astro_Blog/blog/05-service-worker/"
next: "/Kant_Nguyen_Astro_Blog/blog/07-devtools-network/"
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

Progressive Web App (PWA) Manifest là file JSON định nghĩa metadata của ứng dụng web, cho phép browser hiểu cách hiển thị và cài đặt ứng dụng như một native app. Với PWA Manifest, người dùng có thể cài đặt web app lên home screen và sử dụng như một ứng dụng thật.

Bài này sẽ dạy bạn cách tạo PWA Manifest hoàn chỉnh, cấu hình icons, themes, và các tính năng nâng cao để tạo ra trải nghiệm app-like.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**manifest.json - PWA Manifest cơ bản:**

```json
{
  "name": "JavaScript Networking Demo",
  "short_name": "Networking Demo",
  "description": "Demo ứng dụng networking với JavaScript, WebSocket, và PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196f3",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "vi",
  "dir": "ltr",
  "categories": ["productivity", "utilities", "education"],
  "icons": [
    {
      "src": "/images/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/images/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/images/screenshot-mobile-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/images/screenshot-mobile-2.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/images/screenshot-desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/images/screenshot-desktop-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Chat Room",
      "short_name": "Chat",
      "description": "Mở chat room",
      "url": "/chat",
      "icons": [
        {
          "src": "/images/shortcut-chat.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Settings",
      "short_name": "Settings",
      "description": "Mở cài đặt",
      "url": "/settings",
      "icons": [
        {
          "src": "/images/shortcut-settings.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ],
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    },
    {
      "platform": "itunes",
      "url": "https://apps.apple.com/app/example-app/id123456789"
    }
  ],
  "prefer_related_applications": false,
  "edge_side_panel": {
    "preferred_width": 400
  },
  "launch_handler": {
    "client_mode": "navigate-existing"
  },
  "handle_links": "preferred",
  "protocol_handlers": [
    {
      "protocol": "web+networking",
      "url": "/handle-protocol?protocol=%s"
    }
  ],
  "file_handlers": [
    {
      "action": "/handle-file",
      "accept": {
        "text/plain": [".txt"],
        "application/json": [".json"]
      }
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "file",
          "accept": ["image/*", "text/plain"]
        }
      ]
    }
  }
}
```

**pwa-manager.js - PWA Manager class:**

```javascript
class PWAManager {
  constructor() {
    this.manifest = null;
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isInstallable = false;
  }

  // Initialize PWA Manager
  async init() {
    try {
      console.log("🚀 Initializing PWA Manager...");

      // Load manifest
      await this.loadManifest();

      // Check installation status
      this.checkInstallationStatus();

      // Listen for install prompt
      this.listenForInstallPrompt();

      // Listen for app installed
      this.listenForAppInstalled();

      console.log("✅ PWA Manager initialized");
    } catch (error) {
      console.error("❌ Error initializing PWA Manager:", error);
    }
  }

  // Load manifest
  async loadManifest() {
    try {
      const response = await fetch("/manifest.json");
      this.manifest = await response.json();
      console.log("📋 Manifest loaded:", this.manifest.name);
    } catch (error) {
      console.error("❌ Error loading manifest:", error);
    }
  }

  // Check installation status
  checkInstallationStatus() {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      this.isInstalled = true;
      console.log("📱 App is already installed");
    }

    // Check if app is installable
    if ("BeforeInstallPromptEvent" in window) {
      this.isInstallable = true;
      console.log("📱 App is installable");
    }
  }

  // Listen for install prompt
  listenForInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
      console.log("📱 Install prompt triggered");

      // Prevent default install prompt
      event.preventDefault();

      // Store the event
      this.deferredPrompt = event;

      // Show custom install button
      this.showInstallButton();
    });
  }

  // Listen for app installed
  listenForAppInstalled() {
    window.addEventListener("appinstalled", (event) => {
      console.log("🎉 App installed successfully");
      this.isInstalled = true;
      this.hideInstallButton();

      // Track installation
      this.trackInstallation();
    });
  }

  // Show install button
  showInstallButton() {
    const installButton = document.getElementById("install-button");
    if (installButton) {
      installButton.style.display = "block";
      installButton.addEventListener("click", () => this.installApp());
    }
  }

  // Hide install button
  hideInstallButton() {
    const installButton = document.getElementById("install-button");
    if (installButton) {
      installButton.style.display = "none";
    }
  }

  // Install app
  async installApp() {
    if (!this.deferredPrompt) {
      console.log("❌ No install prompt available");
      return;
    }

    try {
      console.log("📱 Installing app...");

      // Show install prompt
      this.deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;

      console.log("📱 Install outcome:", outcome);

      if (outcome === "accepted") {
        console.log("✅ User accepted install");
      } else {
        console.log("❌ User declined install");
      }

      // Clear the deferred prompt
      this.deferredPrompt = null;
    } catch (error) {
      console.error("❌ Error installing app:", error);
    }
  }

  // Track installation
  trackInstallation() {
    // Send analytics event
    if (typeof gtag !== "undefined") {
      gtag("event", "pwa_install", {
        event_category: "PWA",
        event_label: "App Installation",
      });
    }

    // Store in localStorage
    localStorage.setItem("pwa_installed", "true");
    localStorage.setItem("pwa_install_date", new Date().toISOString());
  }

  // Check if app is installed
  isAppInstalled() {
    return (
      this.isInstalled ||
      window.matchMedia("(display-mode: standalone)").matches
    );
  }

  // Get manifest info
  getManifestInfo() {
    return {
      name: this.manifest?.name || "Unknown",
      shortName: this.manifest?.short_name || "Unknown",
      description: this.manifest?.description || "No description",
      version: this.manifest?.version || "1.0.0",
      themeColor: this.manifest?.theme_color || "#000000",
      backgroundColor: this.manifest?.background_color || "#ffffff",
    };
  }

  // Update manifest theme
  updateTheme(themeColor, backgroundColor) {
    if (this.manifest) {
      this.manifest.theme_color = themeColor;
      this.manifest.background_color = backgroundColor;

      // Update meta tags
      this.updateMetaTags(themeColor, backgroundColor);
    }
  }

  // Update meta tags
  updateMetaTags(themeColor, backgroundColor) {
    // Update theme-color meta tag
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = themeColor;

    // Update background-color meta tag
    let bgMeta = document.querySelector('meta[name="background-color"]');
    if (!bgMeta) {
      bgMeta = document.createElement("meta");
      bgMeta.name = "background-color";
      document.head.appendChild(bgMeta);
    }
    bgMeta.content = backgroundColor;
  }

  // Handle share target
  handleShareTarget() {
    if (navigator.share) {
      return {
        canShare: true,
        share: async (data) => {
          try {
            await navigator.share(data);
            console.log("✅ Share successful");
          } catch (error) {
            console.error("❌ Share error:", error);
          }
        },
      };
    }

    return {
      canShare: false,
      share: null,
    };
  }

  // Handle file handlers
  handleFileHandlers() {
    if ("launchQueue" in window) {
      window.launchQueue.setConsumer((launchParams) => {
        if (launchParams.files && launchParams.files.length > 0) {
          console.log("📁 Files received:", launchParams.files);
          this.processFiles(launchParams.files);
        }
      });
    }
  }

  // Process files
  async processFiles(files) {
    for (const file of files) {
      try {
        const content = await file.getFile();
        console.log("📁 Processing file:", content.name);

        // Process file based on type
        if (content.type.startsWith("text/")) {
          const text = await content.text();
          console.log("📄 Text content:", text);
        } else if (content.type.startsWith("image/")) {
          const arrayBuffer = await content.arrayBuffer();
          console.log("🖼️ Image content:", arrayBuffer);
        }
      } catch (error) {
        console.error("❌ Error processing file:", error);
      }
    }
  }
}

// PWA Installation UI
class PWAInstallationUI {
  constructor(pwaManager) {
    this.pwaManager = pwaManager;
    this.installBanner = null;
  }

  // Create install banner
  createInstallBanner() {
    this.installBanner = document.createElement("div");
    this.installBanner.id = "pwa-install-banner";
    this.installBanner.innerHTML = `
            <div class="pwa-banner">
                <div class="pwa-banner-content">
                    <div class="pwa-banner-icon">📱</div>
                    <div class="pwa-banner-text">
                        <h3>Cài đặt ứng dụng</h3>
                        <p>Cài đặt ứng dụng để truy cập nhanh hơn và sử dụng offline</p>
                    </div>
                    <div class="pwa-banner-actions">
                        <button id="pwa-install-btn" class="pwa-install-btn">Cài đặt</button>
                        <button id="pwa-dismiss-btn" class="pwa-dismiss-btn">Bỏ qua</button>
                    </div>
                </div>
            </div>
        `;

    // Add styles
    this.addBannerStyles();

    // Add to page
    document.body.appendChild(this.installBanner);

    // Add event listeners
    this.addBannerEventListeners();
  }

  // Add banner styles
  addBannerStyles() {
    const styles = `
            <style>
                .pwa-banner {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 1000;
                    max-width: 400px;
                    margin: 0 auto;
                }
                
                .pwa-banner-content {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    gap: 15px;
                }
                
                .pwa-banner-icon {
                    font-size: 24px;
                }
                
                .pwa-banner-text {
                    flex: 1;
                }
                
                .pwa-banner-text h3 {
                    margin: 0 0 5px 0;
                    font-size: 16px;
                    color: #333;
                }
                
                .pwa-banner-text p {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                }
                
                .pwa-banner-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .pwa-install-btn {
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    font-size: 14px;
                    cursor: pointer;
                }
                
                .pwa-install-btn:hover {
                    background: #1976d2;
                }
                
                .pwa-dismiss-btn {
                    background: transparent;
                    color: #666;
                    border: 1px solid #ddd;
                    padding: 8px 16px;
                    border-radius: 5px;
                    font-size: 14px;
                    cursor: pointer;
                }
                
                .pwa-dismiss-btn:hover {
                    background: #f5f5f5;
                }
            </style>
        `;

    document.head.insertAdjacentHTML("beforeend", styles);
  }

  // Add banner event listeners
  addBannerEventListeners() {
    const installBtn = document.getElementById("pwa-install-btn");
    const dismissBtn = document.getElementById("pwa-dismiss-btn");

    installBtn.addEventListener("click", () => {
      this.pwaManager.installApp();
      this.hideBanner();
    });

    dismissBtn.addEventListener("click", () => {
      this.hideBanner();
    });
  }

  // Show banner
  showBanner() {
    if (this.installBanner) {
      this.installBanner.style.display = "block";
    }
  }

  // Hide banner
  hideBanner() {
    if (this.installBanner) {
      this.installBanner.style.display = "none";
    }
  }

  // Remove banner
  removeBanner() {
    if (this.installBanner) {
      this.installBanner.remove();
      this.installBanner = null;
    }
  }
}

// Initialize PWA
async function initializePWA() {
  console.log("🚀 Initializing PWA...");

  // Create PWA Manager
  const pwaManager = new PWAManager();
  await pwaManager.init();

  // Create Installation UI
  const installUI = new PWAInstallationUI(pwaManager);

  // Show install banner if app is installable
  if (pwaManager.isInstallable && !pwaManager.isAppInstalled()) {
    installUI.createInstallBanner();
    installUI.showBanner();
  }

  // Handle share target
  const shareHandler = pwaManager.handleShareTarget();
  if (shareHandler.canShare) {
    console.log("📤 Share API available");
  }

  // Handle file handlers
  pwaManager.handleFileHandlers();

  // Make available globally
  window.pwaManager = pwaManager;
  window.installUI = installUI;

  console.log("✅ PWA initialized successfully");
}

// Start PWA when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePWA);
} else {
  initializePWA();
}
```

**pwa-test.html - PWA Test Page:**

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PWA Manifest Test</title>

    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />

    <!-- Meta tags -->
    <meta name="theme-color" content="#2196f3" />
    <meta name="background-color" content="#ffffff" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Networking Demo" />

    <!-- Apple touch icons -->
    <link rel="apple-touch-icon" href="/images/icon-192.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/images/icon-152.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/icon-192.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="/images/icon-192.png" />

    <!-- Favicon -->
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="/images/icon-32.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="/images/icon-16.png"
    />

    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
      }

      .header h1 {
        color: #2196f3;
        margin-bottom: 10px;
      }

      .header p {
        color: #666;
        font-size: 16px;
      }

      .pwa-info {
        background: #e3f2fd;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .pwa-info h3 {
        margin-top: 0;
        color: #1976d2;
      }

      .pwa-info ul {
        margin: 0;
        padding-left: 20px;
      }

      .pwa-info li {
        margin-bottom: 5px;
      }

      .install-section {
        text-align: center;
        margin: 30px 0;
      }

      .install-button {
        background: #4caf50;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        margin: 10px;
      }

      .install-button:hover {
        background: #45a049;
      }

      .install-button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .status {
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
      }

      .status.installed {
        background: #c8e6c9;
        color: #2e7d32;
      }

      .status.not-installed {
        background: #ffcdd2;
        color: #c62828;
      }

      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }

      .feature {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }

      .feature-icon {
        font-size: 32px;
        margin-bottom: 10px;
      }

      .feature h4 {
        margin: 0 0 10px 0;
        color: #333;
      }

      .feature p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📱 PWA Manifest Test</h1>
        <p>Test Progressive Web App với Manifest và Service Worker</p>
      </div>

      <div class="pwa-info">
        <h3>🎯 PWA Features</h3>
        <ul>
          <li>✅ Có thể cài đặt như native app</li>
          <li>✅ Hoạt động offline với Service Worker</li>
          <li>✅ Push notifications</li>
          <li>✅ Background sync</li>
          <li>✅ App-like experience</li>
        </ul>
      </div>

      <div id="pwa-status" class="status not-installed">
        ❌ App chưa được cài đặt
      </div>

      <div class="install-section">
        <button
          id="install-button"
          class="install-button"
          style="display: none;"
        >
          📱 Cài đặt App
        </button>
        <button id="check-status" class="install-button">
          🔍 Kiểm tra trạng thái
        </button>
      </div>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">🚀</div>
          <h4>Fast Loading</h4>
          <p>Cache resources để tải nhanh hơn</p>
        </div>

        <div class="feature">
          <div class="feature-icon">📱</div>
          <h4>App-like</h4>
          <p>Trải nghiệm như native app</p>
        </div>

        <div class="feature">
          <div class="feature-icon">🔔</div>
          <h4>Notifications</h4>
          <p>Push notifications</p>
        </div>

        <div class="feature">
          <div class="feature-icon">🔄</div>
          <h4>Background Sync</h4>
          <p>Đồng bộ dữ liệu ngầm</p>
        </div>
      </div>
    </div>

    <script>
      // PWA Status Checker
      class PWAStatusChecker {
        constructor() {
          this.statusElement = document.getElementById("pwa-status");
          this.installButton = document.getElementById("install-button");
          this.checkButton = document.getElementById("check-status");
        }

        init() {
          this.checkButton.addEventListener("click", () => {
            this.checkStatus();
          });

          // Check status on load
          this.checkStatus();
        }

        checkStatus() {
          const isInstalled = this.isAppInstalled();
          const isInstallable = this.isAppInstallable();

          if (isInstalled) {
            this.statusElement.textContent = "✅ App đã được cài đặt";
            this.statusElement.className = "status installed";
            this.installButton.style.display = "none";
          } else if (isInstallable) {
            this.statusElement.textContent = "📱 App có thể cài đặt";
            this.statusElement.className = "status not-installed";
            this.installButton.style.display = "inline-block";
          } else {
            this.statusElement.textContent = "❌ App không thể cài đặt";
            this.statusElement.className = "status not-installed";
            this.installButton.style.display = "none";
          }

          console.log("PWA Status:", {
            installed: isInstalled,
            installable: isInstallable,
            displayMode: this.getDisplayMode(),
          });
        }

        isAppInstalled() {
          return (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true
          );
        }

        isAppInstallable() {
          return "BeforeInstallPromptEvent" in window;
        }

        getDisplayMode() {
          if (window.matchMedia("(display-mode: standalone)").matches) {
            return "standalone";
          } else if (window.matchMedia("(display-mode: minimal-ui)").matches) {
            return "minimal-ui";
          } else if (window.matchMedia("(display-mode: fullscreen)").matches) {
            return "fullscreen";
          } else {
            return "browser";
          }
        }
      }

      // Initialize PWA Status Checker
      const statusChecker = new PWAStatusChecker();
      statusChecker.init();

      // Initialize PWA Manager
      if (window.pwaManager) {
        window.pwaManager.init();
      }
    </script>
  </body>
</html>
```

# ⚙️ Phân tích & Giải thích

**PWA Manifest Properties:**

1. **Basic Properties**:

   - `name`: Tên đầy đủ của app
   - `short_name`: Tên ngắn cho home screen
   - `description`: Mô tả app
   - `start_url`: URL khởi động
   - `display`: Chế độ hiển thị (standalone, minimal-ui, fullscreen, browser)

2. **Visual Properties**:

   - `theme_color`: Màu chủ đạo
   - `background_color`: Màu nền
   - `orientation`: Hướng màn hình
   - `icons`: Danh sách icons với các kích thước

3. **Advanced Properties**:
   - `shortcuts`: Shortcuts trên home screen
   - `screenshots`: Screenshots cho app store
   - `share_target`: Xử lý share content
   - `file_handlers`: Xử lý file types
   - `protocol_handlers`: Xử lý custom protocols

**Display Modes:**

- **standalone**: App hiển thị như native app
- **minimal-ui**: App với minimal browser UI
- **fullscreen**: App toàn màn hình
- **browser**: App trong browser tab

**Icon Requirements:**

- **Standard Icons**: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- **Maskable Icons**: 192x192, 512x512 với safe area
- **Apple Touch Icons**: 152x152, 180x180, 167x167

**Installation Criteria:**

- Có Service Worker
- Có HTTPS
- Có Manifest với required fields
- Có icon ít nhất 192x192
- User engagement (heuristic)

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng PWA:**

- **E-commerce**: Amazon, Flipkart
- **Social Media**: Twitter, Instagram
- **News**: BBC, CNN
- **Productivity**: Google Docs, Notion
- **Entertainment**: Spotify, YouTube

**PWA Benefits:**

- **Installation**: Cài đặt từ browser
- **Offline Support**: Hoạt động khi offline
- **Push Notifications**: Engage users
- **App-like Experience**: Native app feel
- **Cross-platform**: Hoạt động trên mọi platform

**Best Practices:**

- Provide meaningful icons
- Use appropriate display mode
- Implement proper shortcuts
- Handle share targets
- Test on different devices

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng PWA Manifest như một tấm danh thiếp cho ứng dụng web:

**PWA Manifest** như tấm danh thiếp của ứng dụng:

- Có tên, mô tả, và thông tin liên hệ
- Có logo và màu sắc thương hiệu
- Như danh thiếp giới thiệu về công ty

**Installation** như việc lưu danh thiếp:

- Người dùng có thể "lưu" ứng dụng vào home screen
- Như lưu danh thiếp vào sổ địa chỉ
- Có thể truy cập nhanh khi cần

**Display Modes** như cách hiển thị danh thiếp:

- **Standalone**: Như treo danh thiếp trên tường
- **Minimal-ui**: Như để danh thiếp trên bàn
- **Fullscreen**: Như phóng to danh thiếp
- **Browser**: Như xem danh thiếp trong sổ

**Icons** như logo trên danh thiếp:

- Cần có nhiều kích thước khác nhau
- Như logo công ty có nhiều phiên bản
- Cần rõ ràng và dễ nhận biết

**Shortcuts** như các dịch vụ trên danh thiếp:

- Liệt kê các tính năng chính
- Như danh thiếp có số điện thoại, email
- Giúp người dùng truy cập nhanh

**Share Target** như thông tin liên hệ:

- Cho phép người khác chia sẻ đến app
- Như danh thiếp có địa chỉ để gửi thư
- Tạo kết nối giữa các ứng dụng

**File Handlers** như dịch vụ đặc biệt:

- App có thể xử lý các loại file cụ thể
- Như công ty chuyên về một lĩnh vực
- Tạo trải nghiệm tích hợp

# 🧩 Tổng kết ngắn

- ✅ PWA Manifest biến web app thành Progressive Web App
- ✅ Cho phép cài đặt như native app với icons và shortcuts
- ✅ Cần Service Worker và HTTPS để hoạt động
- ✅ Hỗ trợ share targets, file handlers, và protocol handlers
- ✅ Tạo trải nghiệm app-like với offline support

**Xem bài tiếp theo →** [DevTools Network](/Kant_Nguyen_Astro_Blog/blog/07-devtools-network/)
