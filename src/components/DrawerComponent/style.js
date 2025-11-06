import { Drawer } from "antd";
import styled from "styled-components";

export const StyledDrawer = styled(Drawer)`
  /* Tổng thể Drawer */
  .ant-drawer-content {
    border-radius: 12px 0 0 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  /* Header Drawer */
  .ant-drawer-header {
    background: linear-gradient(to top, #1976d2, #42a5f5);
    padding: 16px 20px;
    border-bottom: none;
  }

  /* Tiêu đề Drawer */
  .ant-drawer-header .ant-drawer-title {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.3px;
  }

  & .ant-drawer-close {
    background-color: white;
    border: 1px solid #fff;
  }
  & .ant-drawer-close:hover {
    background-color: #bbb;
  }

  /* Phần thân Drawer */
  .ant-drawer-body {
    background-color: #fafcff;
    padding: 16px 24px;
    color: #333;
  }
`;
