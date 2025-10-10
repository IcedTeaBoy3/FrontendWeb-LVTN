import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AccountService } from '@/services/AccountService'
import { Space, Input, Button, Form, Radio, Typography, Divider, Dropdown,Tag, Select, Row, Avatar,Col } from "antd";
import Highlighter from "react-highlight-words";
import TableStyle from "@/components/TableStyle/TableStyle";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import defaultImage from "@/assets/default_image.png";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    ExportOutlined,
    BlockOutlined
} from "@ant-design/icons";
const { Text, Title } = Typography;

const AccountPage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isModalOpenBlock, setIsModalOpenBlock] = useState(false);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [account, setAccount] = useState(null);
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
            ) : (text),
               
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
    const queryGetAllAccounts = useQuery({
        queryKey: ['getAllAccounts'],
        queryFn: () => AccountService.getAllAccounts({ page: 1, limit: 1000 }),
        refetchOnWindowFocus: false,
        retry: 1,
    });
    // xóa 1
    const convertRole = (role) => {
        switch (role) {
            case 'user':
                return 'Người dùng';
            case 'doctor':
                return 'Bác sĩ';
            case 'admin':
                return 'Quản trị viên';
            default:
                return 'Không xác định';
        }
    };
    const mutationDeleteAccount = useMutation({
        mutationKey: ["deleteAccount"],
        mutationFn: AccountService.deleteAccount,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setIsModalOpenDelete(false);
                queryGetAllAccounts.refetch();
                setRowSelected(null);
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra");
        },
    });
    const mutationBlockAccount = useMutation({
        mutationKey: ["blockAccount"],
        mutationFn: AccountService.blockAccount,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setIsModalOpenBlock(false);
                queryGetAllAccounts.refetch();
                setRowSelected(null);
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra");
        },
    });
    const mutationUnblockAccount = useMutation({
        mutationKey: ["unblockAccount"],
        mutationFn: AccountService.unblockAccount,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setIsModalOpenBlock(false);
                queryGetAllAccounts.refetch();
                setRowSelected(null);
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra");
        }
    });
    const mutationDeleteManyAccounts = useMutation({
        mutationKey: ["deleteManyAccounts"],
        mutationFn: AccountService.deleteManyAccounts,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setIsModalOpenDeleteMany(false);
                queryGetAllAccounts.refetch();
                setSelectedRowKeys([]); // Xoá selection sau khi xoá
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra");
        },
    });
    const mutationUpdateAccount = useMutation({
        mutationKey: ["updateAccount"],
        mutationFn: ({ id, accountData }) => AccountService.updateAccount(id, accountData),
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setIsDrawerOpen(false);
                formUpdate.resetFields();
                queryGetAllAccounts.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message || "Đã có lỗi xảy ra");
        },
    });
    const { data: dataAccounts, isLoading: isLoadingAccounts } = queryGetAllAccounts;
    const isPendingDelete = mutationDeleteAccount.isPending;
    const isPendingUpdate = mutationUpdateAccount.isPending;
    const isPendingBlock = mutationBlockAccount.isPending || mutationUnblockAccount.isPending;
    const isPendingDeleteMany = mutationDeleteManyAccounts.isPending;
    const data = dataAccounts?.data?.accounts || [];
    // dữ liệu bảng
    const dataTable = data?.map((item, index) => ({
        key: item.accountId,
        index: index + 1,
        email: item.email,
        userName: item.userName,
        phone: item.phone,
        role: item.role,
        isBlocked: item.isBlocked,
        isVerified: item.isVerified,
    }));
    // cột bảng
     const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
            sorter: (a, b) => a?.email.length - b?.email.length,
        },
        {
            title: "Tên tài khoản",
            dataIndex: "userName",
            key: "userName",
            ...getColumnSearchProps("userName"),
            render: (text) => text || <Text type="secondary">Chưa cập nhật</Text>,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            ...getColumnSearchProps("phone"),
            render: (text) => text || <Text type="secondary">Chưa cập nhật</Text>,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            filters: [
                { text: 'Người dùng', value: 'user' },
                { text: 'Bác sĩ', value: 'doctor' },
                { text: 'Quản trị viên', value: 'admin' },
            ],
            onFilter: (value, record) => record.role === value,
            sorter: (a, b) => a?.role.length - b?.role.length,
            render: (role) => convertRole(role),
        },
        {
            title: "Trạng thái",
            dataIndex: "isBlocked",
            key: "isBlocked",
            filters: [
                { text: 'Hoạt động', value: false },
                { text: 'Bị khoá', value: true },
            ],
            onFilter: (value, record) => record.isBlocked === value,
            render: (isBlocked) => (
                isBlocked ? <Tag color="red">Bị khoá</Tag> : <Tag color="green">Hoạt động</Tag>
            ),
        },
        {
            title: "Xác thực",
            dataIndex: "isVerified",
            key: "isVerified",
            filters: [
                { text: 'Đã xác thực', value: true },
                { text: 'Chưa xác thực', value: false },
            ],
            onFilter: (value, record) => record.isVerified === value,
            render: (isVerified) => (
                isVerified ? <Tag color="green">Đã xác thực</Tag> : <Tag color="red">Chưa xác thực</Tag>
            ),
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
                if(record.role !== 'admin'){
                    itemActions.push({ type: "divider" });
                    itemActions.push({ key: "block", label: <Text type={record.isBlocked ? "success" : "danger"}>{record.isBlocked ? "Mở khoá" : "Khoá"}</Text>, icon: <BlockOutlined style={{ fontSize: 16, color: record.isBlocked ? "green" : "red" }} /> });
                }

                const onMenuClick = ({ key, domEvent }) => {
                    setRowSelected(record.key);
                    domEvent.stopPropagation(); // tránh chọn row khi bấm menu
                    if (key === "detail") return handleViewAccount(record.key);
                    if (key === "edit") return handleEditAccount(record.key);
                    if (key === "delete") return handleShowConfirmDelete();
                    if (key === "block") return handleBlockAccount(record.key);
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
    // xem chi tiết
    const handleViewAccount = (accountId) => {
        const account = data?.find(acc => acc.accountId === accountId);
        if(!account) return;
        setAccount(account);
        setIsModalDetailOpen(true);
    };
    // chỉnh sửa
    const handleEditAccount = (accountId) => {
        const account = data.find(acc => acc.accountId === accountId);
        if(!account) return;
        formUpdate.setFieldsValue({
            email: account.email,
            phone: account.phone,
            userName: account.userName,
            role: account.role,
            isBlocked: account.isBlocked,
            isVerified: account.isVerified,
        });
        setIsDrawerOpen(true);
    };
    // xóa
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };

    const handleOkDelete = () => {
        if (!rowSelected) return;
        mutationDeleteAccount.mutate(rowSelected);
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
        setRowSelected(null);
    };
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    }
    const handleOkDeleteMany = () => {
        if(!selectedRowKeys || selectedRowKeys.length === 0) return;
        mutationDeleteManyAccounts.mutate(selectedRowKeys);
    };
    const handleOnUpdateAccount = (values) => {
        if (!rowSelected) return;
        mutationUpdateAccount.mutate({ id: rowSelected, accountData: values });
    };
    // chặn
    const handleBlockAccount = (accountId) => {
        setRowSelected(accountId);
        const account = data.find(acc => acc.accountId === accountId);
        if(!account) return;
        setAccount(account);
        setIsModalOpenBlock(true);
    };
    const handleOkBlock = () => {
        if(account.isBlocked) {
            // nếu đang bị khoá thì mở khoá
            mutationUnblockAccount.mutate(account.accountId);
        } else {
            // nếu đang không bị khoá thì khoá
            mutationBlockAccount.mutate(account.accountId);
        }
    };
    const handleCancelBlock = () => {
        setIsModalOpenBlock(false);
        setRowSelected(null);
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
            <Title level={4}>Danh sách tài khoản</Title>
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
             <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                handleSelectedAll={handleSelectedAll}
                menuProps={menuProps}
            />
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <TableStyle
                rowSelection={rowSelection}
                columns={columns}
                loading={isLoadingAccounts}
                dataSource={dataTable}
                pagination={pagination}
                emptyText="Không có dữ liệu tài khoản"
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
                        <span>Xoá tài khoản</span>
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
                            tài khoản này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
                    <span>Thông tin chi tiết</span>
                    </span>
                }
                open={isModalDetailOpen}
                onCancel={() => setIsModalDetailOpen(false)}
                footer={null}
                centered
                style={{ borderRadius: 8 }}
            >
                <div style={{ padding: "8px 0" }}>
                    <Avatar
                    size={100}
                    src={account?.avatar?.startsWith("https") ? account?.avatar : `${import.meta.env.VITE_APP_BACKEND_URL}${account?.avatar}` || defaultImage}
                    style={{ marginBottom: 16 }}
                    />
                </div>
                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Email:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Text>{account?.email || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />

                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Tên tài khoản:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Text>{account?.userName || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />
                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>SĐT:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Text>{account?.phone || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />
                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Vai trò:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Text>{convertRole(account?.role) || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />
                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Trạng thái:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Tag color={account?.isBlocked ? "red" : "green"}>{account?.isBlocked ? "Bị khoá" : "Hoạt động"}</Tag>
                    </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />
                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Xác thực:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Tag color={account?.isVerified ? "green" : "red"}>{account?.isVerified ? "Đã xác thực" : "Chưa xác thực"}</Tag>
                    </Col>
                </Row>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá tài khoản</span>
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
                            {selectedRowKeys.length} tài khoản này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>{account?.isBlocked ? "Mở khoá tài khoản" : "Khoá tài khoản"}</span>
                    </span>
                }
                open={isModalOpenBlock}
                onOk={handleOkBlock}
                onCancel={handleCancelBlock}
                okText={account?.isBlocked ? "Mở khoá" : "Khoá"}
                cancelText="Hủy"
                okButtonProps={{ style: { backgroundColor: account?.isBlocked ? "green" : "red", borderColor: account?.isBlocked ? "green" : "red" }, danger: !account?.isBlocked }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingBlock}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type={account?.isBlocked ? "success" : "danger"}>
                                {account?.isBlocked ? "mở khoá" : "khoá"}
                            </Text>{" "}
                            tài khoản này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <DrawerComponent
                title="Chi tiết tài khoản"
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
                        style={{ maxWidth: 600, padding: "20px" }}
                        onFinish={handleOnUpdateAccount}
                        autoComplete="off"
                        form={formUpdate}
                    >
                       
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email!",
                                },
                                { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                        >
                            <Input name="email" />
                        </Form.Item>
                         <Form.Item
                            label="Tên tài khoản"
                            name="userName"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên tài khoản!",
                                },
                            ]}
                        >
                            <Input name="userName" />
                        </Form.Item>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                
                                { type: 'phone', message: 'Số điện thoại không hợp lệ' }
                            ]}
                        >
                            <Input name="phone" />
                        </Form.Item>
                        <Form.Item
                            label="Vai trò"
                            name="role"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn vai trò!",
                                },
                            ]}
                        >
                            <Select name="role">
                                <Select.Option value="admin">Quản trị viên</Select.Option>
                                <Select.Option value="doctor">Bác sĩ</Select.Option>
                                <Select.Option value="user">Người dùng</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Trạng thái"
                            name="isBlocked"
                            
                        >
                            <Radio.Group name="isBlocked">
                                <Radio value={false}>Hoạt động</Radio>
                                <Radio value={true}>Bị khoá</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            label="Xác thực"
                            name="isVerified"
                        >
                            <Radio.Group name="isVerified">
                                <Radio value={true}>Đã xác thực</Radio>
                                <Radio value={false}>Chưa xác thực</Radio>
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
        </>
    )
}

export default AccountPage