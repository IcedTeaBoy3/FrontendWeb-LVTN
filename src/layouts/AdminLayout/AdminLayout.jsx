
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
    Divider,
    Avatar,
    Row
} from "antd";
import {
    DashboardOutlined,
    CalendarOutlined,
    TeamOutlined,
    LogoutOutlined,
    UserOutlined,
    InfoCircleFilled,
    BarChartOutlined,
    MedicineBoxOutlined,
    SolutionOutlined,
    AppstoreOutlined,
    PictureOutlined,
} from "@ant-design/icons";
const menuItems = [
    {
        key: "/admin/dashboard",
        icon: <DashboardOutlined />,
        label: "Tổng quan",
    },
    {
        key: "/admin/sliders",
        icon: <PictureOutlined/>,
        label: "Slider",
    },
    {
        key: "/admin/accounts",
        icon: <UserOutlined />,
        label: "Tài khoản",
    },
    {
        key: "/admin/patients",
        icon: <TeamOutlined />,
        label: "Bệnh nhân",
    },
    {
        icon: <SolutionOutlined />,
        label: "Bác sĩ",
        children: [
            { key: "/admin/doctors", label: "Danh sách bác sĩ" },
            { key: "/admin/schedules", label: "Lịch làm việc" },
            { key: "/admin/doctorreviews", label: "Đánh giá bác sĩ" },
            {
                label: "Danh mục dùng chung",
                key: "common-categories",
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
        label: "Lịch khám",
    },
    {
        key: "/admin/statistics",
        icon: <BarChartOutlined />,
        label: "Thống kê",
    }
    
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
        "/admin": "Quản trị",
        "/admin/accounts": "Tài khoản",
        "/admin/sliders": "Slider",
        "/admin/workplaces": "Nơi làm việc",
        "/admin/positions": "Chức vụ",
        "/admin/degrees": "Học vị",
        "/admin/dashboard": "Thống kê",
        "/admin/appointments": "Lịch khám",
        "/admin/doctors": "Bác sĩ",
        "/admin/doctorreviews": "Đánh giá bác sĩ",
        "/admin/doctors/:id": "Chi tiết bác sĩ",
        "/admin/schedules/:id": "Chi tiết lịch làm việc",
        "/admin/appointments/:id": "Chi tiết lịch khám",
        "/admin/hospitals": "Bệnh viện",
        "/admin/specialties": "Chuyên khoa",
        "/admin/patients": "Bệnh nhân",
        "/admin/schedules": "Lịch làm việc",
        "/admin/clinics": "Phòng khám",
        "/admin/services": "Dịch vụ",
        "/admin/personinfo": "Thông tin cá nhân",
        "/admin/statistics": "Thống kê",
    };

    const pathSnippets = location.pathname.split("/").filter((i) => i);

    const breadcrumbItems = [
       
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
            if (!title && /^\/admin\/appointments\/[^/]+$/.test(url)) {
                title = breadcrumbNameMap["/admin/appointments/:id"];
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
                <Row justify="center" style={{ marginBottom: "16px" }}>
                    <Avatar
                        size={90}
                        src={`${import.meta.env.VITE_APP_BACKEND_URL}${user?.avatar}`}
                    />
                </Row>
                <Divider style={{ margin: 0 }} />
                <PopupItem onClick={() => navigate("/admin/personinfo")}>
                    <InfoCircleFilled
                        style={{ fontSize: "15px", marginRight: "8px" }}
                    />
                    Thông tin tài khoản
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
                    defaultSelectedKeys={["/admin/dashboard"]}
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
                                onClick={() => navigate("/admin/personinfo")}
                            >
                                {user?.userName ||
                                    user?.email ||
                                    "Xin chào, Admin!"}
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
                    Admin Dashboard
                </StyledFooter>
            </Layout>
        </StyledLayout>
    )
}

export default AdminLayout;