
import StatusAppointment from "@/components/StatusAppointment/StatusAppointment";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { ClockCircleOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";

import { Card, List, Tag, Typography } from "antd";
import { convertStatusAppointment, getStatusColor } from "@/utils/status_appointment_utils";
import { AppointmentService } from "@/services/AppointmentService";
import { DashboardService } from "@/services/DashboardService";
import { useQuery } from "@tanstack/react-query";
import { Splitter } from "antd";
import dayjs from "dayjs";
const { Text } = Typography;
const AppointmentOverView = ({doctorId}) => {
    const queryGetDoctorAppointmentStatus = useQuery({
        queryKey: ["doctor-appointment-status", doctorId],
        queryFn: () => DashboardService.getDoctorAppointmentStatus(doctorId),
        keepPreviousData: true,
        enabled: !!doctorId,
    });
    const queryGetDoctorAppointment = useQuery({
        queryKey: ["doctor-appointment", doctorId],
        queryFn: () => AppointmentService.getDoctorAppointments(doctorId, { page: 1, limit: 5 }),
        keepPreviousData: true,
        enabled: !!doctorId,
    });
    
    const { data: doctorAppointmentStatus, isLoading: isLoadingDoctorAppointmentStatus } = queryGetDoctorAppointmentStatus;
    const { data: doctorAppointmentData, isLoading: isLoadingDoctorAppointment } = queryGetDoctorAppointment;
    const appointment = doctorAppointmentData?.data?.appointments || [];
    const appointmentStatus = doctorAppointmentStatus?.data || [];
    const recentAppointmentData = appointment?.map(app => ({
        key: app.id,
        patientName: app.patientProfile.person?.fullName ?? '--',
        doctorName: app.doctorService?.doctor?.person?.fullName ?? '--',
        date: dayjs(app.schedule?.workday).format('DD/MM/YYYY'),
        time: dayjs(app.slot?.startTime).format('HH:mm') + ' - ' + dayjs(app.slot?.endTime).format('HH:mm'),
        status: app.status,
    }));
    return (
        <Splitter direction="vertical" style={{ height: '500px', gap: '24px' }} >
            <Splitter.Panel defaultSize="40%">
                <StatusAppointment data={appointmentStatus} isLoading={isLoadingDoctorAppointmentStatus} />
            </Splitter.Panel>
            <Splitter.Panel defaultSize="60%">
                <LoadingComponent isLoading={isLoadingDoctorAppointment} >
                    <Card >
                        <Typography.Title level={4} style={{ marginBottom: 16 }}>Lịch hẹn gần đây</Typography.Title>
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
                </LoadingComponent>
            </Splitter.Panel>
        </Splitter>
    )
}

export default AppointmentOverView