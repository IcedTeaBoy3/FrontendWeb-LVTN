import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ShiftService } from '@/services/ShiftService';
import {ScheduleService} from '@/services/ScheduleService';
import { Space, Input, DatePicker, TimePicker, Button, Form, Radio, Typography, Select, Divider, Dropdown, Tag } from "antd";
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
const ShiftPage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
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
    const queryGetAllShifts = useQuery({
        queryKey: ["getAllShifts"],
        queryFn: ShiftService.getAllShifts,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAllSchedules = useQuery({
        queryKey: ["getAllSchedules"],
        queryFn: ScheduleService.getAllSchedules,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const mutationCreateShift = useMutation({
        mutationKey: ["createShift"],
        mutationFn: ShiftService.createShift,
        onSuccess: (data) => {
            if(data?.status == "success"){
                Message.success(data?.message);
                queryGetAllShifts.refetch();
                formCreate.resetFields();
                setIsModalOpenCreate(false);
            }else{
                Message.error(data?.message || "Tạo ca làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Tạo ca làm việc thất bại");
        }
    });
    const mutationUpdateShift = useMutation({
        mutationKey: ["updateShift"],
        mutationFn: ({ shiftId, ...data }) => ShiftService.updateShift(shiftId, data),
        onSuccess: (data) => {
            if(data?.status == "success"){
                Message.success(data?.message);
                queryGetAllShifts.refetch();
                formUpdate.resetFields();
                setIsDrawerOpen(false);
                setRowSelected(null);
            }else{
                Message.error(data?.message || "Cập nhật ca làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật ca làm việc thất bại");
        }
    });
    const mutationDeleteShift = useMutation({
        mutationKey: ["deleteShift"],
        mutationFn: (shiftId) => ShiftService.deleteShift(shiftId),
        onSuccess: (data) => {
            if(data?.status == "success"){
                Message.success(data?.message);
                queryGetAllShifts.refetch();
                setIsModalOpenDelete(false);
                setRowSelected(null);
            }else{
                Message.error(data?.message || "Xoá ca làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá ca làm việc thất bại");
        }
    });
    const mutationDeleteManyShifts = useMutation({
        mutationKey: ["deleteManyShifts"],
        mutationFn: (shiftIds) => ShiftService.deleteManyShifts(shiftIds),
        onSuccess: (data) => {
            if(data?.status == "success"){
                Message.success(data?.message);
                queryGetAllShifts.refetch();
                setIsModalOpenDeleteMany(false);
                setSelectedRowKeys([]);
            }else{
                Message.error(data?.message || "Xoá ca làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá ca làm việc thất bại");
        }
    });
    const { data: dataGetAllShifts, isLoading: isLoadingShifts } = queryGetAllShifts;
    const { data: dataGetAllSchedules, isLoading: isLoadingSchedules } = queryGetAllSchedules;
    const { isPending: isPendingCreate } = mutationCreateShift;
    const { isPending: isPendingUpdate } = mutationUpdateShift;
    const { isPending: isPendingDelete } = mutationDeleteShift;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyShifts;
    const shiftData = dataGetAllShifts?.data?.shifts || [];
    const scheduleData = dataGetAllSchedules?.data?.schedules || [];

    const dataTable = shiftData.map((item, index) => ({
        key: item.shiftId,
        index: index + 1,
        name: item.name,
        shiftId: dayjs(item.schedule?.workday).format("DD/MM/YYYY"),
        startTime: item.startTime,
        endTime: item.endTime,
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
            title: "Ca làm việc",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name"),
        },
        {
            title: "Lịch làm việc",
            dataIndex: "shiftId",
            key: "shiftId",
        },
        {
            title: "Thời gian bắt đầu",
            dataIndex: "startTime",
            key: "startTime",
            render: (text) => dayjs(text).format("HH:mm"),
        },
        {
            title: "Thời gian kết thúc",
            dataIndex: "endTime",
            key: "endTime",
            render: (text) => dayjs(text).format("HH:mm"),
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
        console.log("View shift:", shiftId);
    }
    const handleEditShift = (shiftId) => {
        const shift = shiftData.find((item) => item.shiftId === shiftId);
        if (shift) {
            formUpdate.setFieldsValue({
                name: shift.name,
                startTime: shift.startTime ? dayjs(shift.startTime, "HH:mm") : null,
                endTime: shift.endTime ? dayjs(shift.endTime, "HH:mm") : null,
                status: shift.status,
            });
            setIsDrawerOpen(true);
        }
    }
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleCreateShift = () => {
        formCreate
            .validateFields()
            .then((values) => {
                mutationCreateShift.mutate(values);
            })
            .catch((errorInfo) => {
                console.log("Failed to create shift:", errorInfo);
            });
    };
    const handleCloseCreateShift = () => {
        formCreate.resetFields();
        setIsModalOpenCreate(false);
    };
    const handleOnUpdateShift = (values) => {
        mutationUpdateShift.mutate({
            shiftId: rowSelected,
            name: values.name,
            startTime: values.startTime.format("HH:mm"),
            endTime: values.endTime.format("HH:mm"),
            status: values.status,
        });
    };
    const handleOkDelete = () => {
        mutationDeleteShift.mutate(rowSelected);
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };
    const handleOkDeleteMany = () => {
        mutationDeleteManyShifts.mutate(selectedRowKeys);
    };
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    };

    const handleSelectedAll = () => {
        if (selectedRowKeys.length === dataTable.length) {
            setSelectedRowKeys([]);
        } else {
            setSelectedRowKeys(dataTable.map((item) => item.key));
        }
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
    return (
        <>
            <Title level={4}>Ca làm việc</Title>
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <ButtonComponent
                type="primary"
                onClick={() => setIsModalOpenCreate(true)}
                icon={<PlusOutlined />}
            >
                Thêm mới
            </ButtonComponent>
            <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                handleSelectedAll={handleSelectedAll}
                menuProps={menuProps}
            />
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <LoadingComponent isLoading={isPendingCreate}>
                <ModalComponent
                    title="Thêm mới lịch làm việc"
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
                                    message: "Vui lòng nhập vào ca làm việc!",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập vào ca làm việc" />
                        </Form.Item>
                        <Form.Item
                            label="Lịch làm việc"
                            name="scheduleId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn lịch làm việc!",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn lịch làm việc"
                                options={scheduleData.map((schedule) => ({
                                    label: dayjs(schedule.workday).format("DD/MM/YYYY"),
                                    value: schedule.scheduleId,
                                }))}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
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
            <DrawerComponent
                title="Chi tiết ca làm việc"
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
                        style={{ maxWidth: 600, padding: "20px" }}
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
                            <Input placeholder="Nhập vào ca làm việc" />
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
                            label="Trạng thái"
                            name="status"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn trạng thái!",
                                },
                            ]}
                        >
                            <Radio.Group>
                                <Radio value="active">Hoạt động</Radio>
                                <Radio value="inactive">Không hoạt động</Radio>
                            </Radio.Group>

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
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá ca làm việc</span>
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
                            ca làm việc này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá ca làm việc</span>
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
                            {selectedRowKeys.length} ca làm việc này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <TableStyle
                rowSelection={rowSelection}
                rowKey={"key"}
                columns={columns}
                scroll={{ x: "max-content" }}
                loading={isLoadingShifts}
                dataSource={dataTable}
                locale={{
                    emptyText: "Không có dữ liệu ca làm việc",
                    filterConfirm: "Lọc",
                    filterReset: "Xóa lọc",
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    position: ["bottomCenter"],
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} ca làm việc`,
                    showSizeChanger: true, // Cho phép chọn số dòng/trang
                    pageSizeOptions: ["5", "8", "10", "20", "50"], // Tuỳ chọn số dòng
                    showQuickJumper: true, // Cho phép nhảy đến trang
                    onChange: (page, pageSize) => {
                        setPagination({
                            current: page,
                            pageSize: pageSize,
                        });
                    },
                }}
            />
        </>
    )
}

export default ShiftPage