import { Typography, Card, Divider, List, Tag, Rate, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardService } from "@/services/DashboardService";
import { AppointmentService } from "@/services/AppointmentService";
import { DoctorReviewService } from "@/services/DoctorReviewService";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined,MessageOutlined  } from "@ant-design/icons";
import { convertStatusAppointment, getStatusColor } from "@/utils/status_appointment_utils";
import Overview from "./components/Overview";
import LoadingCompoent from "@/components/LoadingComponent/LoadingComponent";
import TimeFilter from "@/components/TimeFilter/TimeFilter";
import PieChart from "@/components/PieChart/PieChart";
const { Title,Text, Paragraph } = Typography;
import { Row, Col } from "./style";
import dayjs from "dayjs";
const lineColor = '#0096ff';

const Dashboard = () => {

    const [filter, setFilter] = useState("today");
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(6, 'day').startOf('day').toDate(), // 6 ngày trước
        dayjs().endOf('day').toDate(), // hôm nay
    ]);
   
    const queryGetAdminDashboard = useQuery({
        queryKey: ['getAdminDashboard', filter],
        queryFn: () => DashboardService.getAdminOverview(filter),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminRevenue = useQuery({
        queryKey: ['getAdminRevenue'],
        queryFn: async () => {
            if (dateRange.length === 2) {
                return await DashboardService.getAdminRevenue({
                    type: 'range',
                    start: dateRange[0],
                    end: dateRange[1],
                });
            }
        },
        enabled: dateRange.length === 2,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    
    // gần nhất
    const queryGetAllAppointments = useQuery({
        queryKey: ['getAllAppointments'],
        queryFn: () => AppointmentService.getAllAppointments({ page: 1, limit: 5 }),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    // lấy các đánh giá bình luần gần nhất
    const queryGetRecentReviews = useQuery({
        queryKey: ['getRecentReviews'],
        queryFn: () => DoctorReviewService.getAllDoctorReviews({ page: 1, limit: 5 }),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    
    const { data: overview, isLoading: isLoadingOverview } = queryGetAdminDashboard;
    const { data: revenue, isLoading: isLoadingRevenue} = queryGetAdminRevenue;
    
    const { data: appointments, isLoading: isLoadingAppointments } = queryGetAllAppointments;
    const { data: doctorReviews, isLoading: isLoadingRecentReviews } = queryGetRecentReviews;
    const revenueData = revenue?.data || [];
    const overviewData = overview?.data || {};
    // const appointmentStatusData = appointmentStatus?.data || {};
    const appointmentData = appointments?.data?.appointments || [];
    const doctorReviewsData = doctorReviews?.data?.reviews || [];
    // Chuyển sang array
   
    const recentAppointmentData = appointmentData.map(appointment => ({
        key: appointment.id,
        patientName: appointment.patientProfile.person?.fullName ?? '--',
        doctorName: appointment.doctorService?.doctor?.person?.fullName ?? '--',
        date: dayjs(appointment.schedule?.workday).format('DD/MM/YYYY'),
        time: dayjs(appointment.slot?.startTime).format('HH:mm') + ' - ' + dayjs(appointment.slot?.endTime).format('HH:mm'),
        status: appointment.status,
    }));
    const recentReviewData = doctorReviewsData.map(review => ({
        key: review?.doctorReviewId,
        patientName: review?.patientProfile?.person?.fullName || '--',
        doctorName: review?.doctorProfile?.person?.fullName || '--',
        rating: review?.rating || 0,
        comment: review?.comment || '--',
        date: dayjs(review?.createdAt).format('DD/MM/YYYY'),
    }));
    return (
        <>
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>     
                <Title level={4}>Tổng quan hệ thống</Title>
                <TimeFilter onChange={setFilter} />  
            </Row>
            <Overview isLoadingOverview={isLoadingOverview} overviewData={overviewData} />
            <Divider style={{ margin: '24px 0' }} />
            <Title level={4}>Doanh thu 7 ngày trước</Title>
            <Card>
                <LoadingCompoent isLoading={isLoadingRevenue}>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                            <XAxis dataKey="date" label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0 }} />
                            <YAxis label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                formatter={(value) =>
                                    new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                }).format(value)
                                }
                            />
                            <Line type="monotone" dataKey="totalRevenue" stroke={lineColor} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </LoadingCompoent>
            </Card>
            
            <LoadingCompoent isLoading={isLoadingRecentReviews || isLoadingAppointments}>
                <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
                {/* --- Lịch khám gần nhất --- */}
                    <Col span={12}>
                        <Card
                        title={<Title level={4} style={{ margin: 0 }}>📅 Lịch khám gần nhất</Title>}
                        >
                        <List
                            itemLayout="horizontal"
                            dataSource={recentAppointmentData}
                            split={true}
                            renderItem={(item) => (
                            <List.Item
                                style={{
                                    borderBottom: "1px solid #f0f0f0",
                                    padding: "12px 0",
                                }}
                                actions={[
                                    <Tag color={getStatusColor(item.status)}>
                                        {convertStatusAppointment(item.status)}
                                    </Tag>
                                ]}
                            >
                                <List.Item.Meta
                                title={
                                
                                    <Text strong>{item.patientName}</Text>
                                
                                }
                                description={
                                    <div style={{ lineHeight: 1.8 }}>
                                    <Text type="secondary">
                                        <UserOutlined /> Bác sĩ:{" "}
                                        <Text strong>{item.doctorName}</Text>
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                        <CalendarOutlined /> Ngày: {item.date}
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                        <ClockCircleOutlined /> Thời gian: {item.time}
                                    </Text>
                                    </div>
                                }
                                />
                            </List.Item>
                            )}
                        />
                        </Card>
                    </Col>

                {/* --- Đánh giá gần nhất --- */}
                    <Col span={12}>
                        <Card
                            variant="false"
                            title={<Title level={4} style={{ margin: 0 }}>⭐ Đánh giá gần nhất</Title>}
                        >
                        <List
                            itemLayout="horizontal"
                            dataSource={recentReviewData}
                            split={true}
                            renderItem={(item) => (
                            <List.Item
                                key={item.key}
                                actions={[
                                    <Tag type="secondary">
                                        <CalendarOutlined /> Ngày: {item.date}
                                    </Tag>
                                ]}
                            >
                                <List.Item.Meta
                                    title={<Rate disabled defaultValue={item.rating} />}
                                    avatar={<MessageOutlined style={{ fontSize: 20, color: "#1890ff" }} />}
                                    description={
                                        <Paragraph style={{ marginTop: 6 }}>{item.comment}</Paragraph>
                                    }
                                />
                            
                            </List.Item>
                            )}
                        />
                        </Card>
                    </Col>
                </Row>
            </LoadingCompoent>
        </>
    )
}

export default Dashboard