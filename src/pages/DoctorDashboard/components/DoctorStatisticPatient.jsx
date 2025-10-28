import { UserOutlined } from "@ant-design/icons";
import BarChart from "@/components/BarChart/BarChart";
import PieChart from "@/components/PieChart/PieChart";
import LoadingCompoent from "@/components/LoadingComponent/LoadingComponent";
import { StyledCard } from "./style";
import { Row, Col, Statistic, Card, Splitter } from "antd";
import { Typography } from "antd";
const { Title } = Typography;
const COLORSGENDER = ["#1890ff", "#f759ab", "#52c41a", "#faad14"];
const DoctorStatisticPatient = ({statisticPatientData, isLoading}) => {
    const pieChartDataGender = statisticPatientData.genderStats?.map(item => ({
        name: item.gender === 'male' ? 'Nam' : item.gender === 'female' ? 'Nữ' : 'Khác',
        value: item.total,
    }));
    const barChartDataAge = statisticPatientData.ageStats?.map(item => ({
        ageRange: item.range,
        total: item.total,
    }));
    const total = statisticPatientData?.totalPatients || 0;
    const repeat = statisticPatientData?.repeatPatients || 0;
    const percent = total > 0 ? ((repeat / total) * 100).toFixed(1) : 0;
    return (
        <LoadingCompoent isLoading={isLoading}    >
            <Row gutter={[24, 24]} justify="space-between" align="middle">
                <Col xs={24} md={8}>
                    <StyledCard>
                        <div className="icon-wrapper" style={{ background: "#1890ff" }}>
                        <UserOutlined style={{ color: 'white', fontSize: '22px' }} />
                        </div>
                        <Statistic
                        title="Tổng số bệnh nhân đặt lịch / tái khám"
                        value={`${total} / ${repeat}`}
                        valueStyle={{ color: "#1890ff", fontWeight: 700 }}
                        />
                    </StyledCard>
                </Col>
                <Col xs={24} md={8}>
                    <StyledCard>
                        <Statistic
                        title="Tỉ lệ bệnh nhân tái khám"
                        value={`${percent}%`}
                        valueStyle={{ color: "#1890ff", fontWeight: 700 }}
                        />
                    </StyledCard>
                </Col>
            </Row>
            <Splitter style={{ marginTop: 32, height: 420 }}>
                <Splitter.Panel defaultSize="50%">
                    <Card>
                    <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>
                        Biểu đồ bệnh nhân theo giới tính
                    </Title>
                    <PieChart
                        outerRadius={120}
                        COLORS={COLORSGENDER}
                        data={pieChartDataGender || []}
                    />
                    </Card>
                </Splitter.Panel>

                <Splitter.Panel defaultSize="50%">
                    <Card>
                    <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>
                        Biểu đồ bệnh nhân theo độ tuổi
                    </Title>
                    <BarChart
                        data={barChartDataAge || []}
                        xDataKey="ageRange"
                        barDataKey="total"
                        barColor="#1890ff"
                    />
                    </Card>
                </Splitter.Panel>
            </Splitter>
        </LoadingCompoent>
    )
}

export default DoctorStatisticPatient