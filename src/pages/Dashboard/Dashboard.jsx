import { Typography, DatePicker, Card,Divider} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardService } from "@/services/DashboardService";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Legend } from 'recharts';
import { PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Overview from "./components/Overview";
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
    const lineColor =
    tabKey === 'range' ? '#1890ff' : tabKey === 'month' ? '#52c41a' : '#faad14';
    return (
        <>
            <Title level={4}>Thống kê tổng quan</Title>
            <Overview isLoadingOverview={isLoadingOverview} overviewData={overviewData} />

            <Card style={{ borderRadius: 16, marginTop: 30 }}>
                <StyleTabs
                    activeKey={tabKey}
                    onChange={setTabKey}
                    items={[
                        // ====== THEO KHOẢNG NGÀY ======
                        {
                            key: 'range',
                            label: 'Theo khoảng ngày',
                            children: (
                                <>
                                
                                <RangePicker
                                    onChange={onChangeDateRange}
                                    format="DD/MM/YYYY"
                                    value={dateRange.length === 2 ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : []}
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                    size="large"
                                    style={{ marginBottom: 20 }}
                                />
                                
                                    <LoadingComponent isLoading={isLoadingRevenue || isLoadingAppointment}>
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ doanh thu theo khoảng ngày {dateRange.length === 2 ? `từ ${new Date(dateRange[0]).toLocaleDateString('vi-VN')} đến ${new Date(dateRange[1]).toLocaleDateString('vi-VN')}` : ''}
                                        </Title>
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
                                        <Divider />
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ số lịch khám theo khoảng ngày {dateRange.length === 2 ? `từ ${new Date(dateRange[0]).toLocaleDateString('vi-VN')} đến ${new Date(dateRange[1]).toLocaleDateString('vi-VN')}` : ''}
                                        </Title>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorAppointment" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                                <XAxis dataKey="date" label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Số lịch khám', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip
                                                    formatter={(value) => value.toLocaleString('vi-VN')}
                                                />
                                                <Line type="monotone" dataKey="totalAppointments" stroke={lineColor} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </LoadingComponent>

                                </>
                            ),
                        },

                        // ====== THEO THÁNG ======
                        {
                            key: 'month',
                            label: 'Theo tháng',
                            children: (
                                <>
                                    <DatePicker
                                        picker="month"
                                        onChange={onChangeMonth}
                                        format="MM/YYYY"
                                        value={selectedMonth && selectedYear ? dayjs().month(selectedMonth - 1).year(selectedYear) : null}
                                        placeholder="Chọn tháng"
                                        size="large"
                                        style={{ marginBottom: 20 }}
                                    />
                                    <LoadingComponent isLoading={isLoadingRevenue || isLoadingAppointment}>
                                    
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ doanh thu tháng {selectedMonth && selectedYear ? `${selectedMonth}/${selectedYear}` : ''}
                                        </Title>
                                        <ResponsiveContainer width="100%" height={300}>
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
                                                <Tooltip formatter={(v) => v.toLocaleString('vi-VN') + ' ₫'} />
                                                <Line type="monotone" dataKey="totalRevenue" stroke={lineColor} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <Divider />
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ số lịch khám tháng {selectedMonth && selectedYear ? `${selectedMonth}/${selectedYear}` : ''}
                                        </Title>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorAppointment" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                                <XAxis dataKey="date" label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Số lịch khám', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip
                                                    formatter={(value) => value.toLocaleString('vi-VN')}
                                                />
                                                <Line type="monotone" dataKey="totalAppointments" stroke={lineColor} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    
                                    </LoadingComponent>
                                </>
                            ),
                        },

                        // ====== THEO NĂM ======
                        {
                            key: 'year',
                            label: 'Theo năm',
                            children: (
                                <>
                                    <DatePicker
                                        picker="year"
                                        onChange={onChangeYear}
                                        format="YYYY"
                                        value={selectedYear ? dayjs().year(selectedYear) : null}
                                        placeholder="Chọn năm"
                                        size="large"
                                        style={{ marginBottom: 20 }}
                                    />
                                    <LoadingComponent isLoading={isLoadingRevenue}>
                                    
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ doanh thu năm {selectedYear || ''}
                                        </Title>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(v) => v.toLocaleString('vi-VN') + ' ₫'} />
                                                <Line type="monotone" dataKey="totalRevenue" stroke={lineColor} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <Divider />
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ số lịch khám năm {selectedYear || ''}
                                        </Title>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorAppointment" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                                <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Số lịch khám', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
                                                <Line type="monotone" dataKey="totalAppointments" stroke={lineColor} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </LoadingComponent>
                                </>
                            ),
                        },
                    ]}
                />
            </Card>
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