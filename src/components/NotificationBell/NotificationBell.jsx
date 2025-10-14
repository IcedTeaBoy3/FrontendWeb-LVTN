import { Badge, Button, Dropdown, List, Typography, Empty } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNotifications } from "@/contexts/NotificationContext";

import { useNavigate } from "react-router-dom";
const { Text, Title } = Typography;

const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const handleNotificationClick = (notification) => {
    // Xử lý khi người dùng nhấp vào thông báo
    if(notification.type == "appointment"){
      navigate(`/admin/appointments/`);
    }
  }

  const hasNotifications = notifications.length > 0;

  const menuItems = hasNotifications
    ? [
        {
          key: "header",
          label: (
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                padding: "6px 12px",
                display: "flex",
                justifyContent: "space-between",
              }}
              
            >
              <span>Thông báo</span>  
            
            </div>
          ),
        },
        ...notifications.map((item) => ({
          key: item._id || item.notificationId,
          label: (
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #f0f0f0",
              }}
              onClick={() => handleNotificationClick(item)}
            >
                <Title level={5} style={{ marginBottom: 4, fontSize: 14 }}>
                  {item.title}
                </Title>
                <Text 
                  type="secondary" 
                  style={{
                    fontSize: 13,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                {item.message}
              </Text>
            </div>
          ),
        })),
      ]
    : [
        {
          key: "empty",
          label: (
            <div style={{ padding: "16px 24px", textAlign: "center" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có thông báo"
              />
            </div>
          ),
        },
      ];


  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <Button
        type="default"
        shape="circle"
        onClick={markAllAsRead}
        icon={
          <Badge
            count={unreadCount}
            size="small"
            overflowCount={9}
            offset={[-2, 4]}
          >
            <BellOutlined style={{ fontSize: 22, color: "#555" }} />
          </Badge>
        }
      />
    </Dropdown>
  );
};

export default NotificationBell;
