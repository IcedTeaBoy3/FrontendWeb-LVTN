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
     /* Button submit */
    & .ant-btn-primary {
        width: 100%;
        height: 44px;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        background: linear-gradient(135deg, #1976d2, #42a5f5);
        border: none;
        border-radius: 8px;
        transition: all 0.25s ease;

        &:hover {
            background: linear-gradient(135deg, #1565c0, #2196f3);
            box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
            transform: translateY(-2px);
        }
    }
`;
