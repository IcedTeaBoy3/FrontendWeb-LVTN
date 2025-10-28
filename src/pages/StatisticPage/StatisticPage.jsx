import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { Typography,Card,Divider,Statistic,Rate } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardService } from "@/services/DashboardService";
import PieChart from "@/components/PieChart/PieChart";
import StatisticByTime from "@/components/StatisticByTime/StatisticByTime";
import DoctorStatisticPatient from "@/pages/DoctorDashboard/components/DoctorStatisticPatient";
import AppointmentPerService from "./components/AppointmentPerService";
import { StyleTabs} from "./style";
import TableStyle from "@/components/TableStyle/TableStyle";
const { Title,Text } = Typography;
import { Row, Col } from "./style";
import dayjs from "dayjs";

// const COLORSVERIFICATION = ['#52c41a', '#f5222d']; 

// const COLORSGENDER = ["#1890ff", "#f759ab", "#52c41a", "#faad14"];
const COLORS = {
    pending: '#faad14',
    confirmed: '#1890ff',
    completed: '#52c41a',
    cancelled: '#f5222d',
};
const statusNameMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
};
const StatisticPage = () => {
    const [tabKey, setTabKey] = useState('range');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [tabKeyDetails, setTabKeyDetails] = useState('revenue');
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
    const queryGetAdminStatisticPatient = useQuery({
        queryKey: ['getAdminStatisticPatient'],
        queryFn: () => DashboardService.getAdminStatisticPatient(),
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
   
    // const queryGetAdminAccountVerification = useQuery({
    //     queryKey: ['getAdminAccountVerification'],
    //     queryFn: () => DashboardService.getAdminAccountVerification(),
    //     retry: 1,
    //     refetchOnWindowFocus: false,
    // });
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
    const queryGetAppointmentPerServiceStats = useQuery({
        queryKey: ['getAppointmentPerServiceStats'],
        queryFn: () => DashboardService.getAppointmentPerServiceStats(),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminAvgRating = useQuery({
        queryKey: ['getAdminAverageRating'],
        queryFn: () => DashboardService.getAdminAverageRating(),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    
    const { data: revenue, isLoading: isLoadingRevenue} = queryGetAdminRevenue;
    // const { data: accountVerification, isLoading: isLoadingAccountVerification } = queryGetAdminAccountVerification;
    const { data: appointment, isLoading: isLoadingAppointment } = queryGetAdminAppointment;
    const { data: statisticPatient, isLoading: isLoadingStatisticPatient } = queryGetAdminStatisticPatient;
    const { data: appointmentPerServiceStats, isLoading: isLoadingAppointmentPerServiceStats } = queryGetAppointmentPerServiceStats;
    const { data: appointmentPerDoctor, isLoading: isLoadingAppointmentPerDoctor } = queryGetAdminAppointmentPerDoctor;
    const { data: avgRating, isLoading: isLoadingAvgRating } = queryGetAdminAvgRating;
    

    
    
    // const accountVerificationData = accountVerification?.data || {};
    const revenueData = revenue?.data || [];
    const appointmentData = appointment?.data || [];
    const statisticPatientData = statisticPatient?.data || {};
    const appointmentPerServiceStatsData = appointmentPerServiceStats?.data || [];
    const appointmentPerDoctorData = appointmentPerDoctor?.data || [];
    const avgRatingData = avgRating?.data || [];
    
    // const donutChartData = Object.keys(accountVerificationData).map((key) => ({
    //     name: key === 'verified' ? 'Đã xác thực' : 'Chưa xác thực',
    //     value: accountVerificationData[key],
    // }));
    // const pieChartDataGender = statisticPatientData.genderStats?.map(item => ({
    //     name: item.gender === 'male' ? 'Nam' : item.gender === 'female' ? 'Nữ' : 'Khác',
    //     value: item.total,
    // }));
    const dataTableAvgRating = avgRatingData?.map((item, index) => ({
        key: item.doctorId || index,
        doctorName: item.doctorName,
        averageRating: item.averageRating,
        ratingCount: item.ratingCount,
    }));
    const columns = [
        {
            title: 'Tên bác sĩ',
            dataIndex: 'doctorName',
            key: 'doctorName',
        },
        {
            title: 'Đánh giá trung bình',
            dataIndex: 'averageRating',
            key: 'averageRating',
            render: (value) => <Rate allowHalf disabled defaultValue={value} />
        },
        {
            title: 'Số lượt đánh giá',
            dataIndex: 'ratingCount',
            key: 'ratingCount',
        },
    ];
    return (
        <>
            <Title level={4}>Thống kê chi tiết</Title>
            <StyleTabs
                activeKey={tabKeyDetails}
                onChange={(key) => setTabKeyDetails(key)}
                style={{ marginBottom: 16 }}
                items={[
              
                    {
                        key: 'revenue',
                        label: 'Doanh thu',
                        children: (
                        <StatisticByTime
                            revenueData={revenueData}
                            appointmentData={appointmentData}
                            isLoading={isLoadingRevenue || isLoadingAppointment}
                            tabKey={tabKey}
                            setTabKey={setTabKey}
                            dateRange={dateRange}
                            onChangeDateRange={onChangeDateRange}
                            selectedMonth={selectedMonth}
                            onChangeMonth={onChangeMonth}
                            selectedYear={selectedYear}
                            onChangeYear={onChangeYear}
                        />
                        ),
                    },
                    {
                        key: "patients",
                        label: "Bệnh nhân",
                        children: (
                        <>
                            <DoctorStatisticPatient 
                                statisticPatientData={statisticPatientData}
                                isLoading={isLoadingStatisticPatient}
                            />
                        </>
                        ),
                    },
                    {
                        key: "doctors",
                        label: "Bác sĩ",
                        children: (
                            <>
                                <LoadingComponent isLoading={isLoadingAvgRating}>
                                    <Card title="Đánh giá trung bình của bác sĩ">
                                        <ResponsiveContainer width="100%" height={400}>
                                                <BarChart
                                                    layout="vertical"
                                                    data={avgRatingData}
                                                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                                                >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis
                                                    dataKey="doctorName"
                                                    type="category"
                                                    width={150}
                                                    tick={{ fontSize: 13 }}
                                                />
                                                <Tooltip />
                                                <Legend />
                                                <Bar
                                                    dataKey="averageRating"
                                                    fill="#faad14"
                                                    name="Đánh giá trung bình"
                                                    radius={[0, 5, 5, 0]} // bo góc cho đẹp
                                                    barSize={25}
                                                />
                                                </BarChart>
                                            </ResponsiveContainer>
                                    </Card>
                                    <TableStyle
                                       
                                        dataSource={dataTableAvgRating}
                                        columns={columns}
                                        pagination={pagination}
                                        onChange={(page, pageSize) => {
                                            setPagination((prev) => ({
                                                ...prev,
                                                current: page,
                                                pageSize: pageSize,
                                            }));
                                        }}
                                    />
                                </LoadingComponent>
                            </>
                        )
                    },
                    {
                        key: "appointments",
                        label: "Lịch khám",
                        children: (
                            <>
                                <AppointmentPerService
                                    data={appointmentPerServiceStatsData}
                                    isLoading={isLoadingAppointmentPerServiceStats}
                                />
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
                
                
                ]}
            >
                
                
            </StyleTabs>
            
           
        </>
    )
}

export default StatisticPage