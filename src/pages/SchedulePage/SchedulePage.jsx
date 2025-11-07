import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ScheduleService } from '@/services/ScheduleService'
import { DoctorService } from '@/services/DoctorService'
import { Space, Input, DatePicker, Button, Form, Radio, Typography, Select, Divider, Dropdown} from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import dayjs from 'dayjs';

import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    ExportOutlined
} from "@ant-design/icons";
const { Text, Title } = Typography;
const SchedulePage = () => {
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
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
    const getColumnSearchProps = (dataIndex, type = "text") => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
            {type === "date" ? (
                // 🔹 Nếu là kiểu ngày
                <DatePicker
                format="DD/MM/YYYY"
                value={selectedKeys[0] ? dayjs(selectedKeys[0], "DD/MM/YYYY") : null}
                onChange={(date) =>
                    setSelectedKeys(date ? [date.format("DD/MM/YYYY")] : [])
                }
                style={{ marginBottom: 8, display: "block" }}
                />
            ) : (
                // 🔹 Nếu là kiểu text (giữ nguyên ô search của bạn)
                <Input
                ref={searchInput}
                placeholder={`Tìm theo ${dataIndex}`}
                value={selectedKeys[0]}
                onChange={(e) =>
                    setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                style={{ marginBottom: 8, display: "block" }}
                />
            )}

            <Space>
                <ButtonComponent
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
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
        onFilter: (value, record) => {
            if (type === "date") {
            return dayjs(record[dataIndex], "DD/MM/YYYY").isSame(
                dayjs(value, "DD/MM/YYYY"),
                "day"
            );
            }
            return record[dataIndex]
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        },
        filterDropdownProps: {
            onOpenChange: (open) => {
            if (open && type === "text") {
                setTimeout(() => searchInput.current?.select(), 100);
            }
            },
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
            <Highlighter
                highlightStyle={{ backgroundColor: "#91d5ff", padding: 0 }}
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

    const queryGetAllDoctors = useQuery({
        queryKey: ['getAllDoctors'],
        queryFn: DoctorService.getAllDoctors,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAllSchedules = useQuery({
        queryKey: ['getAllSchedules', selectedDate],
        queryFn: () => ScheduleService.getAllSchedules({
            page: 1,
            limit: 100,
            month: selectedDate?.month() + 1,
            year: selectedDate?.year(),
        }),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const mutationCreateSchedule = useMutation({
        mutationKey: ['createSchedule'],
        mutationFn: ScheduleService.createSchedule,
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message);
                setIsModalOpenCreate(false);
                queryGetAllSchedules.refetch();
                formCreate.resetFields();
            } else {
                Message.error(data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
            }
        },
        onError: (error) => {
            Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        }
    });
    const mutationDeleteSchedule = useMutation({
        mutationKey: ['deleteSchedule'],
        mutationFn: ScheduleService.deleteSchedule,
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message);
                setIsModalOpenDelete(false);
                setRowSelected(null);
                queryGetAllSchedules.refetch();
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
                queryGetAllSchedules.refetch();
                formUpdate.resetFields();
            } else {
                Message.error(data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
            }
        },
        onError: (error) => {
            Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        }
    });
    const mutationDeleteManySchedules = useMutation({
        mutationKey: ['deleteManySchedules'],
        mutationFn: ScheduleService.deleteManySchedules,
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message);
                setIsModalOpenDeleteMany(false);
                setSelectedRowKeys([]);
                queryGetAllSchedules.refetch();
            } else {
                Message.error(data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
            }
        },
        onError: (error) => {
            Message.error(error?.response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        }
    });
    
    const { data: doctors, isLoading: isLoadingDoctors } = queryGetAllDoctors;
    const { data: schedules, isLoading: isLoadingSchedules } = queryGetAllSchedules;
    const { isPending: isPendingCreate } = mutationCreateSchedule;
    const { isPending: isPendingDelete } = mutationDeleteSchedule;
    const { isPending: isPendingUpdate } = mutationUpdateSchedule;
    const { isPending: isPendingDeleteMany } = mutationDeleteManySchedules;
    const doctorData = doctors?.data?.doctors || [];
    const scheduleData = schedules?.data?.schedules || [];
    const dataTable = scheduleData.map((item, index) => ({
        key: item.scheduleId,
        index: index + 1,
        doctor: item.doctor?.person?.fullName,
        workday: dayjs(item.workday).format("DD/MM/YYYY"),
        // shiftId: item.shift?.name,
        shiftCount: item.shiftCount,
        slotCount: item.slotCount,
        slotDuration: item.slotDuration,
        status: item.status,
    }));
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Ngày làm việc",
            dataIndex: "workday",
            key: "workday",
            filterMultiple: false,
            ...getColumnSearchProps("workday", "date"),
            sorter: (a, b) => dayjs(a.workday, "DD/MM/YYYY").unix() - dayjs(b.workday, "DD/MM/YYYY").unix(),
        },
        {
            title: "Bác sĩ",
            dataIndex: "doctor",
            key: "doctor",
            ...getColumnSearchProps("doctor"),
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
            title: "Số ca / ngày",
            dataIndex: "shiftCount",
            key: "shiftCount",
            sorter: (a, b) => a?.shiftCount - b?.shiftCount,
        },
        {
            title: "Số khung giờ / ngày",
            dataIndex: "slotCount",
            key: "slotCount",
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

        },
    ];
    const handleCreateSchedule = () => {
        formCreate
            .validateFields()
            .then((values) => {
                const { workday, doctorId, slotDuration } = values;
                mutationCreateSchedule.mutate({
                    workday,
                    doctorId,
                    slotDuration
                });
            })
    };
    const handleEditSchedule = (key) => {
        const schedule = scheduleData.find(item => item.scheduleId === key);
        if (!schedule) return;
        formUpdate.setFieldsValue({
            workday: schedule.workday ? dayjs(schedule.workday) : null,
            doctorId: schedule.doctor?.doctorId || schedule?.doctor?.id,
            slotDuration: schedule.slotDuration,
            status: schedule.status
        });
        setIsDrawerOpen(true);
    };
    const handleViewSchedule = (key) => {
        navigate(`/admin/schedules/${key}`);
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleOkDelete = () => {
        mutationDeleteSchedule.mutate(rowSelected);
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
        setRowSelected(null);
    };
    const handleCloseCreateSchedule = () => {
        setIsModalOpenCreate(false);
        formCreate.resetFields();
    };
    const handleOnUpdateSchedule = (values) => {
        const { workday, doctorId, slotDuration, status } = values;
        mutationUpdateSchedule.mutate({ id: rowSelected, data: { workday, doctorId,slotDuration, status } });
    };
    const handleOkDeleteMany = () => {
        mutationDeleteManySchedules.mutate(selectedRowKeys);
    };
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    };
    const menuProps = {
        items: [
            {
                key: "export",
                label: "Xuất file",
                icon: <ExportOutlined style={{ fontSize: 16 }} />,
            },
            {
                type: "divider"
            },
            {
                key: "delete",
                label: <Text type="danger">Xoá tất cả</Text>,
                icon: <DeleteOutlined style={{ color: "red", fontSize: 16 }} />,
                onClick: () => setIsModalOpenDeleteMany(true),
            },
        ],
    };
    const handleSelectedAll = () => {
        if (selectedRowKeys.length === dataTable.length) {
            setSelectedRowKeys([]);
        } else {
            setSelectedRowKeys(dataTable.map(item => item.key));
        }
    };

    return (
        <>
            <Title level={4}>Danh sách lịch làm việc</Title>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
               

                    <ButtonComponent
                        type="primary"
                        onClick={() => setIsModalOpenCreate(true)}
                        icon={<PlusOutlined />}
                    >
                        Thêm mới
                    </ButtonComponent>
                    
                

                <ButtonComponent    
                    type="default"
                
                >
                    Xuất file
                    <ExportOutlined style={{ fontSize: 16, marginLeft: 8 }} />
                </ButtonComponent>
            </div>
            <DatePicker
                picker="month"
                onChange={(date) => setSelectedDate(date)}
                placeholder="Chọn tháng"
                value={selectedDate}
                format="MM/YYYY"
                allowClear
                size="middle"
                style={{ marginBottom: 20 }}
            />
            <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                handleSelectedAll={handleSelectedAll}
                menuProps={menuProps}
            />
            
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
                            label="Bác sĩ"
                            name="doctorId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn bác sĩ!",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn bác sĩ"
                                loading={isLoadingDoctors}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                options={doctorData.map(doctor => ({
                                    label: doctor.person?.fullName,
                                    value: doctor.doctorId
                                }))}

                            />
                        </Form.Item>
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
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá lịch làm việc</span>
                    </span>
                }
                open={isModalOpenDeleteMany}
                onOk={handleOkDeleteMany}
                okText="Xoá"
                cancelText="Hủy"
                onCancel={handleCancelDeleteMany}
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteMany}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            {selectedRowKeys.length} lịch làm việc này không?
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
                            label="Bác sĩ"
                            name="doctorId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn bác sĩ!",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn bác sĩ"
                                loading={isLoadingDoctors}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                options={doctorData.map(doctor => ({
                                    label: doctor.person?.fullName,
                                    value: doctor.doctorId
                                }))}

                            />
                        </Form.Item>
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
            <TableStyle
                rowSelection={rowSelection}
                columns={columns}
                loading={isLoadingSchedules}
                dataSource={dataTable}
                pagination={pagination}
                onChange={(page) => setPagination(page)}
            />
        </>
    )
}

export default SchedulePage