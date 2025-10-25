import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom';
import { DoctorService } from '@/services/DoctorService';
import { DegreeService } from '@/services/DegreeService';
import { Space, Input, Form, Select, Radio, Typography, Divider, Dropdown, DatePicker, Upload, Tag, Popover } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import defaultImage from "@/assets/default_image.png";
import { StyledCard } from './style';
import dayjs from 'dayjs';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    ExportOutlined,
    PlusOutlined,
    UploadOutlined,
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
        queryFn: () => DegreeService.getAllDegrees({ status: 'active', page: 1, limit: 1000 }),
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
    const uniqueSpecialties = [
        ...new Set(
            data?.flatMap((doctor) =>
            doctor?.doctorSpecialties.map((ds) => ds?.specialty.name)
            )
        ),
    ];
    const uniqueWorkplaces = [
        ...new Set(
            data?.flatMap((doctor) =>
                doctor?.doctorWorkplaces.map((ws) => ws?.workplace.name)
            )
        ),
    ];
    // const workplaces = data?.
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
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            sorter: (a, b) => a.fullName?.length - b.fullName?.length,
            ...getColumnSearchProps("fullName"),
            render: (fullName) => {
                return fullName ? <Text>{fullName}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
            render: (email) => {
                return email ? <Text>{email}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            ...getColumnSearchProps("phone"),
            render: (phone) => {
                return phone ? <Text>{phone}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Chuyên khoa",
            dataIndex: "specialty",
            key: "specialty",
            render: (dS) => {
                return dS ? <Tag color="blue">{dS?.specialty.name}</Tag> : <Text type="secondary">Chưa cập nhật</Text>;
            },
            filters: uniqueSpecialties.map((spec) => ({ text: spec, value: spec })),
            onFilter: (value, record) => record?.specialty?.specialty?.name === value,
            filterSearch: true,
        },
        {
            title: "Nơi làm việc",
            dataIndex: "workplace",
            key: "workplace",
            render: (dW) => {
                return dW ? (
                    <Popover
                        content={<div style={{ maxWidth: 300 }}>{dW?.workplace.name}</div>}
                        title="Nội dung đầy đủ"
                        trigger="hover"
                    >
                        <Text ellipsis style={{ maxWidth: 200, display: "inline-block" }}>
                            {dW?.workplace.name.length > 60 ? dW?.workplace.name.substring(0, 50) + "..." : dW?.workplace.name}
                        </Text>
                    </Popover>
                ) : (
                    <Text type="secondary">Chưa cập nhật</Text>
                );
            },
            filters: uniqueWorkplaces.map((work) => ({ text: work, value: work })),
            onFilter: (value, record) => record?.workplace?.workplace?.name === value,
            filterSearch: true,
        },
        {
            title: "Bằng cấp",
            dataIndex: "degree",
            key: "degree",
            render: (degree) => {
                return degree ? <Text>{degree}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            },
            filters: degrees?.map((deg) => ({ text: deg.title, value: deg.title })),
            onFilter: (value, record) => record?.degree === value,
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
    console.log('data', data);
    const dataTable = data?.map((item, index) => {
        return {
            key: item.doctorId || item.id,
            index: index + 1,
            email: item.account?.email,
            phone: item.account?.phone,
            fullName: item.person?.fullName,
            degree: item.degree?.title,
            specialty: item.doctorSpecialties.find((spec) => spec.isPrimary === true),
            workplace: item.doctorWorkplaces.find((work) => work.isPrimary === true),
        };
    });
    const handleViewDoctor = (key) => {
        navigate(`/admin/doctors/${key}`);
    };
    const handleEditDoctor = (key) => {
        const doctor = data?.find(doc => doc.doctorId === key);
        if (doctor) {
            formUpdate.setFieldsValue({
                email: doctor.account?.email,
                phone: doctor.account?.phone,
                fullName: doctor.person?.fullName,
                degreeId: doctor.degree?.degreeId,
                dateOfBirth: doctor.person?.dateOfBirth ? dayjs(doctor.person?.dateOfBirth) : null,
                gender: doctor.person?.gender,
                address: doctor.person?.address,
                avatar: [
                    {
                        uid: "-1",
                        name: doctor?.person?.avatar,
                        status: "done",
                        url: doctor?.person?.avatar ? `${import.meta.env.VITE_APP_BACKEND_URL}${doctor?.person?.avatar}` : defaultImage,
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
            fullName: values.fullName,
            degreeId: values.degreeId,
            dateOfBirth: values.dateOfBirth
                ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
                : null,
            gender: values.gender,
            address: values.address,
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
            <Title level={4}>Danh sách bác sĩ</Title>
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
            <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                handleSelectedAll={handleSelectedAll}
                menuProps={menuProps}

            />
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
                            name="fullName"
                        >
                            <Input
                                name="fullName"
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
                      
                        onFinish={handleOnUpdateDoctor}
                        autoComplete="off"
                        labelAlign="left"
                        scrollToFirstError
                        form={formUpdate}
                    >
                        <StyledCard
                            title="Thông tin tài khoản"
                            style={{ marginBottom: 16}}
                        >
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
                        </StyledCard>
                         <StyledCard
                            title="Thông tin cá nhân"
                        >
                            <Form.Item
                                label="Họ và tên"
                                name="fullName"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập họ và tên!",
                                    }
                                ]}
                            >
                                <Input
                                    name="fullName"
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
                                    listType="picture-card"
                                >
                                    <ButtonComponent icon={<UploadOutlined />}>

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
                        </StyledCard>
                    </Form>
                </LoadingComponent>
            </DrawerComponent>
            <TableStyle
                rowSelection={rowSelection}
                emptyText="Không có dữ liệu bác sĩ"
                columns={columns}
                loading={isLoadingDoctors}
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
        </>
    )
}

export default DoctorPage