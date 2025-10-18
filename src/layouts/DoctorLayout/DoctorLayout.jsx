
import { useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { PopupItem } from "./style";
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent';
import NotificationBell from "@/components/NotificationBell/NotificationBell";
import * as Message from '@/components/Message/Message';
import { AuthService } from '@/services/AuthService';
import {
    Layout,
    Menu,
    Breadcrumb,
    theme,
    Popover,
    Grid,
    Divider,
} from "antd";
import {
    DashboardOutlined,
    CalendarOutlined,
    TeamOutlined,
    LogoutOutlined,
    UserOutlined,
    BellOutlined,
    InfoCircleFilled,
    MedicineBoxOutlined,
    SolutionOutlined,
    FileTextOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
const menuItems = [
    {
        key: "/doctor/dashboard",
        icon: <DashboardOutlined />,
        label: "Thống kê",
    },
    {
        key: "/doctor/patients",
        icon: <TeamOutlined />,
        label: "Bệnh nhân",
    },
    {
        key: "/doctor/schedules",
        icon: <MedicineBoxOutlined />,
        label: "Lịch làm việc",
    },
 
    {
        key: "/doctor/appointments",
        icon: <CalendarOutlined />,
        label: "Lịch khám",
    },
    {
        key: "/doctor/medical-records",
        icon: <FileTextOutlined />,
        label: "Hồ sơ bệnh án",
    },
    
];
import {
    StyledLayout,
    StyledSider,
    LogoContainer,
    LogoText,
    StyledImage,
    StyledHeader,
    StyledContent,
    ContentContainer,
    StyledFooter,
} from "./style";
const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    // const { useBreakpoint } = Grid;
    // const screens = useBreakpoint();
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
        "/doctor": "Bác sĩ",
        "/doctor/dashboard": "Thống kê",
        "/doctor/patients": "Bệnh nhân",
        "/doctor/schedules": "Lịch làm việc",
        "/doctor/appointments": "Lịch khám",
        "/doctor/appointments/date": "Ngày khám",
        "/doctor/medical-records": "Hồ sơ bệnh án",
    };

    const pathSnippets = location.pathname.split("/").filter((i) => i);

    const breadcrumbItems = [
       
        ...pathSnippets.map((_, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;

            const title = breadcrumbNameMap[url];
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
                <PopupItem onClick={() => navigate("/doctor/personinfo")}>
                    <InfoCircleFilled
                        style={{ fontSize: "15px", marginRight: "8px" }}
                    />
                    Thông tin cá nhân
                </PopupItem>
                
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
        <StyledLayout>
            <StyledSider
                breakpoint="lg"
                collapsible
                collapsed={collapsed}
                collapsedWidth={80} // 👈 giữ trigger hiển thị
                onCollapse={(collapsed) => setCollapsed(collapsed)}
                
            >
                <LogoContainer onClick={() => navigate("/")}>
                    <StyledImage
                        width={55}
                        src={`${import.meta.env.VITE_APP_FRONTEND_URL}/mylogo.webp`}
                        preview={false}
                        alt="Logo Medicare"
                    />
                    {!collapsed && <LogoText>Medicare</LogoText>}
                </LogoContainer>
                <Menu
                    theme="light"
                    mode="inline"
                    onClick={handleMenuClick}
                    defaultSelectedKeys={["/doctor/dashboard"]}
                    items={menuItems}
                />
                
            </StyledSider>
         
           
            <Layout>
                <StyledHeader>
                    <NotificationBell />
                    <Divider type="vertical" />
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
                                onClick={() => navigate("/doctor/personinfo")}
                            >
                                {user?.userName ||
                                    user?.email ||
                                    "Xin chào, Bác sĩ!"}
                            </ButtonComponent>
                        </Popover>
                    )}
                </StyledHeader>
                <StyledContent>
                    <Breadcrumb
                        style={{ margin: "20px 0" }}
                        items={breadcrumbItems}
                    ></Breadcrumb>
                    <ContentContainer
                        style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </ContentContainer>
                </StyledContent>
                <StyledFooter>
                    © {new Date().getFullYear()} Hệ thống đặt lịch khám bệnh |
                    Doctor
                </StyledFooter>
            </Layout>
        </StyledLayout>
    )
}

export default AdminLayout;