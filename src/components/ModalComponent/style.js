import styled from "styled-components";
import { Modal } from "antd";

export const CustomModal = styled(Modal)`
    .ant-modal-header {
        padding: 16px;
        border-bottom: 1px solid #eee;
        background: linear-gradient(to top, #1976d2, #42a5f5);
        border-bottom: 1px solid #ccc;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 0px;
    }
    .ant-modal-header .ant-modal-title {
        font-weight: 600;
        color: #fff;
        font-size: 18px;
    }
    .ant-modal-footer {
        padding: 16px;
        margin-top: 0px;
        border-top: 1px solid #eee;
    }
    .ant-modal-body {
        background-color: #fafcff;
        padding: 24px 28px;
    }
    .ant-modal-content {
        border-radius: 8px;
        padding: 0px;
    }
    & .ant-modal-close {
        position: absolute;
        background-color: white;
        border: 1px solid #fff;
    }
    & .ant-modal-close:hover {
        background-color: #bbb;
    }
`;
