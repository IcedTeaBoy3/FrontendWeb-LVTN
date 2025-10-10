import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { SpecialtyService } from '@/services/SpecialtyService'
import { ServiceService } from '@/services/ServiceService'
import { Space, Input, Radio, Button, Form, Popover, Typography, Select, Divider, Dropdown, Tag, InputNumber, Row, Col } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
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

const ServicePage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [serviceDetail, setServiceDetail] = useState(null);
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
    const queryGetAllServices = useQuery({
        queryKey: ['getAllServices'],
        queryFn: () => ServiceService.getAllServices({ page: 1, limit: 1000 }),
        retry: 1,
    });
    const queryGetAllSpecialties = useQuery({
        queryKey: ['getAllSpecialties'],
        queryFn: () => SpecialtyService.getAllSpecialties({status: 'active', page: 1, limit: 1000}),
        retry: 1,
    });
    const mutationCreateService = useMutation({
        mutationKey: ['createService'],
        mutationFn: ServiceService.createService,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success("Thêm dịch vụ thành công");
                queryGetAllServices.refetch();
                formCreate.resetFields();
                setIsModalOpenCreate(false);
            } else {
                Message.error(data?.message || "Thêm dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Thêm dịch vụ thất bại");
        }
    });
    const mutationUpdateService = useMutation({
        mutationKey: ['updateService'],
        mutationFn: ({ serviceId, data }) => ServiceService.updateService(serviceId, data),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success("Cập nhật dịch vụ thành công");
                queryGetAllServices.refetch();
                formUpdate.resetFields();
                setIsDrawerOpen(false);
                setRowSelected(null);
            } else {
                Message.error(data?.message || "Cập nhật dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật dịch vụ thất bại");
        }
    });
    const mutationDeleteService = useMutation({
        mutationKey: ['deleteService'],
        mutationFn: (serviceId) => ServiceService.deleteService(serviceId),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success("Xoá dịch vụ thành công");
                queryGetAllServices.refetch();
                setRowSelected(null);
                setIsModalOpenDelete(false);
            } else {
                Message.error(data?.message || "Xoá dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá dịch vụ thất bại");
        }
    });
    const mutationDeleteManyServices = useMutation({
        mutationKey: ['deleteManyServices'],
        mutationFn: (serviceIds) => ServiceService.deleteManyServices(serviceIds),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success("Xoá dịch vụ thành công");
                queryGetAllServices.refetch();
                setSelectedRowKeys([]);
                setIsModalOpenDeleteMany(false);
            } else {
                Message.error(data?.message || "Xoá dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá dịch vụ thất bại");
        }
    });

    const { data: services, isLoading: isLoadingServices } = queryGetAllServices;
    const { data: specialties, isLoading: isLoadingSpecialties } = queryGetAllSpecialties;
    const { isPending: isPendingCreate } = mutationCreateService;
    const { isPending: isPendingDelete } = mutationDeleteService;
    const { isPending: isPendingUpdate } = mutationUpdateService;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyServices;
    const serviceData = services?.data?.services || [];
    const specialtyData = specialties?.data?.specialties || [];
    // dữ liệu bảng
    const dataTable = serviceData?.map((item, index) => ({
        key: item.serviceId,
        index: index + 1,
        name: item.name,
        specialty: item.specialty?.name || <Text type="secondary">Chưa cập nhật</Text>,
        description: item.description,
        price: item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
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
            title: "Tên dịch vụ",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name"),
            sorter: (a, b) => a.name.length - b.name.length,
        },
        {
            title: "Chuyên khoa",
            dataIndex: "specialty",
            key: "specialty",
            filters: specialtyData.map((specialty) => ({
                text: specialty.name,
                value: specialty.name,
            })),
            onFilter: (value, record) => record?.specialty === value,
            showSearch: true,
            filterSearch: true,
            render: (text) => (
                text ? (
                    <Tag color="blue">{text}</Tag>
                ) : (
                    <Text type="secondary">Chưa cập nhật</Text>
                )
            ),
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
            title: "Giá",
            dataIndex: "price",
            key: "price",
            sorter: (a, b) => {
                const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
                const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
                return priceA - priceB;
            },
            filters: [
                { text: 'Dưới 200.000đ', value: 'under_200k' },
                { text: '200.000đ - 500.000đ', value: '200k_500k' },
                { text: '500.000đ - 1.000.000đ', value: '500k_1m' },
                { text: 'Trên 1.000.000đ', value: 'above_1m' },
            ],
            onFilter: (value, record) => {
                const price = parseInt(record.price.replace(/[^0-9]/g, ''));
                if (value === 'under_200k') return price < 200000;
                if (value === '200k_500k') return price >= 200000 && price <= 500000;
                if (value === '500k_1m') return price > 500000 && price <= 1000000;
                if (value === 'above_1m') return price > 1000000;
                return false;
            },
            render: (text) => (
                <Text>{text}</Text>
            ),
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
                    if (key === "detail") return handleViewService(record.key);
                    if (key === "edit") return handleEditService(record.key);
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
    const handleViewService = (serviceId) => {
        const service = serviceData.find((item) => item.serviceId === serviceId);
        if (service) {
            setServiceDetail(service);
            setIsModalDetailOpen(true);
        }
    };
    const handleEditService = (serviceId) => {
        const service = serviceData.find((item) => item.serviceId === serviceId);
        if (service) {
            formUpdate.setFieldsValue({
                name: service.name,
                description: service.description,
                price: service.price,
                specialty: service.specialty?.specialtyId,
                status: service.status,
            });
            setIsDrawerOpen(true);
        }
    };
    const handleOnUpdateService = (values) => {
        mutationUpdateService.mutate({ serviceId: rowSelected, data: values });
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleCreateService = () => {
        formCreate.validateFields().then((values) => {
            mutationCreateService.mutate(values);
        }).catch((info) => {
            console.log('Validate Failed:', info);
        });
    };
    const handleCloseCreateService = () => {
        formCreate.resetFields();
        setIsModalOpenCreate(false);
    };
    const handleOkDelete = () => {
        mutationDeleteService.mutate(rowSelected);
    };
    const handleCancelDelete = () => {
        setRowSelected(null);
        setIsModalOpenDelete(false);
    };
    const handleOkDeleteMany = () => {
        mutationDeleteManyServices.mutate(selectedRowKeys);
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
            <Title level={4}>Danh sách dịch vụ</Title>
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
                setSelectedRowKeys={handleSelectedAll}
                menuProps={menuProps}

            />
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <LoadingComponent isLoading={isPendingCreate}>
                <ModalComponent
                    title="Thêm mới dịch vụ"
                    open={isModalOpenCreate}
                    onOk={handleCreateService}
                    onCancel={handleCloseCreateService}
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
                            label="Tên dịch vụ"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
                        >
                            <Input placeholder="Nhập tên dịch vụ" />
                        </Form.Item>
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialty"
                            rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
                        >
                            <Select
                                placeholder="Chọn chuyên khoa"
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={specialtyData.map((specialty) => ({
                                    label: specialty.name,
                                    value: specialty.specialtyId,
                                }))}
                                loading={isLoadingSpecialties}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="description"
                        >
                            <Input.TextArea placeholder="Nhập mô tả" rows={4} />
                        </Form.Item>
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[
                                { required: true, message: "Vui lòng nhập giá dịch vụ" },
                                {
                                    pattern: /^\d+$/,
                                    message: "Giá dịch vụ phải là số dương",
                                },
                               
                            ]}
                        >
                            <InputNumber placeholder='Nhập giá dịch vụ' style={{ width: "100%" }} />
                        </Form.Item>

                    </Form>
                </ModalComponent>
            </LoadingComponent >
            <DrawerComponent
                title="Chi tiết dịch vụ"
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
                        onFinish={handleOnUpdateService}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên dịch vụ"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
                        >
                            <Input placeholder="Nhập tên dịch vụ" />
                        </Form.Item>
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialty"
                            rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
                        >
                            <Select
                                placeholder="Chọn chuyên khoa"
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={specialtyData.map((specialty) => ({
                                    label: specialty.name,
                                    value: specialty.specialtyId,
                                }))}
                                loading={isLoadingSpecialties}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="description"
                        >
                            <Input.TextArea placeholder="Nhập mô tả" rows={4} />
                        </Form.Item>
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[
                                { required: true, message: "Vui lòng nhập giá dịch vụ" },
                                {
                                    pattern: /^\d+$/,
                                    message: "Giá dịch vụ phải là số dương",
                                },
                              
                            ]}
                        >
                            <InputNumber placeholder='Nhập giá dịch vụ' style={{ width: "100%" }} />
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
                        <span>Xoá dịch vụ</span>
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
                            dịch vụ này không?
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
                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Dịch vụ:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Text>{serviceDetail?.name || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />

                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Mô tả:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        <Text>{serviceDetail?.description || <Text type="secondary">Chưa cập nhật</Text>}</Text>
                    </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />

                <Row style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Text strong>Trạng thái:</Text>
                    </Col>
                    <Col span={14} style={{ textAlign: "right" }}>
                        {serviceDetail?.status === "active" ? (
                            <Tag
                                color="green"
                            >
                                Đang hoạt động
                            </Tag>
                        ) : (
                            <Tag color="red">Ngừng hoạt động</Tag>
                        )}
                    </Col>
                </Row>
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
            <TableStyle
                rowSelection={rowSelection}
                emptyText="Không có dữ liệu dịch vụ"
                columns={columns}
                loading={isLoadingServices}
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

export default ServicePage