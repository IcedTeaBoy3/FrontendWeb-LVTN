import styled from "styled-components";
import { Layout, Image, Typography } from "antd";
const { Paragraph } = Typography;
const { Header, Sider, Content, Footer } = Layout;
export const PopupItem = styled.p`
    margin: 0;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 4px;
    &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
    }
    &:hover {
        background-color: #f0f0f0;
        color: #1890ff;
    }
`;
export const StyledLayout = styled(Layout)`
    min-height: 100vh;
`;

export const StyledSider = styled(Sider)`
    background-color: #fff !important;
    /* ví dụ file global.css hoặc styled-component */
    .ant-layout-sider-trigger {
        background-color: #1976D2 !important; /* 🔵 màu bạn muốn */
        color: #fff !important;
        font-size: 18px;
        border-top: 1px solid #e8e8e8;
        transition: all 0.3s ease;
    }
`;

export const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 5px 0px;
    border-radius: 8px;
    cursor: pointer;
`;

export const StyledImage = styled(Image)`
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const LogoText = styled(Paragraph)`
    margin: 0 !important;
    font-size: 22px !important;
    font-weight: bolder !important;
    color: #1976D2 !important;
`;

export const StyledHeader = styled(Header)`
    background-color: #1976D2;
    padding: 0;
    text-align: right;
    padding-right: 20px;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
`;

export const StyledContent = styled(Content)`
    margin: 16px;
    overflow: auto;
`;

export const ContentContainer = styled.div`
    padding: 24px;
    min-height: 360px;
    background: ${({ theme }) => theme?.token?.colorBgContainer || "#fff"};
    border-radius: ${({ theme }) => theme?.token?.borderRadiusLG || "8px"};
`;

export const StyledFooter = styled(Footer)`
    text-align: center;
`;
