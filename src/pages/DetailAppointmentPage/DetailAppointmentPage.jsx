import { useNavigate, useParams } from 'react-router-dom';
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppointmentService } from '@/services/AppointmentService';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import {Row, Col, Typography, Divider, Tag, Descriptions} from 'antd';
import { getStatusColor,convertStatusAppointment } from '@/utils/status_appointment_utils';
import { StyledCard } from './style';
import dayjs from 'dayjs';
import * as DatetimeUtils from '@/utils/datetime_utils';
import {convertStatusPayment,getStatusPaymentColor} from '@/utils/status_payment_utils';
import { convertPaymentType } from '@/utils/paymentType_utils';
import { convertMethodPayment } from '../../utils/method_utils';
import {
    ArrowLeftOutlined,
    UserOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    AppstoreOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
const { Title,Text,Paragraph } = Typography;
const DetailAppointmentPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    console.log('id', id);
    const handleBack = () => {
        navigate(-1);
    };
    const queryDetailAppointment = useQuery({
        queryKey: ['detail-appointment', id],
        queryFn: () => AppointmentService.getDetailAppointment(id),
        enabled: !!id,
    });

    const { data: appointment, isLoading: isLoadingAppointment } = queryDetailAppointment;
    const appointmentData = appointment?.data || {};
    console.log('appointmentData', appointmentData);
    return (
        <>
            <ButtonComponent
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ fontSize: 18, padding: 0 }}
            >Chi tiết lịch khám</ButtonComponent>
            <Divider />
            <LoadingComponent isLoading={isLoadingAppointment}>
                <Row gutter={[16, 16]}>
                {/* THÔNG TIN LỊCH KHÁM */}
                <Col span={12}>
                    <StyledCard
                    title="Thông tin lịch khám"
                    extra={
                        <Tag color={getStatusColor(appointmentData.status)}>
                        {convertStatusAppointment(appointmentData.status)}
                        </Tag>
                    }
                    style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="STT">
                            <Text style={{color:'green',fontSize:18,fontWeight:'bold'}}>

                                {appointmentData.appointmentNumber || "Chưa cập nhật"}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã lịch khám">
                        {appointmentData.appointmentCode || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày khám">
                        {appointmentData.schedule?.workday
                            ? dayjs(appointmentData.schedule.workday).format("DD/MM/YYYY")
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giờ khám">
                            <Text style={{color:'green',fontSize:16}}>
                            {appointmentData.slot
                            ? `${DatetimeUtils.formatTime(appointmentData.slot)} (${appointmentData.slot?.shift?.name})`
                            : "Chưa cập nhật"}
                            </Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ margin: "16px 0" }} />

                    <Title level={5} style={{ marginBottom: 8 }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        Thông tin bệnh nhân
                    </Title>
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Mã bệnh nhân">
                        {appointmentData.patientProfile?.patientProfileCode || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Họ và tên">
                        {appointmentData.patientProfile?.person?.fullName || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="SĐT">
                        {appointmentData.patientProfile?.person?.phone || "Chưa cập nhật"}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ margin: "16px 0" }} />

                    <Title level={5} style={{ marginBottom: 8 }}>
                        <MedicineBoxOutlined style={{ marginRight: 8 }} />
                        Thông tin bác sĩ
                    </Title>
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Họ và tên">
                        {appointmentData.doctorService?.doctor?.person?.fullName || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chuyên khoa">
                        {appointmentData.doctorService?.service?.specialty?.name || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dịch vụ khám">
                        {appointmentData.doctorService?.service?.name || "Chưa cập nhật"}
                        </Descriptions.Item>
                    </Descriptions>
                    </StyledCard>
                </Col>

                {/* THÔNG TIN THANH TOÁN */}
                <Col span={12}>
                    <StyledCard
                    title="Thông tin thanh toán"
                    extra={
                        <Tag color={getStatusPaymentColor(appointmentData?.payment?.status)}>
                        {convertStatusPayment(appointmentData?.payment?.status)}
                        </Tag>
                    }
                    style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Hình thức khám">
                        {convertPaymentType(appointmentData?.payment?.paymentType) || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">
                        {convertMethodPayment(appointmentData?.payment?.method) || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số tiền">
                        {appointmentData?.payment?.amount
                            ? `${appointmentData.payment.amount.toLocaleString()} VND`
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày thanh toán">
                        {appointmentData?.payment?.payAt
                            ? dayjs(appointmentData.payment.payAt).format("DD/MM/YYYY HH:mm")
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                    </Descriptions>
                    </StyledCard>
                </Col>
                </Row>
            </LoadingComponent>
        </>
    )
}

export default DetailAppointmentPage