import {Typography, Tag, Badge, List  } from "antd";
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { AppointmentService } from '@/services/AppointmentService';
import { useState } from 'react';
import { convertStatusAppointment, getStatusColor } from '@/utils/status_appointment_utils';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import { CalendarCell, CalendarItem, CalendarText, CalendarTime, CalendarPatient, AppointmentList, AppointmentItem,EmptyText } from './style';
import { StyledCalendar } from '../DoctorSchedulePage/style';
import { ThemeProvider } from "styled-components";
import { theme } from '@/styles/theme';
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");

const { Text, Title } = Typography;
const DoctorAppointmentPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const doctorId = user?.doctor?.doctorId;
  const navigate = useNavigate();
  const queryGetDoctorAppointments = useQuery({
    queryKey: ['doctor-appointments', doctorId],
    queryFn: () => AppointmentService.getDoctorAppointments(doctorId, { page: 1, limit: 10 }),
    keepPreviousData: true,
    enabled: !!doctorId,
  });
  const { data: doctorAppointmentsData, isLoading: isLoadingDoctorAppointments } = queryGetDoctorAppointments;
  const doctorAppointments = doctorAppointmentsData?.data?.appointments|| [];
  const calenderData = doctorAppointments.map(appointment => {
    return {
      id: appointment.appointmentId,
      appointmentNumber: appointment.appointmentNumber,
      date: dayjs(appointment?.schedule?.workday).format('DD/MM/YYYY'),
      time: dayjs(appointment.slot?.startTime).format('HH:mm') + ' - ' + dayjs(appointment?.slot?.endTime).format('HH:mm'),
      patientName: appointment.patientProfile?.person?.fullName || '--',
      status: appointment.status,
    }
  });
  const dateCellRender = (value) => {
    const listData =calenderData.filter(item => item.date === value.format('DD/MM/YYYY'));
    return (
      <CalendarCell>
        {listData.map((item) => (
          <CalendarItem key={item.id}>
            <Badge color={getStatusColor(item.status)} />
            <CalendarText>
              <CalendarTime>{item.time}</CalendarTime>
              <CalendarPatient>{item.patientName}</CalendarPatient>
            </CalendarText>
          </CalendarItem>
        ))}
      </CalendarCell>
    );
  };
   // ✅ Khi click vào 1 ngày trong calendar
  const onSelect = (value, info) => {
    if (info.source !== "date") return; 

    setIsModalOpen(true);
    const listData = calenderData.filter((item) =>
      item.date === value.format('DD/MM/YYYY')
    );
    setSelectedDate({ date: value, list: listData });
  };

  const handleViewDetails = () => {
    if(selectedDate.list.length == 0 ) return;
    navigate('/doctor/appointments/date', { state: selectedDate });
    
  }
  return (
    <>
      <Title level={4}>Quản lý lịch khám</Title>
      <LoadingComponent isLoading={isLoadingDoctorAppointments} >
        <ThemeProvider theme={theme}>
          <StyledCalendar 
            cellRender={dateCellRender} 
            onSelect={onSelect} 
          />
        </ThemeProvider>
        <ModalComponent
          title={`Lịch khám ngày ${selectedDate ? selectedDate.date.format("DD/MM/YYYY") : ""}`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleViewDetails}
          okText="Xem chi tiết"
          cancelText="Đóng"
          width={700}
        >
          {selectedDate?.list?.length ? (
            <AppointmentList
              dataSource={selectedDate?.list}
              renderItem={(item) => (
                <AppointmentItem
                  key={item.id}
                >
                  <List.Item.Meta
                    title={<>
                      <p>STT: {item.appointmentNumber}</p>
                      <span>{item.time}</span> - <span>{item.patientName}</span>
                    </>}
                    description={
                      <>
                        <span>Trạng thái: </span>
                        <Tag color={getStatusColor(item.status)}>
                          {convertStatusAppointment(item.status)}
                        </Tag>
                      </>
                    }
                  />
                </AppointmentItem>
              )}
            />
          ) : (
            <EmptyText>Không có lịch khám nào trong ngày này.</EmptyText>
          )}
        </ModalComponent>
      </LoadingComponent>
    </>
  )
}

export default DoctorAppointmentPage;