import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { Typography,Card,Divider} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardService } from "@/services/DashboardService";
import PieChart from "@/components/PieChart/PieChart";
import StatisticByTime from "@/components/StatisticByTime/StatisticByTime";
import StatisticPatient from "@/components/StatisticPatient/StatisticPatient";
import AppointmentPerService from "./components/AppointmentPerService";
import AppointmentPerDoctor from "./components/AppointmentPerDoctor";
import DoctorPerSpecialty from "./components/DoctorPerSpecialty";
import ReviewPerDoctor from "./components/ReviewPerDoctor";
import { StyleTabs} from "./style";
const { Title,Text } = Typography;
import { Row, Col } from "./style";
import dayjs from "dayjs";

// const COLORSVERIFICATION = ['#52c41a', '#f5222d']; 

// const COLORSGENDER = ["#1890ff", "#f759ab", "#52c41a", "#faad14"];
const COLORSSTATUS= ['#faad14', '#1890ff', '#52c41a', '#f5222d'];
const statusNameMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã huỷ',
};
const StatisticPage = () => {
    const [tabKey, setTabKey] = useState('range');

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
    const queryGetAdminAppointmentStatus = useQuery({
        queryKey: ['getAdminAppointmentStatus'],
        queryFn: () => DashboardService.getAdminAppointmentStatus(),
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
    const queryGetSpecialtyPerDoctor = useQuery({
        queryKey: ['getAdminSpecialtyPerDoctor'],
        queryFn: () => DashboardService.getAdminSpecialtyPerDoctor(),
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
    const { data: appointmentStatus, isLoading: isLoadingAppointmentStatus } = queryGetAdminAppointmentStatus;
    const { data: specialtyPerDoctor, isLoading: isLoadingSpecialtyPerDoctor } = queryGetSpecialtyPerDoctor;
    

    
    
    // const accountVerificationData = accountVerification?.data || {};
    const revenueData = revenue?.data || [];
    const appointmentData = appointment?.data || [];
    const statisticPatientData = statisticPatient?.data || {};
    const appointmentPerServiceStatsData = appointmentPerServiceStats?.data || [];
    const appointmentPerDoctorData = appointmentPerDoctor?.data || [];
    const avgRatingData = avgRating?.data || [];
    const appointmentStatusData = appointmentStatus?.data || [];
    const specialtyPerDoctorData = specialtyPerDoctor?.data || [];
    const pieChartData = Object.entries(appointmentStatusData).map(([key, value]) => ({
        name: statusNameMap[key] || key,
        value: value,
    }));

    return (
        <>
            <StyleTabs
                activeKey={tabKeyDetails}
                tabPosition="left"
                type="card"
                size="large"
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
                            <StatisticPatient
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
                                <AppointmentPerDoctor
                                    data={appointmentPerDoctorData}
                                    isLoading={isLoadingAppointmentPerDoctor}
                                />
                                <br/>
                                <DoctorPerSpecialty
                                    data={specialtyPerDoctorData}
                                    isLoading={isLoadingSpecialtyPerDoctor}
                                />
                                <br/>
                                <ReviewPerDoctor
                                    data={avgRatingData}
                                    isLoading={isLoadingAvgRating}
                                />  
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
                                <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
                                    <Col span={12}>
                                        <Card style={{ borderRadius: 16}}>
                                            <LoadingComponent isLoading={isLoadingAppointmentStatus}>
                                                <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>
                                                    Biểu đồ trạng thái lịch hẹn
                                                </Title>
                                                <PieChart
                                                    outerRadius={130}
                                                    COLORS={COLORSSTATUS}
                                                    data={pieChartData || []}
                                                />
                                                <Divider />
                                                <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Tổng số lịch hẹn: {Object.values(appointmentStatusData).reduce((sum, val) => sum + val, 0)}</div>
                                                <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Hoàn thành: {appointmentStatusData['completed'] || 0}</div>
                                            </LoadingComponent>
                                        </Card>
                                    </Col>
                                    
                                </Row>
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