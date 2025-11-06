import { Typography, Calendar,List, Divider, Form, Select, DatePicker, Button, Input, Space,Dropdown  } from "antd";
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { ScheduleService } from '@/services/ScheduleService';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import TabsComponent from "@/components/TabsComponent/TabsComponent";
import DrawerComponent from "@/components/DrawerComponent/DrawerComponent";
import TableStyle from "@/components/TableStyle/TableStyle";
import * as Message from "@/components/Message/Message";
import Highlighter from 'react-highlight-words';
import { CalendarCell, ShiftTag, ShiftTime, EmptyText } from './style';
import { getColorForShiftName } from '@/utils/shiftName_utils';
import dayjs from "dayjs";
dayjs.locale("vi");
const { Text, Title } = Typography;
const DoctorSchedulePage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const account = useSelector((state) => state.auth.user);
  const [tabKey, setTabKey] = useState('calendar-schedules');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [rowSelected, setRowSelected] = useState(null);
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    type: "checkbox",
  };
  // Tìm kiếm
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  // phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  
  const navigate = useNavigate();
  const queryGetDoctorSchedules = useQuery({
    queryKey: ['doctor-schedules', selectedDate],
    queryFn: () => ScheduleService.getDoctorSchedules({
      month: selectedDate.month() + 1,
      year: selectedDate.year()
    }),
    enabled: !!selectedDate,
  });
  const mutationDeleteSchedule = useMutation({
      mutationKey: ['deleteSchedule'],
      mutationFn: ScheduleService.deleteSchedule,
      onSuccess: (data) => {
        if (data?.status === "success") {
          Message.success(data?.message);
          setIsModalOpenDelete(false);
          setRowSelected(null);
          queryGetDoctorSchedules.refetch();
        } else {
          Message.error(data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        }
      },
      onError: (error) => {
        Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
      }
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
  const mutationUpdateSchedule = useMutation({
    mutationKey: ['updateSchedule'],
    mutationFn: ({ id, data }) => ScheduleService.updateSchedule(id, data),
    onSuccess: (data) => {
      if (data?.status === "success") {
        Message.success(data?.message);
        setIsDrawerOpen(false);
        queryGetDoctorSchedules.refetch();
        formUpdate.resetFields();
      } else {
        Message.error(data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
      }
    },
    onError: (error) => {
      Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
    }
  });
  const { data: schedules, isLoading:isLoadingSchedules} = queryGetDoctorSchedules;
  const isPendingDelete = mutationDeleteSchedule.isPending;
  const isPendingCreate = mutationCreateSchedule.isPending;
  const isPendingUpdate = mutationUpdateSchedule.isPending;
  const schedulesData = schedules?.data || [];
  const calendarData = schedulesData?.map(schedule => {
    return {
      id: schedule._id,
      date: dayjs(schedule.workday)?.format('DD/MM/YYYY'),
      shifts: schedule.shifts || [],
      slotDuration: schedule.slotDuration,
      totalShifts: schedule.totalShifts,
      totalSlots: schedule.totalSlots,
    }
  });
  const dataTable = schedulesData.map((schedule,index) => ({
    key: schedule._id,
    index: index + 1,
    date: dayjs(schedule.workday).format('DD/MM/YYYY'),
    shifts: schedule.shifts || [],
    slotDuration: schedule.slotDuration,
    totalShifts: schedule.totalShifts,
    totalSlots: schedule.totalSlots,
  }));
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm theo ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
          <Space>
            <ButtonComponent
              type="primary"
              onClick={() =>
                  handleSearch(selectedKeys, confirm, dataIndex)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </ButtonComponent>
            <Button
              onClick={() => handleReset(clearFilters, confirm)}
              size="small"
              style={{ width: 90 }}
            >
              Xóa
            </Button>
          </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
        record[dataIndex]
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (open) => {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
        searchedColumn === dataIndex ? (
            <Highlighter
                highlightStyle={{ backgroundColor: "#91d5ff", padding: 0 }} // màu bạn chọn
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ""}
            />
        ) : (
            text
        ),
  });
  // sửa lại để xóa cũng confirm luôn
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText("");
    confirm(); 
  };
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      sorter: (a, b) => a.index - b.index,
    },
    {
      title: 'Ngày làm việc',
      dataIndex: 'date',
      key: 'date',
      ...getColumnSearchProps("date"),
    },
    {
      title: "Thời gian khám (phút) / lượt",
      dataIndex: "slotDuration",
      key: "slotDuration",
      filters: [
        { text: '15 phút', value: 15 },
        { text: '20 phút', value: 20 },
        { text: '30 phút', value: 30 },
        { text: '45 phút', value: 45 },
        { text: '60 phút', value: 60 },
      ],
      onFilter: (value, record) => record?.slotDuration === value,
    },
    {
      title: 'Số ca / ngày',
      dataIndex: 'totalShifts',
      key: 'totalShifts',
      sorter: (a, b) => a.totalShifts - b.totalShifts,
    },
    {
      title: 'Số khung giờ / ngày',
      dataIndex: 'totalSlots',
      key: 'totalSlots',
      sorter: (a, b) => a.totalSlots - b.totalSlots,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const itemActions = [
          { key: "detail", label: "Xem chi tiết", icon: <EyeOutlined style={{ fontSize: 16 }} /> },
          { type: "divider" },
          { key: "edit", label: "Chỉnh sửa", icon: <EditOutlined style={{ fontSize: 16 }} /> },
          { type: "divider" },
          { key: "delete", label: <Text type="danger">Xoá</Text>, icon: <DeleteOutlined style={{ fontSize: 16, color: "red" }} /> },
        ];

        const onMenuClick = ({ key, domEvent }) => {
          setRowSelected(record.key);
          domEvent.stopPropagation(); // tránh chọn row khi bấm menu
          if (key === "detail") return handleViewDetails(record.key);
          if (key === "edit") return handleEditSchedule(record.key);
          if (key === "delete") return handleShowConfirmDelete();
        };

        return (
          <Dropdown
            menu={{ items: itemActions, onClick: onMenuClick }}
            trigger={["click"]}
            placement="bottomLeft"
            zIndex={1000} // Đặt z-index cao
            getPopupContainer={() => document.body}
          >
            <ButtonComponent
              type="default"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()} // tránh select row/expand khi bấm nút
            />
          </Dropdown>
        );
      },

    },
  ];
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
  const onPanelChange = (value) => {
    setSelectedDate(value);
  };
  const handleViewDetails = (scheduleId) => {
    const id = typeof scheduleId === "string" ? scheduleId : selectedCellData?.id;
    if (id) {
      navigate(`/doctor/schedules/${id}`);
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
  const handleShowConfirmDelete = () => {
    setIsModalOpenDelete(true);
  };
  const handleOkDelete = () => {
    if (rowSelected) {
      mutationDeleteSchedule.mutate(rowSelected);
    }
  };
  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };
  const handleOnUpdateSchedule = (values) => {
    const { workday, slotDuration, status } = values;
    mutationUpdateSchedule.mutate({ 
      id: rowSelected, 
      data: { workday, doctorId: account?.doctor?.doctorId, slotDuration, status } 
    });
  };
  const handleEditSchedule = (scheduleId) => {
    const schedule = schedulesData.find(sch => sch._id === scheduleId);
    if(!schedule) return;
    formUpdate.setFieldsValue({
      workday: dayjs(schedule.workday),
      slotDuration: schedule.slotDuration,
    });
    setIsDrawerOpen(true);
  };
  return (
    <>
      <Title level={4}>Quản lý lịch làm việc</Title>
      <Divider style={{ margin: '12px 0' }} />
      <ButtonComponent 
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpenCreate(true)}
      >Thêm lịch làm việc</ButtonComponent>
      <TabsComponent 
        activeKey={tabKey}
        type='card'
        tabPosition='left'
        size='large'
        onChange={(key) => setTabKey(key)}
        style={{ marginTop: 16, marginBottom: 16 }}
        items={[
          { 
            key: 'calendar-schedules', 
            label: 'Lịch làm việc', 
            children: (    
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
            )
          },
          { 
            key: 'list-schedules', 
            label: 'Danh sách lịch làm việc', 
            children: (
              <>
                <Title level={5} style={{ marginBottom: 16 }}>Danh sách lịch làm việc tháng {selectedDate?.format("MM/YYYY")}</Title>
                <DatePicker
                  picker="month"
                  onChange={(date) => setSelectedDate(date)}
                  placeholder="Chọn tháng"
                  value={selectedDate}
                  allowClear
                  size="large"
                  style={{ marginBottom: 20 }}
                />
                <TableStyle
                  rowSelection={rowSelection}
                  columns={columns}
                  loading={isLoadingSchedules}
                  dataSource={dataTable}
                  pagination={pagination}
                  onChange={(page) => setPagination(page)}
                />
              </>
            ),
          },
        ]}
      />
      <ModalComponent
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
            <span>Xoá lịch làm việc</span>
          </span>
        }
        open={isModalOpenDelete}
        onOk={handleOkDelete}
        onCancel={handleCancelDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
        style={{ borderRadius: 8 }}
      >
        <LoadingComponent isLoading={isPendingDelete}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <Text>
              Bạn có chắc chắn muốn{" "}
              <Text strong type="danger">
                xoá
              </Text>{" "}
              lịch làm việc này không?
            </Text>
          </div>
        </LoadingComponent>
      </ModalComponent>
      <DrawerComponent
        title={
          <>
            <EditOutlined style={{marginRight:'8px'}}/>
            Cập nhật lịch làm việc
          </>
        }
        placement="right"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={window.innerWidth < 768 ? "100%" : 700}
        forceRender
      >
        <LoadingComponent isLoading={isPendingUpdate}>
          <Form
            name="formUpdate"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleOnUpdateSchedule}
            autoComplete="off"
            form={formUpdate}
          >
            <Form.Item
              label="Ngày làm việc"
              name="workday"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày làm việc!",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && (current < dayjs().add(1,'day').startOf('day') || current.day() === 0)}
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

            <Form.Item
              label={null}
              wrapperCol={{ offset: 18, span: 6 }}
            >
              <Space>
                <ButtonComponent
                  type="default"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Huỷ
                </ButtonComponent>
                <ButtonComponent
                  type="primary"
                  htmlType="submit"
                >
                  Lưu
                </ButtonComponent>
              </Space>
            </Form.Item>
          </Form>
        </LoadingComponent>
      </DrawerComponent>
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
      
    </>
  )
}

export default DoctorSchedulePage