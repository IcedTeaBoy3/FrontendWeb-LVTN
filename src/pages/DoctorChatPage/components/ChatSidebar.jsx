import { List, Avatar, Badge, Typography } from "antd";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
// import { formatDistanceToNow } from "date-fns";
// import { vi } from "date-fns/locale";
import { theme } from "@/styles/theme";

const { Text } = Typography;

export default function ChatSidebar({ conversations = [], onSelect, activeId }) {
  return (
    <div
      style={{
        width: "360px",
        height: "100vh",
        borderRight: "1px solid #e8ecef",
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header cố định */}
      <div
        style={{
          padding: "20px",
          background: theme.primaryDark,
          color: "white",
          flexShrink: 0,
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          Tin nhắn bệnh nhân
        </h3>
        <Text style={{ color: "#d0e7ff", fontSize: "13px" }}>
          {conversations.length} cuộc trò chuyện
        </Text>
      </div>

      {/* Danh sách cuộn được */}
      <List
        dataSource={conversations}
        style={{ flex: 1, overflowY: "auto" }}
        renderItem={(item) => {
          const isActive = activeId === item.id;
          // const timeAgo = item.lastMessageAt
          //   ? formatDistanceToNow(new Date(item.lastMessageAt), {
          //       addSuffix: true,
          //       locale: vi,
          //     })
          //   : "Chưa có tin nhắn";

          return (
            <List.Item
              onClick={() => onSelect(item)}
              style={{
                padding: "14px 20px",
                cursor: "pointer",
                backgroundColor: isActive ? "#e6f3ff" : "transparent",
                borderLeft: isActive ? "4px solid #0d6efd" : "4px solid transparent",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "#f0f5ff";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    count={item.unreadDoctor || 0}
                    size="small"
                    offset={[-6, 6]}
                    style={{ backgroundColor: "#ff4d4f" }}
                  >
                    <Avatar
                      size={50}
                      icon={<UserOutlined />}
                      src={`${import.meta.env.VITE_BACKEND_URL}${item.patient?.person?.avatar}`}
                      style={{
                        border: "3px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Badge>
                }
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: "15px" }}>
                      {item.patient?.person?.fullName || "Bệnh nhân chưa có tên"}
                    </span>
                    {item.isUrgent && (
                      <span
                        style={{
                          background: "#ff4d4f",
                          color: "white",
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        KHẨN
                      </span>
                    )}
                  </div>
                }
                description={
                  <div>
                    <Text
                      ellipsis={{ tooltip: true }}
                      style={{ color: "#595959", fontSize: "14px", display: "block" }}
                    >
                      {item.lastMessage || "Chưa có tin nhắn"}
                    </Text>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <ClockCircleOutlined style={{ color: "#aaa", fontSize: "12px" }} />
                      {/* <Text type="secondary" style={{ fontSize: "12px" }}>
                        {timeAgo}
                      </Text> */}
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
}