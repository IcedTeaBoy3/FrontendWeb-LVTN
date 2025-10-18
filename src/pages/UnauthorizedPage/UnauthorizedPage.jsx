import { Result } from "antd";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import { Container } from "./style";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import * as Message from '@/components/Message/Message'

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
     
    useEffect(() => {
        const state = location.state || {};
        if (state.message) {
            Message.warning(state.message);
        }
    }, [location.state]);

    return (
        <Container>
            <Result
                status="403"
                title="403 - Không có quyền truy cập"
                subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
                extra={
                    <ButtonComponent
                        type="primary"
                        onClick={() => navigate("/")}
                    >
                        Quay về Trang chủ
                    </ButtonComponent>
                }
            />
        </Container>
    )
}

export default UnauthorizedPage