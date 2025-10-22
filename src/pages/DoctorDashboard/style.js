import styled from "styled-components";
import { Tabs, Card, Col as AntCol, Row as AntRow } from "antd";
export const StyleTabs = styled(Tabs)`
    & .ant-tabs-nav-list {
       margin: 0;
    }
    & .ant-tabs-tab {
        font-size: 15px;
        font-weight: 400;
        color: #1890ff;
        padding: 16px 30px;
    }
    & .ant-tabs-tab-active {
        font-weight: 500;
    }

`;
export const StyledCard = styled(Card)`
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        border-color: 1px solid #1890ff;
    }

    .ant-card-body {
        padding: 24px 16px;
    }

    .icon-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-bottom: 12px;
        color: white;
        font-size: 22px;
    }

    .stat-title {
        font-weight: 500;
        color: #4a4a4a;
        margin-bottom: 4px;
    }
`;