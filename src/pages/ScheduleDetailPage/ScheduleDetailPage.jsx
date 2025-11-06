import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined, PlusOutlined ,SearchOutlined, EyeOutlined, CalendarOutlined, EditOutlined , DeleteOutlined , MoreOutlined, ExclamationCircleOutlined, AppstoreOutlined, ClockCircleOutlined   } from "@ant-design/icons";
import { Form, Input, TimePicker, Space, Button, Dropdown, Typography, Card, Tag, Row, Divider, Col, Select } from 'antd';
import Highlighter from "react-highlight-words";
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent'
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import TableStyle from '@/components/TableStyle/TableStyle';
import { ShiftService } from '@/services/ShiftService';
import { ScheduleService } from '@/services/ScheduleService';
import { SlotService } from '@/services/SlotService';
import * as Message from "@/components/Message/Message";
import dayjs from 'dayjs';
const {Text} =Typography;

const DetailSchedulePage = () => {
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [isModalOpenDetail, setIsModalOpenDetail] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rowSelected, setRowSelected] = useState(null);
  const [shiftSelected, setShiftSelected] = useState(null);
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
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
    confirm(); // refresh bảng sau khi clear
  };
  const handleBack = () => {
    navigate(-1);
  };
  const mutationCreateShift = useMutation({
    mutationKey: ['createShift'],
    mutationFn: ShiftService.createShift,
    onSuccess: (data) => {
      if(data?.status === "success") {
        handleCloseCreateShift();
        queryGetAllShiftBySchedule.refetch();
        formCreate.resetFields();
        Message.success(data?.message);
      }else{
        Message.error(data?.message || "Error creating shift");
      }
    },
    onError: (error) => {
      Message.error(error?.response?.data?.message || "Error creating shift");
    }
  });
  const mutationUpdateShift = useMutation({
    mutationKey: ['updateShift'],
    mutationFn: ({id, data}) => ShiftService.updateShift(id, data),
    onSuccess: (data) => {
      if(data?.status === "success") {
        Message.success(data?.message);
        setIsDrawerOpen(false);
        queryGetAllShiftBySchedule.refetch();
        setRowSelected(null);
      }else{
        Message.error(data?.message || "Error update shift");
      }
    },
    onError: (error) => {
      Message.error(error?.response?.data?.message || "Error update shift");
    }
  });
  const mutationDeleteShift = useMutation({
    mutationKey: ['deleteShift'],
    mutationFn: ShiftService.deleteShift,
    onSuccess: (data) => {
      if(data?.status === "success") {
        Message.success(data?.message);
        setIsModalOpenDelete(false);
        queryGetAllShiftBySchedule.refetch();
        setRowSelected(null);
      }else{
        Message.error(data?.message || "Error delete shift");
      }
    },
    onError: (error) => {
      Message.error(error?.response?.data?.message || "Error delete shift");
    }
  });
  const queryGetAllShiftBySchedule = useQuery({
    queryKey: ["getAllShiftBySchedule", id],
    queryFn: () => ShiftService.getAllShiftBySchedule(id),
    enabled: !!id,
  });
  const queryGetAllSlotByShift = useQuery({
    queryKey: ["getAllSlotByShift", rowSelected],
    queryFn: () => SlotService.getAllSlotsByShift(rowSelected),
    enabled: !!rowSelected,
  });
  const queryGetSchedule = useQuery({
    queryKey: ["getSchedule", id],
    queryFn: () => ScheduleService.getSchedule(id),
    enable: !!id,
  });
  const handleCreateShift = () => {
    formCreate
      .validateFields(). then((values) => {
        const { name, startTime, endTime } = values;
        mutationCreateShift.mutate({
          name,
          scheduleId: id,
          startTime,
          endTime,
        });
      });
  };
  const handleCloseCreateShift = () => {
    setIsModalOpenCreate(false);
  };
  const isPendingCreate = mutationCreateShift.isPending;
  const isPendingUpdate = mutationUpdateShift.isPending;
  const isPendingDelete = mutationDeleteShift.isPending;
  const {data: shifts , isLoading: isLoadingShifts} = queryGetAllShiftBySchedule;
  const {data: slots , isLoading: isLoadingSlots} = queryGetAllSlotByShift;
  const {data: schedule, isLoading: isLoadingSchedule} = queryGetSchedule;
  const shiftData = shifts?.data?.shifts || [];
  const scheduleInfo = schedule?.data || {};
  const slotsData = slots?.data || [];
  const dataTable = shiftData.map((item, index) => ({
    key: item.shiftId,
    index: index + 1,
    name: item.name,
    startTime: dayjs(item.startTime).format("HH:mm"),
    endTime: dayjs(item.endTime).format("HH:mm"),
    slotCount: item.slotCount
  }));
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      sorter: (a, b) => a.index - b.index,
    },
    {
      title: "Ca làm việc",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      sorter: (a, b) => dayjs(a.endTime).unix() - dayjs(b.endTime).unix(),
    },
   
    {
      title: "Số khung giờ",
      dataIndex: "slotCount",
      sorter: (a, b) => a?.slotCount - b?.slotCount,
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
            if (key === "detail") return handleViewShift(record.key);
            if (key === "edit") return handleEditShift(record.key);
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
  const handleViewShift = (shiftId) => {
    const shift = shiftData.find(item => item.shiftId === shiftId);
    setShiftSelected(shift);
    setIsModalOpenDetail(true);
  };
  const handleEditShift = (shiftId) => {
    const shift = shiftData.find(item => item.shiftId === shiftId);
    if(shift) {
      formUpdate.setFieldsValue({
        name: shift.name,
        startTime: dayjs(shift.startTime),
        endTime: dayjs(shift.endTime),
      });
      setIsDrawerOpen(true);
    }
  };
  const handleOnUpdateShift = () => {
    formUpdate.validateFields().then((values) => {
      const { name, startTime, endTime } = values;
      mutationUpdateShift.mutate({
        id: rowSelected,
        data: {
          name,
          startTime,
          endTime,
        }
      });
    })
  };
  const handleShowConfirmDelete = () => {
    setIsModalOpenDelete(true);
  };
  const handleOkDelete = () => {
    mutationDeleteShift.mutate(rowSelected);
  };
  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };
  const handleOnchange = (value) => {
    if(isDrawerOpen) {
      if(value === 'Ca sáng') {
        formUpdate.setFieldsValue({
          startTime: dayjs('08:00', 'HH:mm'),
          endTime: dayjs('12:00', 'HH:mm'),
        });
      } else if(value === 'Ca chiều') {
        formUpdate.setFieldsValue({
          startTime: dayjs('13:00', 'HH:mm'),
          endTime: dayjs('17:00', 'HH:mm'),
        });
      } else if(value === 'Ca tối') {
        formUpdate.setFieldsValue({
          startTime: dayjs('18:00', 'HH:mm'),
          endTime: dayjs('22:00', 'HH:mm'),
        });
      }
    } else {
      if(value === 'Ca sáng') {
        formCreate.setFieldsValue({
          startTime: dayjs('08:00', 'HH:mm'),
          endTime: dayjs('12:00', 'HH:mm'),
        });
      } else if(value === 'Ca chiều') {
        formCreate.setFieldsValue({
          startTime: dayjs('13:00', 'HH:mm'),
          endTime: dayjs('17:00', 'HH:mm'),
        });
      } else if(value === 'Ca tối') {
        formCreate.setFieldsValue({
          startTime: dayjs('18:00', 'HH:mm'),
          endTime: dayjs('22:00', 'HH:mm'),
        });
      }
    }
  }

  return (
    <>
      <ButtonComponent
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ fontSize: 18, padding: 0 }}

      >Chi tiết lịch</ButtonComponent>
      <Card
        style={{
          marginTop: 16,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
        loading={isLoadingSchedule}
      >
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Space>
              <CalendarOutlined style={{ color: "#1890ff" }} />
              <Text>
                <b>Ngày làm việc: </b>
                {scheduleInfo?.workday
                  ? dayjs(scheduleInfo.workday).format("DD/MM/YYYY")
                  : "—"}
              </Text>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <UserOutlined style={{ color: "#52c41a" }} />
              <Text>
                <b>Bác sĩ: </b>
                {scheduleInfo?.doctor?.person?.fullName || "—"}
              </Text>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <ClockCircleOutlined style={{ color: "#faad14" }} />
              <Text>
                <b>Thời gian khám: </b>
                {scheduleInfo?.slotDuration || "—"} phút
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>
      <Divider style={{ margin: "12px 0" }} />
      <ButtonComponent 
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpenCreate(true)}
      >Thêm ca làm việc</ButtonComponent>
      <Divider style={{ margin: "12px 0" }} />
      <LoadingComponent isLoading={isPendingCreate}>
          <ModalComponent
              title="Thêm mới ca làm việc"
              open={isModalOpenCreate}
              onOk={handleCreateShift}
              onCancel={handleCloseCreateShift}
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
                    shiftDuration: 30,
                  }}
                  autoComplete="off"
                  form={formCreate}
              >
          
                  <Form.Item
                    label="Ca làm việc"
                    name="name"
                    rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn ca làm việc!",
                        },
                    ]}
                  >
                    <Select
                      placeholder="Chọn ca làm việc"
                      style={{ width: "100%" }}
                      onChange={handleOnchange}
                      options={[
                        { value: 'Ca sáng', label: 'Ca sáng' },
                        { value: 'Ca chiều', label: 'Ca chiều' },
                        { value: 'Ca tối', label: 'Ca tối' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                      label="Thời gian bắt đầu"
                      name="startTime"
                      rules={[
                          {
                              required: true,
                              message: "Vui lòng chọn thời gian bắt đầu!",
                          },
                          ({ getFieldValue }) => ({
                              validator(_, value) {
                                  const startTime = getFieldValue('startTime');
                                  const endTime = getFieldValue('endTime');
                                  if (startTime && endTime && startTime.isAfter(endTime)) {
                                      return Promise.reject(new Error("Thời gian bắt đầu phải trước thời gian kết thúc!"));
                                  }
                                  return Promise.resolve();
                              }
                          })
                      ]}
                  >
                      <TimePicker
                          format="HH:mm"
                          style={{ width: "100%" }}
                          placeholder="Chọn giờ bắt đầu"
                      />
                  </Form.Item>

                  <Form.Item
                      label="Thời gian kết thúc"
                      name="endTime"
                      rules={[
                          {
                              required: true,
                              message: "Vui lòng chọn thời gian kết thúc!",
                          },
                          ({ getFieldValue }) => ({
                              validator(_, value) {
                                  const startTime = getFieldValue('startTime');
                                  const endTime = getFieldValue('endTime');
                                  if (startTime && endTime && startTime.isAfter(endTime)) {
                                      return Promise.reject(new Error("Thời gian kết thúc phải sau thời gian bắt đầu!"));
                                  }
                                  return Promise.resolve();
                              }
                          })
                      ]}
                  >
                    <TimePicker
                      format="HH:mm"
                      style={{ width: "100%" }}
                      placeholder="Chọn giờ kết thúc"
                    />
                  </Form.Item>
              </Form>
          </ModalComponent>
      </LoadingComponent >
      <ModalComponent
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
            <span>Xoá ca</span>
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
              ca này không?
            </Text>
          </div>
        </LoadingComponent>
      </ModalComponent>
      <DrawerComponent
        title="Chi tiết ca làm việc"
        placement="right"
        isOpen={isModalOpenDetail}
        onClose={() => setIsModalOpenDetail(false)}
        width={window.innerWidth < 768 ? "100%" : 800}
        forceRender
      >
        <LoadingComponent isLoading={isLoadingSlots}>
          <Card
            style={{
              marginBottom: 16,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: "12px 16px",
            }}
          >
            <Row gutter={[0, 12]}>
              <Col span={24}>
                <Text strong>
                  <AppstoreOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Ca làm việc:{" "}
                </Text>
                <Text>{shiftSelected?.name || "—"}</Text>
              </Col>

              <Col span={24}>
                <Text strong>
                  <ClockCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  Thời gian:{" "}
                </Text>
                <Text>
                  {shiftSelected
                    ? `${dayjs(shiftSelected.startTime).format("HH:mm")} - ${dayjs(
                        shiftSelected.endTime
                      ).format("HH:mm")}`
                    : "—"}
                </Text>
              </Col>

              <Col span={24}>
                <Text strong>
                  <CalendarOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  Tổng số khung giờ:{" "}
                </Text>
                <Text>{shiftSelected?.slotCount || 0}</Text>
              </Col>
            </Row>
          </Card>
          <TableStyle
            columns={[
              {
                title: "STT",
                dataIndex: "index",
                key: "index",
                sorter: (a, b) => a.index - b.index,
                width: 80,
              },
              {
                title: "Thời gian bắt đầu",
                dataIndex: "startTime",
                key: "startTime",
                center: true,
                ...getColumnSearchProps("startTime"),
              },
              {
                title: "Thời gian kết thúc",
                dataIndex: "endTime",
                key: "endTime",
                center: true,
                
                ...getColumnSearchProps("endTime"),
              },
              {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                render: (status) => {
                  let color = "green";
                  let text = "Còn trống";
                  if (status === "booked") {
                    color = "red";
                    text = "Đã đặt";
                  }
                
                  return <Tag color={color}>{text}</Tag>;
                },
                filters: [
                  { text: 'Còn trống', value: 'available' },
                  { text: 'Đã đặt', value: 'booked' },
                ],
                onFilter: (value, record) => record?.status === value,
                filterSearch: true,
                filterMultiple: false,
                width: 150,
              }
            ]}
            loading={isLoadingSlots}
            dataSource={slotsData.map((item, index) => ({
              key: item.slotId,
              index: index + 1,
              startTime: dayjs(item.startTime).format("HH:mm"),
              endTime: dayjs(item.endTime).format("HH:mm"),
              status: item.status
            }))}
            pagination={{
              pageSize: 5,
            }}
          />
        </LoadingComponent>

      </DrawerComponent>
      <DrawerComponent
          title={
            <>
              <EditOutlined style={{marginRight:'8px'}}/>
              Cập nhật ca làm việc
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
              labelAlign="left"
              wrapperCol={{ span: 18 }}
              style={{ maxWidth: 600 }}
              onFinish={handleOnUpdateShift}
              autoComplete="off"
              form={formUpdate}
            >
              <Form.Item
                  label="Ca làm việc"
                  name="name"
                  rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ca làm việc!",
                      },
                  ]}
                >
                  <Select
                    placeholder="Chọn ca làm việc"
                    style={{ width: "100%" }}
                    onChange={handleOnchange}
                    options={[
                      { value: 'Ca sáng', label: 'Ca sáng' },
                      { value: 'Ca chiều', label: 'Ca chiều' },
                      { value: 'Ca tối', label: 'Ca tối' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                    label="Thời gian bắt đầu"
                    name="startTime"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn thời gian bắt đầu!",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const startTime = getFieldValue('startTime');
                                const endTime = getFieldValue('endTime');
                                if (startTime && endTime && startTime.isAfter(endTime)) {
                                    return Promise.reject(new Error("Thời gian bắt đầu phải trước thời gian kết thúc!"));
                                }
                                return Promise.resolve();
                            }
                        })
                    ]}
                >
                    <TimePicker
                        format="HH:mm"
                        style={{ width: "100%" }}
                        placeholder="Chọn giờ bắt đầu"
                    />
                </Form.Item>

                <Form.Item
                    label="Thời gian kết thúc"
                    name="endTime"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn thời gian kết thúc!",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const startTime = getFieldValue('startTime');
                                const endTime = getFieldValue('endTime');
                                if (startTime && endTime && startTime.isAfter(endTime)) {
                                    return Promise.reject(new Error("Thời gian kết thúc phải sau thời gian bắt đầu!"));
                                }
                                return Promise.resolve();
                            }
                        })
                    ]}
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: "100%" }}
                    placeholder="Chọn giờ kết thúc"
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
                      ghost
                      htmlType="submit"
                    >
                      Cập nhật
                    </ButtonComponent>
                  </Space>
                </Form.Item>
            </Form>
          </LoadingComponent>
      </DrawerComponent>
      <TableStyle
        rowSelection={rowSelection}
        columns={columns}
        loading={isLoadingShifts}
        dataSource={dataTable}
        pagination={pagination}
        onChange={(page) => setPagination(page)}
      />
    </>
  )
}

export default DetailSchedulePage