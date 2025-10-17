---
title: "Lập trình mạng với JavaScript"
description: "Khám phá các kỹ thuật lập trình mạng hiện đại với JavaScript và Node.js"
date: 2024-01-10
author: "Kant Nguyễn"
tags: ["JavaScript", "Node.js", "Networking", "Web Development"]
---

# Lập trình mạng với JavaScript

JavaScript không chỉ là ngôn ngữ của web frontend mà còn là một công cụ mạnh mẽ cho lập trình mạng phía server với Node.js.

## Giới thiệu

Node.js đã cách mạng hóa việc sử dụng JavaScript cho backend development. Với event-driven, non-blocking I/O, Node.js rất phù hợp cho các ứng dụng mạng.

## HTTP Server cơ bản

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Express.js Framework

Express.js là framework phổ biến nhất cho Node.js:

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## WebSocket với Socket.io

Cho các ứng dụng real-time:

```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('message', (data) => {
    io.emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
```

## RESTful API

Xây dựng API RESTful với Express:

```javascript
app.get('/api/users', (req, res) => {
  // Lấy danh sách users
});

app.post('/api/users', (req, res) => {
  // Tạo user mới
});

app.put('/api/users/:id', (req, res) => {
  // Cập nhật user
});

app.delete('/api/users/:id', (req, res) => {
  // Xóa user
});
```

## Middleware

Middleware cho phép xử lý request trước khi đến route handler:

```javascript
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers
```

## Kết luận

JavaScript và Node.js cung cấp một ecosystem phong phú cho việc phát triển các ứng dụng mạng. Từ HTTP server đơn giản đến các ứng dụng real-time phức tạp, JavaScript đều có thể xử lý tốt.

---

*Hãy thử nghiệm và khám phá thêm về khả năng của JavaScript trong lập trình mạng!*
