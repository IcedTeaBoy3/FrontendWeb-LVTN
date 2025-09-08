import { useState } from 'react'
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent';
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DoctorWorkplaceService } from '@/services/DoctorWorkplaceService';
import { WorkplaceService } from '@/services/WorkplaceService';
import { PositionService } from '@/services/PositionService';
import * as Message from '@/components/Message/Message';
import TableStyle from '../TableStyle/TableStyle';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Typography, Divider, Form, Select, Radio, Space, Skeleton, Card } from 'antd';
const { Title, Text } = Typography;
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
const DoctorWorkplace = ({ id }) => {
    const [isOpenModalCreateDoctorWorkplace, setIsOpenModalCreateDoctorWorkplace] = useState(false);
    const [isDrawerOpenWorkplace, setIsDrawerOpenWorkplace] = useState(false);
    const [isModalOpenDeleteWorkplace, setIsModalOpenDeleteWorkplace] = useState(false);
    const [selectedRowKeyWorkplaces, setSelectedRowKeyWorkplaces] = useState([]);
    const [rowSelectedWorkplace, setRowSelectedWorkplace] = useState(null);
    const [formCreateDoctorWorkplace] = Form.useForm();
    const [formUpdateDoctorWorkplace] = Form.useForm();
    const rowSelectionWorkplaces = {
        selectedRowKeyWorkplaces,
        onChange: (selectedKeys) => {
            setSelectedRowKeyWorkplaces(selectedKeys);
        },
        type: "checkbox",
    };
    // phân trang
    const [paginationWorkplaces, setPaginationWorkplaces] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const queryGetAllWorkplaces = useQuery({
        queryKey: ['getAllWorkplaces'],
        queryFn: WorkplaceService.getAllWorkplaces,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetAllPositions = useQuery({
        queryKey: ['getAllPositions'],
        queryFn: PositionService.getAllPositions,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetAllWorkplacesByDoctor = useQuery({
        queryKey: ['getWorkplacesByDoctor', id],
        queryFn: () => DoctorWorkplaceService.getWorkplacesByDoctor(id),
        enabled: !!id,
    });
    const mutationCreateDoctorWorkplace = useMutation({
        mutationKey: ['createDoctorWorkplace'],
        mutationFn: DoctorWorkplaceService.createDoctorWorkplace,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                formCreateDoctorWorkplace.resetFields();
                setIsOpenModalCreateDoctorWorkplace(false);
                queryGetAllWorkplacesByDoctor.refetch();
            } else {
                Message.error(data.message || "Thêm nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Thêm nơi làm việc thất bại");
        }
    });
    const mutationDeleteDoctorWorkplace = useMutation({
        mutationKey: ['deleteDoctorWorkplace'],
        mutationFn: DoctorWorkplaceService.deleteDoctorWorkplace,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setRowSelectedWorkplace(null);
                setIsModalOpenDeleteWorkplace(false);
                queryGetAllWorkplacesByDoctor.refetch();
            } else {
                Message.error(data.message || "Xoá nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Xoá nơi làm việc thất bại");
        }

    });
    const mutationUpdateDoctorWorkplace = useMutation({
        mutationKey: ['updateDoctorWorkplace'],
        mutationFn: ({ id, data }) => DoctorWorkplaceService.updateDoctorWorkplace(id, data),
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setIsDrawerOpenWorkplace(false);
                setRowSelectedWorkplace(null);
                formUpdateDoctorWorkplace.resetFields();
                queryGetAllWorkplacesByDoctor.refetch();
            } else {
                Message.error(data.message || "Cập nhật nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Cập nhật nơi làm việc thất bại");
        }
    });
    const { isPending: isPendingCreateDoctorWorkplace } = mutationCreateDoctorWorkplace;
    const { isPending: isPendingDeleteDoctorWorkplace } = mutationDeleteDoctorWorkplace;
    const { isPending: isPendingUpdateDoctorWorkplace } = mutationUpdateDoctorWorkplace;
    const { data: doctorWorkplace, isLoading: isLoadingWorkplacesByDoctor } = queryGetAllWorkplacesByDoctor;
    const { data: workplaces, isLoading: isLoadingWorkplaces } = queryGetAllWorkplaces;
    const { data: positions, isLoading: isLoadingPositions } = queryGetAllPositions;
    const workplaceData = workplaces?.data?.workplaces || [];
    const positionData = positions?.data?.positions || [];
    const doctorWorkplaceData = doctorWorkplace?.data || [];
    const columnsWorkplaces = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Nơi làm việc",
            dataIndex: "workplace",
            key: "workplace",
            sorter: (a, b) => a.name?.length - b.name?.length,
            render: (name) => {
                return name ? <Text>{name}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Chức vụ",
            dataIndex: "degree",
            key: "degree",
        },
        {
            title: "Nơi làm việc chính",
            dataIndex: "isPrimary",
            key: "isPrimary",
            filters: [
                { text: "Có", value: true },
                { text: "Không", value: false },
            ],
            onFilter: (value, record) => record.isPrimary === value,
            filterMultiple: false,
            render: (isPrimary) => {
                return isPrimary ? "✅" : "❌";
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                return (
                    <Space size="middle">
                        <ButtonComponent
                            size="small"
                            icon={<EditOutlined />}
                            type="primary"
                            onClick={() => handleEditWorkplace(record.key)}
                        >Sửa</ButtonComponent>
                        <ButtonComponent
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                setIsModalOpenDeleteWorkplace(true);
                            }}
                        >Xoá</ButtonComponent>
                    </Space>
                );
            },
        },
    ].filter(Boolean);
    const dataTableWorkplaces = doctorWorkplaceData?.map((item, index) => {
        return {
            key: item.doctorWorkplaceId,
            index: index + 1,
            workplace: item.workplace?.name,
            degree: item.position?.title,
            isPrimary: item.isPrimary,
        };
    });
    const handleEditWorkplace = (key) => {
        const doctorWorkplace = doctorWorkplaceData?.find(wp => wp.doctorWorkplaceId === key);
        if (doctorWorkplace) {
            formUpdateDoctorWorkplace.setFieldsValue({
                workplaceId: doctorWorkplace.workplace?.workplaceId,
                positionId: doctorWorkplace.position?.positionId,
                isPrimary: doctorWorkplace.isPrimary,
            });
            setIsDrawerOpenWorkplace(true);
        }
    };
    const handleCreateDoctorWorkplace = () => {
        formCreateDoctorWorkplace.validateFields().then((values) => {
            mutationCreateDoctorWorkplace.mutate({
                ...values,
                doctorId: id
            });
        });
    };
    const handleCloseCreateDoctorWorkplace = () => {
        setIsOpenModalCreateDoctorWorkplace(false);
    };
    const handleOkDeleteWorkplace = () => {
        mutationDeleteDoctorWorkplace.mutate(rowSelectedWorkplace)
    };
    const handleCancelDeleteWorkplace = () => {
        setIsModalOpenDeleteWorkplace(false);
    };
    const handleOnUpdateDoctorWorkplace = (values) => {
        mutationUpdateDoctorWorkplace.mutate({ id: rowSelectedWorkplace, data: { ...values, doctorId: id } });
    };
    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>Nơi làm việc</Title>}
            extra={
                <ButtonComponent
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsOpenModalCreateDoctorWorkplace(true)}
                >Thêm nơi làm việc</ButtonComponent>
            }
            style={{ width: "100%" }}
        >
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá nơi làm việc</span>
                    </span>
                }
                open={isModalOpenDeleteWorkplace}
                onOk={handleOkDeleteWorkplace}
                onCancel={handleCancelDeleteWorkplace}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteDoctorWorkplace}>
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
            <LoadingComponent isLoading={isPendingCreateDoctorWorkplace}>
                <ModalComponent
                    title="Thêm mới nơi làm việc"
                    open={isOpenModalCreateDoctorWorkplace}
                    onOk={handleCreateDoctorWorkplace}
                    onCancel={handleCloseCreateDoctorWorkplace}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDoctorWorkplace"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        initialValues={{ isPrimary: true }}
                        autoComplete="off"
                        form={formCreateDoctorWorkplace}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Nơi làm việc"
                            name="workplaceId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi làm việc"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingWorkplaces ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={workplaceData.map((wp) => ({
                                    label: wp.name,
                                    value: wp.workplaceId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Chức vụ"
                            name="positionId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chức vụ!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi chức vụ"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingPositions ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={positionData.map((pos) => ({
                                    label: pos.title,
                                    value: pos.positionId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Nơi làm việc chính"
                            name="isPrimary"

                        >
                            <Radio.Group>
                                <Radio value={true}>Có</Radio>
                                <Radio value={false}>Không</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <DrawerComponent
                title="Chi tiết nơi làm việc"
                placement="right"
                isOpen={isDrawerOpenWorkplace}
                onClose={() => setIsDrawerOpenWorkplace(false)}
                width={window.innerWidth < 768 ? "100%" : 700}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdateDoctorWorkplace}>

                    <Form
                        name="formUpdateDoctorWorkplace"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        onFinish={handleOnUpdateDoctorWorkplace}
                        form={formUpdateDoctorWorkplace}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Nơi làm việc"
                            name="workplaceId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi làm việc"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingWorkplaces ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={workplaceData.map((wp) => ({
                                    label: wp.name,
                                    value: wp.workplaceId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Chức vụ"
                            name="positionId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chức vụ!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi chức vụ"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingPositions ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={positionData.map((pos) => ({
                                    label: pos.title,
                                    value: pos.positionId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Nơi làm việc chính"
                            name="isPrimary"

                        >
                            <Radio.Group>
                                <Radio value={true}>Có</Radio>
                                <Radio value={false}>Không</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            label={null}
                            wrapperCol={{ offset: 18, span: 6 }}
                        >
                            <Space>
                                <ButtonComponent
                                    type="default"
                                    onClick={() => setIsDrawerOpenWorkplace(false)}
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
            <TableStyle
                rowSelection={rowSelectionWorkplaces}
                rowKey={"key"}
                columns={columnsWorkplaces}
                scroll={{ x: "max-content" }}
                loading={isLoadingWorkplacesByDoctor}
                dataSource={dataTableWorkplaces}
                locale={{
                    emptyText: "Không có dữ liệu",
                    filterConfirm: "Lọc",
                    filterReset: "Xóa lọc",
                }}
                pagination={{
                    current: paginationWorkplaces.current,
                    pageSize: paginationWorkplaces.pageSize,
                    position: ["bottomCenter"],
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} nơi làm việc`,
                    showSizeChanger: true, // Cho phép chọn số dòng/trang
                    pageSizeOptions: ["5", "8", "10", "20", "50"], // Tuỳ chọn số dòng
                    showQuickJumper: true, // Cho phép nhảy đến trang
                    onChange: (page, pageSize) => {
                        setPaginationWorkplaces((prev) => ({
                            ...prev,
                            current: page,
                            pageSize: pageSize,
                        }));
                    },
                }}
                onRow={(record) => ({
                    onClick: () => {
                        setRowSelectedWorkplace(record.key);
                    },
                })}
            />
        </Card>
    )
}

export default DoctorWorkplace