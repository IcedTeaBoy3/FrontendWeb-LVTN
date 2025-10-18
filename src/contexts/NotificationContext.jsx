import { createContext, useContext, useEffect, useState } from "react";
import { socket,connectSocket } from "@/services/SocketService";
import { notification } from "antd";
import { NotificationService } from "@/services/NotificationService";
import { useSelector } from "react-redux";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const user = useSelector((state) => state.auth.user);
    const [unreadCount, setUnreadCount] = useState(0);
    const loadNotifications = async () => {
        const res = await NotificationService.getAllNotifications();
        if (res.status == "success") {
            setNotifications(res?.data?.notifications);
            setUnreadCount(res?.data?.notifications?.filter((n) => !n.isRead).length);
        }
    };
    useEffect(() => {
        connectSocket("admin", user?.accountId);
        loadNotifications();
        socket.on("new_notification", (newNotification) => {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            notification.info({
                message: newNotification.title,
                description: newNotification.message,
                placement: "bottomRight",
            });
        });
        return () => {
            socket.off("new_notification");
        };
        
    }, []);
    const markAllAsRead = async () => {
        await NotificationService.markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const clearNotifications = async () => {
        await NotificationService.clearAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
    };
    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, setNotifications, markAllAsRead, clearNotifications, loadNotifications }}
        >
        {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
