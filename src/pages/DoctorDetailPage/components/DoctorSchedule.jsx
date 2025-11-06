import { DatePicker, Card, Form, Select , Dropdown, Typography, Space, Input} from 'antd';
import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ScheduleService } from '@/services/ScheduleService';
import TableStyle from '@/components/TableStyle/TableStyle';
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import * as Message from '@/components/Message/Message';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined,PlusOutlined,ExclamationCircleOutlined,SearchOutlined  } from '@ant-design/icons';
import dayjs from 'dayjs';
import Highlighter from 'react-highlight-words';
import { useNavigate } from 'react-router-dom';
const { Text, Title } = Typography;

const DoctorSchedule = ({id}) => {
    const [rowSelected, setRowSelected] = useState(null);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formUpdate] = Form.useForm();
    const now = new Date(); // Tạo đối tượng Date hiện tại
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [formCreate] = Form.useForm();
    const navigate = useNavigate();
    // Tìm kiếm
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);
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
                    <ButtonComponent
                        onClick={() => handleReset(clearFilters, confirm)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xóa
                    </ButtonComponent>
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
    // sửa lại để Xóa cũng confirm luôn
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
    const onChangeMonth = (date) => {
        if (date) {
            setSelectedMonth(date.month() + 1); // Tháng trong DatePicker bắt đầu từ 0
            setSelectedYear(date.year());
        } else {
            setSelectedMonth(null);
            setSelectedYear(null);
        }
    };
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };
    const queryGetSchedulesByDoctor = useQuery({
        queryKey: ['schedules', id, selectedMonth, selectedYear],
        queryFn: () => ScheduleService.getSchedulesByDoctor(id, selectedMonth, selectedYear),
        enabled: !!id && !!selectedMonth && !!selectedYear,
        retry: 1,
    });
    const mutationCreateSchedule = useMutation({
        mutationKey: ['createSchedule'],
        mutationFn: ScheduleService.createSchedule,
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message);
                setIsModalOpenCreate(false);
                queryGetSchedulesByDoctor.refetch();
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
        mutationFn: ({ scheduleId, data }) => ScheduleService.updateSchedule(scheduleId, data),
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message);
                setIsDrawerOpen(false);
                setRowSelected(null);
                queryGetSchedulesByDoctor.refetch();
            }else {
                Message.error(data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
            }
        },
        onError: (error) => {
            Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        }
    });
    const mutationDeleteSchedule = useMutation({
        mutationKey: ['deleteSchedule'],
        mutationFn: (scheduleId) => ScheduleService.deleteSchedule(scheduleId),
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message);
                setIsModalOpenDelete(false);
                setRowSelected(null);
                queryGetSchedulesByDoctor.refetch();
            }
        },
        onError: (error) => {
            Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        }
    });
    const { data: dataSchedules, isLoading:isLoadingSchedule } = queryGetSchedulesByDoctor;
    const isPendingCreate = mutationCreateSchedule.isPending;
    const isPendingDelete = mutationDeleteSchedule.isPending;
    const isPendingUpdate = mutationUpdateSchedule.isPending;
    const dataTable = dataSchedules?.data.map((item,index) => ({
        key: item._id,
        index: index+1,
        workDay: new Date(item.workday).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        slotDuration: item.slotDuration,
        shiftCount: item.totalShifts,
        slotCount: item.totalSlots,
    })) || [];
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: '5%',
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: 'Ngày làm việc',
            dataIndex: 'workDay',
            key: 'workDay',
            ...getColumnSearchProps('workDay'),
        },
        {
            title: 'Thời gian khám (phút)',
            dataIndex: 'slotDuration',
            key: 'slotDuration',
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
            title: 'Số ca',
            dataIndex: 'shiftCount',
            key: 'shiftCount',
            sorter: (a, b) => a?.shiftCount - b?.shiftCount,
        },
        {
            title: 'Số khung giờ',
            dataIndex: 'slotCount',
            key: 'slotCount',
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
                    if (key === "detail") return handleViewSchedule(record.key);
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
        }
    ];
    const handleViewSchedule = (key) => {
        navigate(`/admin/schedules/${key}`);
    };
    const handleCloseCreateSchedule = () => {
        setIsModalOpenCreate(false);
    }
    const handleCreateSchedule = () => {
        formCreate
            .validateFields()
            .then((values) => {
                const data = {
                    doctorId: id,
                    ...values
                };
                mutationCreateSchedule.mutate(data);
            });
    }
    const handleOkDelete = () => {
        if (rowSelected) {
            mutationDeleteSchedule.mutate(rowSelected);
        }
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
        setRowSelected(null);
    };
    const handleEditSchedule = (scheduleId) => {
        const schedule = dataSchedules?.data.find(item => item._id === scheduleId);
        if(schedule){
            formUpdate.setFieldsValue({
                workday: dayjs(schedule.workday),
                slotDuration: schedule.slotDuration,
            });
            setIsDrawerOpen(true);
        }
    };
    const handleOnUpdateSchedule = (values) => {
        if(rowSelected){
            const data = {
                ...values,
                doctorId:id,
            };
            mutationUpdateSchedule.mutate({ scheduleId: rowSelected, data });
        }
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    return (
        <>
            <Card 
                title={
                    <Title level={4} style={{margin:0}}>Lịch làm việc</Title>
                }
                style={{ marginBottom: 20 }}
                extra={
                    <ButtonComponent
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpenCreate(true)}
                    >
                        Thêm lịch làm việc
                    </ButtonComponent>
                }
            >
                <DatePicker
                    picker="month"
                    onChange={onChangeMonth}
                    placeholder="Chọn tháng"
                    value={selectedMonth && selectedYear ? dayjs(`${selectedYear}-${selectedMonth}`, 'YYYY-M') : null}
                    allowClear
                    size="large"
                    style={{ marginBottom: 20 }}
                />
                <TableStyle
                    rowSelection={rowSelection}
                    columns={columns}
                    loading={isLoadingSchedule}
                    dataSource={dataTable}
                    pagination={pagination}
                    onChange={(page, pageSize) => {
                        setPagination((prev) => ({
                            ...prev,
                            current: page,
                            pageSize: pageSize,
                        }));
                    }}
                />
            </Card>
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
                        labelAlign="left"
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
        </>
    )
}

export default DoctorSchedule