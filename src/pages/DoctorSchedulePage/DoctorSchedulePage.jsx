import { ConfigProvider, Typography, Tag, Calendar, Badge, List, Divider,Form,Select,DatePicker   } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ScheduleService } from '@/services/ScheduleService';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import * as Message from "@/components/Message/Message";
import { CalendarCell, ShiftTag, ShiftTime, EmptyText } from './style';
import { getColorForShiftName } from '@/utils/shiftName_utils';
import viVN from 'antd/locale/vi_VN';
import dayjs from "dayjs";
import "dayjs/locale/vi";
// Thiết lập ngôn ngữ cho dayjs
dayjs.locale("vi");

const { Text, Title } = Typography;
const DoctorSchedulePage = () => {
  const account = useSelector((state) => state.auth.user);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCreate] = Form.useForm();
  const navigate = useNavigate();
  const queryGetDoctorSchedules = useQuery({
    queryKey: ['doctor-schedules', selectedDate],
    queryFn: () => ScheduleService.getDoctorSchedules({
      month: selectedDate.month() + 1,
      year: selectedDate.year()
    }),
    enabled: !!selectedDate,
  });
  const mutationCreateSchedule = useMutation({
    mutationKey: ['createSchedule'],
    mutationFn: ScheduleService.createSchedule,
    onSuccess: (data) => {
      if (data?.status === "success") {
        Message.success(data?.message);
        setIsModalOpenCreate(false);
        queryGetDoctorSchedules.refetch();
        formCreate.resetFields();
      } else {
        Message.error(data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
      }
    },
    onError: (error) => {
      Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
    }
  });
  const { data: schedules, isLoading:isLoadingSchedules} = queryGetDoctorSchedules;
  const isPendingCreate = mutationCreateSchedule.isPending;
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
 
  const handleCreateSchedule = () => {
    formCreate
    .validateFields()
    .then((values) => {
      const { workday, slotDuration } = values;
      mutationCreateSchedule.mutate({
        workday,
        doctorId: account.doctor.doctorId,
        slotDuration
      });
    })
  };
 
  const handleCloseCreateSchedule = () => {
    setIsModalOpenCreate(false);
  };
  return (
    <ConfigProvider locale={viVN}>
      <Title level={4}>Quản lý lịch làm việc</Title>
      <Divider style={{ margin: '12px 0' }} />
      <ButtonComponent 
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpenCreate(true)}
      >Thêm lịch làm việc</ButtonComponent>
      <LoadingComponent isLoading={isPendingCreate}>
        <ModalComponent
          title="Thêm mới lịch làm việc"
          open={isModalOpenCreate}
          onOk={handleCreateSchedule}
          onCancel={handleCloseCreateSchedule}
          width={600}
          cancelText="Huỷ"
          okText="Thêm"
          style={{ borderRadius: 0 }}
        >
          <Form
            name="formCreate"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            style={{ maxWidth: 600, padding: "20px" }}
            initialValues={{
                slotDuration: 30,
                workday: null,
            }}
            autoComplete="off"
            form={formCreate}
          >
            <Form.Item
                label="Ngày làm việc"
                name="workday"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng chọn ngày làm việc!",
                    },
                    {
                        validator: (_, value) => {
                            if (value && value.day() === 0) {
                                return Promise.reject("Phòng khám không làm việc vào ngày Chủ nhật!");
                            }
                            return Promise.resolve();
                        }
                    }
                ]}
            >
                  
              <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                      current && current < dayjs().add(1, "day").startOf("day")
                  }
              />
                
            </Form.Item>
              <Form.Item
                label="Thời gian khám"
                name="slotDuration"
              >
                <Select
                  placeholder="Chọn thời gian khám"
                  options={[
                    { label: '15 phút', value: 15 },
                    { label: '20 phút', value: 20 },
                    { label: '30 phút', value: 30 },
                    { label: '45 phút', value: 45 },
                    { label: '60 phút', value: 60 },
                  ]}
                />
              </Form.Item>
            </Form>
        </ModalComponent>
      </LoadingComponent >
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