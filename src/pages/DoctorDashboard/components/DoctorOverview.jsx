import React from 'react'
import { StyledCard } from "./style";
import { UserOutlined,CalendarOutlined,DollarOutlined,WarningOutlined } from "@ant-design/icons";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { Row, Col, Statistic } from "antd";
const DoctorOverview = ({ overview, isLoading }) => {
    return (
        <LoadingComponent isLoading={isLoading}>
            <Row gutter={16}>
                <Col span={6}>
                    <StyledCard>
                        <div className="icon-wrapper" style={{ background: "#1890ff" }}>
                        <UserOutlined style={{ color: 'white', fontSize: '22px' }} />
                        </div>
                        <Statistic
                            title="Tổng số bệnh nhân"
                            value={overview.totalPatients || 0}
                            valueStyle={{ color: "#1890ff", fontWeight: 700 }}
                        />
                    </StyledCard>
                </Col>
                <Col span={6}>
                    <StyledCard>
                        <div className="icon-wrapper" style={{ background: "#52c41a" }}>
                            <CalendarOutlined style={{ color: 'white', fontSize: '22px' }} />
                        </div>
                        <Statistic
                            title="Tổng số lịch khám"
                            value={overview.totalAppointments || 0}
                            valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                        />
                    </StyledCard>
                </Col>
                <Col span={6}>
                    <StyledCard>
                        <div className="icon-wrapper" style={{ background: "#faad14" }}>
                            <WarningOutlined style={{ color: 'white', fontSize: '22px' }}/>
                        </div>
                        <Statistic
                            title="Lịch khám đã hủy hoặc bỏ lỡ"
                            value={overview.cancelledAppointments || 0}
                            valueStyle={{ color: "#faad14", fontWeight: 700 }}
                        />
                    </StyledCard>
                </Col>
                <Col span={6}>
                    <StyledCard>
                        <div className="icon-wrapper" style={{ background: "#f5222d" }}>
                            <DollarOutlined style={{ color: 'white', fontSize: '22px' }}/>
                        </div>
                        <Statistic
                            title="Doanh thu (VNĐ)"
                            value={overview.totalRevenue || 0}
                            valueStyle={{ color: "#f5222d", fontWeight: 700 }}
                        />
                    </StyledCard>
                </Col>
            </Row>
        </LoadingComponent>
    )
}

export default DoctorOverview