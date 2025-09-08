import {Card} from "antd";
import styled from "styled-components";
export const StyledCard = styled(Card)`
    margin-bottom: 20px;
    & .ant-card-head {
        background: #f0f2f5;
    }
    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-color: #1890ff;
    }
`;