import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { notification } from "antd";
import { useState, useEffect } from "react";
import { socket,connectSocket } from "@/services/SocketService";
import { ChatDoctorService } from "@/services/ChatDoctorService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const DoctorChatPage = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const queryClient = useQueryClient();

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
        if (!user) return;
        connectSocket(user.role, user.accountId);

        return () => {
            socket.disconnect();
        };
    }, [user]);
    useEffect(() => {
        if (!selectedConversation) return;

        const conversationId = selectedConversation.conversationId;

        // 🔥 Mark as read
        socket.emit("mask_as_read", { conversationId });

        // 🔥 Cập nhật UI conversation list
        socket.on("conversation_read", ({ conversationId: readId }) => {
            queryClient.setQueryData(
                ["getDoctorConversations", doctorId],
                (oldData) => {
                    if (!oldData?.data) return oldData;

                    return {
                        ...oldData,
                        data: oldData.data.map((conv) =>
                            conv.conversationId === readId
                                ? { ...conv, unreadDoctor: 0 }
                                : conv
                        ),
                    };
                }
            );
        });

        // 🔥 Load messages
        loadMessages(conversationId);

        socket.on("new_message", (message) => {
            if (message.senderModel === "PatientProfile") {
                notification.info({
                    message: "Tin nhắn mới",
                    description: `Bạn có tin nhắn mới từ bệnh nhân ${message.sender.person.fullName}`,
                    placement: "topRight",
                });
            }

        // 🔥 UPDATE CONVERSATION LIST (KHÔNG return)
        queryClient.setQueryData(
            ["getDoctorConversations", doctorId],
            (oldData) => {
                if (!oldData?.data) return oldData;

                return {
                    ...oldData,
                    data: oldData.data.map((conv) =>
                        conv.conversationId === message.conversation
                            ? {
                                ...conv,
                                lastMessage: message.content, // ✅ string
                                lastMessageAt: message.createdAt,
                                unreadDoctor:
                                    message.conversation === conversationId
                                        ? 0
                                        : conv.unreadDoctor + 1,
                            }
                            : conv
                    ),
                };
            }
        );

        // 🔥 CHỈ append message nếu đang mở đúng conversation
        if (message.conversation === conversationId) {
            setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            socket.off("conversation_read");
            socket.off("new_message");
        };
    }, [selectedConversation, doctorId]);
    

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
