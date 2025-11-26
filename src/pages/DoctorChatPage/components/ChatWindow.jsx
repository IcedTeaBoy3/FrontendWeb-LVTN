import { Avatar, Input, Button } from "antd";
import { useEffect, useRef, useState } from "react";

const ChatWindow = ({ selectedConversation, messages, onSend }) => {
    const [text, setText] = useState("");
    const listRef = useRef();

    // Auto scroll
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);
    if (!selectedConversation)
    return <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>Chọn một cuộc trò chuyện</div>;
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
      
            {/* Header */}
            <div style={{ padding: 16, borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center" }}>
                <Avatar src={selectedConversation.patient.avatar} />
                <span style={{ marginLeft: 10, fontSize: 16, fontWeight: 500 }}>
                {selectedConversation.patient?.person?.fullName}
                </span>
            </div>

            {/* Messages */}
            <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: 16, background: "#fafafa" }}>
                {messages?.map((msg) => (
                <div key={msg.messageId} style={{ marginBottom: 12, textAlign: msg.senderModel === "Doctor" ? "right" : "left" }}>
                    <div
                    style={{
                        display: "inline-block",
                        padding: "8px 14px",
                        background: msg.senderModel === "Doctor" ? "#1890ff" : "#e4e6eb",
                        color: msg.senderModel === "Doctor" ? "white" : "black",
                        borderRadius: 16,
                        maxWidth: "75%",
                    }}
                    >
                        {msg.content}
                    </div>
                </div>
                ))}
            </div>

            {/* Input */}
            <div style={{ padding: 16, borderTop: "1px solid #e8e8e8", display: "flex" }}>
                <Input
                    value={text}
                    placeholder="Nhập tin nhắn..."
                    onChange={(e) => setText(e.target.value)}
                    onPressEnter={() => {
                        onSend(text);
                        setText("");
                    }}
                />
                <Button type="primary" style={{ marginLeft: 8 }} onClick={() => {
                    onSend(text);
                    setText("");
                }}>
                    Gửi
                </Button>
            </div>
        </div>
    )
}

export default ChatWindow