---
title: "Dự án Chat Mini - Ứng dụng chat hoàn chỉnh"
description: "Kết hợp tất cả kiến thức đã học để xây dựng ứng dụng chat với GUI, WebSocket, và database"
date: 2025-09-17
tags: ["Java", "Project", "Chat", "GUI", "WebSocket", "Database"]
series: "Lập trình mạng với Java"
prev: "/Kant_Nguyen_Astro_Blog/blog/06-websocket-java/"
next: "/Kant_Nguyen_Astro_Blog/blog/08-summary-feynman/"
---

## 📚 Series Overview

<div class="series-table">

| # | Bài viết | Liên kết |
|:-:|:---------------------------|:------------------------------|
| 00 | Giới thiệu & Chuẩn bị môi trường | [00-intro-environment](/Kant_Nguyen_Astro_Blog/blog/00-intro-environment/) |
| 01 | TCP Socket cơ bản | [01-tcp-socket-basic](/Kant_Nguyen_Astro_Blog/blog/01-tcp-socket-basic/) |
| 02 | TCP Server đa luồng | [02-tcp-multithreaded-server](/Kant_Nguyen_Astro_Blog/blog/02-tcp-multithreaded-server/) |
| 03 | Lập trình mạng với UDP | [03-udp-datagram](/Kant_Nguyen_Astro_Blog/blog/03-udp-datagram/) |
| 04 | Java 11 HttpClient | [04-httpclient-api](/Kant_Nguyen_Astro_Blog/blog/04-httpclient-api/) |
| 05 | HTTPS và TLS | [05-https-tls](/Kant_Nguyen_Astro_Blog/blog/05-https-tls/) |
| 06 | WebSocket trong Java | [06-websocket-java](/Kant_Nguyen_Astro_Blog/blog/06-websocket-java/) |
| 07 | Ứng dụng chat mini | [07-chat-mini-project](/Kant_Nguyen_Astro_Blog/blog/07-chat-mini-project/) |
| 08 | Tổng kết & Feynman Review | [08-summary-feynman](/Kant_Nguyen_Astro_Blog/blog/08-summary-feynman/) |

</div>

# 🧠 Giới thiệu

Đây là bài cuối cùng trong series, nơi chúng ta sẽ kết hợp tất cả kiến thức đã học để xây dựng một ứng dụng chat hoàn chỉnh với GUI, WebSocket server, database, và các tính năng nâng cao.

Dự án này sẽ bao gồm:
- Chat server với WebSocket
- Desktop client với JavaFX GUI
- Database để lưu tin nhắn
- Authentication và user management
- File sharing và emoji support

<!-- IMAGE_PLACEHOLDER -->

# 💻 Code minh họa

**ChatServer.java - Server chính với Spring Boot:**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@SpringBootApplication
@EnableWebSocket
public class ChatServer implements WebSocketConfigurer {
    
    public static void main(String[] args) {
        SpringApplication.run(ChatServer.class, args);
        System.out.println("🚀 Chat Server đang chạy trên port 8080");
        System.out.println("WebSocket endpoint: ws://localhost:8080/chat");
    }
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatWebSocketHandler(), "/chat")
                .setAllowedOrigins("*");
    }
    
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
```

**ChatWebSocketHandler.java - WebSocket Handler nâng cao:**

```java
import org.springframework.web.socket.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

public class ChatWebSocketHandler implements WebSocketHandler {
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> userNames = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ChatService chatService = new ChatService();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        
        System.out.println("✅ Client kết nối: " + sessionId);
        
        // Gửi danh sách user online
        sendUserList(session);
        
        // Gửi tin nhắn gần đây
        sendRecentMessages(session);
    }
    
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String sessionId = session.getId();
        String messageText = (String) message.getPayload();
        
        try {
            // Parse JSON message
            ChatMessage chatMessage = objectMapper.readValue(messageText, ChatMessage.class);
            
            switch (chatMessage.getType()) {
                case "JOIN":
                    handleJoin(session, chatMessage);
                    break;
                case "MESSAGE":
                    handleMessage(session, chatMessage);
                    break;
                case "FILE":
                    handleFile(session, chatMessage);
                    break;
                case "EMOJI":
                    handleEmoji(session, chatMessage);
                    break;
                case "TYPING":
                    handleTyping(session, chatMessage);
                    break;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi parse message: " + e.getMessage());
        }
    }
    
    private void handleJoin(WebSocketSession session, ChatMessage message) {
        String sessionId = session.getId();
        String userName = message.getContent();
        
        userNames.put(sessionId, userName);
        
        // Lưu vào database
        chatService.saveMessage(userName, "JOIN", "đã tham gia chat");
        
        // Broadcast đến tất cả client
        broadcast(new ChatMessage("SYSTEM", userName + " đã tham gia chat", "JOIN"));
        
        // Gửi danh sách user mới
        broadcastUserList();
    }
    
    private void handleMessage(WebSocketSession session, ChatMessage message) {
        String sessionId = session.getId();
        String userName = userNames.get(sessionId);
        
        if (userName != null) {
            // Lưu vào database
            chatService.saveMessage(userName, "MESSAGE", message.getContent());
            
            // Broadcast tin nhắn
            ChatMessage broadcastMessage = new ChatMessage(userName, message.getContent(), "MESSAGE");
            broadcast(broadcastMessage);
        }
    }
    
    private void handleFile(WebSocketSession session, ChatMessage message) {
        String sessionId = session.getId();
        String userName = userNames.get(sessionId);
        
        if (userName != null) {
            // Lưu file info vào database
            chatService.saveMessage(userName, "FILE", message.getContent());
            
            // Broadcast file message
            ChatMessage broadcastMessage = new ChatMessage(userName, message.getContent(), "FILE");
            broadcast(broadcastMessage);
        }
    }
    
    private void handleEmoji(WebSocketSession session, ChatMessage message) {
        String sessionId = session.getId();
        String userName = userNames.get(sessionId);
        
        if (userName != null) {
            ChatMessage broadcastMessage = new ChatMessage(userName, message.getContent(), "EMOJI");
            broadcast(broadcastMessage);
        }
    }
    
    private void handleTyping(WebSocketSession session, ChatMessage message) {
        String sessionId = session.getId();
        String userName = userNames.get(sessionId);
        
        if (userName != null) {
            // Chỉ gửi đến các client khác
            ChatMessage typingMessage = new ChatMessage(userName, message.getContent(), "TYPING");
            broadcast(typingMessage, sessionId);
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String sessionId = session.getId();
        String userName = userNames.get(sessionId);
        
        sessions.remove(sessionId);
        userNames.remove(sessionId);
        
        if (userName != null) {
            chatService.saveMessage(userName, "LEAVE", "đã rời khỏi chat");
            broadcast(new ChatMessage("SYSTEM", userName + " đã rời khỏi chat", "LEAVE"));
        }
        
        broadcastUserList();
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("❌ Transport error: " + exception.getMessage());
    }
    
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
    
    private void broadcast(ChatMessage message) {
        broadcast(message, null);
    }
    
    private void broadcast(ChatMessage message, String excludeSessionId) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            
            sessions.values().stream()
                .filter(session -> !session.getId().equals(excludeSessionId))
                .forEach(session -> {
                    try {
                        if (session.isOpen()) {
                            session.sendMessage(new TextMessage(jsonMessage));
                        }
                    } catch (IOException e) {
                        System.err.println("❌ Lỗi broadcast: " + e.getMessage());
                    }
                });
        } catch (Exception e) {
            System.err.println("❌ Lỗi serialize message: " + e.getMessage());
        }
    }
    
    private void sendUserList(WebSocketSession session) {
        try {
            List<String> users = new ArrayList<>(userNames.values());
            ChatMessage userListMessage = new ChatMessage("SYSTEM", 
                objectMapper.writeValueAsString(users), "USER_LIST");
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(userListMessage)));
        } catch (IOException e) {
            System.err.println("❌ Lỗi gửi user list: " + e.getMessage());
        }
    }
    
    private void broadcastUserList() {
        try {
            List<String> users = new ArrayList<>(userNames.values());
            ChatMessage userListMessage = new ChatMessage("SYSTEM", 
                objectMapper.writeValueAsString(users), "USER_LIST");
            
            broadcast(userListMessage);
        } catch (Exception e) {
            System.err.println("❌ Lỗi broadcast user list: " + e.getMessage());
        }
    }
    
    private void sendRecentMessages(WebSocketSession session) {
        try {
            List<ChatMessage> recentMessages = chatService.getRecentMessages(10);
            for (ChatMessage message : recentMessages) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            }
        } catch (IOException e) {
            System.err.println("❌ Lỗi gửi recent messages: " + e.getMessage());
        }
    }
}
```

**ChatMessage.java - Model cho tin nhắn:**

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ChatMessage {
    @JsonProperty("sender")
    private String sender;
    
    @JsonProperty("content")
    private String content;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("timestamp")
    private String timestamp;
    
    public ChatMessage() {
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
    
    public ChatMessage(String sender, String content, String type) {
        this.sender = sender;
        this.content = content;
        this.type = type;
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
    
    // Getters and setters
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
```

**ChatService.java - Service layer với database:**

```java
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChatService {
    private static final String DB_URL = "jdbc:h2:mem:chatdb";
    private static final String DB_USER = "sa";
    private static final String DB_PASSWORD = "";
    
    public ChatService() {
        initializeDatabase();
    }
    
    private void initializeDatabase() {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String createTable = """
                CREATE TABLE IF NOT EXISTS messages (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    sender VARCHAR(100) NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """;
            
            conn.createStatement().execute(createTable);
            System.out.println("✅ Database initialized");
            
        } catch (SQLException e) {
            System.err.println("❌ Database error: " + e.getMessage());
        }
    }
    
    public void saveMessage(String sender, String type, String content) {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "INSERT INTO messages (sender, type, content) VALUES (?, ?, ?)";
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, sender);
                stmt.setString(2, type);
                stmt.setString(3, content);
                stmt.executeUpdate();
            }
            
        } catch (SQLException e) {
            System.err.println("❌ Save message error: " + e.getMessage());
        }
    }
    
    public List<ChatMessage> getRecentMessages(int limit) {
        List<ChatMessage> messages = new ArrayList<>();
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT sender, type, content, timestamp FROM messages ORDER BY timestamp DESC LIMIT ?";
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, limit);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        ChatMessage message = new ChatMessage();
                        message.setSender(rs.getString("sender"));
                        message.setType(rs.getString("type"));
                        message.setContent(rs.getString("content"));
                        message.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime()
                            .format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss")));
                        messages.add(message);
                    }
                }
            }
            
        } catch (SQLException e) {
            System.err.println("❌ Get messages error: " + e.getMessage());
        }
        
        return messages;
    }
}
```

**ChatClientGUI.java - JavaFX Client:**

```java
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.util.List;

public class ChatClientGUI extends Application {
    private WebSocketClient webSocketClient;
    private ObjectMapper objectMapper = new ObjectMapper();
    private String userName;
    
    private TextArea chatArea;
    private TextField messageField;
    private ListView<String> userList;
    private Button sendButton;
    private Button emojiButton;
    
    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("Chat Client");
        
        // Tạo layout chính
        BorderPane mainPane = new BorderPane();
        
        // Chat area
        chatArea = new TextArea();
        chatArea.setEditable(false);
        chatArea.setWrapText(true);
        chatArea.setPrefRowCount(20);
        
        // User list
        userList = new ListView<>();
        userList.setPrefWidth(150);
        
        // Message input area
        HBox inputArea = new HBox(10);
        messageField = new TextField();
        messageField.setPromptText("Nhập tin nhắn...");
        messageField.setOnAction(e -> sendMessage());
        
        sendButton = new Button("Gửi");
        sendButton.setOnAction(e -> sendMessage());
        
        emojiButton = new Button("😀");
        emojiButton.setOnAction(e -> showEmojiPicker());
        
        inputArea.getChildren().addAll(messageField, sendButton, emojiButton);
        
        // Layout
        VBox rightPane = new VBox(10);
        rightPane.getChildren().addAll(new Label("Người dùng online:"), userList);
        
        mainPane.setCenter(chatArea);
        mainPane.setRight(rightPane);
        mainPane.setBottom(inputArea);
        
        // Padding
        mainPane.setPadding(new Insets(10));
        rightPane.setPadding(new Insets(10));
        inputArea.setPadding(new Insets(10));
        
        Scene scene = new Scene(mainPane, 800, 600);
        primaryStage.setScene(scene);
        primaryStage.show();
        
        // Kết nối WebSocket
        connectToServer();
    }
    
    private void connectToServer() {
        try {
            webSocketClient = new WebSocketClient(new URI("ws://localhost:8080/chat")) {
                @Override
                public void onOpen(ServerHandshake handshake) {
                    System.out.println("✅ Kết nối thành công");
                    
                    // Nhập tên người dùng
                    userName = showInputDialog("Nhập tên của bạn:");
                    if (userName != null && !userName.trim().isEmpty()) {
                        sendJoinMessage(userName);
                    }
                }
                
                @Override
                public void onMessage(String message) {
                    try {
                        ChatMessage chatMessage = objectMapper.readValue(message, ChatMessage.class);
                        handleMessage(chatMessage);
                    } catch (Exception e) {
                        System.err.println("❌ Lỗi parse message: " + e.getMessage());
                    }
                }
                
                @Override
                public void onClose(int code, String reason, boolean remote) {
                    System.out.println("👋 Kết nối đã đóng");
                }
                
                @Override
                public void onError(Exception ex) {
                    System.err.println("❌ WebSocket error: " + ex.getMessage());
                }
            };
            
            webSocketClient.connect();
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi kết nối: " + e.getMessage());
        }
    }
    
    private void handleMessage(ChatMessage message) {
        switch (message.getType()) {
            case "MESSAGE":
                chatArea.appendText("[" + message.getTimestamp() + "] " + 
                    message.getSender() + ": " + message.getContent() + "\n");
                break;
            case "SYSTEM":
                chatArea.appendText("[" + message.getTimestamp() + "] " + 
                    message.getContent() + "\n");
                break;
            case "USER_LIST":
                try {
                    List<String> users = objectMapper.readValue(message.getContent(), 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                    userList.getItems().clear();
                    userList.getItems().addAll(users);
                } catch (Exception e) {
                    System.err.println("❌ Lỗi parse user list: " + e.getMessage());
                }
                break;
            case "TYPING":
                // Hiển thị typing indicator
                break;
        }
    }
    
    private void sendMessage() {
        String message = messageField.getText().trim();
        if (!message.isEmpty()) {
            try {
                ChatMessage chatMessage = new ChatMessage(userName, message, "MESSAGE");
                webSocketClient.send(objectMapper.writeValueAsString(chatMessage));
                messageField.clear();
            } catch (Exception e) {
                System.err.println("❌ Lỗi gửi message: " + e.getMessage());
            }
        }
    }
    
    private void sendJoinMessage(String userName) {
        try {
            ChatMessage joinMessage = new ChatMessage(userName, userName, "JOIN");
            webSocketClient.send(objectMapper.writeValueAsString(joinMessage));
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi join message: " + e.getMessage());
        }
    }
    
    private void showEmojiPicker() {
        // Simple emoji picker
        String[] emojis = {"😀", "😂", "😍", "🤔", "👍", "👎", "❤️", "🎉"};
        
        Alert alert = new Alert(Alert.AlertType.NONE);
        alert.setTitle("Chọn Emoji");
        
        HBox emojiBox = new HBox(10);
        for (String emoji : emojis) {
            Button emojiBtn = new Button(emoji);
            emojiBtn.setOnAction(e -> {
                try {
                    ChatMessage emojiMessage = new ChatMessage(userName, emoji, "EMOJI");
                    webSocketClient.send(objectMapper.writeValueAsString(emojiMessage));
                    alert.close();
                } catch (Exception ex) {
                    System.err.println("❌ Lỗi gửi emoji: " + ex.getMessage());
                }
            });
            emojiBox.getChildren().add(emojiBtn);
        }
        
        alert.getDialogPane().setContent(emojiBox);
        alert.showAndWait();
    }
    
    private String showInputDialog(String message) {
        TextInputDialog dialog = new TextInputDialog();
        dialog.setTitle("Chat Client");
        dialog.setHeaderText(message);
        dialog.setContentText("Tên:");
        
        return dialog.showAndWait().orElse("");
    }
    
    public static void main(String[] args) {
        launch(args);
    }
}
```

# ⚙️ Phân tích & Giải thích

**Project Architecture:**

1. **Server Layer**: Spring Boot với WebSocket support
2. **Service Layer**: Business logic và database operations
3. **Client Layer**: JavaFX GUI application
4. **Data Layer**: H2 in-memory database

**Key Features:**

- **Real-time Messaging**: WebSocket cho instant communication
- **User Management**: Track online users
- **Message Persistence**: Lưu tin nhắn vào database
- **Emoji Support**: Gửi emoji reactions
- **Typing Indicators**: Hiển thị khi ai đó đang gõ
- **File Sharing**: Gửi file (có thể mở rộng)

**Database Design:**

- **messages table**: Lưu tất cả tin nhắn
- **id**: Primary key auto-increment
- **sender**: Tên người gửi
- **type**: Loại tin nhắn (MESSAGE, JOIN, LEAVE, FILE, EMOJI)
- **content**: Nội dung tin nhắn
- **timestamp**: Thời gian gửi

**Message Types:**

- **JOIN**: User tham gia chat
- **MESSAGE**: Tin nhắn bình thường
- **FILE**: Gửi file
- **EMOJI**: Gửi emoji
- **TYPING**: Typing indicator
- **USER_LIST**: Danh sách user online
- **SYSTEM**: Tin nhắn hệ thống

# 🧭 Ứng dụng thực tế

**Các tính năng có thể mở rộng:**

- **Authentication**: Login/logout với database
- **Private Messages**: Tin nhắn riêng tư
- **File Upload**: Upload và share files
- **Message Encryption**: Mã hóa tin nhắn
- **Push Notifications**: Thông báo khi offline
- **Message Search**: Tìm kiếm tin nhắn cũ
- **Voice Messages**: Gửi voice notes
- **Video Calls**: WebRTC integration

**Production Considerations:**

- **Scalability**: Sử dụng Redis cho session management
- **Load Balancing**: Multiple server instances
- **Security**: HTTPS, authentication, rate limiting
- **Monitoring**: Logs, metrics, health checks
- **Database**: PostgreSQL/MySQL thay vì H2
- **Caching**: Cache frequent data

# 🎓 Giải thích theo Feynman

Hãy tưởng tượng ứng dụng chat như một quán cà phê:

**Chat Server** như quán cà phê:
- Có không gian để mọi người gặp gỡ
- Quản lý khách hàng và cuộc trò chuyện
- Cung cấp dịch vụ cho tất cả mọi người
- Lưu trữ lịch sử cuộc trò chuyện

**WebSocket** như không khí trong quán:
- Mọi người có thể nói chuyện tự do
- Không cần "gọi" mỗi lần muốn nói
- Tin nhắn lan truyền ngay lập tức
- Như nói chuyện trực tiếp

**Database** như sổ ghi chép của quán:
- Ghi lại tất cả cuộc trò chuyện
- Lưu thông tin khách hàng
- Có thể tra cứu lại sau này
- Như lịch sử hoạt động của quán

**GUI Client** như bàn ngồi của bạn:
- Có thể nhìn thấy mọi người xung quanh
- Có thể nói chuyện với mọi người
- Có thể gửi emoji để thể hiện cảm xúc
- Như ngồi trong quán và tham gia cuộc trò chuyện

**Message Types** như các loại cuộc trò chuyện:
- **MESSAGE**: Nói chuyện bình thường
- **JOIN**: Ai đó vào quán
- **LEAVE**: Ai đó rời quán
- **EMOJI**: Thể hiện cảm xúc
- **TYPING**: Đang suy nghĩ điều gì đó

# 🧩 Tổng kết ngắn

- ✅ Kết hợp tất cả kiến thức đã học trong series
- ✅ Xây dựng ứng dụng chat hoàn chỉnh với GUI
- ✅ Sử dụng WebSocket cho real-time communication
- ✅ Database để lưu trữ tin nhắn và user data
- ✅ Có thể mở rộng với nhiều tính năng nâng cao

**Xem bài tiếp theo →** [Tổng kết Feynman](/Kant_Nguyen_Astro_Blog/blog/08-summary-feynman/)
