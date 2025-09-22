import { FormContainer } from './style.js';
import TabsComponent from '../TabsComponent/TabsComponent.jsx';
import LoadingComponent from '../LoadingComponent/LoadingComponent.jsx';
import ButtonComponent from '../ButtonComponent/ButtonComponent.jsx';
import { Form, Input, Checkbox } from 'antd';
import { MailOutlined, LockOutlined, PhoneOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';

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
  const identifier = Form.useWatch("identifier", formAuth);
  const password = Form.useWatch("password", formAuth);

  const handleSubmitForm = (values) => {
    const data = {
      identifier: values.identifier, // email hoặc phone
      password: values.password,
      confirmPassword: values.confirmPassword,
    };
    onSubmit(data);
  };

  return (
    <FormContainer>
      <TabsComponent
        items={items}
        onChange={onChangeForm}
        defaultActiveKey="2"
        activeKey={isRegister ? "2" : "1"}
        style={{ width: "100%" }}
      />

      <Form
        name="formAuth"
        form={formAuth}
        layout="vertical"
        initialValues={{
          identifier: localStorage.getItem("identifier") || "",
          remember: true,
        }}
        onFinish={handleSubmitForm}
        autoComplete="on"
      >
        {/* Email hoặc Phone */}
        <Form.Item
          label="Email hoặc Số điện thoại"
          name="identifier"
          hasFeedback
          rules={[
            {
              required: true,
              message: "* Vui lòng nhập email hoặc số điện thoại!",
            },
          ]}
        >
          <Input
            placeholder="Nhập email hoặc số điện thoại"
            autoComplete="username"
            prefix={<MailOutlined />}
          />
        </Form.Item>

        {/* Password */}
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
              message: "* Mật khẩu không được vượt quá 20 ký tự!",
            },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
              message: "* Mật khẩu phải có ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt!",
            },
          ]}
        >
          <Input.Password
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="Password"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        {/* Confirm password (chỉ khi đăng ký) */}
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
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
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

        {/* Remember me (chỉ khi login) */}
        {!isRegister && (
          <Form.Item>
            <Form.Item
              name="remember"
              valuePropName="checked"
              noStyle
            >
              <Checkbox>Ghi nhớ tôi</Checkbox>
            </Form.Item>
            <span
              style={{ float: "right", color: "#1890ff", cursor: "pointer" }}
              onClick={() => alert("Chức năng quên mật khẩu chưa có 😅")}
            >
              Quên mật khẩu?
            </span>
          </Form.Item>
        )}

        {/* Submit */}
        <LoadingComponent isLoading={isPending}>
          <Form.Item shouldUpdate>
            <ButtonComponent
              type="primary"
              htmlType="submit"
              size="large"
              disabled={!identifier || !password}
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

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
        <p style={{ margin: '0 10px', whiteSpace: 'nowrap', color: "#666" }}>Hoặc tiếp tục bằng</p>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
      </div>

      {/* Social login */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
        <ButtonComponent
          icon={<GoogleOutlined />}
          size="large"
          styleButton={{ flex: 1, backgroundColor: "#db4437", color: "#fff" }}
        >
          Google
        </ButtonComponent>
        <ButtonComponent
          icon={<FacebookOutlined />}
          size="large"
          styleButton={{ flex: 1, backgroundColor: "#3b5998", color: "#fff" }}
        >
          Facebook
        </ButtonComponent>
      </div>
    </FormContainer>
  );
};

export default FormAuth;
