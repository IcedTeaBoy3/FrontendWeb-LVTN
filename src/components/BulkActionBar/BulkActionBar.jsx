import { motion,AnimatePresence } from "framer-motion";
import { Typography, Divider, Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";

const { Text } = Typography;

export default function BulkActionBar({
    selectedRowKeys,
    handleSelectedAll,
    menuProps,
}) {
    return (
        <AnimatePresence>
            {selectedRowKeys.length > 0 && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{
                        background: "#f0f2f5",
                        padding: "10px",
                        borderRadius: 8,
                        margin: "10px 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    }}
                >
                    <Text strong>
                        Đã chọn {selectedRowKeys.length}{" "}
                        <Text type="secondary" underline onClick={handleSelectedAll}>
                            (Chọn tất cả)
                        </Text>
                    </Text>

                    <Divider type="vertical" style={{ height: "24px", margin: "0 10px" }} />

                    <Dropdown menu={menuProps} disabled={selectedRowKeys.length === 0}>
                        <ButtonComponent disabled={selectedRowKeys.length === 0}>
                            <Space>
                                Hành động
                                <DownOutlined />
                            </Space>
                        </ButtonComponent>
                    </Dropdown>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
