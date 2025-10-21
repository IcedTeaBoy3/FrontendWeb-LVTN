
import { Card, Form, Input, Button, Upload,Avatar, Row, Col } from "antd";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { updateUser, logout} from "@/redux/slices/authSlice";
import { UploadOutlined, UserOutlined,LockOutlined  } from "@ant-design/icons";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import * as Message from "@/components/Message/Message";
import { AccountService } from "@/services/AccountService";
import { AuthService } from "@/services/AuthService";
const PersonInfo = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [formPassword] = Form.useForm();
    const user = useSelector((state) => state.auth.user);
    const [avatarUrl, setAvatarUrl] = useState(`${import.meta.env.VITE_APP_BACKEND_URL}${user?.avatar}` || null);
    const dispatch = useDispatch();
    const handleAvatarChange = (info) => {
        const fileList = info?.fileList || [];
        const file = fileList[0]?.originFileObj;

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarUrl(previewUrl);
        }

        // Gán lại toàn bộ fileList (đúng format mà Form.Item mong đợi)
        form.setFieldValue("avatar", fileList);
    };
    const handleChangePassword = (values) => {
        mutationChangePassword.mutate(values);
    };

    const handleUpdateInfo = (values) => {
        const formData = new FormData();
        formData.append("userName", values.userName);
        formData.append("email", values.email);
        formData.append("phone", values.phone);
        const file = values.avatar && values.avatar[0]?.originFileObj;
        if (file) {
            formData.append("avatar", file);
        }
        mutationUpdateAccount.mutate(formData);
    };
    const mutationUpdateAccount = useMutation({
        mutationKey: ["update-account"],
        mutationFn: (data) => AccountService.updateAccount(user.accountId, data),
        onSuccess: (data) => {
            if(data?.status === 'success') {
                Message.success(data?.message || "Cập nhật tài khoản thành công");
                dispatch(updateUser(data?.data));
            }else {
                Message.error(data?.message || "Cập nhật tài khoản thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Cập nhật tài khoản thất bại");
        },
    });
    const mutationChangePassword = useMutation({
        mutationKey: ["change-password"],
        mutationFn: (data) => AuthService.changePassword(data),
        onSuccess: (data) => {
            if(data?.status === 'success') {
                Message.success(data?.message || "Cập nhật mật khẩu thành công");
                formPassword.resetFields();
                handleLogoutUser();
            }else {
                Message.error(data?.message || "Cập nhật mật khẩu thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Cập nhật mật khẩu thất bại");
        }
    });
    const handleLogoutUser = async () => {
        // Xử lý đăng xuất ở đây
        const res = await AuthService.logout();
        if (res?.status == "success") {
            dispatch(logout());
            navigate("/");
        } else {
            Message.error("Đăng xuất thất bại");
        }
    };
    return (
        <Row gutter={[16, 16]}>
            <Col span={12}>
                <LoadingComponent isLoading={mutationUpdateAccount.isPending}>
                    <Card
                        title="Cập nhật thông tin tài khoản"
                        style={{ margin: "0 auto", borderRadius: 12 }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{ userName: user?.userName, email: user?.email, phone: user?.phone }}
                            onFinish={handleUpdateInfo}
                        >
                            <Row gutter={24} align="top">
                                <Col span={8} style={{ textAlign: "center" }}>
                                    <Avatar
                                        size={120}
                                        src={avatarUrl}
                                        icon={<UserOutlined />}
                                        style={{ marginBottom: 16 }}
                                    />

                                    <Form.Item
                                        name="avatar"
                                        valuePropName="fileList"
                                        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Upload
                                            showUploadList={false}
                                            beforeUpload={() => false}
                                            onChange={handleAvatarChange}
                                            maxCount={1}
                                            accept=".jpg,.jpeg,.png,.gif,.webp"
                                        >
                                        <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
                                        </Upload>
                                    </Form.Item>
                                </Col>

                                <Col span={16}>
                                    <Form.Item
                                        label="Tên người dùng"
                                        name="userName"
                                    
                                    >
                                    <Input placeholder="Nhập tên hiển thị..." />
                                    </Form.Item>

                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            {
                                                type: "email",
                                                message: "Email không hợp lệ!",
                                            },
                                            {
                                                required: true,
                                                message: "Vui lòng nhập email!",
                                            }
                                        ]}
                                    >
                                        <Input placeholder="Nhập email..." />
                                    </Form.Item>

                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                        rules={[
                                            {
                                                pattern: /^[0-9]{9,11}$/,
                                                message: "Số điện thoại không hợp lệ!",
                                            },
                                            {
                                                required: true,
                                                message: "Vui lòng nhập số điện thoại!",
                                            }
                                        ]}
                                    >
                                        <Input placeholder="Nhập số điện thoại..." />
                                    </Form.Item>

                                    <Form.Item>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                        <Button onClick={() => form.resetFields()}>Đặt lại</Button>
                                        <Button type="primary" htmlType="submit">
                                            Lưu thay đổi
                                        </Button>
                                    </div>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </LoadingComponent>
            </Col>
            <Col span={12}>
                <LoadingComponent isLoading={mutationChangePassword.isPending}>
                    <Card title="Đổi mật khẩu" style={{ borderRadius: 12 }}>
                        <Form
                        form={formPassword}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        >
                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu hiện tại..." prefix={<LockOutlined />} />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                {
                                    required: true,
                                    message: "* Vui lòng nhập mật khẩu!",
                                },
                                {
                                    min: 6,
                                    message: "* Mật khẩu phải có ít nhất 6 ký tự!",
                                },
                                {
                                    max: 20,
                                    message: "* Mật khẩu không được vượt quá 20 ký tự!",
                                },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                                    message: "* Mật khẩu phải có ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt!",
                                },
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu mới..." prefix={<LockOutlined />} />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={["newPassword"]}
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Mật khẩu xác nhận không khớp!");
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Nhập lại mật khẩu mới..." prefix={<LockOutlined />} />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button type="primary" htmlType="submit">
                                Cập nhật mật khẩu
                            </Button>
                            </div>
                        </Form.Item>
                        </Form>
                    </Card>
                </LoadingComponent>
            </Col>
        </Row>
    );
}

export default PersonInfo