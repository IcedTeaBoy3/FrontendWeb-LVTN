import { useState,} from "react";
import { Row,Typography,Divider } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import DoctorOverview from "./components/DoctorOverview";
import TimeFilter from "@/components/TimeFilter/TimeFilter";
import { DashboardService } from "@/services/DashboardService";
import StatisticRevenueSevenDay from "@/components/StatistticRevenueSevenDay/StatisticRevenueSevenDay";
import AppointmentOverView from "./components/AppointmentOverView";
import dayjs from "dayjs";
const { Title } = Typography;
const DoctorDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const doctorId = user?.doctor?.doctorId;
  const [filter, setFilter] = useState("today");
  const queryGetDoctorOverview = useQuery({
    queryKey: ["doctor-overview", filter, doctorId],
    queryFn: () => DashboardService.getDoctorOverview(doctorId, filter),
    keepPreviousData: true,
    enabled: !!filter && !!doctorId,
  });
  const queryGetDoctorRevenueSevenDays = useQuery({
    queryKey: ["doctor-revenue-seven-days", doctorId],
    queryFn: () => DashboardService.getDoctorRevenue(doctorId,{
      type: 'range',
      start: dayjs().subtract(6, 'day').startOf('day').toDate(), // 6 ngày trước
      end: dayjs().endOf('day').toDate(), // hôm nay
    }),
    keepPreviousData: true,
    enabled: !!doctorId,
  });
 
 

  const { data: doctorOverviewData, isLoading: isLoadingDoctorOverview } = queryGetDoctorOverview;
  const { data: doctorRevenueData, isLoading: isLoadingDoctorRevenue } = queryGetDoctorRevenueSevenDays;
 
  const overview = doctorOverviewData?.data || {};
  const revenueSevenDays = doctorRevenueData?.data || [];

 
  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={4}>Thống kê tổng quan</Title>
        <TimeFilter onChange={setFilter} />
      </Row>
      <DoctorOverview overview={overview} isLoading={isLoadingDoctorOverview} />
      <br/>
      <Title level={4}>Doanh thu 7 ngày qua</Title>
      <StatisticRevenueSevenDay data={revenueSevenDays} isLoading={isLoadingDoctorRevenue} /> 
      <br/>
      <AppointmentOverView doctorId={doctorId} />
      
    </>
  )
}

export default DoctorDashboard