import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic,Typography } from "antd";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";

import TimeFilter from "./components/TimerFilter";
import DoctorOverview from "./components/DoctorOverview";
import StatisticByTime from "@/pages/Dashboard/components/StatisticByTime";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/DashboardService";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
import dayjs from "dayjs";
const DoctorDashboard = () => {
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

  const { data: doctorOverviewData, isLoading: isLoadingDoctorOverview } = queryGetDoctorOverview;
  const { data: revenue, isLoading: isLoadingRevenue } = queryGetDoctorRevenue;
  const { data: appointment, isLoading: isLoadingAppointment } = queryGetDoctorAppointment;
  const revenueData = revenue?.data || [];
  const appointmentData = appointment?.data || [];
  const overview = doctorOverviewData?.data || {};
  console.log("doctorOverviewData", overview);
  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={4}>Thống kê</Title>
        <TimeFilter onChange={setFilter} />
      </Row>
      <DoctorOverview overview={overview} isLoading={isLoadingDoctorOverview} />
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
    </>
  )
}

export default DoctorDashboard