import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { notification } from "antd";
import { useState, useEffect } from "react";
import { socket,connectSocket } from "@/services/SocketService";
import { ChatDoctorService } from "@/services/ChatDoctorService";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const DoctorChatPage = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    const user = useSelector((state) => state.auth.user);
    const doctorId = user?.doctor?.doctorId;

    // 📌 Lấy danh sách conversation của bác sĩ
    const { data: conversations } = useQuery({
        queryKey: ["getDoctorConversations", doctorId],
        queryFn: () => ChatDoctorService.getDoctorConversations(doctorId),
        enabled: !!doctorId,
    });

    // 📌 Lấy message của conversation đang chọn
    const loadMessages = async (conversationId) => {
        try {
            const res = await ChatDoctorService.getMessages(conversationId);
            if (res.status === "success") {
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Lấy tin nhắn thất bại:", error);
        }
    }

    useEffect(() => {
        connectSocket(user?.role, user?.accountId);
        if (!selectedConversation) return;
        loadMessages(selectedConversation.conversationId);
        socket.on("new_message", (message) => {
            if(message.senderModel === 'PatientProfile'){
                notification.info({
                    message: "Tin nhắn mới",
                    description: `Bạn có tin nhắn mới từ bệnh nhân ${message.sender.person.fullName}`,
                    placement: "topRight",
                });
            }
            if (message.conversation !== selectedConversation.conversationId) return;
            setMessages((prev) => [...prev, message]);
        });
        

        return () => {
            socket.off("new_message");
        };
    }, [selectedConversation]);
    

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <ChatSidebar
                conversations={conversations?.data || []}
                onSelect={(conv) => {
                    setSelectedConversation(conv);

                    socket.emit("join_conversation", {
                        conversationId: conv.conversationId,
                    });
                    // Đánh dấu tin nhắn đã đọc
                    // socket.emit("mark_as_read", { conversationId: conv.conversationId });
                    
                }}
            />

            <ChatWindow
                selectedConversation={selectedConversation}
                messages={messages}
                onSend={(content) => {
                    if (!selectedConversation) return;
                    socket.emit("send_message", {
                        conversationId: selectedConversation.conversationId,
                        senderId: doctorId,
                        content,
                        messageType: "text",
                    });

                }}
            />
        </div>
    );
};

export default DoctorChatPage;
