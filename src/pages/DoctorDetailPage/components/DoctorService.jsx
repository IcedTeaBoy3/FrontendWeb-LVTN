import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Form, Typography, Space, Divider, Select, Skeleton, InputNumber, Checkbox, Card } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { DoctorServiceService } from "@/services/DoctorServiceService";
import { ServiceService } from "@/services/ServiceService";
import * as Message from "@/components/Message/Message";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import TableStyle from "@/components/TableStyle/TableStyle";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from "@/components/DrawerComponent/DrawerComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
const { Text, Title } = Typography;

const DoctorService = ({id}) => {
    const [isOpenModalCreateDoctorService, setIsOpenModalCreateDoctorService] = useState(false);
    const [rowSelectedService, setRowSelectedService] = useState(null);
    const [isModalOpenDeleteService, setIsModalOpenDeleteService] = useState(false);
    const [selectedRowKeyServices, setSelectedRowKeyServices] = useState([]);
    const [isDrawerOpenService, setIsDrawerOpenService] = useState(false);
    const [formCreateDoctorService] = Form.useForm();
    const [formUpdateDoctorService] = Form.useForm();
    const rowSelectionServices = {
        selectedRowKeyServices,
        onChange: (selectedKeys) => {
            setSelectedRowKeyServices(selectedKeys);
        },
        type: "checkbox",
    };
    const [paginationServices, setPaginationServices] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const queryGetAllServicesByDoctor = useQuery({
        queryKey: ['getServicesByDoctor', id],
        queryFn: () => DoctorServiceService.getServicesByDoctor(id),
        enabled: !!id,
    });
    const mutationCreateDoctorService = useMutation({
        mutationKey: ['createDoctorService'],
        mutationFn: DoctorServiceService.assignDoctorToService,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data.message);
                formCreateDoctorService.resetFields();
                setIsOpenModalCreateDoctorService(false);
                queryGetAllServicesByDoctor.refetch();
            } else {
                Message.error(data.message || "Thêm dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Thêm dịch vụ thất bại");
        }
    });
    const mutationUpdateDoctorService = useMutation({
        mutationKey: ['updateDoctorService'],
        mutationFn: ({id,data}) => DoctorServiceService.updateDoctorService(id,data),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data.message);
                formUpdateDoctorService.resetFields();
                setIsDrawerOpenService(false);
                setRowSelectedService(null);
                queryGetAllServicesByDoctor.refetch();
            } else {
                Message.error(data.message || "Cập nhật dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Cập nhật dịch vụ thất bại");
        }
    });
    const mutationDeleteDoctorService = useMutation({
        mutationKey: ['deleteDoctorService'],
        mutationFn: DoctorServiceService.removeDoctorFromService,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data.message);
                setIsModalOpenDeleteService(false);
                setRowSelectedService(null);
                queryGetAllServicesByDoctor.refetch();
            } else {
                Message.error(data.message || "Xoá dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Xoá dịch vụ thất bại");
        }
    });
    const queryGetAllServices = useQuery({
        queryKey: ['getAllServices'],
        queryFn: () => ServiceService.getAllServices({status: 'active', page: 1, limit: 100}),
    });
    const { data: doctorServices, isLoading: isLoadingServicesByDoctor } = queryGetAllServicesByDoctor;
    const isPendingCreateDoctorService = mutationCreateDoctorService.isPending;
    const isPendingUpdateDoctorService = mutationUpdateDoctorService.isPending;
    const isPendingDeleteService = mutationDeleteDoctorService.isPending;
    const { data: services, isLoading: isLoadingServices } = queryGetAllServices;
    const doctorServiceData = doctorServices?.data || [];
    const serviceData = services?.data?.services || [];
    const columnServices = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Dịch vụ",
            dataIndex: "service",
            key: "service",
            render: (service) => {
                return service ? <Text>{service}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Giá tiền",
            dataIndex: "price",
            key: "price",
            render: (price) => {
                return price ? <Text>{price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
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
                            onClick={() => handleEditService(record.key)}
                        >Sửa</ButtonComponent>
                        <ButtonComponent
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                setIsModalOpenDeleteService(true);
                            }}
                        >Xoá</ButtonComponent>
                    </Space>
                );
            },
        },
    ];
    const dataTableServices = doctorServiceData?.map((item, index) => {
        return {
            key: item.doctorServiceId,
            index: index + 1,
            service: item.service?.name,
            price: item?.price,
        };
    });
    const handleEditService = (key) => {
        const service = doctorServiceData.find((item) => item.doctorServiceId === key);
        if (service) {
            formUpdateDoctorService.setFieldsValue({
                serviceId: service?.service?.serviceId,
                price: service?.price,
            });
            setIsDrawerOpenService(true);
        }
    };
    const handleCreateDoctorService = () => {
        formCreateDoctorService.validateFields().then((values) => {
            const payload = {
                doctorId: id,
                serviceId: values.serviceId,
                price: values.price,
            };
            mutationCreateDoctorService.mutate(payload);
        }).catch((info) => {
            console.log('Validate Failed:', info);
        });
    };

    const handleCloseCreateDoctorService = () => {
        formCreateDoctorService.resetFields();
        setIsOpenModalCreateDoctorService(false);
    };
    const handleOkDeleteService = () => {
        console.log(rowSelectedService);
        mutationDeleteDoctorService.mutate(rowSelectedService);
    };
    const handleCancelDeleteService = () => {
        setIsModalOpenDeleteService(false);
        setRowSelectedService(null);
    };
    const handleOnUpdateDoctorService = (values) => {
        const payload = {
            doctorId: id,
            serviceId: values.serviceId,
            price: values.price,
        };
        mutationUpdateDoctorService.mutate({id: rowSelectedService, data: payload});
    }
    return (
        <Card
            title="Dịch vụ"
            extra={
                <ButtonComponent
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsOpenModalCreateDoctorService(true)}
                >Thêm dịch vụ</ButtonComponent>
            }
            style={{ width: "100%" }}
        > 
            <LoadingComponent isLoading={isPendingCreateDoctorService}>
                <ModalComponent
                    title="Thêm mới chuyên khoa"
                    open={isOpenModalCreateDoctorService}
                    onOk={handleCreateDoctorService}
                    onCancel={handleCloseCreateDoctorService}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDoctorService"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        initialValues={{ isPrimary: true }}
                        autoComplete="off"
                        form={formCreateDoctorService}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Dịch vụ"
                            name="serviceId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn dịch vụ"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingServices ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={serviceData.map((sv) => ({
                                    label: sv.name,
                                    value: sv.serviceId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Giá tiền"
                            name="price"
                            rules={[
                                { required: true, message: "Vui lòng nhập giá tiền!" },
                                { type: 'number', min: 0, message: 'Giá tiền phải là số dương!' }
                            ]}
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá dịch vụ</span>
                    </span>
                }
                open={isModalOpenDeleteService}
                onOk={handleOkDeleteService}
                onCancel={handleCancelDeleteService}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteService}>
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
            <DrawerComponent
                title="Chi tiết dịch vụ"
                placement="right"
                isOpen={isDrawerOpenService}
                onClose={() => setIsDrawerOpenService(false)}
                width={window.innerWidth < 768 ? "100%" : 700}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdateDoctorService}>

                    <Form
                        name="formUpdateDoctorSpecialty"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        onFinish={handleOnUpdateDoctorService}
                        form={formUpdateDoctorService}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Dịch vụ"
                            name="serviceId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn dịch vụ"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingServices ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={serviceData.map((sv) => ({
                                    label: sv.name,
                                    value: sv.serviceId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Giá tiền"
                            name="price"
                            rules={[
                                { required: true, message: "Vui lòng nhập giá tiền!" },
                                { type: 'number', min: 0, message: 'Giá tiền phải là số dương!' }
                            ]}
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>

                       
                        <Form.Item
                            label={null}
                            wrapperCol={{ offset: 18, span: 6 }}
                        >
                            <Space>
                                <ButtonComponent
                                    type="default"
                                    onClick={() => setIsDrawerOpenService(false)}
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
                rowSelection={rowSelectionServices}
                columns={columnServices}
                loading={isLoadingServicesByDoctor}
                dataSource={dataTableServices} 
                pagination={paginationServices}
                onChange={(page) => {
                    setPaginationServices(page);
                }}
                onRow={(record) => ({
                    onClick: () => {
                        setRowSelectedService(record.key);
                    },
                })}
            />
        </Card>
    )
}

export default DoctorService