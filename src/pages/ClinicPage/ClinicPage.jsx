import { Form, Input, Button, Upload, Card, Row, Col, Select, Typography, Divider } from "antd";
import * as Message from '@/components/Message/Message';
import { useMutation, useQuery } from "@tanstack/react-query";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { ClinicService } from "@/services/ClinicService";
import { ServiceService } from "@/services/ServiceService";
import { StyledCard } from "./style";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import CKEditorComponent from "@/components/CKEditorComponent/CKEditorComponent";
import { useState} from "react";
const { Title } = Typography;

const ClinicPage = () => {
    const [formUpdate] = Form.useForm();
    const [editorData, setEditorData] = useState("");
    const mutationUpdateClinic = useMutation({
        mutationKey: ['updateClinic'],
        mutationFn: (formData) => ClinicService.updateClinic(formData),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success("Cập nhật thông tin phòng khám thành công");
                queryGetClinic.refetch();
            } else {
                Message.error(data?.message || "Cập nhật thông tin phòng khám thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật thông tin phòng khám thất bại");
        }
    });
    const queryGetClinic = useQuery({
        queryKey: ['getClinic'],
        queryFn: ClinicService.getClinic,
    });
    const queryGetAllServices = useQuery({
        queryKey: ['getAllServices'],
        queryFn: ServiceService.getAllServices,
        retry: 1,
    });
    const { isPending: isPendingUpdate } = mutationUpdateClinic;
    const { isLoading: isLoadingGetClinic, data: clinic } = queryGetClinic;
    const { isLoading: isLoadingGetAllServices, data: services } = queryGetAllServices;
    const serviceData = services?.data?.services || [];
    const clinicData = clinic?.data || {};
    useEffect(() => {
        if (clinicData) {
            formUpdate.setFieldsValue({
                name: clinicData.name,
                criteria: clinicData.criteria,
                
                address: clinicData.address,
                phone: clinicData.phone,
                email: clinicData.email,
                website: clinicData.website,
                workHours: clinicData.workHours,
                services: clinicData.services,
                images: (clinicData.images || []).map((url, index) => ({
                    uid: -index - 1,
                    name: url,
                    status: 'done',
                    url: `${import.meta.env.VITE_APP_BACKEND_URL}${url}`,
                }))
            });
            setEditorData(clinicData.description || ""); // Cập nhật dữ liệu mô tả vào state
        }
    }, [clinicData]);

    const handleUpdateClinic = (values) => {
        const formData = new FormData();
        values.images.forEach((file) => {
            if (file.originFileObj) {
                // ảnh mới upload
                formData.append("images", file.originFileObj);
            } else if (file.url) {
                // ảnh cũ → gửi url để backend giữ lại
                // loại bỏ phần domain để backend lưu đường dẫn tương đối
                const oldImagePath = file.url.replace(import.meta.env.VITE_APP_BACKEND_URL, '');
                formData.append("oldImages", oldImagePath);
            }
        });
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("address", values.address);
        formData.append("phone", values.phone);
        formData.append("email", values.email || "");
        formData.append("criteria",values.criteria || "");
        formData.append("website", values.website || "");
        formData.append("workHours", values.workHours || "");
        formData.append("services", JSON.stringify(values.services || []));
        mutationUpdateClinic.mutate(formData);
    }
    return (
        <>
            <Title level={4} >
                Thông tin phòng khám
            </Title>
            <Divider style={{ margin: "20px 0" }} />
            <LoadingComponent isLoading={isLoadingGetClinic || isPendingUpdate}>

                <Form
                    form={formUpdate}
                    layout="vertical"
                    onFinish={handleUpdateClinic}
                    style={{ maxWidth: 1000 }}
                    scrollToFirstError={{ behavior: "smooth" }}
                >
                    {/* Thông tin cơ bản */}
                    <StyledCard
                        title="Thông tin cơ bản"
                        style={{ marginBottom: 20 }}
                        hoverable={true}
                    >
                        <Form.Item
                            label="Tên phòng khám"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên phòng khám" }]}
                        >
                            <Input placeholder="Nhập tên phòng khám" />
                        </Form.Item>
                        <Form.Item
                            label="Phương châm"
                            name="criteria"

                        >
                            <Input placeholder="Nhập phương châm" />
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                        >
                            <CKEditorComponent
                                editorData={editorData}
                                onChange={(data) => formUpdate.setFieldsValue({ description: data })}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Ảnh phòng khám"
                            name="images"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) {
                                    return e;
                                }
                                return e?.fileList || [];
                            }}
                            rules={[
                                {
                                    validator: (_, value) => {

                                        if (value.length > 5) {
                                            return Promise.reject(new Error("Chỉ được chọn tối đa 5 ảnh"));
                                        }

                                        // kiểm tra dung lượng khi submit
                                        const tooLarge = value.some(
                                            (file) => file.originFileObj && file.originFileObj.size > 2 * 1024 * 1024
                                        );
                                        if (tooLarge) {
                                            return Promise.reject(new Error("Mỗi ảnh phải nhỏ hơn 2MB"));
                                        }

                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            extra="Chọn ảnh phòng khám (jpg, jpeg, png, gif, webp) tối đa 5 ảnh, dung lượng ≤ 2MB/ảnh"
                        >
                            <Upload
                                listType="picture-card"
                                multiple
                                maxCount={5}
                                accept=".jpg, .jpeg, .png, .gif, .webp"
                                beforeUpload={(file, fileList) => {
                                    // kiểm tra định dạng
                                    const isValidType = [
                                        "image/jpeg",
                                        "image/png",
                                        "image/jpg",
                                        "image/gif",
                                        "image/webp",
                                    ].includes(file.type);
                                    if (!isValidType) {
                                        Message.error("Chỉ được chọn file ảnh (jpg, jpeg, png, gif, webp)!");
                                        return Upload.LIST_IGNORE;
                                    }

                                    // kiểm tra dung lượng
                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                    if (!isLt2M) {
                                        Message.error("Ảnh phải nhỏ hơn 2MB!");
                                        return Upload.LIST_IGNORE;
                                    }

                                    // kiểm tra số lượng
                                    if (fileList.length > 5) {
                                        Message.error("Bạn chỉ được chọn tối đa 5 ảnh!");
                                        return Upload.LIST_IGNORE;
                                    }

                                    return false; // chặn upload tự động
                                }}


                            >
                                <Button type="dashed" icon={<UploadOutlined />}></Button>
                            </Upload>
                        </Form.Item>
                    </StyledCard>
                    {/* Địa chỉ & Liên hệ */}
                    <StyledCard title="Địa chỉ & Liên hệ" style={{ marginBottom: 20 }} hoverable={true}>
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="phone"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số điện thoại" },
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Email" name="email">
                                    <Input type="email" placeholder="Nhập email" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Website" name="website">
                            <Input type="url" placeholder="Nhập website" />
                        </Form.Item>
                    </StyledCard>
                    {/* Thông tin khác */}
                    <StyledCard title="Thông tin khác" style={{ marginBottom: 20 }} hoverable={true}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Giờ làm việc" name="workHours">
                                    <Input.TextArea rows={3} placeholder="Ví dụ: Thứ 2 - Thứ 6: 8h - 17h, Thứ 7 - Chủ nhật: 8h - 12h" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Dịch vụ nổi bật" name="services">
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn dịch vụ"
                                        loading={isLoadingGetAllServices}
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                        }
                                        style={{ width: '100%' }}
                                        options={serviceData.map((service) => ({
                                            label: service.name,
                                            value: service.serviceId,
                                        }))}
                                    >
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </StyledCard>

                    {/* Buttons */}
                    <Form.Item style={{ textAlign: "right" }}>
                        <Button style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form >
            </LoadingComponent>
        </>
    )
}

export default ClinicPage