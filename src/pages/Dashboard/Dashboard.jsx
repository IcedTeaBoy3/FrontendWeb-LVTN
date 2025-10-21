import { Typography, DatePicker, Card,Divider} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardService } from "@/services/DashboardService";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Legend } from 'recharts';
import { PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Overview from "./components/Overview";
import StatisticByTime from "./components/StatisticByTime";
const { RangePicker } = DatePicker;
const { Title,Text } = Typography;
import { StyleTabs, Row, Col } from "./style";
import dayjs from "dayjs";
const COLORSSTATUS= ['#faad14', '#1890ff', '#52c41a', '#f5222d'];
const COLORSVERIFICATION = ['#52c41a', '#f5222d']; 
 const statusNameMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã huỷ',
};
const COLORS = {
    pending: '#faad14',    // chờ xác nhận
    confirmed: '#1890ff',  // đã xác nhận
    completed: '#52c41a',  // đã hoàn thành
    cancelled: '#f5222d',  // đã huỷ
};
const Dashboard = () => {
    const [tabKey, setTabKey] = useState('range');
    const [dateRange, setDateRange] = useState([
        dayjs().startOf('month').toISOString(),
        dayjs().endOf('month').toISOString()
    ]);
    const [selectedMonth, setSelectedMonth] = useState(
        dayjs().month() + 1
    );
    const [selectedYear, setSelectedYear] = useState(
        dayjs().year()
    );
    const onChangeDateRange = (values) => {
        if(values && values.length === 2) {
            const startDate = values[0].startOf('day').toISOString();
            const endDate = values[1].endOf('day').toISOString();
            setDateRange([startDate, endDate]);
        } else {
            setDateRange([]);
        }
    };
    const onChangeMonth = (date) => {
        if (date) {
            setSelectedMonth(date.month() + 1); // month() trả 0–11
            setSelectedYear(date.year());
        } else {
            setSelectedMonth(null);
            setSelectedYear(null);
        }
    };
    const onChangeYear = (date) => {
        if (date) {
            setSelectedYear(date.year());
        } else {
            setSelectedYear(null);
        }
    };
    const queryGetAdminDashboard = useQuery({
        queryKey: ['getAdminDashboard'],
        queryFn: () => DashboardService.getAdminOverview(),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminRevenue = useQuery({
        queryKey: ['getAdminRevenue', tabKey, dateRange, selectedMonth, selectedYear],
        queryFn: async () => {
            if (tabKey === 'range' && dateRange.length === 2) {
                return await DashboardService.getAdminRevenue({
                    type: 'range',
                    start: dateRange[0],
                    end: dateRange[1],
                });
            }

            if (tabKey === 'month' && selectedMonth && selectedYear) {
                return await DashboardService.getAdminRevenue({
                    type: 'month',
                    month: selectedMonth,
                    year: selectedYear,
                });
            }

            if (tabKey === 'year' && selectedYear) {
                return await DashboardService.getAdminRevenue({
                    type: 'year',
                    year: selectedYear,
                });
            }

            return null;
        },
        enabled: Boolean(
            (tabKey === 'range' && dateRange.length === 2) ||
            (tabKey === 'month' && selectedMonth && selectedYear) ||
            (tabKey === 'year' && selectedYear)
        ),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminAppointmentStatus = useQuery({
        queryKey: ['getAdminAppointmentStatus'],
        queryFn: () => DashboardService.getAdminAppointmentStatus(),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminAccountVerification = useQuery({
        queryKey: ['getAdminAccountVerification'],
        queryFn: () => DashboardService.getAdminAccountVerification(),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminAppointmentPerDoctor = useQuery({
        queryKey: ['getAdminAppointmentPerDoctor'],
        queryFn: () => DashboardService.getAdminAppointmentPerDoctor(),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminAppointment= useQuery({
        queryKey: ['getAdminAppointmentPerDay', tabKey, dateRange, selectedMonth, selectedYear],
        queryFn: async () => {
            if (tabKey === 'range' && dateRange.length === 2) {
                return await DashboardService.getAdminAppointment({
                    type: 'range',
                    start: dateRange[0],
                    end: dateRange[1],
                });
            }
            if (tabKey === 'month' && selectedMonth && selectedYear) {
                return await DashboardService.getAdminAppointment({
                    type: 'month',
                    month: selectedMonth,
                    year: selectedYear,
                });
            }
            if (tabKey === 'year' && selectedYear) {
                return await DashboardService.getAdminAppointment({
                    type: 'year',
                    year: selectedYear,
                });
            }
        },
        enabled: Boolean(
            (tabKey === 'range' && dateRange.length === 2) ||
            (tabKey === 'month' && selectedMonth && selectedYear) ||
            (tabKey === 'year' && selectedYear)
        ),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const { data: overview, isLoading: isLoadingOverview } = queryGetAdminDashboard;
    const { data: revenue, isLoading: isLoadingRevenue} = queryGetAdminRevenue;
    const { data: appointmentStatus, isLoading: isLoadingAppointmentStatus } = queryGetAdminAppointmentStatus;
    const { data: accountVerification, isLoading: isLoadingAccountVerification } = queryGetAdminAccountVerification;
    const { data: appointmentPerDoctor, isLoading: isLoadingAppointmentPerDoctor } = queryGetAdminAppointmentPerDoctor;
    const { data: appointment, isLoading: isLoadingAppointment } = queryGetAdminAppointment;

    const overviewData = overview?.data || {};
    const revenueData = revenue?.data || [];
    const appointmentStatusData = appointmentStatus?.data || {};
    const accountVerificationData = accountVerification?.data || {};
    const appointmentPerDoctorData = appointmentPerDoctor?.data || [];
    const appointmentData = appointment?.data || [];
   
    // Chuyển sang array
    const pieChartData = Object.entries(appointmentStatusData).map(([key, value]) => ({
        name: statusNameMap[key] || key,
        value: value,
    }));
    const donutChartData = Object.keys(accountVerificationData).map((key) => ({
        name: key === 'verified' ? 'Đã xác thực' : 'Chưa xác thực',
        value: accountVerificationData[key],
    }));
   
    return (
        <>
            <Title level={4}>Thống kê tổng quan</Title>
            <Overview isLoadingOverview={isLoadingOverview} overviewData={overviewData} />

            <StatisticByTime 
                tabKey={tabKey}
                setTabKey={setTabKey} 
                dateRange={dateRange} 
                revenueData={revenueData}
                appointmentData={appointmentData}
                onChangeDateRange={onChangeDateRange} 
                selectedMonth={selectedMonth} 
                onChangeMonth={onChangeMonth} 
                selectedYear={selectedYear} 
                onChangeYear={onChangeYear} 
                isLoading={isLoadingRevenue || isLoadingAppointment}
            />
            <Row gutter={[16, 16]} style={{ marginTop: 30 }}>

                <Col span={12}>
                    <Card style={{ borderRadius: 16}}>
                        <LoadingComponent isLoading={isLoadingAppointmentStatus}>
                            <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                Biểu đồ trạng thái lịch hẹn
                            </Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                <Pie
                                    data={pieChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={130}
                                    fill="#8884d8"
                                    label
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORSSTATUS[index % COLORSSTATUS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                            <Divider />
                            <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Tổng số lịch hẹn: {Object.values(appointmentStatusData).reduce((sum, val) => sum + val, 0)}</div>
                            <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Hoàn thành: {appointmentStatusData['completed'] || 0}</div>

                        </LoadingComponent>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card style={{ borderRadius: 16 }}>
                        <LoadingComponent isLoading={isLoadingAccountVerification}>
                            <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                Biểu đồ xác thực tài khoản người dùng
                            </Title>
                            <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                            <Pie
                                data={donutChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70} // tạo donut chart
                                outerRadius={120}
                                label
                            >
                                {donutChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORSVERIFICATION[index % COLORSVERIFICATION.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                        <Divider />
                        <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Tổng số tài khoản: {Object.values(accountVerificationData).reduce((sum, val) => sum + val, 0)}</div>
                        <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Đã xác thực: {accountVerificationData['verified'] || 0}</div>
                        </LoadingComponent>
                    </Card>
                </Col>
            </Row>
            <LoadingComponent isLoading={isLoadingAppointmentPerDoctor}>

                <Card title="Biểu đồ số lịch khám của mỗi bác sĩ theo trạng thái" style={{ borderRadius: 16, marginTop: 30 }}>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={appointmentPerDoctorData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="doctorName" />
                        <YAxis label={{ value: 'Số lịch', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                            formatter={(value, name) => [value, statusNameMap[name]]} // đổi tên tooltip
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            formatter={(value) => statusNameMap[value] || value} // đổi tên legend
                        />
                        <Bar dataKey="pending" stackId="a" fill={COLORS.pending} />
                        <Bar dataKey="confirmed" stackId="a" fill={COLORS.confirmed} />
                        <Bar dataKey="completed" stackId="a" fill={COLORS.completed} />
                        <Bar dataKey="cancelled" stackId="a" fill={COLORS.cancelled} />
                    
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </LoadingComponent>
            
        </>
    )
}

export default Dashboard