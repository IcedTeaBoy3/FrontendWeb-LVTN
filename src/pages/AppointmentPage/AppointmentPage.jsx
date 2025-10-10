import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { SpecialtyService } from '@/services/SpecialtyService'
import { AppointmentService } from '@/services/AppointmentService'
import { Space, Input, Radio, Button, Form, Popover, Typography, Select, Divider, Dropdown, Tag, InputNumber } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import * as DatetimeUtils from '@/utils/datetime_utils';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    ExportOutlined,
    CheckOutlined, 
    CheckCircleFilled
} from "@ant-design/icons";
const { Text,Title } = Typography;
const AppointmentPage = () => {
    // const listStatus = [
    //     { label: "Chờ xác nhận", value: "pending" },
    //     { label: "Đã xác nhận", value: "confirmed" },
    //     { label: "Đã hoàn thành", value: "completed" },
    //     { label: "Đã hủy", value: "cancelled" },
    // ]

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
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
    const queryGetAllAppointments = useQuery({
        queryKey: ['getAllAppointments'],
        queryFn: () => AppointmentService.getAllAppointments({ page: 1, limit: 1000}),
        retry: 1,
    });
    const mutationDeleteAppointment = useMutation({
        mutationKey: ['deleteAppointment'],
        mutationFn: (appointmentId) => AppointmentService.deleteAppointment(appointmentId),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success("Xoá lịch khám thành công");
                queryGetAllAppointments.refetch();
                setRowSelected(null);
                setIsModalOpenDelete(false);
            } else {
                Message.error(data?.message || "Xoá lịch khám thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá lịch khám thất bại");
        }
    });
    const mutationConfirmAppointment = useMutation({
        mutationKey: ['confirmAppointment'],
        mutationFn: (appointmentId) => AppointmentService.confirmAppointment(appointmentId),
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message || "Xác nhận lịch khám thành công");
                setIsModalConfirmOpen(false);
                setRowSelected(null);
                queryGetAllAppointments.refetch();
            } else {
                Message.error(data?.message || "Xác nhận lịch khám thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xác nhận lịch khám thất bại");
        }
    });
    const mutationDeleteManyAppointments = useMutation({
        mutationKey: ['deleteManyAppointments'],
        mutationFn: (appointmentIds) => AppointmentService.deleteManyAppointments(appointmentIds),
        onSuccess: (data) => {
            if (data?.status === "success") {
                Message.success(data?.message || "Xóa nhiều lịch khám thành công");
                setIsModalOpenDeleteMany(false);
                setSelectedRowKeys([]);
                queryGetAllAppointments.refetch();
            } else {
                Message.error(data?.message || "Xóa nhiều lịch khám thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xóa nhiều lịch khám thất bại");
        }
    });
    const { data: appointments, isLoading: isLoadingAppointments} = queryGetAllAppointments;
    const { isPending: isPendingConfirm } = mutationConfirmAppointment;
    const { isPending: isPendingDelete } = mutationDeleteAppointment;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyAppointments;
    const appointmentData = appointments?.data?.appointments || [];
    const dataTable = appointmentData.map((item, index) => ({
        key: item.id,
        index: index + 1,
        appointmentCode: item.appointmentCode,
        doctorName: item.doctorService?.doctor?.person?.fullName,
        patientName: item.patientProfile?.person?.fullName,
        appointmentDate: item.schedule?.workday,
        appointmentTime: item.slot,
        description: item.description,
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
            title: "Mã lịch khám",
            dataIndex: "appointmentCode",
            key: "appointmentCode",
            ...getColumnSearchProps("appointmentCode"),
            sorter: (a, b) => a.appointmentCode.length - b.appointmentCode.length,
        },
        {
            title: "Ngày khám",
            dataIndex: "appointmentDate",
            key: "appointmentDate",
        
            sorter: (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
           
            onFilter: (value, record) => record.appointmentDate === value,
            render: (text) => (
                text ? (
                    DatetimeUtils.formatDate(text)
                ) : (
                    "Chưa có ngày khám"
                )
            )
        },
        {
            title: "Giờ khám",
            dataIndex: "appointmentTime",
            key: "appointmentTime",
            
            render: (text) => (
                text ? (
                    DatetimeUtils.formatTime(text)
                ) : (
                    "Chưa có giờ khám"
                )
            )
        },
        {
           title: "Bác sĩ",
           dataIndex: "doctorName",
           key: "doctorName",
           ...getColumnSearchProps("doctorName"),
           sorter: (a, b) => a?.doctorName?.length - b?.doctorName?.length, 
        },
        {
            title: "Bệnh nhân",
            dataIndex: "patientName",
            key: "patientName",
            ...getColumnSearchProps("patientName"),
            sorter: (a, b) => a?.patientName?.length - b?.patientName?.length,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
           render: (text) => (
                text === "pending" ? <Tag color="warning">Chờ xác nhận</Tag> :
                text === "confirmed" ? <Tag color="success">Đã xác nhận</Tag> :
                text === "completed" ? <Tag color="processing">Đã hoàn thành</Tag> :
                text === "cancelled" ? <Tag color="error">Đã hủy</Tag> :
                <Tag color="default">Không xác định</Tag>
            ),
            filters: [
                { text: "Chờ xác nhận", value: "pending" },
                { text: "Đã xác nhận", value: "confirmed" },
                { text: "Đã hoàn thành", value: "completed" },
                { text: "Đã hủy", value: "cancelled" },
            ],
            onFilter: (value, record) => record.status.startsWith(value),
            filterMultiple: false,
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
                if(record.status === "pending") {
                    itemActions.push({ type: "divider" });
                    itemActions.push({ key: "confirm", label: "Xác nhận", icon: <CheckCircleFilled style={{ fontSize: 16, color: "green" }} /> });
                }

                const onMenuClick = ({ key, domEvent }) => {
                    setRowSelected(record.key);
                    domEvent.stopPropagation(); // tránh chọn row khi bấm menu
                    if (key === "detail") return handleViewAppointment(record.key);
                    if (key === "edit") return handleEditAppointment(record.key);
                    if (key === "delete") return handleShowConfirmDelete();
                    if (key === "confirm") return setIsModalConfirmOpen(true);
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
    const handleViewAppointment = (key) => {
        const appointment = appointmentData.find((item) => item.id === key);
        setRowSelected(appointment);
        setIsDrawerOpen(true);
    };
    const handleEditAppointment = (key) => {};
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleOkDelete = () => {
        mutationDeleteAppointment.mutate(rowSelected);
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };
    const handleOkConfirm = () => {
        mutationConfirmAppointment.mutate(rowSelected);
    };
    const handleCancelConfirm = () => {
        setIsModalConfirmOpen(false);
        setRowSelected(null);
    };
    const handleOkDeleteMany = () => {
        mutationDeleteManyAppointments.mutate(selectedRowKeys);
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
            <Title level={4}>Danh sách lịch khám</Title>
          
           
            <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={handleSelectedAll}
                menuProps={menuProps}
                handleSelectedAll={handleSelectedAll}
            />
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <TableStyle
                rowSelection={rowSelection}
                emptyText="Không có dữ liệu lịch khám"
                columns={columns}
                loading={isLoadingAppointments}
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
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá lịch khám</span>
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
                            lịch khám này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                    <span style={{ fontWeight: 600 }}>Xác nhận lịch khám</span>
                    </span>
                }
                open={isModalConfirmOpen}
                onOk={handleOkConfirm}
                onCancel={handleCancelConfirm}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ 
                    type: "primary", 
                    danger: true, // 🔥 nhấn mạnh hành động có ảnh hưởng
                }}
                centered
                style={{ borderRadius: 12 }}
            >
                <LoadingComponent isLoading={isPendingConfirm}>
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                        <Text style={{ fontSize: 16 }}>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                            xác nhận
                            </Text>{" "}
                            lịch khám này không?
                        </Text>
                    
                    </div>
                </LoadingComponent>
            </ModalComponent>
                        <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá dịch vụ</span>
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
                            {selectedRowKeys.length} dịch vụ này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>

        </>
    )
}

export default AppointmentPage