---
title: "Service Worker - Background processing và caching"
description: "Học cách sử dụng Service Worker để cache resources, intercept requests và tạo ứng dụng offline-first"
date: 2025-10-27
tags: ["JavaScript", "Service Worker", "PWA", "Caching", "Offline"]
series: "Lập trình mạng với JavaScript"
prev: "./04-sse-vs-websocket.md"
next: "./06-pwa-manifest.md"
---

# 🧠 Giới thiệu

Service Worker là một script chạy trong background của browser, hoạt động như một proxy giữa ứng dụng và network. Nó cho phép bạn cache resources, intercept requests, và tạo ứng dụng offline-first.

Service Worker là nền tảng của Progressive Web Apps (PWA), cho phép ứng dụng web hoạt động như native apps với khả năng offline, push notifications, và background sync.

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**sw.js - Service Worker cơ bản:**

```javascript
// Service Worker - sw.js
const CACHE_NAME = 'my-app-cache-v1';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png'
];

// Install event - Cache static resources
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching static resources...');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('✅ Static resources cached successfully');
                // Skip waiting để activate ngay
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error caching static resources:', error);
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                // Claim all clients
                return self.clients.claim();
            })
    );
});

// Fetch event - Intercept requests
self.addEventListener('fetch', (event) => {
    console.log('🌐 Fetch event:', event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('📦 Serving from cache:', event.request.url);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('🌐 Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        // Cache the response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                                console.log('💾 Cached response:', event.request.url);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('❌ Fetch error:', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/offline.html');
                        }
                        
                        // Return cached version if available
                        return caches.match(event.request);
                    });
            })
    );
});

// Background sync event
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync event:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Push event - Handle push notifications
self.addEventListener('push', (event) => {
    console.log('📱 Push event received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Xem chi tiết',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Đóng',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Service Worker Demo', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open app
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close notification
        console.log('❌ Notification closed');
    } else {
        // Default action - open app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        console.log('🔄 Performing background sync...');
        
        // Get pending data from IndexedDB
        const pendingData = await getPendingData();
        
        if (pendingData.length > 0) {
            // Send pending data to server
            for (const data of pendingData) {
                try {
                    await fetch('/api/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    // Remove from pending data
                    await removePendingData(data.id);
                    console.log('✅ Synced data:', data.id);
                    
                } catch (error) {
                    console.error('❌ Sync error:', error);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Background sync error:', error);
    }
}

// Helper functions for IndexedDB
async function getPendingData() {
    // Implementation depends on your IndexedDB setup
    return [];
}

async function removePendingData(id) {
    // Implementation depends on your IndexedDB setup
    console.log('🗑️ Removing pending data:', id);
}
```

**app.js - Register Service Worker:**

```javascript
// app.js - Register Service Worker
class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isSupported = 'serviceWorker' in navigator;
    }
    
    // Register Service Worker
    async register() {
        if (!this.isSupported) {
            console.log('❌ Service Worker không được hỗ trợ');
            return false;
        }
        
        try {
            console.log('🔧 Đang đăng ký Service Worker...');
            
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('✅ Service Worker đã đăng ký:', this.registration.scope);
            
            // Listen for updates
            this.registration.addEventListener('updatefound', () => {
                console.log('🔄 Service Worker update found');
                this.handleUpdate();
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Lỗi đăng ký Service Worker:', error);
            return false;
        }
    }
    
    // Handle Service Worker updates
    handleUpdate() {
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    // New content available
                    console.log('🆕 New content available');
                    this.showUpdateNotification();
                } else {
                    // Content cached for first time
                    console.log('📦 Content cached for offline use');
                }
            }
        });
    }
    
    // Show update notification
    showUpdateNotification() {
        if (confirm('Có phiên bản mới! Bạn có muốn cập nhật không?')) {
            // Reload page to use new Service Worker
            window.location.reload();
        }
    }
    
    // Unregister Service Worker
    async unregister() {
        if (this.registration) {
            try {
                await this.registration.unregister();
                console.log('✅ Service Worker đã hủy đăng ký');
                return true;
            } catch (error) {
                console.error('❌ Lỗi hủy đăng ký Service Worker:', error);
                return false;
            }
        }
        return false;
    }
    
    // Check for updates
    async checkForUpdates() {
        if (this.registration) {
            try {
                await this.registration.update();
                console.log('🔄 Đã kiểm tra cập nhật');
            } catch (error) {
                console.error('❌ Lỗi kiểm tra cập nhật:', error);
            }
        }
    }
    
    // Get Service Worker status
    getStatus() {
        if (!this.isSupported) {
            return 'not-supported';
        }
        
        if (!this.registration) {
            return 'not-registered';
        }
        
        if (navigator.serviceWorker.controller) {
            return 'active';
        } else {
            return 'installing';
        }
    }
}

// Cache Manager
class CacheManager {
    constructor() {
        this.cacheName = 'my-app-cache-v1';
    }
    
    // Add to cache
    async addToCache(url) {
        try {
            const cache = await caches.open(this.cacheName);
            await cache.add(url);
            console.log('✅ Added to cache:', url);
            return true;
        } catch (error) {
            console.error('❌ Error adding to cache:', error);
            return false;
        }
    }
    
    // Get from cache
    async getFromCache(url) {
        try {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(url);
            return response;
        } catch (error) {
            console.error('❌ Error getting from cache:', error);
            return null;
        }
    }
    
    // Delete from cache
    async deleteFromCache(url) {
        try {
            const cache = await caches.open(this.cacheName);
            await cache.delete(url);
            console.log('✅ Deleted from cache:', url);
            return true;
        } catch (error) {
            console.error('❌ Error deleting from cache:', error);
            return false;
        }
    }
    
    // Clear all caches
    async clearAllCaches() {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('✅ All caches cleared');
            return true;
        } catch (error) {
            console.error('❌ Error clearing caches:', error);
            return false;
        }
    }
}

// Background Sync Manager
class BackgroundSyncManager {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
    }
    
    // Register background sync
    async registerSync(tag) {
        if (!this.isSupported) {
            console.log('❌ Background Sync không được hỗ trợ');
            return false;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log('✅ Background sync registered:', tag);
            return true;
        } catch (error) {
            console.error('❌ Error registering background sync:', error);
            return false;
        }
    }
}

// Push Notification Manager
class PushNotificationManager {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        this.subscription = null;
    }
    
    // Request permission
    async requestPermission() {
        if (!this.isSupported) {
            console.log('❌ Push notifications không được hỗ trợ');
            return false;
        }
        
        try {
            const permission = await Notification.requestPermission();
            console.log('🔔 Notification permission:', permission);
            return permission === 'granted';
        } catch (error) {
            console.error('❌ Error requesting permission:', error);
            return false;
        }
    }
    
    // Subscribe to push notifications
    async subscribe() {
        if (!this.isSupported) {
            return false;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
            });
            
            console.log('✅ Push subscription created');
            return this.subscription;
        } catch (error) {
            console.error('❌ Error subscribing to push:', error);
            return false;
        }
    }
    
    // Unsubscribe from push notifications
    async unsubscribe() {
        if (this.subscription) {
            try {
                await this.subscription.unsubscribe();
                this.subscription = null;
                console.log('✅ Push subscription removed');
                return true;
            } catch (error) {
                console.error('❌ Error unsubscribing from push:', error);
                return false;
            }
        }
        return false;
    }
}

// Initialize app
async function initializeApp() {
    console.log('🚀 Initializing app...');
    
    // Initialize managers
    const swManager = new ServiceWorkerManager();
    const cacheManager = new CacheManager();
    const syncManager = new BackgroundSyncManager();
    const pushManager = new PushNotificationManager();
    
    // Register Service Worker
    const swRegistered = await swManager.register();
    
    if (swRegistered) {
        console.log('✅ Service Worker registered successfully');
        
        // Request push notification permission
        const permissionGranted = await pushManager.requestPermission();
        
        if (permissionGranted) {
            await pushManager.subscribe();
        }
        
        // Register background sync
        await syncManager.registerSync('background-sync');
    }
    
    // Make managers available globally
    window.swManager = swManager;
    window.cacheManager = cacheManager;
    window.syncManager = syncManager;
    window.pushManager = pushManager;
    
    console.log('🎉 App initialized successfully');
}

// Start app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
```

**offline.html - Offline page:**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Service Worker Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
        }
        .offline-container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .offline-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        .offline-title {
            font-size: 24px;
            margin-bottom: 20px;
            color: #333;
        }
        .offline-message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        .retry-button {
            background-color: #2196f3;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-right: 10px;
        }
        .retry-button:hover {
            background-color: #1976d2;
        }
        .home-button {
            background-color: #4caf50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        .home-button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1 class="offline-title">Bạn đang offline</h1>
        <p class="offline-message">
            Không có kết nối internet. Một số tính năng có thể không khả dụng.
            Khi có kết nối trở lại, ứng dụng sẽ tự động đồng bộ dữ liệu.
        </p>
        <button class="retry-button" onclick="retryConnection()">Thử lại</button>
        <button class="home-button" onclick="goHome()">Về trang chủ</button>
    </div>
    
    <script>
        function retryConnection() {
            if (navigator.onLine) {
                window.location.reload();
            } else {
                alert('Vẫn chưa có kết nối internet');
            }
        }
        
        function goHome() {
            window.location.href = '/';
        }
        
        // Listen for online event
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            window.location.reload();
        });
    </script>
</body>
</html>
```

# ⚙️ Phân tích & Giải thích

**Service Worker Lifecycle:**

1. **Install**: Cache static resources
2. **Activate**: Clean up old caches, claim clients
3. **Fetch**: Intercept requests, serve from cache or network
4. **Sync**: Background synchronization
5. **Push**: Handle push notifications

**Cache Strategies:**

- **Cache First**: Serve from cache, fallback to network
- **Network First**: Try network first, fallback to cache
- **Stale While Revalidate**: Serve cache immediately, update in background
- **Network Only**: Always fetch from network
- **Cache Only**: Always serve from cache

**Service Worker Events:**

- **install**: Khi Service Worker được install
- **activate**: Khi Service Worker được activate
- **fetch**: Khi có request được gửi
- **sync**: Khi background sync được trigger
- **push**: Khi có push notification
- **notificationclick**: Khi user click notification

**Background Sync:**

- Cho phép sync data khi có kết nối trở lại
- Sử dụng IndexedDB để lưu pending data
- Tự động trigger khi có kết nối

**Push Notifications:**

- Cần VAPID keys để authenticate
- Cần user permission
- Có thể customize notification appearance

# 🧭 Ứng dụng thực tế

**Các ứng dụng sử dụng Service Worker:**

- **Progressive Web Apps**: Offline-first applications
- **E-commerce**: Offline shopping cart
- **News Apps**: Offline article reading
- **Social Media**: Offline post creation
- **Productivity Apps**: Offline task management

**Service Worker Benefits:**

- **Offline Support**: App hoạt động khi offline
- **Performance**: Faster loading với caching
- **Push Notifications**: Engage users
- **Background Sync**: Sync data khi có kết nối
- **App-like Experience**: Native app feel

**Best Practices:**

- Cache critical resources
- Implement proper cache strategies
- Handle offline scenarios gracefully
- Use background sync cho data
- Implement push notifications

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng Service Worker như một người trợ lý cá nhân:

**Service Worker** như người trợ lý cá nhân:
- Làm việc ngầm trong background
- Có thể lưu trữ thông tin quan trọng
- Có thể thông báo khi có tin mới
- Như trợ lý cá nhân luôn sẵn sàng

**Caching** như tủ lưu trữ:
- Lưu trữ những thứ quan trọng
- Có thể lấy ra khi cần
- Như tủ lưu trữ trong nhà

**Offline Support** như làm việc khi mất điện:
- Vẫn có thể làm việc với những gì đã lưu
- Khi có điện trở lại, đồng bộ dữ liệu
- Như làm việc với máy tính xách tay

**Background Sync** như gửi thư khi có bưu điện:
- Viết thư khi không có bưu điện
- Gửi thư khi bưu điện hoạt động trở lại
- Như hệ thống gửi thư tự động

**Push Notifications** như chuông cửa:
- Báo khi có khách đến
- Có thể tùy chỉnh âm thanh
- Như chuông cửa thông minh

**Cache Strategies** như cách quản lý tủ lưu trữ:
- **Cache First**: Lấy từ tủ trước, mua mới sau
- **Network First**: Mua mới trước, lấy từ tủ sau
- **Stale While Revalidate**: Dùng cũ ngay, cập nhật sau
- **Network Only**: Luôn mua mới
- **Cache Only**: Luôn dùng từ tủ

# 🧩 Tổng kết ngắn

- ✅ Service Worker cho phép cache resources và intercept requests
- ✅ Có thể tạo ứng dụng offline-first với background sync
- ✅ Hỗ trợ push notifications và background processing
- ✅ Là nền tảng của Progressive Web Apps (PWA)
- ✅ Cần implement proper cache strategies và error handling

**Xem bài tiếp theo →** [PWA Manifest](./06-pwa-manifest.md)
