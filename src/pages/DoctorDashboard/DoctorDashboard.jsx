import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic,Typography,Divider, Tabs, } from "antd";

import DoctorOverview from "./components/DoctorOverview";
import StatisticByTime from "@/components/StatisticByTime/StatisticByTime";
import DoctorStatisticPatient from "./components/DoctorStatisticPatient";
import TimeFilter from "@/components/TimeFilter/TimeFilter";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/DashboardService";
import { useSelector } from "react-redux";
const { Title, Text } = Typography;
import dayjs from "dayjs";
import { StyleTabs, StyledCard } from "./style";

const DoctorDashboard = () => {
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
  const user = useSelector((state) => state.auth.user);
  const doctorId = user?.doctor?.doctorId;
  const [filter, setFilter] = useState("today");
  const queryGetDoctorOverview = useQuery({
    queryKey: ["doctor-overview", filter, doctorId],
    queryFn: () => DashboardService.getDoctorOverview(doctorId, filter),
    keepPreviousData: true,
    enabled: !!filter && !!doctorId,
  });
  const queryGetDoctorRevenue = useQuery({
    queryKey: ['getDoctorRevenue', tabKey, dateRange, selectedMonth, selectedYear, doctorId],
    queryFn: async () => {
      if (tabKey === 'range' && dateRange.length === 2) {
        return await DashboardService.getDoctorRevenue(doctorId, {
          type: 'range',
          start: dateRange[0],
          end: dateRange[1],
        });
      }

      if (tabKey === 'month' && selectedMonth && selectedYear) {
        return await DashboardService.getDoctorRevenue(doctorId, {
          type: 'month',
          month: selectedMonth,
          year: selectedYear,
        });
      }

      if (tabKey === 'year' && selectedYear) {
        return await DashboardService.getDoctorRevenue(doctorId, {
          type: 'year',
          year: selectedYear,
        });
      }

      return null;
    },
    enabled: Boolean(
        (tabKey === 'range' && dateRange.length === 2 && doctorId) ||
        (tabKey === 'month' && selectedMonth && selectedYear && doctorId) ||
        (tabKey === 'year' && selectedYear && doctorId)
    ),
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const queryGetDoctorAppointment = useQuery({
    queryKey: ['getDoctorAppointment', tabKey, dateRange, selectedMonth, selectedYear, doctorId],
    queryFn: async () => {
      if (tabKey === 'range' && dateRange.length === 2) {
        return await DashboardService.getDoctorAppointment( doctorId, {
          type: 'range',
          start: dateRange[0],
          end: dateRange[1],
        });
      }
      if (tabKey === 'month' && selectedMonth && selectedYear) {
          return await DashboardService.getDoctorAppointment( doctorId, {
              type: 'month',
              month: selectedMonth,
              year: selectedYear,
          });
      }
      if (tabKey === 'year' && selectedYear) {
          return await DashboardService.getDoctorAppointment( doctorId, {
              type: 'year',
              year: selectedYear,
          });
      }
    },
    enabled: Boolean(
        (tabKey === 'range' && dateRange.length === 2 && doctorId) ||
        (tabKey === 'month' && selectedMonth && selectedYear && doctorId) ||
        (tabKey === 'year' && selectedYear && doctorId)
    ),
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const queryGetDoctorStatisticPatient = useQuery({
    queryKey: ['getDoctorStatisticPatient', doctorId],
    queryFn: () => DashboardService.getDoctorStatisticPatient(doctorId),
    enabled: !!doctorId,
  });

  const { data: doctorOverviewData, isLoading: isLoadingDoctorOverview } = queryGetDoctorOverview;
  const { data: doctorStatisticPatientData, isLoading: isLoadingDoctorStatisticPatient } = queryGetDoctorStatisticPatient;
  const { data: revenue, isLoading: isLoadingRevenue } = queryGetDoctorRevenue;
  const { data: appointment, isLoading: isLoadingAppointment } = queryGetDoctorAppointment;
  const revenueData = revenue?.data || [];
  const appointmentData = appointment?.data || [];
  const overview = doctorOverviewData?.data || {};
  const statisticPatientData = doctorStatisticPatientData?.data || {};
  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={4}>Thống kê tổng quan</Title>
        <TimeFilter onChange={setFilter} />
      </Row>
      <DoctorOverview overview={overview} isLoading={isLoadingDoctorOverview} />
      <Divider style={{ margin: '24px 0' }} />
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
              <DoctorStatisticPatient 
                statisticPatientData={statisticPatientData}
                isLoading={isLoadingDoctorStatisticPatient}
              />
            ),
          }
          
          
        ]}
      >
        
        
      </StyleTabs>
      
    </>
  )
}

export default DoctorDashboard