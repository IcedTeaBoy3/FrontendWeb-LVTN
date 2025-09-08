import { Form, Input, Button, Upload, Card, Row, Col, Select, Typography, Divider } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { StyledCard } from "./style";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const ClinicPage = () => {
    const [formUpdate] = Form.useForm();
    const handleUpdateClinic = (values) => { }
    return (
        <>
            <Title level={4} >
                Thông tin phòng khám
            </Title>
            <Divider style={{ margin: "20px 0" }} />
            <Form
                form={formUpdate}
                layout="vertical"
                onFinish={handleUpdateClinic}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 18 }}
                initialValues={{
                    name: "",
                    description: "",
                    address: "",
                    phone: "",
                    email: "",
                    website: "",
                    workingHours: "",
                    services: [],
                }}
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
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả" />
                    </Form.Item>

                    <Form.Item label="Ảnh đại diện" name="image">
                        <Upload listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
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
                            <Form.Item label="Giờ làm việc" name="workingHours">
                                <Input placeholder="Ví dụ: Thứ 2 - Thứ 6: 7:00 - 17:00" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Dịch vụ nổi bật" name="services">
                                <Select mode="multiple" placeholder="Chọn dịch vụ">
                                    <Option value="kham-noi">Khám nội</Option>
                                    <Option value="kham-ngoai">Khám ngoại</Option>
                                    <Option value="xet-nghiem">Xét nghiệm</Option>
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



        </>
    )
}

export default ClinicPage