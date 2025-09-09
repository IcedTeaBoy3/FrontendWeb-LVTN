import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Form, Input, Row, Col, Typography, Select, DatePicker, Radio, Space, Divider, Card, Upload } from "antd";
import { DegreeService } from '@/services/DegreeService'
import { DoctorService } from '@/services/DoctorService'
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import ModalComponent from '@/components/ModalComponent/ModalComponent'
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent'
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent'
import * as Message from '@/components/Message/Message'
import dayjs from 'dayjs';

const { Title } = Typography;
const InfoDoctor = ({ id }) => {
    const [formUpdateDoctor] = Form.useForm();
    const [formCreateDegree] = Form.useForm();
    const [isOpenModalCreateDegree, setIsOpenModalCreateDegree] = useState(false);

    const queryGetAllDegrees = useQuery({
        queryKey: ['getAllDegrees'],
        queryFn: DegreeService.getAllDegrees,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetDoctor = useQuery({
        queryKey: ['doctorDetail', id],
        queryFn: () => DoctorService.getDoctor(id),
        enabled: !!id,
    });
    const mutationCreateDegree = useMutation({
        mutationKey: ['createDegree'],
        mutationFn: DegreeService.createDegree,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                formCreateDegree.resetFields();
                formUpdateDoctor.setFieldValue("degreeId", data?.data?.degreeId);
                setIsOpenModalCreateDegree(false);
                queryGetAllDegrees.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Thêm bằng cấp thất bại. Vui lòng thử lại!");
        },
    });
    const mutationUpdateDoctor = useMutation({
        mutationKey: ['updateDoctor'],
        mutationFn: ({ id, formData }) => DoctorService.updateDoctor(id, formData),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                queryGetDoctor.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật bác sĩ thất bại. Vui lòng thử lại!");
        },
    });
    const { data: doctor, isLoading: isLoadingDoctor } = queryGetDoctor;
    const { data: degrees, isLoading: isLoadingDegrees } = queryGetAllDegrees;
    const { isPending: isPendingCreateDegree } = mutationCreateDegree;
    const degreeData = degrees?.data?.degrees || [];
    const doctorData = useMemo(() => doctor?.data || {}, [doctor]);
    useEffect(() => {
        if (doctorData) {
            formUpdateDoctor.setFieldsValue({
                email: doctorData?.user?.email,
                phone: doctorData?.user?.phone,
                name: doctorData?.user?.name,
                degreeId: doctorData?.degree?.degreeId, // hoặc doctorData.degree?.degreeId
                bio: doctorData?.bio,
                dateOfBirth: doctorData?.user?.dateOfBirth
                    ? dayjs(doctorData?.user?.dateOfBirth)
                    : null,
                gender: doctorData?.user?.gender,
                address: doctorData?.user?.address,
                avatar:
                    [
                        {
                            uid: '-1',
                            name: doctorData?.user?.avatar,
                            status: 'done',
                            url: `${import.meta.env.VITE_APP_BACKEND_URL}${doctorData?.user?.avatar}`,
                        },
                    ],
            });
        }
    }, [doctorData, formUpdateDoctor]);
    const handleOnUpdateDoctor = (values) => {
        const formData = new FormData();
        const fileObj = values.avatar?.[0]?.originFileObj;
        if (fileObj instanceof File) {
            formData.append("avatar", fileObj);
        } else if (values.avatar?.[0]?.url) {
            const avatarUrl = values.avatar[0].url;
            const imageName = avatarUrl.replace(import.meta.env.VITE_APP_BACKEND_URL, ""); // Lấy lại phần tên file
            formData.append("oldImage", imageName);
        } else {
            // Không có ảnh và cũng không dùng ảnh cũ → đã xoá
            formData.append("isImageDeleted", true);
        }
        // --- Các field khác ---
        const dataToAppend = {
            email: values.email,
            phone: values.phone,
            password: values.password, // chỉ append nếu có
            name: values.name,
            degreeId: values.degreeId,
            dateOfBirth: values.dateOfBirth
                ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
                : null,
            gender: values.gender,
            address: values.address,
            bio: values.bio,
        };

        Object.entries(dataToAppend).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "undefined" && value !== "null") {
                formData.append(key, value);
            }
        });
        mutationUpdateDoctor.mutate({ id, formData });
    };
    const handleCreateDegree = () => {
        formCreateDegree.validateFields().then((values) => {
            mutationCreateDegree.mutate(values);
        });
    };
    const handleCloseCreateDegree = () => {
        setIsOpenModalCreateDegree(false);
    };
    const handleCancelUpdateDoctor = () => {
        formUpdateDoctor.resetFields();
    };
    return (
        <>
            <Card>

                <LoadingComponent isLoading={isLoadingDoctor}>

                    <Form
                        form={formUpdateDoctor}
                        layout='vertical'
                        name="formUpdateDoctor"
                        labelCol={{ span: 8 }}
                        onFinish={handleOnUpdateDoctor}
                    >
                        <Row gutter={32}>
                            {/* Thông tin tài khoản */}
                            <Col span={12}>
                                <Title level={5}>Thông tin tài khoản</Title>

                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { type: "email", message: "Email không hợp lệ" },
                                        { required: true, message: "Vui lòng nhập email" }]}
                                >
                                    <Input placeholder="Nhập email" />
                                </Form.Item>

                                <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>

                                <Form.Item label="Mật khẩu" name="password">
                                    <Input.Password placeholder="Để trống nếu không đổi mật khẩu" />
                                </Form.Item>
                            </Col>

                            {/* Thông tin cá nhân */}
                            <Col span={12}>
                                <Title level={5}>Thông tin cá nhân</Title>
                                <Form.Item
                                    label="Ảnh đại diện"
                                    name="avatar"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
                                    initialValue={[]}
                                    extra="Chọn ảnh đại diện (jpg, jpeg, png, gif, webp) tối đa 1 file"
                                >
                                    <Upload
                                        beforeUpload={() => false}
                                        maxCount={1}
                                        accept=".jpg, .jpeg, .png, .gif, .webp"
                                        onRemove={() => formUpdateDoctor.setFieldsValue({ avatar: [] })}
                                        fileList={formUpdateDoctor.getFieldValue("avatar") || []}
                                        listType="picture-card"

                                    >
                                        <ButtonComponent icon={<UploadOutlined />}>
                                            Chọn file
                                        </ButtonComponent>
                                    </Upload>

                                </Form.Item>
                                <Form.Item
                                    label="Họ tên"
                                    name="name"
                                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                >
                                    <Input placeholder="Nhập họ tên" />
                                </Form.Item>

                                <Form.Item
                                    label="Bằng cấp"
                                    name="degreeId"
                                    rules={[{ required: true, message: "Vui lòng chọn bằng cấp" }]}
                                >
                                    <Select
                                        name="degreeId"
                                        placeholder="Chọn bằng cấp"
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                        }
                                        popupRender={menu => (
                                            <LoadingComponent isLoading={isLoadingDegrees}>
                                                {menu}
                                                <Divider style={{ margin: '4px 0' }} />
                                                <div
                                                    style={{
                                                        padding: '8px',
                                                        color: '#1890ff',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => setIsOpenModalCreateDegree(true)}
                                                >
                                                    <PlusOutlined /> Thêm bằng cấp mới
                                                </div>
                                            </LoadingComponent>
                                        )}
                                        options={degreeData?.map(degree => ({
                                            label: degree.title,
                                            value: degree.degreeId
                                        }))}

                                    />
                                </Form.Item>

                                <Form.Item label="Tiểu sử" name="bio">
                                    <Input.TextArea rows={4} placeholder="Nhập tiểu sử" />
                                </Form.Item>

                                <Form.Item label="Ngày sinh" name="dateOfBirth">
                                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                                </Form.Item>

                                <Form.Item label="Giới tính" name="gender">
                                    <Radio.Group name="gender">
                                        <Radio value="male">Nam</Radio>
                                        <Radio value="female">Nữ</Radio>
                                        <Radio value="other">Khác</Radio>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item label="Địa chỉ" name="address">
                                    <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24} style={{ textAlign: "right" }}>

                                <Space>
                                    <ButtonComponent
                                        type="default"
                                        onClick={handleCancelUpdateDoctor}
                                    >
                                        Huỷ
                                    </ButtonComponent>
                                    <ButtonComponent
                                        type="primary"
                                        htmlType="submit"
                                    >
                                        Lưu thay đổi
                                    </ButtonComponent>
                                </Space>
                            </Col>
                        </Row>
                    </Form>
                </LoadingComponent>
            </Card>
            <LoadingComponent isLoading={isPendingCreateDegree}>
                <ModalComponent
                    title="Thêm mới bằng cấp"
                    open={isOpenModalCreateDegree}
                    onOk={handleCreateDegree}
                    onCancel={handleCloseCreateDegree}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDegree"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        form={formCreateDegree}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Tên bằng cấp"
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
                                placeholder="Nhập vào tên bằng cấp"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Viết tắt"
                            name="abbreviation"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên viết tắt!",
                                },
                            ]}
                        >
                            <Input
                                name="abbreviation"
                                placeholder="Nhập vào tên viết tắt"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="description"

                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Nhập mô tả chi tiết tại đây..."
                            />
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
        </>
    )
}

export default InfoDoctor