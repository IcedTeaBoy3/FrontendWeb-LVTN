
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardService } from "@/services/DashboardService";
import AppointmentPerService from "./components/AppointmentPerService";
import AppointmentPerDoctor from "./components/AppointmentPerDoctor";
import DoctorPerSpecialty from "./components/DoctorPerSpecialty";
import ReviewPerDoctor from "./components/ReviewPerDoctor";
import RevenuePerDoctor from "./components/RevenuePerDoctor";
import StatisticByTime from "@/components/StatisticByTime/StatisticByTime";
import StatisticPatient from "@/components/StatisticPatient/StatisticPatient";
import RevenuePerService from "@/components/RevenuePerService/RevenuePerService";
import { SpecialtyService } from "@/services/SpecialtyService";
import { Select, Splitter } from "antd";
import { StyleTabs} from "./style";
import dayjs from "dayjs";

const StatisticPage = () => {
    const [tabKey, setTabKey] = useState('range');
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
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
        keepPreviousData: true,
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
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });
   
    const queryGetAdminAppointmentPerDoctor = useQuery({
        queryKey: ['getAdminAppointmentPerDoctor'],
        queryFn: () => DashboardService.getAdminAppointmentPerDoctor(),
        retry: 1,
        keepPreviousData: true,
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
        queryKey: ['getAppointmentPerServiceStats', selectedSpecialty],
        queryFn: () => DashboardService.getAppointmentPerServiceStats(selectedSpecialty),
        retry: 1,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminAvgRating = useQuery({
        queryKey: ['getAdminAverageRating'],
        queryFn: () => DashboardService.getAdminAverageRating(),
        retry: 1,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });
    const queryGetSpecialtyPerDoctor = useQuery({
        queryKey: ['getAdminSpecialtyPerDoctor'],
        queryFn: () => DashboardService.getAdminSpecialtyPerDoctor(),
        retry: 1,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminRevenuePerService = useQuery({
        queryKey: ['getAdminRevenuePerService', selectedSpecialty],
        queryFn: () => DashboardService.getAdminRevenuePerService(selectedSpecialty),
        retry: 1,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });
    const queryGetAllSpecialties = useQuery({
        queryKey: ['getAllSpecialties'],
        queryFn: () => SpecialtyService.getAllSpecialties({ status: "active", page: 1, limit: 1000 }),
        refetchOnWindowFocus: false,
        retry: 1,
        keepPreviousData: true,
    });
    const queryGetAdminRevenuePerDoctor = useQuery({
        queryKey: ['getAdminRevenuePerDoctor'],
        queryFn: () => DashboardService.getAdminRevenuePerDoctor(),
        retry: 1,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });
    const { data: dataSpecialties, isLoading: isLoadingSpecialties } = queryGetAllSpecialties;
    const specialtiesData = dataSpecialties?.data?.specialties;
    
    const { data: revenue, isLoading: isLoadingRevenue} = queryGetAdminRevenue;
    const { data: appointment, isLoading: isLoadingAppointment } = queryGetAdminAppointment;
    const { data: statisticPatient, isLoading: isLoadingStatisticPatient } = queryGetAdminStatisticPatient;
    const { data: appointmentPerServiceStats, isLoading: isLoadingAppointmentPerServiceStats } = queryGetAppointmentPerServiceStats;
    const { data: appointmentPerDoctor, isLoading: isLoadingAppointmentPerDoctor } = queryGetAdminAppointmentPerDoctor;
    const { data: avgRating, isLoading: isLoadingAvgRating } = queryGetAdminAvgRating;
    const { data: specialtyPerDoctor, isLoading: isLoadingSpecialtyPerDoctor } = queryGetSpecialtyPerDoctor;
    const { data: revenuePerService, isLoading: isLoadingRevenuePerService } = queryGetAdminRevenuePerService;
    const { data: revenuePerDoctor, isLoading: isLoadingRevenuePerDoctor } = queryGetAdminRevenuePerDoctor;

    const revenueData = revenue?.data || [];
    const appointmentData = appointment?.data || [];
    const statisticPatientData = statisticPatient?.data || {};
    const appointmentPerServiceStatsData = appointmentPerServiceStats?.data || [];
    const appointmentPerDoctorData = appointmentPerDoctor?.data || [];
    const avgRatingData = avgRating?.data || [];
    const specialtyPerDoctorData = specialtyPerDoctor?.data || [];
    const revenuePerDoctorData = revenuePerDoctor?.data || [];
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
                                <RevenuePerDoctor
                                    data={revenuePerDoctorData}
                                    isLoading={isLoadingRevenuePerDoctor}
                                />
                                <br/>
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
                        key: "services",
                        label: "Dịch vụ",
                        children: (
                            <>
                                <Select
                                    style={{ width: 250, marginBottom: 16 }}
                                    placeholder="Chọn chuyên khoa"
                                    loading={isLoadingSpecialties}
                                    options={specialtiesData?.map((specialty) => ({
                                        label: specialty.name,
                                        value: specialty.specialtyId,
                                    }))}
                                    showSearch
                                    onChange={(value) => {
                                        setSelectedSpecialty(value);
                                    }}
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    allowClear
                                />
                                <Splitter 
                                    style={{ height: 500, gap: '16px' }}
                                >
                                    <Splitter.Panel defaultSize="50%">
                                        <AppointmentPerService
                                            data={appointmentPerServiceStatsData}
                                            isLoading={isLoadingAppointmentPerServiceStats}
                                        />
                                    </Splitter.Panel>
                                    <Splitter.Panel defaultSize="50%">
                                        <RevenuePerService
                                            data={revenuePerService?.data || []}
                                            isLoading={isLoadingRevenuePerService}
                                        />
                                    </Splitter.Panel>
                                </Splitter>
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