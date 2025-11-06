import styled from "styled-components";
import { Tabs } from "antd";

export const CustomTabs = styled(Tabs)`
 
 
  & .ant-tabs-nav-list {
    margin: 0;
  }
  & .ant-tabs-tab {
    font-size: 18px;
    font-weight: bold;
    color: #1890ff;
    padding: 16px 30px;
  }
  & .ant-tabs-tab-active {
    font-weight: 500;
  }

`;
