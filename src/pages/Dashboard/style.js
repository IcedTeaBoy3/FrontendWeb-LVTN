import styled from "styled-components";
import { Tabs } from "antd";
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