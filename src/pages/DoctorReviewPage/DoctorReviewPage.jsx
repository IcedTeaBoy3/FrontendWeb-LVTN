import { useMutation, useQuery } from "@tanstack/react-query"
import { DoctorReviewService } from "@/services/DoctorReviewService";
import { useState, useRef, useEffect, useMemo } from "react";
import useDebounce from "@/hooks/useDebounce";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import DrawerComponent from "@/components/DrawerComponent/DrawerComponent";
import * as Message from "@/components/Message/Message";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import { 
    EyeOutlined, 
    EditOutlined, 
    MoreOutlined, 
    PlusOutlined, 
    ExportOutlined, 
    SearchOutlined, 
    DeleteOutlined, 
    ExclamationCircleOutlined,
    ReloadOutlined  
} from "@ant-design/icons";
import { Dropdown, Typography, Tag, Form, Popover, Rate, Descriptions, Input, Space, Button, Badge ,Select  } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import BulkActionBar from "@/components/BulkActionBar/BulkActionBar";
import dayjs from "dayjs";
const { Title, Text } = Typography;
const DoctorReviewPage = () => {

    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [doctorReviewDetail, setDoctorReviewDetail] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [globalSearch, setGlobalSearch] = useState("");

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
        confirm();
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
    const handleSelectAll = () => {
        if (selectedRowKeys.length === dataTable.length) {
            setSelectedRowKeys([]);
        } else {
            const allKeys = dataTable.map((item) => item.key);
            setSelectedRowKeys(allKeys);
        }
    };
    const queryGetAllDoctorReviews = useQuery({
        queryKey: ["doctor-reviews"],
        queryFn: () => DoctorReviewService.getAllDoctorReviews({
            limit: 100,
            page: 1
        }),
        
    });
    const mutationDeleteReview = useMutation({
        mutationKey: ["delete-doctor-review"],
        mutationFn: DoctorReviewService.deleteDoctorReview,
        onSuccess: (data) => {
            if(data?.status == "success") {
                Message.success(data?.message || "Xoá đánh giá thành công");
                setIsModalOpenDelete(false);
                setSelectedRowKeys((prev) => prev.filter((key) => key !== rowSelected));
                setRowSelected(null);
                queryGetAllDoctorReviews.refetch();
            }else{
                Message.error(data?.message || "Xoá đánh giá thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá đánh giá thất bại");
        },
    });
    const mutationToggleDoctorReview = useMutation({
        mutationKey: ["toggle-doctor-review"],
        mutationFn: DoctorReviewService.toggleDoctorView,
        onSuccess: (data) => {
            if(data?.status == "success") {
                Message.success(data?.message || "Cập nhật trạng thái đánh giá thành công");
                setRowSelected(null);
                queryGetAllDoctorReviews.refetch();
            }else{
                Message.error(data?.message || "Cập nhật trạng thái đánh giá thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật trạng thái đánh giá thất bại");
        },
    });
    const mutationDeleteManyReviews = useMutation({
        mutationKey: ["delete-many-doctor-reviews"],
        mutationFn: DoctorReviewService.deleteManyDoctorReviews,
        onSuccess: (data) => {
            if(data?.status == "success") {
                Message.success(data?.message || "Xoá nhiều đánh giá thành công");
                setIsModalOpenDeleteMany(false);
                setSelectedRowKeys([]);
                queryGetAllDoctorReviews.refetch();
            }else{
                Message.error(data?.message || "Xoá nhiều đánh giá thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá nhiều đánh giá thất bại");
        },
    });
    const { data, isLoading } = queryGetAllDoctorReviews;
    const reviewsData = data?.data?.reviews || [];
    const dataTable = reviewsData.map((review, index) => ({
        key: review.doctorReviewId,
        index: (pagination.current - 1) * pagination.pageSize + index + 1,
        appointmentCode: review.appointment?.appointmentCode,
        patientName: review.appointment?.patientProfile?.person?.fullName,
        doctorName: review.doctor?.person?.fullName,
        rating: review.rating,
        comment: review.comment,
        isVisible: review.isVisible,
        createdAt: dayjs(review.createdAt).format("HH:mm giờ, ngày DD/MM/YYYY"),
    }));
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a?.index - b?.index,
        },
        {
            title: "Mã lịch khám",
            dataIndex: "appointmentCode",
            key: "appointmentCode",
            ...getColumnSearchProps("appointmentCode"),
        },
        {
            title: "Tên bệnh nhân",
            dataIndex: "patientName",
            key: "patientName",
            ...getColumnSearchProps("patientName"),
        },
        {
            title: "Tên bác sĩ",
            dataIndex: "doctorName",
            key: "doctorName",
            ...getColumnSearchProps("doctorName"),
        },
        {
            title: "Đánh giá",
            dataIndex: "rating",
            key: "rating",
            render: (text) => (
                <Rate disabled value={text} />
            ),
            filters: [
                { text: "1 Sao", value: 1 },
                { text: "2 Sao", value: 2 },
                { text: "3 Sao", value: 3 },
                { text: "4 Sao", value: 4 },
                { text: "5 Sao", value: 5 },
            ],
            onFilter: (value, record) => record.rating === value,
        },
        {
            title: "Nội dung",
            dataIndex: "comment",
            key: "comment",
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
            dataIndex: "isVisible",
            key: "isVisible",
            render: (text) => {
                return text ? <Tag color="green">Hiển thị</Tag> : <Tag color="red">Đã ẩn</Tag>;
            },
            filters: [
                { text: "Hiển thị", value: true },
                { text: "Đã ẩn", value: false },
            ],
            onFilter: (value, record) => record.isVisible === value,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
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
                    {
                        key: "hide",
                        label: record.isVisible ? "Ẩn đánh giá" : "Hiện đánh giá",
                        icon: record.isVisible ? <EyeOutlined style={{ fontSize: 16 }} /> : <EyeOutlined style={{ fontSize: 16, opacity: 0.5 }} />
                    },
                    { type: "divider" },
                    { key: "delete", label: <Text type="danger">Xoá</Text>, icon: <DeleteOutlined style={{ fontSize: 16, color: "red" }} /> },
                    { type: "divider" },
                ];

                const onMenuClick = ({ key, domEvent }) => {
                    setRowSelected(record.key);
                    domEvent.stopPropagation(); // tránh chọn row khi bấm menu
                    if (key === "detail") return handleViewReview(record.key);
                    if (key === "edit") return handleEditReview(record.key);
                    if (key === "delete") return handleShowConfirmDelete();
                    if (key === "hide") return handleToggleVisibility(record.key);
                };

                return (
                    <>
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
                    </>
                );
            },

        },
    ];
    const handleViewReview = (reviewId) => {
        const review = dataTable.find((item) => item.key === reviewId);
        setDoctorReviewDetail(review);
        setIsModalDetailOpen(true);
    };
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleOkDelete = () => {
        // gọi mutation xoá
        mutationDeleteReview.mutate(rowSelected);
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };
    const handleToggleVisibility = (reviewId) => {
        mutationToggleDoctorReview.mutate(reviewId);
    };
    const handleEditReview = (reviewId) => {
        // // mở drawer sửa
        // console.log("edit review:", reviewId);
    };
    const handleOkDeleteMany = () => {
        mutationDeleteManyReviews.mutate(selectedRowKeys);
    }; 
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    };
    const debouncedGlobalSearch = useDebounce(globalSearch, 500);
    const filteredData = useMemo(() => {
        if (!debouncedGlobalSearch) return dataTable;
        return dataTable.filter((item) => {
            return (
                item.appointmentCode?.toLowerCase().includes(debouncedGlobalSearch.toLowerCase()) ||
                item.patientName?.toLowerCase().includes(debouncedGlobalSearch.toLowerCase()) ||
                item.doctorName?.toLowerCase().includes(debouncedGlobalSearch.toLowerCase())
            );
        });
    }, [dataTable, debouncedGlobalSearch]);
    useEffect(() => {
        if(!debouncedGlobalSearch) {
            setSearchText("");
            setSearchedColumn("");
        }
    }, [debouncedGlobalSearch]);
    return (
        <>
            <Space align="center" style={{ marginBottom: 24 }}>
                <Badge count={dataTable?.length} showZero overflowCount={99} color="#1890ff">

                    <Title level={4} style={{ marginBottom: 0 }}>Danh sách đánh giá bác sĩ</Title>
                </Badge>
               
            </Space>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <Space>
                    <Space.Compact>
                        <Input
                            placeholder="Tìm kiếm theo mã lịch khám, bác sĩ, bệnh nhân"
                            allowClear
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            style={{ width: 400 }}
                            size="middle"
                            enterButton
                        /> 
                        <Button type="primary" icon={<SearchOutlined />} onClick={() => {}}/>
                    </Space.Compact>
                    <Space>

                        
                        <Button 
                            type="primary" 
                            ghost 
                            onClick={() => queryGetAllDoctorReviews.refetch()}  
                            icon={<ReloadOutlined />}
                        >
                            Tải lại
                        </Button>
                    </Space>
                    
                </Space>
                <Space>
                    <ButtonComponent    
                        type="default"
                        disabled={true}
                    >
                        Xuất file
                        <ExportOutlined style={{ fontSize: 16, marginLeft: 8 }} />
                    </ButtonComponent>
                </Space>
            </div>
            
            <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                handleSelectedAll={handleSelectAll}
                menuProps={menuProps}
            />
            <TableStyle
                rowSelection={rowSelection}
                columns={columns}
                loading={isLoading}
                dataSource={filteredData}
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
                    size="middle"
                >
                    <Descriptions.Item label="Mã lịch khám">{doctorReviewDetail?.appointmentCode}</Descriptions.Item>
                    <Descriptions.Item label="Tên bệnh nhân">{doctorReviewDetail?.patientName}</Descriptions.Item>
                    <Descriptions.Item label="Tên bác sĩ">{doctorReviewDetail?.doctorName}</Descriptions.Item>
                    <Descriptions.Item label="Đánh giá">
                        <Rate disabled value={doctorReviewDetail?.rating} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Nội dung">{doctorReviewDetail?.comment || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {doctorReviewDetail?.isVisible ? <Tag color="green">Hiển thị</Tag> : <Tag color="red">Đã ẩn</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{doctorReviewDetail?.createdAt}</Descriptions.Item>
                </Descriptions>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá đánh giá</span>
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
                <LoadingComponent isLoading={mutationDeleteReview.isPending}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            đánh giá này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá đánh giá</span>
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
                <LoadingComponent isLoading={mutationDeleteManyReviews.isPending}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            {selectedRowKeys.length} đánh giá này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
        </>
    )
}

export default DoctorReviewPage