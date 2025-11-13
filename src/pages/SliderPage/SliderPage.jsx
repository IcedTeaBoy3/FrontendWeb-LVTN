import { SliderService } from '@/services/SliderService'
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import TableStyle from '@/components/TableStyle/TableStyle';
import * as Message from "@/components/Message/Message";
import { 
    Space, 
    Input, 
    Radio, 
    Button, 
    Form, 
    Image, 
    Typography, 
    Dropdown, 
    Tag,
    Upload,  
    Descriptions, 
    Row, 
    Col, 
    DatePicker
} from "antd";

import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    ExportOutlined,
    UploadOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import defaultImage from "@/assets/default_image.png";
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const SliderPage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [sliderDetail, setSliderDetail] = useState(null);
    const [formCreate] = Form.useForm();
    const [formUpdate] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
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
    const queryGetAllSliders = useQuery({
        queryKey: ['getAllSliders'],
        queryFn: () => SliderService.getAllSliders({ page: 1, limit: 100 }),
        retry: 1,
    });
    const mutationCreateSlider = useMutation({
        queryKey: ['createSlider'],
        mutationFn: (data) => SliderService.createSlider(data),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success("Tạo slider thành công!");
                queryGetAllSliders.refetch();
                setIsModalOpenCreate(false);
                setImageUrl(null);
                formCreate.resetFields();
            }else {
                Message.error(data?.message || "Tạo slider thất bại. Vui lòng thử lại!");
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Tạo slider thất bại. Vui lòng thử lại!");
        }
    });
    const mutationUpdateSlider = useMutation({
        mutationKey: ['updateSlider'],
        mutationFn: ({ sliderId, data }) => SliderService.updateSlider(sliderId, data),
        onSuccess: (data) => {
            Message.success(data?.message || "Cập nhật slider thành công!");
            queryGetAllSliders.refetch();
            setIsDrawerOpen(false);
            setRowSelected(null);
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật slider thất bại. Vui lòng thử lại!");
        }
    });
    const mutationDeleteSlider = useMutation({
        mutationKey: ['deleteSlider'],
        mutationFn: (sliderId) => SliderService.deleteSlider(sliderId),
        onSuccess: (data) => {
            Message.success(data?.message || "Xoá slider thành công!");
            queryGetAllSliders.refetch();
            setRowSelected(null);
            setIsModalOpenDelete(false);
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá slider thất bại. Vui lòng thử lại!");
        }
    });
    const mutationDeleteManySliders = useMutation({
        mutationKey: ['deleteManySliders'],
        mutationFn: (ids) => SliderService.deleteManySliders(ids),
        onSuccess: (data) => {
            Message.success(data?.message || "Xoá nhiều slider thành công!");
            queryGetAllSliders.refetch();
            setSelectedRowKeys([]);
            setIsModalOpenDeleteMany(false);
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá nhiều slider thất bại. Vui lòng thử lại!");
        }
    });
    const { data: sliders, isLoading: isLoadingSliders } = queryGetAllSliders;
    const { isPending: isPendingCreate } = mutationCreateSlider;
    const { isPending: isPendingDelete } = mutationDeleteSlider;
    const { isPending: isPendingUpdate } = mutationUpdateSlider;
    const { isPending: isPendingDeleteMany } = mutationDeleteManySliders;
    const sliderData = sliders?.data?.sliders || [];
    const dataTable = sliderData?.map((item, index) => ({
        key: item.sliderId,
        index: index + 1,
        caption: item.caption,
        imageUrl: `${import.meta.env.VITE_APP_BACKEND_URL}${item.imageUrl}`,
        expireAt: item.expireAt ? dayjs(item.expireAt).format('HH:mm giờ, ngày DD/MM/YYYY') : 'Chưa đặt',
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
            title: "Tên slider",
            dataIndex: "caption",
            key: "caption",
            ...getColumnSearchProps("caption"),
        },
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (imageUrl) => {

                return (
                    <Image
                        src={imageUrl}
                        alt="Hình ảnh slider"
                        style={{ width: 100, height: 50, objectFit: "cover", borderRadius: 4 }}
                        fallback={defaultImage}
                    />
                );
            }
        },
        {
            title: "Ngày hết hạn",
            dataIndex: "expireAt",
            key: "expireAt",
            render: (text) => text || 'Chưa đặt',
            ...getColumnSearchProps("expireAt"),
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
                    if (key === "detail") return handleViewSlider(record.key);
                    if (key === "edit") return handleEditSlider(record.key);
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
    const handleCreateSlider = () => {
        formCreate
        .validateFields()
        .then((values) => {
            const image = values.image?.[0].originFileObj;
            const formData = new FormData();
            formData.append("caption", values.caption);
            formData.append("status", values.status);
            if(values.expireAt){
                formData.append("expireAt", dayjs(values.expireAt).format('YYYY-MM-DD HH:mm'));
            }
            formData.append("image", image);
            mutationCreateSlider.mutate(formData);
        })
        .catch((info) => {
            console.log("Validate Failed:", info);
        });
    }
    const handleUploadChange = (info) => {
    const file = info.fileList[0]?.originFileObj;
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        } else {
            setImageUrl(null);
        }
    };
    const handleViewSlider = (sliderId) => {
        const slider = sliderData.find((item) => item.sliderId === sliderId);
        setSliderDetail(slider);
        setIsModalDetailOpen(true);
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleOkDelete = () => {
        // Xử lý xóa slider ở đây
        mutationDeleteSlider.mutate(rowSelected);
    }
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };
    const handleEditSlider = (sliderId) => {
        const slider = sliderData.find((item) => item.sliderId === sliderId);
        if (!slider) {
            Message.error("Không tìm thấy slider cần chỉnh sửa!");
            return;
        }
        formUpdate.setFieldsValue({
            caption: slider.caption,
            status: slider.status,
            expireAt: slider.expireAt ? dayjs(slider.expireAt) : null,
            image: [
                {
                    uid: "-1",
                    name: slider?.caption || "image.png",
                    status: "done",
                    url: slider?.imageUrl ? `${import.meta.env.VITE_APP_BACKEND_URL}${slider.imageUrl}` : defaultImage,
                }
            ],
        });
        setIsDrawerOpen(true);
    };
    const handleOnUpdateSlider = () => {
        formUpdate
        .validateFields()
        .then((values) => {
            const imageFile = values.image?.[0]?.originFileObj;
            const formData = new FormData();
            if (imageFile instanceof File) {
                formData.append("image", imageFile);
            }else if(values.image?.[0]?.url){
                // giữ nguyên ảnh cũ
                const imageName = values.image[0].url.replace(import.meta.env.VITE_APP_BACKEND_URL, '');
                formData.append("oldImage", imageName);
            }else{
                // Không có ảnh và cũng không dùng ảnh cũ → đã xoá
                formData.append("isImageDeleted", true);
            }
            formData.append("caption", values.caption);
            formData.append("status", values.status);
            if(values.expireAt){
                formData.append("expireAt", dayjs(values.expireAt).format('YYYY-MM-DD HH:mm'));
            }
            mutationUpdateSlider.mutate({ sliderId: rowSelected, data: formData });
        })
        .catch((info) => {
            console.log("Validate Failed:", info);
        });
    };
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    };
    const handleOkDeleteMany = () => {
        mutationDeleteManySliders.mutate(selectedRowKeys);
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
            <Title level={4}>Danh sách slider</Title>
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
            <LoadingComponent isLoading={isPendingCreate}>
                <ModalComponent
                    title="Thêm mới slider"
                    open={isModalOpenCreate}
                    onOk={handleCreateSlider}
                    onCancel={() => setIsModalOpenCreate(false)}
                    width={750}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        labelAlign="left"
                        autoComplete="off"
                        form={formCreate}
                        layout="vertical"
                    >
                        <Form.Item
                            label={<b>Tên slider</b>}
                            name="caption"
                            rules={[{ required: true, message: "Vui lòng nhập tên slider" }]}
                        >
                            <Input placeholder="Nhập tên slider..." size="middle" />
                        </Form.Item>
                    
                    
                       
                        {/* Ngày hết hạn */}
                        <Form.Item
                            label={<b>Thời gian hết hạn</b>}
                            name="expireAt"
                        >
                            <DatePicker
                                style={{ width: '50%' }}
                                format="HH:mm giờ, ngày DD/MM/YYYY"
                                showTime={{ format: 'HH:mm' }} 
                                disabledDate={(current) => current && current < dayjs().endOf('day')}
                                placeholder="Chọn thời gian hết hạn"
                            />
                        </Form.Item>
                        <Form.Item
                            label={<b>Trạng thái</b>}
                            name="status"
                            initialValue={"active"}
                            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                        >
                            <Radio.Group>
                                <Radio value="active" >Hoạt động</Radio>
                                <Radio value="inactive">Không hoạt động</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {/* Upload ảnh */}
                        <Form.Item
                            label={<b>Ảnh slider</b>}
                            name="image"
                            rules={[{ required: true, message: "Vui lòng tải ảnh slider" }]}
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e?.fileList || [];
                            }}
                        >
                            <Upload
                                listType="picture-card"
                                showUploadList={true}
                                maxCount={1}
                                accept=".jpg,.jpeg,.png,.gif,.webp"
                                beforeUpload={() => false}
                                onChange={handleUploadChange}
                                className="slider-upload"
                            >
                            
                                <div>
                                    {uploading ? (
                                        <LoadingOutlined style={{ fontSize: 28 }} />
                                    ) : (
                                        <PlusOutlined style={{ fontSize: 28 }} />
                                    )}
                                <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                </div>
                            
                            </Upload>
                        </Form.Item>

                        {/* Xem trước ảnh */}
                        {imageUrl && (
                            <div
                            style={{
                                marginTop: 16,
                                border: "1px solid #f0f0f0",
                                borderRadius: 8,
                                padding: 12,
                                background: "#fafafa",
                            }}
                            >
                            <div
                                style={{
                                fontWeight: 500,
                                marginBottom: 8,
                                color: "#555",
                                }}
                            >
                                Ảnh xem trước:
                            </div>
                            <img
                                src={imageUrl}
                                alt="Preview"
                                style={{
                                width: "100%",
                                maxHeight: 300,
                                objectFit: "cover",
                                borderRadius: 6,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                }}
                            />
                            </div>
                        )}
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <DrawerComponent
                title={
                    <>
                        <EditOutlined style={{marginRight:'8px'}}/>
                        Cập nhật slider
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
                        onFinish={handleOnUpdateSlider}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên slider"
                            name="caption"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên slider!",
                                },
                            ]}
                        >
                            <Input name="caption" />
                        </Form.Item>
                    
                        <Form.Item
                            label="Hình ảnh"
                            name="image"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e?.fileList || [];
                            }}
                            extra="Chọn ảnh chuyên khoa (jpg, jpeg, png, gif, webp) tối đa 1 file"
                        >
                            <Upload
                                name="image"
                                beforeUpload={() => false}
                                maxCount={1}
                                accept=".jpg, .jpeg, .png, .gif, .webp"
                                onRemove={() => formUpdate.setFieldsValue({ image: [] })}
                                fileList={formUpdate.getFieldValue("image") || []}
                                listType="picture-card"
                            >
                                <ButtonComponent icon={<UploadOutlined />}>
                                    Chọn file
                                </ButtonComponent>
                            </Upload>

                        </Form.Item>
                        {/* Ngày hết hạn */}
                        <Form.Item
                            label="Ngày hết hạn"
                            name="expireAt"
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="HH:mm giờ, ngày DD/MM/YYYY"
                                showTime={{ format: 'HH:mm' }}
                                disabledDate={(current) => current && current < dayjs().endOf('day')}
                                placeholder="Chọn ngày hết hạn"
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
                        <span>Xoá slider</span>
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
                            {selectedRowKeys.length} slider đã chọn không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá slider</span>
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
                            slider này không?
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
                    bordered
                    column={1}
                    size='middle'
                >
                    <Descriptions.Item label="Tên slider">
                        {sliderDetail?.caption || <Text type="secondary">Chưa cập nhật</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {sliderDetail?.status === "active" ? (
                            <Tag color="success">Đang hoạt động</Tag>
                        ) : (
                            <Tag color="default">Ngừng hoạt động</Tag>
                        )}
                    </Descriptions.Item>
                </Descriptions>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Title level={5}>Ảnh slider</Title>
                        <Image
                            src={sliderDetail ? `${import.meta.env.VITE_APP_BACKEND_URL}${sliderDetail.imageUrl}` : defaultImage}
                            alt="Hình ảnh slider"
                            style={{ width: '100%', maxHeight: 400, objectFit: "contain", borderRadius: 4 }}
                        />
                    </Col>
                </Row>
            </ModalComponent>

            <TableStyle
                rowSelection={rowSelection}
                emptyText="Không có dữ liệu dịch vụ"
                columns={columns}
                loading={isLoadingSliders}
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

export default SliderPage