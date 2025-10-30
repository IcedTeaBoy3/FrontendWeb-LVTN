import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic,Typography,Divider, Tabs, } from "antd";

import DoctorOverview from "./components/DoctorOverview";
import StatisticByTime from "@/components/StatisticByTime/StatisticByTime";
import DoctorStatisticPatient from "../../components/StatisticPatient/StatisticPatient";
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
  

  const { data: doctorOverviewData, isLoading: isLoadingDoctorOverview } = queryGetDoctorOverview;
 

  const overview = doctorOverviewData?.data || {};
 
  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={4}>Thống kê tổng quan</Title>
        <TimeFilter onChange={setFilter} />
      </Row>
      <DoctorOverview overview={overview} isLoading={isLoadingDoctorOverview} />
      <Divider style={{ margin: '24px 0' }} />
      
      
        
        
      
      
    </>
  )
}

export default DoctorDashboard