import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Form, Typography, Space, Divider, Select, Skeleton, InputNumber, Checkbox, Card } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { SpecialtyService } from "@/services/SpecialtyService";
import { DoctorSpecialtyService } from "@/services/DoctorSpecialtyService";
import * as Message from "@/components/Message/Message";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import TableStyle from "@/components/TableStyle/TableStyle";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from "@/components/DrawerComponent/DrawerComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
const { Text, Title } = Typography;
const DoctorSpecialty = ({ id }) => {
    const [isOpenModalCreateDoctorSpecialty, setIsOpenModalCreateDoctorSpecialty] = useState(false);
    const [isDrawerOpenSpecialty, setIsDrawerOpenSpecialty] = useState(false);
    const [isModalOpenDeleteSpecialty, setIsModalOpenDeleteSpecialty] = useState(false);
    const [rowSelectedSpecialty, setRowSelectedSpecialty] = useState(null);
    const [selectedRowKeySpecialties, setSelectedRowKeySpecialties] = useState([]);
    const [formCreateDoctorSpecialty] = Form.useForm();
    const [formUpdateDoctorSpecialty] = Form.useForm();
    const rowSelectionSpecialties = {
        selectedRowKeySpecialties,
        onChange: (selectedKeys) => {
            setSelectedRowKeySpecialties(selectedKeys);
        },
        type: "checkbox",
    };
    const [paginationSpecialties, setPaginationSpecialties] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const queryGetAllSpecialties = useQuery({
        queryKey: ['getAllSpecialties'],
        queryFn:() => SpecialtyService.getAllSpecialties({ status: 'active', page: 1, limit: 1000 }),
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetAllSpecialtiesByDoctor = useQuery({
        queryKey: ['getSpecialtiesByDoctor', id],
        queryFn: () => DoctorSpecialtyService.getSpecialtiesByDoctor(id),
        enabled: !!id,
    });
    const mutationCreateDoctorSpecialty = useMutation({
        mutationKey: ['createDoctorSpecialty'],
        mutationFn: DoctorSpecialtyService.assignDoctorToSpecialty,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                formCreateDoctorSpecialty.resetFields();
                setIsOpenModalCreateDoctorSpecialty(false);
                queryGetAllSpecialtiesByDoctor.refetch();
            } else {
                Message.error(data.message || "Thêm chuyên khoa thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Thêm chuyên khoa thất bại");
        }
    });
    const mutationDeleteDoctorSpecialty = useMutation({
        mutationKey: ['deleteDoctorSpecialty'],
        mutationFn: DoctorSpecialtyService.removeDoctorFromSpecialty,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setRowSelectedSpecialty(null);
                setIsModalOpenDeleteSpecialty(false);
                queryGetAllSpecialtiesByDoctor.refetch();
            } else {
                Message.error(data.message || "Xoá chuyên khoa thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Xoá chuyên khoa thất bại");
        }
    });
    const mutationUpdateDoctorSpecialty = useMutation({
        mutationKey: ['updateDoctorSpecialty'],
        mutationFn: ({ id, data }) => DoctorSpecialtyService.updateDoctorSpecialty(id, data),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data.message);
                setIsDrawerOpenSpecialty(false);
                setRowSelectedSpecialty(null);
                formUpdateDoctorSpecialty.resetFields();
                queryGetAllSpecialtiesByDoctor.refetch();
            } else {
                Message.error(data.message || "Cập nhật nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Cập nhật nơi làm việc thất bại");
        }
    });
    const { data: doctorSpecialties, isLoading: isLoadingSpecialtiesByDoctor } = queryGetAllSpecialtiesByDoctor;
    const { data: specialties, isLoading: isLoadingSpecialties } = queryGetAllSpecialties;
    const { isPending: isPendingCreateDoctorSpecialty } = mutationCreateDoctorSpecialty;
    const { isPending: isPendingUpdateDoctorSpecialty } = mutationUpdateDoctorSpecialty;
    const { isPending: isPendingDeleteDoctorSpecialty } = mutationDeleteDoctorSpecialty;
    const specialtyData = specialties?.data?.specialties || [];
    const doctorSpecialtyData = doctorSpecialties?.data || [];
    const columnSpecialties = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Chuyên khoa",
            dataIndex: "specialty",
            key: "specialty",
            render: (specialty) => {
                return specialty ? <Text>{specialty}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Kinh nghiệm (năm)",
            dataIndex: "yearsOfExperience",
            key: "yearsOfExperience",
            sorter: (a, b) => a.yearsOfExperience - b.yearsOfExperience,
            render: (yearsOfExperience) => {
                return yearsOfExperience ? <Text>{yearsOfExperience}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Chuyên khoa chính",
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
                            onClick={() => handleEditSpecialty(record.key)}
                        >Sửa</ButtonComponent>
                        <ButtonComponent
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                setIsModalOpenDeleteSpecialty(true);
                            }}
                        >Xoá</ButtonComponent>
                    </Space>
                );
            },
        },
    ];
    const dataTableSpecialties = doctorSpecialtyData?.map((item, index) => {
        return {
            key: item.doctorSpecialtyId,
            index: index + 1,
            specialty: item.specialty?.name,
            yearsOfExperience: item.yearsOfExperience,
            isPrimary: item.isPrimary,
        };
    });
    const handleCreateDoctorSpecialty = () => {
        formCreateDoctorSpecialty.validateFields().then((values) => {
            mutationCreateDoctorSpecialty.mutate({
                ...values,
                doctorId: id
            });
        });
    };
    const handleCloseCreateDoctorSpecialty = () => {
        setIsOpenModalCreateDoctorSpecialty(false);
    };
    const handleEditSpecialty = (key) => {
        const doctorSpecialty = doctorSpecialtyData?.find(sp => sp.doctorSpecialtyId === key);
        if (doctorSpecialty) {
            formUpdateDoctorSpecialty.setFieldsValue({
                specialtyId: doctorSpecialty.specialty?.specialtyId,
                yearsOfExperience: doctorSpecialty.yearsOfExperience,
                isPrimary: doctorSpecialty.isPrimary,
            });
            setIsDrawerOpenSpecialty(true);
        }
    };
    const handleOkDeleteSpecialty = () => {
        mutationDeleteDoctorSpecialty.mutate(rowSelectedSpecialty)
    };
    const handleCancelDeleteSpecialty = () => {
        setIsModalOpenDeleteSpecialty(false);
    };
    const handleOnUpdateDoctorSpecialty = (values) => {
        mutationUpdateDoctorSpecialty.mutate({
            id: rowSelectedSpecialty, data: { ...values, doctorId: id }
        });
    };
    return (
        <Card
            title="Chuyên khoa"
            extra={
                <ButtonComponent
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsOpenModalCreateDoctorSpecialty(true)}
                >Thêm chuyên khoa</ButtonComponent>
            }
            style={{ width: "100%" }}
        >
            <LoadingComponent isLoading={isPendingCreateDoctorSpecialty}>
                <ModalComponent
                    title="Thêm mới chuyên khoa"
                    open={isOpenModalCreateDoctorSpecialty}
                    onOk={handleCreateDoctorSpecialty}
                    onCancel={handleCloseCreateDoctorSpecialty}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDoctorSpecialty"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        initialValues={{ isPrimary: true }}
                        autoComplete="off"
                        form={formCreateDoctorSpecialty}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialtyId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
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
                                options={specialtyData.map((sp) => ({
                                    label: sp.name,
                                    value: sp.specialtyId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Năm kinh nghiệm"
                            name="yearsOfExperience"
                            rules={[

                                () => ({
                                    validator(_, value) {
                                        if (value === undefined) {
                                            return Promise.resolve();
                                        }

                                        if (!Number.isInteger(value) || value < 0) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm phải là số nguyên dương!")
                                            );
                                        }

                                        if (value > 25) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm không được lớn hơn 25!")
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            label="Chuyên khoa chính"
                            name="isPrimary"
                            valuePropName="checked"
                        >
                            <Checkbox></Checkbox>
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá chuyên khoa</span>
                    </span>
                }
                open={isModalOpenDeleteSpecialty}
                onOk={handleOkDeleteSpecialty}
                onCancel={handleCancelDeleteSpecialty}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteDoctorSpecialty}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            chuyên khoa này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <DrawerComponent
                title="Chi tiết chuyên khoa"
                placement="right"
                isOpen={isDrawerOpenSpecialty}
                onClose={() => setIsDrawerOpenSpecialty(false)}
                width={window.innerWidth < 768 ? "100%" : 700}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdateDoctorSpecialty}>

                    <Form
                        name="formUpdateDoctorSpecialty"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        onFinish={handleOnUpdateDoctorSpecialty}
                        form={formUpdateDoctorSpecialty}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialtyId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chuyên khoa",
                                },
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
                                options={specialtyData.map((sp) => ({
                                    label: sp.name,
                                    value: sp.specialtyId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Năm kinh nghiệm"
                            name="yearsOfExperience"
                            rules={[

                                () => ({
                                    validator(_, value) {
                                        if (value === undefined) {
                                            return Promise.resolve();
                                        }

                                        if (!Number.isInteger(value) || value < 0) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm phải là số nguyên dương!")
                                            );
                                        }

                                        if (value > 25) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm không được lớn hơn 25!")
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            label="Chuyên khoa chính"
                            name="isPrimary"
                            valuePropName="checked"
                        >
                            <Checkbox></Checkbox>
                        </Form.Item>
                        <Form.Item
                            label={null}
                            wrapperCol={{ offset: 18, span: 6 }}
                        >
                            <Space>
                                <ButtonComponent
                                    type="default"
                                    onClick={() => setIsDrawerOpenSpecialty(false)}
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
                rowSelection={rowSelectionSpecialties}
                columns={columnSpecialties}
                loading={isLoadingSpecialtiesByDoctor}
                dataSource={dataTableSpecialties}
              
                pagination={paginationSpecialties}
                onChange={(page) => {
                    setPaginationSpecialties(page);
                }}
                onRow={(record) => ({
                    onClick: () => {
                        setRowSelectedSpecialty(record.key);
                    },
                })}
            />
        </Card>
    )
}

export default DoctorSpecialty