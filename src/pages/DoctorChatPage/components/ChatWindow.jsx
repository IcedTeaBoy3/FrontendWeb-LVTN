import { Avatar, Input, Button, Typography, Space } from "antd";
import { useEffect, useRef, useState } from "react";
import { UserOutlined, SendOutlined } from "@ant-design/icons";
import { theme } from "@/styles/theme";

const { Text } = Typography;

const ChatWindow = ({ selectedConversation, messages = [], onSend }) => {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  // Auto scroll xuống tin nhắn mới nhất
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  if (!selectedConversation) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f8f9fa",
          color: "#999",
          fontSize: 18,
        }}
      >
        Chọn một bệnh nhân để bắt đầu trò chuyện
      </div>
    );
  }

  const patient = selectedConversation.patient?.person;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#f0f5ff",
      }}
    >
      {/* Header – Thanh thông tin bệnh nhân */}
      <div
        style={{
          padding: "16px 24px",
          background: theme.primaryDark,
          color: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Space size={14}>
          <Avatar
            size={52}
            icon={<UserOutlined />}
            src={`${import.meta.env.VITE_BACKEND_URL}${patient?.avatar}`}
            style={{ border: "3px solid white" }}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {patient?.fullName || "Bệnh nhân"}
            </div>
            <Text style={{ color: "#d0e7ff", fontSize: 13 }}>
              Đang hoạt động
            </Text>
          </div>
        </Space>
      </div>

      {/* Khu vực tin nhắn */}
      <div
        ref={listRef}
        style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            // backgroundImage: 'url("/chat-background.png")',
            backgroundSize: "500px",
            backgroundPosition: "center",
        }}
      >
        {messages.map((msg) => {
          const isDoctor = msg.senderModel === "Doctor";

          return (
            <div
              key={msg.messageId}
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: isDoctor ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                    maxWidth: "70%",
                    padding: "10px 16px",
                    borderRadius: 18,
                    background: isDoctor ? theme.primary : "white",
                    color: isDoctor ? "white" : "black",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: isDoctor ? "none" : "1px solid #e8e8e8",
                    position: "relative",
                }}
              >
                <Text style={{ fontSize: 15, lineHeight: 1.5 }}>
                  {msg.content}
                </Text>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    opacity: 0.8,
                    textAlign: "right",
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thanh nhập tin nhắn */}
      <div
        style={{
          padding: "16px 24px",
          background: "white",
          borderTop: "1px solid #e8e8e8",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Space.Compact style={{ width: "100%" }}>
          <Input
            size="large"
            placeholder="Nhập tin nhắn cho bệnh nhân..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              borderRadius: "24px",
              padding: "10px 18px",
            }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!text.trim()}
            style={{
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Space.Compact>
      </div>
    </div>
  );
};

export default ChatWindow;