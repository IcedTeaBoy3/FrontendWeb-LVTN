import { FormContainer } from './style.js';
import TabsComponent from '../TabsComponent/TabsComponent.jsx';
import LoadingComponent from '../LoadingComponent/LoadingComponent.jsx';
import ButtonComponent from '../ButtonComponent/ButtonComponent.jsx';
import { Form, Input, Checkbox } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
const items = [
    {
        key: "1",
        label: "Đăng nhập",
    },
    {
        key: "2",
        label: "Đăng ký",
    },
];
const FormAuth = ({ isRegister, onSubmit, onChangeForm, isPending }) => {
    const [formAuth] = Form.useForm();
    const email = Form.useWatch("email", formAuth);
    const password = Form.useWatch("password", formAuth);
    const onChange = () => {
        onChangeForm();
    };
    const handleSubmitForm = (values) => {
        if (values.remember) {
            localStorage.setItem("email", values.email);
        } else {
            localStorage.removeItem("email");
        }
        const data = {
            email: values.email,
            password: values.password,
            confirmPassword: values.confirmPassword,
        }
        onSubmit(data);
    }
    return (
        <FormContainer>
            <TabsComponent
                items={items}
                onChange={onChange}
                defaultActiveKey="2"
                activeKey={isRegister ? "2" : "1"}
                style={{ width: "100%" }}
            />
            <Form
                name="formAuth"
                form={formAuth}
                layout="vertical"
                initialValues={{
                    email: localStorage.getItem("email") || "",
                    remember: true,
                }}
                onFinish={handleSubmitForm}
                autoComplete="on"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: "* Vui lòng nhập email!",
                        },
                        {
                            type: "email",
                            message: "* Email không hợp lệ!",
                        },
                    ]}
                >
                    <Input placeholder="Email" autoComplete="username" prefix={<MailOutlined />} />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    hasFeedback
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
                            message: "* Mật khẩu không được quá 20 ký tự!",
                        },
                        {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                            message:
                                "* Mật khẩu phải có ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt!",
                        },
                    ]}
                >
                    <Input.Password
                        autoComplete={isRegister ? "new-password" : "current-password"}
                        placeholder="Password"
                        prefix={<LockOutlined />}
                    />
                </Form.Item>
                {isRegister && (
                    <Form.Item
                        label="Nhập lại mật khẩu"
                        name="confirmPassword"
                        dependencies={["password"]}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: "* Vui lòng nhập lại mật khẩu!",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("password") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Mật khẩu không khớp!"),
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Nhập lại mật khẩu"
                            prefix={<LockOutlined />}
                            autoComplete="new-password"
                        />
                    </Form.Item>
                )}
                {!isRegister && (
                    <Form.Item>
                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            noStyle
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value
                                            ? Promise.resolve()
                                            : Promise.reject(new Error("* Vui lòng đồng ý với điều khoản!")),
                                },
                            ]}
                        >
                            <Checkbox>Ghi nhớ tôi</Checkbox>
                        </Form.Item>

                        <span style={{ float: "right", color: "#1890ff" }} onClick={() => { }}>
                            Quên mật khẩu?
                        </span>
                    </Form.Item>
                )}
                <LoadingComponent isLoading={isPending} >

                    <Form.Item shouldUpdate>
                        <ButtonComponent
                            type="primary"
                            htmlType="submit"
                            size="large"
                            disabled={!email || !password}
                            styleButton={{
                                width: "100%",
                                backgroundColor: "#1890ff",
                                fontWeight: 500,
                            }}
                        >
                            {isRegister ? "Đăng ký" : "Đăng nhập"}
                        </ButtonComponent>
                    </Form.Item>
                </LoadingComponent>
            </Form>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
                <p style={{ margin: '0 10px', whiteSpace: 'nowrap' }}>Hoặc tiếp tục bằng</p>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
            </div>
        </FormContainer>
    )
}

export default FormAuth