import { ConfigProvider, Typography, Tag, Calendar, Badge, List  } from "antd";
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ScheduleService } from '@/services/ScheduleService';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import { CalendarCell, ShiftTag, ShiftTime, EmptyText } from './style';
import { getColorForShiftName } from '@/utils/shiftName_utils';
import viVN from 'antd/locale/vi_VN';
import dayjs from "dayjs";
import "dayjs/locale/vi";
// Thiết lập ngôn ngữ cho dayjs
dayjs.locale("vi");

const { Text, Title } = Typography;
const DoctorSchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryGetDoctorSchedules = useQuery({
    queryKey: ['doctor-schedules', selectedDate],
    queryFn: () => ScheduleService.getDoctorSchedules({
      month: selectedDate.month() + 1,
      year: selectedDate.year()
    }),
    enabled: !!selectedDate,
  });
  const { data: schedules, isLoading:isLoadingSchedules} = queryGetDoctorSchedules;
  const schedulesData = schedules?.data || [];
  const calendarData = schedulesData.map(schedule => {
    return {
      id: schedule._id,
      date: dayjs(schedule.workday).format('DD/MM/YYYY'),
      shifts: schedule.shifts || [],
      slotDuration: schedule.slotDuration,
      totalShifts: schedule.totalShifts,
      totalSlots: schedule.totalSlots,
    }
  });
   // ✅ Render mỗi ô trong Calendar
  const dateCellRender = (value) => {
    const listData = calendarData.filter(
      (item) => item.date === value.format("DD/MM/YYYY")
    );
    // Giới hạn hiển thị 3 ca đầu tiên
    const shifts = listData[0]?.shifts?.slice(0, 3) || [];

    return (
      <CalendarCell>
        {shifts.map((shift) => (
          <div key={shift._id}>
            <ShiftTag
              bg={getColorForShiftName(shift.name).bg}
              color={getColorForShiftName(shift.name).color}
            >
              {shift.name}
            </ShiftTag>
            <ShiftTime>
              {dayjs(shift.startTime).format("HH:mm")} -{" "}
              {dayjs(shift.endTime).format("HH:mm")}
            </ShiftTime>
          </div>
        ))}
      </CalendarCell>
    );
  };
  const onSelect = (value) => {
    const cellData = calendarData.find(
      (item) => item.date === value.format("DD/MM/YYYY")
    );
    setSelectedCellData(cellData || null);
    setIsModalOpen(true);
    setSelectedDate(dayjs(value));
  };
    // ✅ Khi đổi tháng (tự load API tháng mới)
  const onPanelChange = (value) => {
    setSelectedDate(value);
  };
  const handleViewDetails = () => {
    if (selectedCellData) {
      navigate(`/doctor/schedules/${selectedCellData.id}`);
    }
  };
  return (
    <ConfigProvider locale={viVN}>
      <Title level={4}>Quản lý lịch làm việc</Title>
      <LoadingComponent isLoading={isLoadingSchedules} >
        <Calendar 
          cellRender={dateCellRender} 
          onSelect={onSelect} 
          onPanelChange={onPanelChange}
        />
        <ModalComponent
          title={`Lịch làm việc ngày ${selectedDate ? selectedDate.format("DD/MM/YYYY") : ""}`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleViewDetails}
          okText="Xem chi tiết"
          cancelText="Đóng"
        >
          {selectedCellData ? (
            <div>
              {selectedCellData.shifts.map((shift) => (
                <List.Item key={shift._id}>
                  <List.Item.Meta
                    title={
                      <div style={{backgroundColor: getColorForShiftName(shift.name).bg, color: getColorForShiftName(shift.name).color, display: 'inline-block', padding: '2px 6px', borderRadius: '6px', fontWeight: '500'}}>
                        {shift.name}
                      </div>
                    }
                    description={
                     
                      <p>Thời gian: {dayjs(shift.startTime).format("HH:mm")} - {dayjs(shift.endTime).format("HH:mm")}</p>
                     
                    }
                  />
                </List.Item>
              ))}
              <p><strong>Thời gian khung giờ:</strong> {selectedCellData.slotDuration ? `${selectedCellData.slotDuration}p` : ''}</p>
              <p><strong>Số khung giờ:</strong> {selectedCellData.totalSlots}</p>
            </div>
          ) : (
            <EmptyText>Không có lịch làm việc trong ngày này</EmptyText>
          )}
        </ModalComponent>
      </LoadingComponent>
    </ConfigProvider>
  )
}

export default DoctorSchedulePage