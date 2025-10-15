import { Badge, Button, Dropdown, List, Typography, Empty, Divider, Space } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (notification.type === "appointment") {
      navigate(`/admin/appointments`);
    }
  };

  const hasNotifications = notifications.length > 0;

  const menuContent = hasNotifications ? (
    <div style={{ width: 340, maxHeight: 420, overflowY: "auto" }}>
      {/* Header */}
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Thông báo
        </Title>
        <Space size="small">
          <Button
            type="text"
            icon={<CheckOutlined />}
            size="small"
            onClick={markAllAsRead}
          >
            Đã đọc hết
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={clearNotifications}
          >
            Xoá
          </Button>
        </Space>
      </div>

      <Divider style={{ margin: "4px 0" }} />

      {/* Danh sách thông báo */}
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleNotificationClick(item)}
            style={{
              cursor: "pointer",
              backgroundColor: item.isRead ? "#fff" : "#e6f4ff",
              padding: "10px 14px",
              borderLeft: item.isRead ? "4px solid transparent" : "4px solid #1677ff",
            }}
          >
            <List.Item.Meta
              title={
                <Text strong style={{ fontSize: 14 }}>
                  {item.title}
                </Text>
              }
              description={
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
              }
            />
          </List.Item>
        )}
      />
    </div>
  ) : (
    <div style={{ padding: "24px 16px", textAlign: "center" ,backgroundColor: "#fff", width: 340, height: 100 }}>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" />
    </div>
  );

  return (
    <Dropdown
      menu={null} // ✅ fix warning overlay deprecated
      popupRender={() => menuContent}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <Button
        type="default"
        shape="circle"
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
