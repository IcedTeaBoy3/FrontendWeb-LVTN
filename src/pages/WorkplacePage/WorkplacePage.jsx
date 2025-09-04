import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Space, Input, Button, Form, Select, Radio, Typography, Popover, Divider, Dropdown, Menu, Upload, Tag, Image } from "antd";
import { TableStyled } from './style';
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import { WorkplaceService } from '@/services/WorkplaceService';
import * as Message from "@/components/Message/Message";
import defaultImage from "@/assets/default_image.png";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    DownOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    ExportOutlined,
    UploadOutlined
} from "@ant-design/icons";
const { Text, Title } = Typography;

const WorkplacePage = () => {
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
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

    const queryGetAllWorkplaces = useQuery({
        queryKey: ['getAllWorkplaces'],
        queryFn: WorkplaceService.getAllWorkplaces,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const mutationCreateWorkplace = useMutation({
        mutationKey: ['createWorkplace'],
        mutationFn: WorkplaceService.createWorkplace,
        onSuccess: (data) => {
            if (data?.status == 'success') {
                Message.success(data.message);
                formCreate.resetFields();
                setIsModalOpenCreate(false);
                queryGetAllWorkplaces.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    });
    const mutationUpdateWorkplace = useMutation({
        queryKey: ['updateWorkplace'],
        mutationFn: ({ id, ...data }) => WorkplaceService.updateWorkplace(id, data),
        onSuccess: (data) => {
            if (data?.status == 'success') {
                Message.success(data.message);
                formUpdate.resetFields();
                setIsDrawerOpen(false);
                queryGetAllWorkplaces.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    });
    const mutationDeleteWorkplace = useMutation({
        mutationKey: ['deleteWorkplace'],
        mutationFn: WorkplaceService.deleteWorkplace,
        onSuccess: (data) => {
            if (data?.status == 'success') {
                Message.success(data.message);
                setIsModalOpenDelete(false);
                queryGetAllWorkplaces.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    });
    const mutationDeleteManyWorkplaces = useMutation({
        mutationKey: ['deleteManyWorkplaces'],
        mutationFn: WorkplaceService.deleteManyWorkplaces,
        onSuccess: (data) => {
            if (data?.status == 'success') {
                Message.success(data.message);
                setIsModalOpenDeleteMany(false);
                setSelectedRowKeys([]);
                queryGetAllWorkplaces.refetch();
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    });
    const { data: dataWorkplaces, isLoading: isLoadingWorkplaces } = queryGetAllWorkplaces;
    const { isPending: isPendingCreate } = mutationCreateWorkplace;
    const { isPending: isPendingUpdate } = mutationUpdateWorkplace;
    const { isPending: isPendingDelete } = mutationDeleteWorkplace;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyWorkplaces;
    const data = dataWorkplaces?.data?.workplaces;
    const dataTable = data?.map((item, index) => ({
        key: item.workplaceId,
        index: index + 1,
        name: item.name,
        description: item.description,
        address: item.address,
        phone: item.phone,
        type: item.type,
        thumbnail: item.thumbnail,
    }));
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Tên cơ sở",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name"),
            sorter: (a, b) => a.name.length - b.name.length,
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
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Loại cơ sở",
            dataIndex: "type",
            key: "type",
            render: (text) => (
                text === "hospital" ? <Tag color="blue" style={{ borderRadius: "8px", padding: "0 8px" }}>Bệnh viện</Tag> : <Tag color="green" style={{ borderRadius: "8px", padding: "0 8px" }}>Phòng khám</Tag>
            ),
        },
        // {
        //     title: "Hình ảnh",
        //     dataIndex: "thumbnail",
        //     key: "thumbnail",
        //     render: (text) => (
        //         <Image
        //             src={`${import.meta.env.VITE_APP_BACKEND_URL}${text}`}
        //             alt={text}
        //             width={50}
        //             height={50}
        //             style={{ borderRadius: "8px", objectFit: "cover" }}
        //             fallback={defaultImage}
        //         />
        //     ),
        // },
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
                    if (key === "detail") return handleViewWorkplace(record.key);
                    if (key === "edit") return handleEditWorkplace(record.key);
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
    const handleViewWorkplace = (key) => {
        console.log("View workplace:", key);
    };
    const handleEditWorkplace = (key) => {
        const workplace = dataTable.find(item => item.key === key);
        formUpdate.setFieldsValue(workplace);
        setIsDrawerOpen(true);
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleOnUpdateWorkplace = (values) => {
        mutationUpdateWorkplace.mutate({ id: rowSelected, ...values });
    };
    const handleOkDelete = () => {
        mutationDeleteWorkplace.mutate(rowSelected);
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };
    const handleCreateWorkplace = () => {
        formCreate.validateFields().then((values) => {
            mutationCreateWorkplace.mutate(values);
        });
    };
    const handleCloseCreateWorkplace = () => {
        setIsModalOpenCreate(false);
    };
    const handleOkDeleteMany = () => {
        mutationDeleteManyWorkplaces.mutate(selectedRowKeys);
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
            <Title level={4}>Danh sách nơi làm việc</Title>
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
                    title="Thêm mới nơi làm việc"
                    open={isModalOpenCreate}
                    onOk={handleCreateWorkplace}
                    onCancel={handleCloseCreateWorkplace}
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
                            label="Tên cơ sở"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >
                            <Input
                                name="name"
                                placeholder="Nhập vào tên cơ sở"
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
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập địa chỉ!",
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={2}
                                placeholder="Nhập địa chỉ tại đây..."
                            />
                        </Form.Item>
                        <Form.Item
                            label="SĐT"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập SĐT!",
                                },
                            ]}
                        >
                            <Input
                                name="phone"
                                placeholder="Nhập vào SĐT"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Loại cơ sở"
                            name="type"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn loại cơ sở!",
                                },
                            ]}
                        >
                            <Select placeholder="Chọn loại cơ sở">
                                <Select.Option value="hospital">Bệnh viện</Select.Option>
                                <Select.Option value="clinic">Phòng khám</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Ảnh"
                            name="image"
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
                                accept=".jpg, .jpeg, .png, .gif, .webps"
                                onRemove={() => formCreate.setFieldsValue({ image: [] })}
                                fileList={formCreate.getFieldValue("image") || []}
                                listType="picture"
                            >
                                <ButtonComponent icon={<UploadOutlined />}>
                                    Chọn file
                                </ButtonComponent>
                            </Upload>


                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <DrawerComponent
                title="Chi tiết nơi làm việc"
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
                        onFinish={handleOnUpdateWorkplace}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên cơ sở"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên cơ sở!",
                                },
                            ]}
                        >
                            <Input name="name" />
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
                            label="Địa chỉ"
                            name="address"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập địa chỉ!",
                                },
                            ]}
                        >
                            <Input.TextArea
                                name="address"
                                rows={4}
                                placeholder="Nhập địa chỉ chi tiết "
                            />
                        </Form.Item>
                        <Form.Item
                            label="SĐT"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập SĐT!",
                                },
                            ]}
                        >
                            <Input name="phone" />
                        </Form.Item>
                        <Form.Item
                            label="Loại cơ sở"
                            name="type"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn loại cơ sở!",
                                },
                            ]}
                        >
                            <Select placeholder="Chọn loại cơ sở">
                                <Select.Option value="hospital">Bệnh viện</Select.Option>
                                <Select.Option value="clinic">Phòng khám</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Ảnh"
                            name="image"
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
                                onRemove={() => formUpdate.setFieldsValue({ image: [] })}
                                fileList={formUpdate.getFieldValue("image") || []}
                                listType="picture"
                            >
                                <ButtonComponent icon={<UploadOutlined />}>
                                    Chọn file
                                </ButtonComponent>
                            </Upload>

                        </Form.Item>
                        {/* <Form.Item
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

                        </Form.Item> */}

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
                        <span>Xoá nơi làm việc</span>
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
                            nơi làm việc này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá nơi làm việc</span>
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
                            {selectedRowKeys.length} nơi làm việc này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <TableStyled
                rowSelection={rowSelection}
                rowKey={"key"}
                columns={columns}
                scroll={{ x: "max-content" }}
                loading={isLoadingWorkplaces}
                dataSource={dataTable}
                locale={{
                    emptyText: "Không có dữ liệu nơi làm việc",
                    filterConfirm: "Lọc",
                    filterReset: "Xóa lọc",
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    position: ["bottomCenter"],
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} nơi làm việc`,
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

export default WorkplacePage