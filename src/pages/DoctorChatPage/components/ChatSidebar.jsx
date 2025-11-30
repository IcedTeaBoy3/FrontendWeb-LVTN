import { List, Avatar, Card, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
export default function ChatSidebar({ conversations, onSelect }) {
  return (
    <div style={{ width: "320px", borderRight: "1px solid #f0f0f0" }}>
      <List
        itemLayout="horizontal"
        dataSource={conversations}
        renderItem={(item) => (
          <List.Item onClick={() => onSelect(item)} style={{ cursor: "pointer" }}>
            <List.Item.Meta
              avatar={
                <Badge count={item.unreadDoctor}>
                  <Avatar size={40} icon={<UserOutlined />}  src={`${import.meta.env.VITE_BACKEND_URL}${item.patient?.person?.avatar}`} />
                </Badge>
              }
              title={item.patient.person?.fullName}
              description={item.lastMessage || "Chưa có tin nhắn"}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
