import styled from "styled-components";

export const FormContainer = styled.div`
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    border: 2px solid #e8e8e8;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 450px;
    @media (max-width: 576px) {
        padding: 16px;
    }
    & .ant-form-item-label {
        font-size: 16px;
        font-weight: 500;
        color: #333;
    }
    & .ant-input-outlined,
    .ant-input-password {
        font-size: 16px;
        padding: 4px;
        :hover {
            border-color: #1890ff;
        }
    }
`;
