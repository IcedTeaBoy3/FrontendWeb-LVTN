import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom';
import { DoctorService } from '@/services/DoctorService';
import { DegreeService } from '@/services/DegreeService';
import { Space, Input, Button, Form, Select, Radio, Typography, Popover, Divider, Dropdown, Menu, DatePicker, Upload } from "antd";
import { TableStyled } from './style';
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import defaultImage from "@/assets/default_image.png";
import { AnimatePresence } from "framer-motion";
import dayjs from 'dayjs';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    DownOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    ExportOutlined,
    PlusOutlined,
    UploadOutlined
} from "@ant-design/icons";
const { Text, Title } = Typography;

const DoctorPage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isOpenModelCreateDegree, setIsOpenModelCreateDegree] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [formCreate] = Form.useForm();
    const [formUpdate] = Form.useForm();
    const [formCreateDegree] = Form.useForm();
    const navigate = useNavigate();
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

    const queryGetAllDoctors = useQuery({
        queryKey: ['getAllDoctors'],
        queryFn: DoctorService.getAllDoctors,
        retry: 1,
    });
    const queryGetAllDegrees = useQuery({
        queryKey: ['getAllDegrees'],
        queryFn: DegreeService.getAllDegrees,
        retry: 1,
    });
    const mutationCreateDoctor = useMutation({
        mutationKey: ['createDoctor'],
        mutationFn: DoctorService.createDoctor,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                formCreate.resetFields();
                setIsModalOpenCreate(false);
                queryGetAllDoctors.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Thêm bác sĩ thất bại. Vui lòng thử lại!");
        },
    });
    const mutationCreateDegree = useMutation({
        mutationKey: ['createDegree'],
        mutationFn: DegreeService.createDegree,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                formCreateDegree.resetFields();
                if (isModalOpenCreate)
                    formCreate.setFieldValue("degreeId", data?.data?.degreeId); // chọn luôn bằng cấp vừa tạo
                formUpdate.setFieldValue("degreeId", data?.data?.degreeId);
                setIsOpenModelCreateDegree(false);
                queryGetAllDegrees.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Thêm bằng cấp thất bại. Vui lòng thử lại!");
        },
    });
    const mutationUpdateDoctor = useMutation({
        mutationKey: ['updateDoctor'],
        mutationFn: ({ id, formData }) => DoctorService.updateDoctor(id, formData),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                setIsDrawerOpen(false);
                setRowSelected(null);
                formUpdate.resetFields();
                queryGetAllDoctors.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật bác sĩ thất bại. Vui lòng thử lại!");
        },
    });
    const mutationDeleteDoctor = useMutation({
        mutationKey: ['deleteDoctor'],
        mutationFn: DoctorService.deleteDoctor,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                setSelectedRowKeys((prev) => prev.filter((key) => key !== rowSelected));
                setRowSelected(null);
                setIsModalOpenDelete(false);
                queryGetAllDoctors.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá bác sĩ thất bại. Vui lòng thử lại!");
        },
    });
    const mutationDeleteManyDoctors = useMutation({
        mutationKey: ['deleteManyDoctors'],
        mutationFn: DoctorService.deleteManyDoctors,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                setSelectedRowKeys([]);
                setIsModalOpenDeleteMany(false);
                queryGetAllDoctors.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá nhiều bác sĩ thất bại. Vui lòng thử lại!");
        },
    });
    const { data: dataDoctors, isLoading: isLoadingDoctors } = queryGetAllDoctors;
    const { data: dataDegrees, isLoading: isLoadingDegrees } = queryGetAllDegrees;
    const { isPending: isPendingCreateDegree } = mutationCreateDegree;
    const { isPending: isPendingDelete } = mutationDeleteDoctor;
    const { isPending: isPendingCreate } = mutationCreateDoctor;
    const { isPending: isPendingUpdate } = mutationUpdateDoctor;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyDoctors;
    const data = dataDoctors?.data?.doctors;
    const degrees = dataDegrees?.data?.degrees;
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
            sorter: (a, b) => a.name?.length - b.name?.length,
            ...getColumnSearchProps("name"),
            render: (name) => {
                return name ? <Text>{name}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            ...getColumnSearchProps("phone"),
        },
        {
            title: "Bằng cấp",
            dataIndex: "degree",
            key: "degree",
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
                    if (key === "detail") return handleViewDoctor(record.key);
                    if (key === "edit") return handleEditDoctor(record.key);
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
    const dataTable = data?.map((item, index) => {
        return {
            key: item.doctorId,
            index: index + 1,
            name: item.user?.name,
            email: item.user?.email,
            phone: item.user?.phone,
            degree: item.degree?.abbreviation,
        };
    });
    const handleViewDoctor = (key) => {
        navigate(`/admin/doctors/${key}`);
    };
    const handleEditDoctor = (key) => {
        const doctor = data?.find(doc => doc.doctorId === key);
        if (doctor) {
            formUpdate.setFieldsValue({
                email: doctor.user?.email,
                phone: doctor.user?.phone,
                name: doctor.user?.name,
                degreeId: doctor.degree?.degreeId,
                dateOfBirth: doctor.user?.dateOfBirth ? dayjs(doctor.user?.dateOfBirth) : null,
                gender: doctor.user?.gender,
                address: doctor.user?.address,
                avatar: [
                    {
                        uid: "-1",
                        name: doctor?.user?.avatar,
                        status: "done",
                        url: doctor?.user?.avatar ? `${import.meta.env.VITE_APP_BACKEND_URL}${doctor?.user?.avatar}` : defaultImage,
                    },
                ],
            });
            setIsDrawerOpen(true);
        }
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleCreateDoctor = () => {
        formCreate.validateFields().then((values) => {
            mutationCreateDoctor.mutate(values);
        });
    };
    const handleCloseCreateDoctor = () => {
        formCreate.resetFields();
        setIsModalOpenCreate(false);
    };
    const handleCreateDegree = () => {
        formCreateDegree.validateFields().then((values) => {
            mutationCreateDegree.mutate(values);
        });
    };
    const handleCloseCreateDegree = () => {
        formCreateDegree.resetFields();
        setIsOpenModelCreateDegree(false);
    };
    const handleOkDelete = () => {
        mutationDeleteDoctor.mutate(rowSelected);
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
        setRowSelected(null);
    };
    const handleOnUpdateDoctor = (values) => {
        const formData = new FormData();
        const fileObj = values.avatar?.[0]?.originFileObj;
        if (fileObj instanceof File) {
            formData.append("avatar", fileObj);
        } else if (values.avatar?.[0]?.url) {
            const avatarUrl = values.avatar[0].url;
            const imageName = avatarUrl.replace(import.meta.env.VITE_APP_BACKEND_URL, ""); // Lấy lại phần tên file
            formData.append("oldImage", imageName);
        } else {
            // Không có ảnh và cũng không dùng ảnh cũ → đã xoá
            formData.append("isImageDeleted", true);
        }
        // --- Các field khác ---
        const dataToAppend = {
            email: values.email,
            phone: values.phone,
            password: values.password, // chỉ append nếu có
            name: values.name,
            degreeId: values.degreeId,
            dateOfBirth: values.dateOfBirth
                ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
                : null,
            gender: values.gender,
            address: values.address,
            bio: values.bio,
        };

        Object.entries(dataToAppend).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "undefined" && value !== "null") {
                formData.append(key, value);
            }
        });
        mutationUpdateDoctor.mutate({ id: rowSelected, formData });

    };
    const handleOkDeleteMany = () => {
        mutationDeleteManyDoctors.mutate(selectedRowKeys);
    };
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    };

    const menuProps = {
        items: [
            {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined style={{ fontSize: 16 }} />,
            },
            {
                type: "divider"
            },
            {
                key: "delete",
                label: <Text type="danger">Xoá được chọn</Text>,
                icon: <DeleteOutlined style={{ fontSize: 16, color: "red" }} />,
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
            <Title level={4}>Danh sách bác sĩ</Title>
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
                onSelectedAll={handleSelectedAll}
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
            <LoadingComponent isLoading={isPendingCreateDegree}>
                <ModalComponent
                    title="Thêm mới bằng cấp"
                    open={isOpenModelCreateDegree}
                    onOk={handleCreateDegree}
                    onCancel={handleCloseCreateDegree}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDegree"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        form={formCreateDegree}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Tên bằng cấp"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >
                            <Input
                                name="title"
                                placeholder="Nhập vào tên bằng cấp"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Viết tắt"
                            name="abbreviation"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên viết tắt!",
                                },
                            ]}
                        >
                            <Input
                                name="abbreviation"
                                placeholder="Nhập vào tên viết tắt"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="description"

                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Nhập mô tả chi tiết tại đây..."
                            />
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <LoadingComponent isLoading={isPendingCreate}>
                <ModalComponent
                    title="Thêm mới bác sĩ"
                    open={isModalOpenCreate}
                    onOk={handleCreateDoctor}
                    onCancel={handleCloseCreateDoctor}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"

                >
                    <Form
                        name="formCreate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        form={formCreate}
                        labelAlign="left"
                    >
                        <Title level={5}>Thông tin tài khoản</Title>
                        <Divider style={{ margin: "14px 0" }} />
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
                                }
                            ]}
                        >
                            <Input
                                name="email"
                                placeholder="Nhập vào email"
                            />
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
                                    pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/,
                                    message: "Số điện thoại không hợp lệ!",
                                }
                            ]}
                        >
                            <Input
                                name="phone"
                                placeholder="Nhập vào số điện thoại"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mật khẩu!",
                                }
                            ]}
                        >
                            <Input.Password
                                name="password"
                                placeholder="Nhập vào mật khẩu"
                                autoComplete="new-password"
                            />
                        </Form.Item>
                        <Title level={5}>Thông tin cá nhân</Title>
                        <Divider style={{ margin: "14px 0" }} />
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                        >
                            <Input
                                name="name"
                                placeholder="Nhập vào họ và tên"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Bằng cấp"
                            name="degreeId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn bằng cấp!",
                                }
                            ]}
                        >
                            <Select
                                name="degreeId"
                                placeholder="Chọn bằng cấp"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                popupRender={menu => (
                                    <LoadingComponent isLoading={isLoadingDegrees}>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div
                                            style={{
                                                padding: '8px',
                                                color: '#1890ff',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setIsOpenModelCreateDegree(true)}
                                        >
                                            <PlusOutlined /> Thêm bằng cấp mới
                                        </div>
                                    </LoadingComponent>
                                )}
                                options={degrees?.map(degree => ({
                                    label: degree.title,
                                    value: degree.degreeId
                                }))}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="bio"
                        >
                            <Input.TextArea
                                name="bio"
                                placeholder="Nhập vào mô tả"
                                autoSize={{ minRows: 3, maxRows: 5 }}
                            />
                        </Form.Item>

                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <DrawerComponent
                title="Chi tiết bác sĩ"
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
                        style={{ maxWidth: 600, padding: "10px" }}
                        onFinish={handleOnUpdateDoctor}
                        autoComplete="off"
                        labelAlign="left"
                        scrollToFirstError
                        form={formUpdate}
                    >
                        <Title level={5}>Thông tin tài khoản</Title>
                        <Divider style={{ margin: "14px 0" }} />
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
                                }
                            ]}
                        >
                            <Input
                                name="email"
                                placeholder="Nhập vào email"
                            />
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
                                    pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/,
                                    message: "Số điện thoại không hợp lệ!",
                                }
                            ]}
                        >
                            <Input
                                name="phone"
                                placeholder="Nhập vào số điện thoại"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mật khẩu"
                            name="password"

                        >
                            <Input.Password
                                name="password"
                                placeholder="Nhập vào mật khẩu"
                                autoComplete="new-password"
                            />
                        </Form.Item>
                        <Title level={5}>Thông tin cá nhân</Title>
                        <Divider style={{ margin: "14px 0" }} />
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập họ và tên!",
                                }
                            ]}
                        >
                            <Input
                                name="name"
                                placeholder="Nhập vào họ và tên"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Bằng cấp"
                            name="degreeId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn bằng cấp!",
                                }
                            ]}
                        >
                            <Select
                                name="degreeId"
                                placeholder="Chọn bằng cấp"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                popupRender={menu => (
                                    <LoadingComponent isLoading={isLoadingDegrees}>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div
                                            style={{
                                                padding: '8px',
                                                color: '#1890ff',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setIsOpenModelCreateDegree(true)}
                                        >
                                            <PlusOutlined /> Thêm bằng cấp mới
                                        </div>
                                    </LoadingComponent>
                                )}
                                options={degrees?.map(degree => ({
                                    label: degree.title,
                                    value: degree.degreeId
                                }))}

                            />
                        </Form.Item>
                        <Form.Item
                            label="Ngày sinh"
                            name="dateOfBirth"
                            rules={[
                                {
                                    validator(_, value) {
                                        if (!value || dayjs(value).isBefore(dayjs(), 'day')) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Ngày sinh không hợp lệ!"));
                                    }
                                }
                            ]}
                        >
                            <DatePicker
                                name="dateOfBirth"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày sinh"
                                style={{ width: '100%' }}
                            />
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
                            label="Địa chỉ"
                            name="address"
                        >
                            <Input.TextArea
                                name="address"
                                placeholder="Nhập vào địa chỉ"
                                autoSize={{ minRows: 2, maxRows: 4 }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Tiểu sử"
                            name="bio"
                        >
                            <Input.TextArea
                                name="bio"
                                placeholder="Nhập vào tiểu sử"
                                autoSize={{ minRows: 4, maxRows: 5 }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Ảnh đại diện"
                            name="avatar"
                            valuePropName="fileList"
                            getValueFromEvent={(e) =>
                                Array.isArray(e) ? e : e && e.fileList
                            }
                            extra="Chọn ảnh chuyên khoa (jpg, jpeg, png, gif, webp) tối đa 1 file"
                        >
                            <Upload
                                name="file"
                                beforeUpload={() => false}
                                maxCount={1}
                                accept=".jpg, .jpeg, .png, .gif, .webp"
                                onRemove={() => formUpdate.setFieldsValue({ file: [] })}
                                fileList={formUpdate.getFieldValue("file") || []}
                                listType="picture"
                            >
                                <ButtonComponent icon={<UploadOutlined />}>
                                    Chọn file
                                </ButtonComponent>
                            </Upload>

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
            <TableStyled
                rowSelection={rowSelection}
                rowKey={"key"}
                columns={columns}
                scroll={{ x: "max-content" }}
                loading={isLoadingDoctors}
                dataSource={dataTable}
                locale={{
                    emptyText: "Không có dữ liệu bác sĩ",
                    filterConfirm: "Lọc",
                    filterReset: "Xóa lọc",
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    position: ["bottomCenter"],
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} bác sĩ`,
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

export default DoctorPage