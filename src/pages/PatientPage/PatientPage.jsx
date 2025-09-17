import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PatientService } from '@/services/PatientService'
import { Space, Input, Form,  Radio, Typography, Popover, Divider, Dropdown } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import dayjs from "dayjs";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    ExportOutlined
} from "@ant-design/icons";
const { Text, Title } = Typography;

const PatientPage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [rowSelected, setRowSelected] = useState(null);
    const [formUpdate] = Form.useForm();
    const Navigate = useNavigate();
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys);
        },
        type: "checkbox",
    };
    // phân trang
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    // Tìm kiếm
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);
    const queryGetAllPatients = useQuery({
        queryKey: ['getAllPatients'],
        queryFn: PatientService.getAllPatients,
        retry: 1,
    });
    const mutationDeletePatient = useMutation({
        mutationKey: ["deletePatient"],
        mutationFn: PatientService.deletePatient,
        onSuccess: (data) => {
            if (data.status === "success") {
                Message.success(data.message);
                setIsModalOpenDelete(false);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.");
        }
    });
    const mutationDeleteManyPatients = useMutation({
        mutationKey: ["deleteManyPatients"],
        mutationFn: PatientService.deleteManyPatients,
        onSuccess: (data) => {
            if (data.status === "success") {
                Message.success(data.message);
                setSelectedRowKeys([]);
                setIsModalOpenDeleteMany(false);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.");
        }
    });
    const mutationUpdatePatient = useMutation({
        mutationKey: ["updatePatient"],
        mutationFn: ({ id, ...data }) => PatientService.updatePatient(id, data),
        onSuccess: (data) => {
            if (data.status === "success") {
                Message.success(data.message);
                setIsOpenDrawer(false);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.");
        }
    });
    const { data: dataPatients, isLoading: isLoadingPatient } = queryGetAllPatients;
    const data = dataPatients?.data?.users;
    const { isPending: isPendingDelete } = mutationDeletePatient;
    const { isPending: isPendingUpdate } = mutationUpdatePatient;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyPatients;

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
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,

        },
         {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name"),
            sorter: (a, b) => a.name?.length - b.name?.length,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
            sorter: (a, b) => a.email?.length - b.email?.length,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            ...getColumnSearchProps("phone"),
            render: (phone) => {
                if (!phone) {
                return <Text type="secondary">Chưa cập nhật</Text>;
                }
                return searchedColumn === "phone" ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#91d5ff", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={phone.toString()}
                />
                ) : (
                <Text>{phone}</Text>
                );
            },
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            render: (text) => (
                text ? (
                    <Popover
                        content={<div style={{ maxWidth: 300 }}>{text}</div>}
                        title="Nội dung đầy đủ"
                        trigger="hover"
                    >
                        <Text ellipsis style={{ maxWidth: 200, display: "inline-block" }}>
                            {text.length > 60 ? text.substring(0, 50) + "..." : text}
                        </Text>
                    </Popover>
                ) : (
                    <Text type="secondary">Chưa cập nhật</Text>
                )
            )

        },
        {
            title: "Ngày sinh",
            dataIndex: "dateOfBirth",
            key: "dateOfBirth",
            render: (date) => {
                return date ? new Date(date).toLocaleDateString("vi-VN") : <Text type="secondary">Chưa cập nhật</Text>;
            },
        },
        {
            title: "Giới tính",
            dataIndex: 'gender',
            key: "dateOfBirth",
            render: (gender) => {
                switch (gender) {
                    case "male":
                        return "Nam";
                    case "female":
                        return "Nữ";
                    case "other":
                        return "Khác";
                    default:
                        return <Text type="secondary">Chưa cập nhật</Text>;
                }
            },
            filters: [
                { text: "Nam", value: "male" },
                { text: "Nữ", value: "female" },
                { text: "Khác", value: "other" },
            ],
            onFilter: (value, record) => record.gender?.includes(value),

        },
        {
            title: "Dân tộc",
            dataIndex: "ethnic",
            key: "ethnic",
            render: (ethnic) => {
                return ethnic ? (
                    <Text>{ethnic}</Text>
                ) : (
                    <Text type="secondary">Chưa cập nhật</Text>
                );
            }
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                return role ? (
                    <Text>{convertRole(role)}</Text>
                ) : (
                    <Text type="secondary">Chưa cập nhật</Text>
                );
            },
            filters: [
                { text: "Người dùng", value: "user" },
                { text: "Bác sĩ", value: "doctor" },
            ],
            onFilter: (value, record) => record?.role?.includes(value),
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
                    if (key === "detail") return handleViewUser(record.key);
                    if (key === "edit") return handleEditPatient(record.key);
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
    ].filter(Boolean);
    const convertRole = (role) => {
        switch (role) {
            case "user":
                return "Người dùng";
            case "doctor":
                return "Bác sĩ";
            case "admin":
                return "Quản trị viên";
            default:
                return "Chưa cập nhật";
        }
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleEditPatient = (userId) => {
        const patient = data.find(user => user.userId === userId);
        if (patient) {
            formUpdate.setFieldsValue({
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                address: patient.address,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
            });
            setIsOpenDrawer(true);
        }
    };
    const handleViewUser = (userId) => {
        const user = data.find(user => user.userId === userId);
        if(!user) return Message.error("Người dùng không tồn tại");
    }
    const runMutation = (mutation, payload) => {
        mutation.mutate(payload, {
            onSettled: () => queryGetAllPatients.refetch(),
        });
    };
    const handleOkDelete = () => runMutation(mutationDeletePatient, rowSelected);
    const handleOnUpdatePatient = (values) => {
        runMutation(mutationUpdatePatient, {
            id: rowSelected,
            ...values
        });
    };
    const handleOkDeleteMany = () => runMutation(mutationDeleteManyPatients, selectedRowKeys);
    const handleCancelDelete = () => setIsModalOpenDelete(false);
    const handleCancelDeleteMany = () => setIsModalOpenDeleteMany(false);

    const dataTable = data?.map((item, index) => {
        return {
            key: item.userId,
            index: index + 1,
            name: item.name,
            email: item.email,
            phone: item.phone,
            address: item.address,
            dateOfBirth: item.dateOfBirth,
            gender: item.gender,
            ethnic: item.ethnic,
            job: item.job,
            role: item?.role,
        };
    });
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
            <Title level={4}>Danh sách tài khoản</Title>
            <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                handleSelectedAll={handleSelectedAll}
                menuProps={menuProps}

            />
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá người dùng</span>
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
                            người dùng này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá người dùng</span>
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
                            {selectedRowKeys.length} người dùng này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <DrawerComponent
                title="Chi tiết người dùng"
                placement="right"
                isOpen={isOpenDrawer}
                onClose={() => setIsOpenDrawer(false)}
                width={window.innerWidth < 768 ? "100%" : 700}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdate}>
                    <Form
                        name="formUpdate"
                        labelCol={{ span: 6 }}
                        labelAlign='left'
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "20px" }}
                        initialValues={{ remember: true }}
                        onFinish={handleOnUpdatePatient}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >
                            <Input name="name" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email!",
                                },
                                {
                                    type: "email",
                                    message: "Email không hợp lệ!",
                                },
                            ]}
                        >
                            <Input name="email" />
                        </Form.Item>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập số điện thoại!",
                                },
                                {
                                    pattern: /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/,
                                    message: "Vui lòng nhập số điện thoại hợp lệ!",
                                },
                            ]}
                        >
                            <Input name="phone" />
                        </Form.Item>
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            
                        >
                            <Input.TextArea name="address" rows={4} />
                        </Form.Item>

                        <Form.Item
                        label="Ngày sinh"
                        name="dateOfBirth"
                        rules={[
                            () => ({
                            validator(_, value) {
                                if (!value) {
                                    return Promise.resolve();
                                }
                                const selectedDate = dayjs(value);
                                const today = dayjs();

                                if (selectedDate.isAfter(today, "day")) {
                                    return Promise.reject(new Error("Ngày sinh phải sau ngày hiện tại!"));
                                }
                                return Promise.resolve();
                            },
                            }),
                        ]}
                        >
                            <Input type="date" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            label="Giới tính"
                            name="gender"
                        >
                            <Radio.Group name="gender">
                                <Radio value="male">Nam</Radio>
                                <Radio value="female">Nữ</Radio>
                                <Radio value="other">Khác</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            label={null}
                            wrapperCol={{ offset: 17, span: 7 }}
                        >
                            <Space>

                                <ButtonComponent
                                    type="default"
                                    onClick={() => setIsOpenDrawer(false)}
                                >
                                    Hủy
                                </ButtonComponent>
                                <ButtonComponent
                                    type="primary"
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
                dataSource={dataTable}
                loading={isLoadingPatient}
                pagination={pagination}
                onChange={(page, pageSize) => {
                    setPagination((prev) => ({
                        ...prev,
                        current: page,
                        pageSize: pageSize,
                    }));
                }}
            />
        </>
    )
}

export default PatientPage