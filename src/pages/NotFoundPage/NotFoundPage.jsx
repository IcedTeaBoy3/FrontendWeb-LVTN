import { Result } from "antd";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import { Container } from "./style";
import { useNavigate } from "react-router-dom";
const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <Result
                status="404"
                title="404 - Trang không tìm thấy"
                subTitle="Xin lỗi, trang bạn truy cập không tồn tại. Vui lòng quay lại trang chủ."
                extra={
                    <ButtonComponent
                        type="primary"
                        onClick={() => navigate("/admin")}
                    >
                        Quay về Trang chủ
                    </ButtonComponent>
                }
            />
        </Container>
    );
};

export default NotFoundPage;
