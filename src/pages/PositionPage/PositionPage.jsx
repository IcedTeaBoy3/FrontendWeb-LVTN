import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Space, Input, Button, Form, Radio, Typography, Popover, Divider, Dropdown, Tag, Row, Col, Descriptions } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import { PositionService } from '@/services/PositionService';
import * as Message from "@/components/Message/Message";
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
const PositionPage = () => {
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [positionDetail, setPositionDetail] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
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
    // Lấy dữ liệu
    const queryGetAllPositions = useQuery({
        queryKey: ['getAllPositions'],
        queryFn: PositionService.getAllPositions,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const mutationCreatePosition = useMutation({
        mutationKey: ['createPosition'],
        mutationFn: PositionService.createPosition,
        onSuccess: (data) => {
            if (data.status == 'success') {
                Message.success(data.message);
                formCreate.resetFields();
                setIsModalOpenCreate(false);
                queryGetAllPositions.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message);
        },
    });
    const mutationUpdatePosition = useMutation({
        mutationKey: ['updatePosition'],
        mutationFn: ({ id, ...data }) => PositionService.updatePosition(id, data),
        onSuccess: (data) => {
            if (data.status == 'success') {
                Message.success(data.message);
                formUpdate.resetFields();
                setIsDrawerOpen(false);
                queryGetAllPositions.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message);
        },
    });
    const mutationDeletePosition = useMutation({
        mutationKey: ['deletePosition'],
        mutationFn: PositionService.deletePosition,
        onSuccess: (data) => {
            if (data.status == 'success') {
                Message.success(data.message);
                setIsModalOpenDelete(false);
                setRowSelected(null);
                queryGetAllPositions.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.message);
        },
    });
    const mutationDeleteManyPosition = useMutation({
        mutationKey: ['deleteManyPosition'],
        mutationFn: PositionService.deleteManyPositions,
        onSuccess: (data) => {
            if (data.status == 'success') {
                Message.success(data.message);
                setIsModalOpenDeleteMany(false);
                queryGetAllPositions.refetch();
                setSelectedRowKeys([]);
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    });
    const { data: dataPositions, isLoading: isLoadingPositions } = queryGetAllPositions;
    const { isPending: isPendingCreate } = mutationCreatePosition;
    const { isPending: isPendingUpdate } = mutationUpdatePosition;
    const { isPending: isPendingDelete } = mutationDeletePosition;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyPosition;
    const data = dataPositions?.data?.positions;
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
        confirm();
    };

    const handleViewPosition = (positionId) => {
        const position = data.find(item => item.positionId === positionId);
        setPositionDetail(position);
        setIsModalDetailOpen(true);
    }
    const handleEditPosition = (positionId) => {
        const position = data.find(item => item.positionId === positionId);
        formUpdate.setFieldsValue(position);
        setIsDrawerOpen(true);
    };
    const handleOnUpdatePosition = (values) => {
        mutationUpdatePosition.mutate({ id: rowSelected, ...values });
    }
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    }

    const handleOkDelete = () => {
        mutationDeletePosition.mutate(rowSelected);
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };

    const handleOkDeleteMany = () => {
        mutationDeleteManyPosition.mutate(selectedRowKeys);
    };

    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    };

    const handleCreatePosition = () => {
        formCreate.validateFields().then((values) => {
            mutationCreatePosition.mutate(values);
        });
    };
    const handleCloseCreatePosition = () => {
        setIsModalOpenCreate(false);
    };
    const dataTable = data?.map((item, index) => {
        return {
            key: item.positionId,
            index: index + 1,
            title: item.title,
            description: item.description,
            status: item.status,
        };
    });
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Tên chức vụ",
            dataIndex: "title",
            key: "title",
            ...getColumnSearchProps("title"),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
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
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (text) => (
                text === "active" ? (
                    <Tag
                        color="green"
                        style={{ borderRadius: "8px", padding: "0 8px" }}
                    >
                        Hoạt động
                    </Tag>
                ) : (
                    <Tag
                        color="red"
                        style={{ borderRadius: "8px", padding: "0 8px" }}
                    >
                        Không hoạt động
                    </Tag>
                )
            ),
            filters: [
                { text: "Hoạt động", value: "active" },
                { text: "Không hoạt động", value: "inactive" },
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

                const onMenuClick = ({ key, domEvent }) => {
                    setRowSelected(record.key);
                    domEvent.stopPropagation(); // tránh chọn row khi bấm menu
                    if (key === "detail") return handleViewPosition(record.key);
                    if (key === "edit") return handleEditPosition(record.key);
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
    const handleSelectAll = () => {
        if (selectedRowKeys.length === dataTable.length) {
            setSelectedRowKeys([]);
        } else {
            const allKeys = dataTable.map((item) => item.key);
            setSelectedRowKeys(allKeys);
        }
    };
    return (
        <>
            <Title level={4}>Danh sách chức vụ</Title>
            
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
                handleSelectedAll={handleSelectAll}
                menuProps={menuProps}
            />
            <LoadingComponent isLoading={isPendingCreate}>
                <ModalComponent
                    title="Thêm mới chức vụ"
                    open={isModalOpenCreate}
                    onOk={handleCreatePosition}
                    onCancel={handleCloseCreatePosition}
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
                        initialValues={{ remember: true }}
                        autoComplete="off"
                        form={formCreate}
                    >
                        <Form.Item
                            label="Tên chức vụ"
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
                                placeholder="Nhập vào tên chức vụ"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="description"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mô tả!",
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Nhập mô tả chi tiết tại đây..."
                            />
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <DrawerComponent
                title={
                    <>
                        <EditOutlined style={{ marginRight: '8px' }} />
                        Cập nhật chức vụ
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
                        onFinish={handleOnUpdatePosition}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên chức vụ"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên chức vụ!",
                                },
                            ]}
                        >
                            <Input name="title" />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="description"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mô tả!",
                                },
                            ]}
                        >
                            <Input.TextArea
                                name="description"
                                rows={4}
                                placeholder="Nhập mô tả chi tiết tại đây..."
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
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá chức vụ</span>
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
                            chức vụ này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                    <span>Thông tin chi tiết</span>
                    </span>
                }
                open={isModalDetailOpen}
                onCancel={() => setIsModalDetailOpen(false)}
                footer={null}
                centered
                style={{ borderRadius: 8 }}
            >
                <Descriptions
                    column={1}
                    bordered
                    size="small"
                >
                    <Descriptions.Item label="Tên chức vụ">
                        {positionDetail?.title || <Text type="secondary">Chưa cập nhật</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {positionDetail?.description || <Text type="secondary">Chưa cập nhật</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {positionDetail?.status === "active" ? (
                            <Tag color="green">Đang hoạt động</Tag>
                        ) : (
                            <Tag color="red">Ngừng hoạt động</Tag>
                        )}
                    </Descriptions.Item>
                </Descriptions>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá chức vụ</span>
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
                            {selectedRowKeys.length} chức vụ này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <TableStyle
                rowSelection={rowSelection}
                columns={columns}
                loading={isLoadingPositions}
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

export default PositionPage