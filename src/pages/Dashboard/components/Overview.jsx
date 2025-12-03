
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { Statistic } from "antd";
import { StyledCard } from "./style";
import {
    CalendarOutlined,
    DollarOutlined,
    UserOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import { Row, Col, Card } from "../style";
// Màu riêng cho từng thẻ
const colorMap = {
  users: "#1890ff",
  doctors: "#52c41a",
  appointments: "#faad14",
  revenue: "#f5222d",
};


const Overview = ({ isLoadingOverview, overviewData }) => {
  return (
    <LoadingComponent isLoading={isLoadingOverview} >
        <Row gutter={[16, 16]}>
            <Col span={6}>
                <StyledCard>
                    <div className="icon-wrapper" style={{ background: colorMap.users }}>
                        <UserOutlined />
                    </div>
                    <Statistic
                        title="Tổng số bệnh nhân"
                        value={overviewData.totalPatients || 0}
                        valueStyle={{ color: colorMap.users, fontWeight: 700 }}
                    />
                </StyledCard>
            </Col>

            <Col span={6}>
                <StyledCard>
                    <div className="icon-wrapper" style={{ background: colorMap.doctors }}>
                        <UserSwitchOutlined />
                    </div>
                    <Statistic
                        title="Tổng số bác sĩ"
                        value={overviewData.totalDoctors || 0}
                        valueStyle={{ color: colorMap.doctors, fontWeight: 700 }}
                    />
                </StyledCard>
            </Col>

            <Col span={6}>
                <StyledCard>
                    <div className="icon-wrapper" style={{ background: colorMap.appointments }}>
                        <CalendarOutlined />
                    </div>
                    <Statistic
                        title="Tổng số lịch khám"
                        value={overviewData.totalAppointments || 0}
                        valueStyle={{ color: colorMap.appointments, fontWeight: 700 }}
                    />
                </StyledCard>
            </Col>

            <Col span={6}>
                <StyledCard>
                    <div className="icon-wrapper" style={{ background: colorMap.revenue }}>
                        <DollarOutlined />
                    </div>
                    <Statistic
                        title="Doanh thu (VND)"
                        value={overviewData.totalRevenue || 0}
                        precision={0}
                        valueStyle={{ color: colorMap.revenue, fontWeight: 700 }}
                        formatter={(value) =>
                            value.toLocaleString("vi-VN", { minimumFractionDigits: 0 })
                        }
                    />
                </StyledCard>
            </Col>
        </Row>
    </LoadingComponent>
  )
}

export default Overview