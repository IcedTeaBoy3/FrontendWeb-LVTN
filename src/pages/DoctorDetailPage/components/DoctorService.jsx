import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Form, Typography, Space, Divider, Select, Skeleton, InputNumber, Checkbox, Card, Table } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined, ExportOutlined } from "@ant-design/icons";
import { DoctorServiceService } from "@/services/DoctorServiceService";
import { DoctorSpecialtyService } from "@/services/DoctorSpecialtyService";
import { ServiceService } from "@/services/ServiceService";
import * as Message from "@/components/Message/Message";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import TableStyle from "@/components/TableStyle/TableStyle";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from "@/components/DrawerComponent/DrawerComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';

const { Text, Title } = Typography;

const DoctorService = ({id}) => {
    const [isOpenModalCreateDoctorService, setIsOpenModalCreateDoctorService] = useState(false);
    const [rowSelectedService, setRowSelectedService] = useState(null);
    const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [isModalOpenDeleteService, setIsModalOpenDeleteService] = useState(false);
    const [selectedRowKeyServices, setSelectedRowKeyServices] = useState([]);
    const [isDrawerOpenService, setIsDrawerOpenService] = useState(false);
    const [isOpenModalDeleteMany, setIsOpenModalDeleteMany] = useState(false);
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
    const queryGetAllSpecialtiesByDoctor = useQuery({
        queryKey: ['getSpecialtiesByDoctor', id],
        queryFn: () => DoctorSpecialtyService.getSpecialtiesByDoctor(id),
        enabled: !!id,
    });
    const queryGetAllServicesBySpecialty = useQuery({
        queryKey: ['getServicesBySpecialty', selectedSpecialtyId],
        queryFn: () => ServiceService.getServicesBySpecialty(selectedSpecialtyId),
        enabled: !!selectedSpecialtyId,
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
            Message.error(error?.message || "Thêm dịch vụ thất bại");
        }
    });
    const mutationCreateMultipleDoctorService = useMutation({
        mutationKey: ['createMultipleDoctorService'],
        mutationFn: ({doctorId, data}) => DoctorServiceService.assignMultipleServicesToDoctor(doctorId, data),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data.message);
                formCreateDoctorService.resetFields();
                setSelectedServices([]);
                setIsOpenModalCreateDoctorService(false);
                queryGetAllServicesByDoctor.refetch();
            } else {
                Message.error(data.message || "Thêm dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Thêm dịch vụ thất bại");
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
            Message.error(error?.message || "Cập nhật dịch vụ thất bại");
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
            Message.error(error?.message || "Xoá dịch vụ thất bại");
        }
    });
    const mutationDeleteMultipleDoctorService = useMutation({
        mutationKey: ['deleteMultipleDoctorService'],
        mutationFn: ({doctorId, doctorServiceIds}) => DoctorServiceService.removeMultipleServicesFromDoctor(doctorId, doctorServiceIds),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data.message);
                setSelectedRowKeyServices([]);
                setIsOpenModalDeleteMany(false);
                queryGetAllServicesByDoctor.refetch();
            } else {
                Message.error(data.message || "Xoá nhiều dịch vụ thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Xoá nhiều dịch vụ thất bại");
        }
    });
    const { data: doctorServices, isLoading: isLoadingServicesByDoctor } = queryGetAllServicesByDoctor;
    const isPendingCreateDoctorService = mutationCreateDoctorService.isPending;
    const isPendingUpdateDoctorService = mutationUpdateDoctorService.isPending;
    const isPendingDeleteService = mutationDeleteDoctorService.isPending;
    const isPendingDeleteMultipleServices = mutationDeleteMultipleDoctorService.isPending;
    const { data: specialties, isLoading: isLoadingSpecialties } = queryGetAllSpecialtiesByDoctor;
    const { data: services, isLoading: isLoadingServices } = queryGetAllServicesBySpecialty;
    const doctorServiceData = doctorServices?.data || [];
    const doctorSpecialtyData = specialties?.data || [];
    const serviceData = services?.data || [];
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
            setSelectedSpecialtyId(service?.service?.specialty);
            formUpdateDoctorService.setFieldsValue({
                specialtyId: service?.service?.specialty,
                serviceId: service?.service?.serviceId,
                price: service?.price,
            });
            setIsDrawerOpenService(true);
        }
    };
     // Cập nhật danh sách khi chọn dịch vụ
    const handleServiceChange = (values) => {
        const newServices = values.map((id) => {
            const existing = selectedServices.find((item) => item.serviceId === id);
            if (existing) return existing; // giữ giá trị cũ nếu có
            const service = serviceData.find((sv) => sv.serviceId === id);
            return { serviceId: id, name: service?.name, price: service?.price || 0 };
        });
        setSelectedServices(newServices);
    };
      // Cập nhật giá tiền từng dịch vụ
    const handlePriceChange = (id, value) => {
        setSelectedServices((prev) =>
            prev.map((s) =>
                s.serviceId === id ? { ...s, price: value } : s
            )
        );
    };
    const handleCreateDoctorService = () => {
        mutationCreateMultipleDoctorService.mutate({doctorId: id, data: selectedServices});
    };

    const handleCloseCreateDoctorService = () => {
        formCreateDoctorService.resetFields();
        setIsOpenModalCreateDoctorService(false);
    };
    const handleOkDeleteService = () => {
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
    };
    const handleOkDeleteMany = () => {
        mutationDeleteMultipleDoctorService.mutate({doctorId: id, doctorServiceIds: selectedRowKeyServices});
    };
    const handleCancelDeleteMany = () => {
        setIsOpenModalDeleteMany(false);
    };
    const columns = [
        {
            title: "Dịch vụ",
            dataIndex: "name",
        },
        {
            title: "Giá tiền",
            dataIndex: "price",
            render: (price, record) => (
                <InputNumber
                    min={0}
                    value={price}
                    onChange={(value) => handlePriceChange(record.serviceId, value)}
                    style={{ width: "100%" }}
                />
            ),
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
                onClick: () => setIsOpenModalDeleteMany(true),
            },
        ],
    };
    const handleSelectedAll = () => {
        if (selectedRowKeyServices.length === dataTableServices.length) {
            setSelectedRowKeyServices([]);
        } else {
            setSelectedRowKeyServices(dataTableServices.map((item) => item.key));
        }
    };
    return (
        <Card
            title={
                <Title level={4} style={{margin:0}}>Dịch vụ</Title>
            }
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
                    title="Thêm mới dịch vụ cho bác sĩ"
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
                            label="Chuyên khoa"
                            name="specialtyId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chuyên khoa!",
                                }
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn chuyên khoa"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingSpecialties ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={doctorSpecialtyData.map((sp) => ({
                                    label: sp.specialty?.name,
                                    value: sp.specialty?.specialtyId
                                }))}
                                onChange={(value) => {
                                    setSelectedSpecialtyId(value);
                                    formCreateDoctorService.setFieldsValue({ serviceId: null });
                                }}
                            />
                        </Form.Item>

                         <Form.Item
                            label="Dịch vụ"
                            name="serviceIds"
                            rules={[{ required: true, message: "Vui lòng chọn ít nhất một dịch vụ!" }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn dịch vụ"
                                showSearch
                                allowClear
                                optionFilterProp="children"
                                notFoundContent={
                                    isLoadingServices ? (
                                        <Skeleton active title={false} paragraph={{ rows: 1 }} />
                                    ) : (
                                        "Không tìm thấy dịch vụ"
                                    )
                                }
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={serviceData.map((sv) => ({
                                    label: sv.name,
                                    value: sv.serviceId,
                                }))}
                                onChange={handleServiceChange}
                            />
                        </Form.Item>

                        {selectedServices.length > 0 && (
                            <Table
                                columns={columns}
                                dataSource={selectedServices.map((s) => ({
                                    key: s.serviceId,
                                    ...s,
                                }))}
                                pagination={false}
                                bordered
                                style={{ marginBottom: 16 }}
                            />
                        )}
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
                title={
                    <>
                        <EditOutlined style={{marginRight:'8px'}}/>
                        Cập nhật dịch vụ
                    </>
                }
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
                        autoComplete="off"
                        onFinish={handleOnUpdateDoctorService}
                        form={formUpdateDoctorService}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialtyId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chuyên khoa!",
                                }
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn chuyên khoa"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingSpecialties ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={doctorSpecialtyData.map((sp) => ({
                                    label: sp.specialty?.name,
                                    value: sp.specialty?.specialtyId
                                }))}
                                onChange={(value) => {
                                    setSelectedSpecialtyId(value);
                                    formUpdateDoctorService.setFieldsValue({ serviceId: null });
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Dịch vụ"
                            name="serviceId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn dịch vụ!",
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
                                onChange={(value) => {
                                    formUpdateDoctorService.setFieldsValue({ serviceId: value });
                                    const service = serviceData.find((sv) => sv.serviceId === value);
                                    if (service) {
                                        formUpdateDoctorService.setFieldsValue({ price: service.price });
                                    }
                                }}
                            />
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
                        <span>Xoá dịch vụ</span>
                    </span>
                }
                open={isOpenModalDeleteMany}
                onOk={handleOkDeleteMany}
                okText="Xoá"
                cancelText="Hủy"
                onCancel={handleCancelDeleteMany}
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteMultipleServices}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            {selectedRowKeyServices.length} dịch vụ đã chọn không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <BulkActionBar
                selectedRowKeys={selectedRowKeyServices}
                handleSelectedAll={handleSelectedAll}
                menuProps={menuProps}

            />
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