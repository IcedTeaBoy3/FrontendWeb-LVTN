
import { useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { PopupItem } from "./style";
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent';
import * as Message from '@/components/Message/Message';
import { AuthService } from '@/services/AuthService';
import {
    Layout,
    Menu,
    Breadcrumb,
    theme,
    Badge,
    Popover,
    Grid,
    Image,
    Typography,
} from "antd";
import {
    DashboardOutlined,
    CalendarOutlined,
    TeamOutlined,
    LogoutOutlined,
    UserOutlined,
    BellOutlined,
    InfoCircleFilled,
    SettingFilled,
    MedicineBoxOutlined,
    SolutionOutlined,
    FileTextOutlined,
    AppstoreOutlined
} from "@ant-design/icons";
const menuItems = [
    {
        key: "/admin/dashboard",
        icon: <DashboardOutlined />,
        label: "Thống kê",
    },
    {
        key: "/admin/accounts",
        icon: <UserOutlined />,
        label: "Tài khoản",
    },
    {
        icon: <SolutionOutlined />,
        label: "Bác sĩ",
        children: [
            { key: "/admin/doctors", label: "Danh sách bác sĩ" },
            { key: "/admin/schedules", label: "Lịch làm việc" },
            { key: "/admin/shifts", label: "Ca làm việc" },
            {
                label: "Danh mục dùng chung",
                children: [
                    { key: "/admin/specialties", label: "Chuyên khoa" },
                    { key: "/admin/degrees", label: "Học vị" },
                    { key: "/admin/positions", label: "Chức vụ" },
                    { key: "/admin/workplaces", label: "Nơi làm việc" },
                ],
            },
        ],
    },
    {
        key: "/admin/clinics",
        icon: <MedicineBoxOutlined />,
        label: "Phòng khám",
    },
    {
        key: "/admin/services",
        icon: <AppstoreOutlined />,
        label: "Dịch vụ",
    },
    {
        key: "/admin/appointments",
        icon: <CalendarOutlined />,
        label: "Lịch hẹn",
    },
    {
        key: "/admin/medical-records",
        icon: <FileTextOutlined />,
        label: "Hồ sơ bệnh án",
    },
    {
        key: "/logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
    },
];


const { Header, Sider, Content, Footer } = Layout;
const { Text, Paragraph } = Typography;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const user = useSelector((state) => state.auth.user);
    const [isOpenPopupUser, setIsOpenPopupUser] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleLogoutUser = async () => {
        // Xử lý đăng xuất ở đây
        const res = await AuthService.logout();
        if (res?.status == "success") {
            dispatch(logout());
            Message.success("Đăng xuất thành công");
            navigate("/");
        } else {
            Message.error("Đăng xuất thất bại");
        }
    };
    const breadcrumbNameMap = {
        "/admin": "Quản trị",
        "/admin/accounts": "Tài khoản",
        "/admin/workplaces": "Nơi làm việc",
        "/admin/positions": "Chức vụ",
        "/admin/degrees": "Học vị",
        "/admin/dashboard": "Thống kê",
        "/admin/appointments": "Lịch hẹn",
        "/admin/doctors": "Bác sĩ",
        "/admin/doctors/:id": "Chi tiết bác sĩ",
        "/admin/schedules/:id": "Chi tiết lịch làm việc",
        "/admin/hospitals": "Bệnh viện",
        "/admin/specialties": "Chuyên khoa",
        "/admin/patients": "Người dùng",
        "/admin/schedules": "Lịch làm việc",
        "/admin/shifts": "Ca làm việc",
        "/admin/medical-records": "Hồ sơ bệnh án",
        "/admin/clinics": "Phòng khám",
        "/admin/services": "Dịch vụ",
    };

    const pathSnippets = location.pathname.split("/").filter((i) => i);

    const breadcrumbItems = [
        {
            title: "Trang chủ",
            key: "home",
        },
        ...pathSnippets.map((_, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;

            // Nếu URL match với pattern /admin/doctor/:id
            let title = breadcrumbNameMap[url];
            if (!title && /^\/admin\/doctors\/[^/]+$/.test(url)) {
                title = breadcrumbNameMap["/admin/doctors/:id"];
            }
            if (!title && /^\/admin\/schedules\/[^/]+$/.test(url)) {
                title = breadcrumbNameMap["/admin/schedules/:id"];
            }

            return {
                title: title || url,
                key: url,
            };
        }),
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const content = useMemo(
        () => (
            <>
                <PopupItem onClick={() => navigate("/profile")}>
                    <InfoCircleFilled
                        style={{ fontSize: "15px", marginRight: "8px" }}
                    />
                    Thông tin người dùng
                </PopupItem>
                {user?.role === "admin" && (
                    <PopupItem
                        $isSelected={location.pathname.includes("admin")}
                        onClick={() => navigate("/admin")}
                    >
                        <SettingFilled
                            style={{ fontSize: "15px", marginRight: "8px" }}
                        />
                        Quản lý hệ thống
                    </PopupItem>
                )}
                <PopupItem onClick={handleLogoutUser}>
                    <LogoutOutlined
                        style={{ fontSize: "15px", marginRight: "8px" }}
                    />
                    Đăng xuất
                </PopupItem>
            </>
        ),
        [user?.role],
    );
    const handleMenuClick = ({ key }) => {
        navigate(key);
    };
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                breakpoint="lg"
                collapsible
                collapsed={collapsed}
                collapsedWidth={0} // Ẩn hoàn toàn khi nhỏ hơn lg
                onCollapse={(collapsed) => setCollapsed(collapsed)}
                style={{
                    backgroundColor: "#fff",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16, // Khoảng cách giữa logo và tên
                        padding: "5px 0px",
                        borderRadius: 8,
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/")}
                >
                    <Image
                        width={55}
                        src={`${import.meta.env.VITE_APP_FRONTEND_URL}/mylogo.webp`}
                        preview={false}
                        style={{
                            borderRadius: "50%",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                        alt="Logo Medicare"
                    />
                    <Paragraph
                        style={{
                            margin: 0,
                            fontSize: 22,
                            fontWeight: 'bolder',
                            color: "#1890ff",
                        }}
                    >
                        Medicare
                    </Paragraph>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    onClick={handleMenuClick}
                    defaultSelectedKeys={["/admin/dashboard"]}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: "rgb(25 117 220)",
                        padding: 0,
                        textAlign: "right",
                        paddingRight: 20,
                        borderBottom: "1px solid #e8e8e8",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        position: "sticky",
                        top: 0,
                        zIndex: 1000,
                    }}
                >
                    {screens.md && (
                        <ButtonComponent
                            type="default"
                            icon={
                                <Badge count={1}>
                                    <BellOutlined
                                        style={{ fontSize: "20px" }}
                                    />
                                </Badge>
                            }
                            styleButton={{
                                marginRight: "16px",
                            }}
                        />
                    )}

                    {user?.accessToken && (
                        <Popover
                            content={content}
                            open={isOpenPopupUser}
                            onOpenChange={(visible) =>
                                setIsOpenPopupUser(visible)
                            }
                            placement="bottomRight"
                        >
                            <ButtonComponent
                                type="default"
                                size="middle"
                                styleButton={{

                                    marginRight: "16px",
                                }}
                                icon={<UserOutlined />}
                                onClick={() => navigate("/profile")}
                            >
                                {user?.name ||
                                    user?.email ||
                                    "Xin chào, Admin!"}
                            </ButtonComponent>
                        </Popover>
                    )}
                </Header>
                <Content style={{ margin: 16, overflow: "auto" }}>
                    <Breadcrumb
                        style={{ margin: "16px 0" }}
                        items={breadcrumbItems}
                    ></Breadcrumb>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    © {new Date().getFullYear()} Hệ thống đặt lịch khám bệnh |
                    Admin Dashboard
                </Footer>
            </Layout>
        </Layout>
    )
}

export default AdminLayout;