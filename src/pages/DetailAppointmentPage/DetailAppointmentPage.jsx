import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppointmentService } from '@/services/AppointmentService';
import { PaymentService } from '@/services/PaymentService';
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import * as Message from "@/components/Message/Message";
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
    MedicineBoxOutlined,
    CheckOutlined 
} from "@ant-design/icons";
const { Title,Text,Paragraph } = Typography;
const DetailAppointmentPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const handleBack = () => {
        navigate(-1);
    };
    const queryDetailAppointment = useQuery({
        queryKey: ['detail-appointment', id],
        queryFn: () => AppointmentService.getDetailAppointment(id),
        enabled: !!id,
    });
    const mutationUpdatePaymentStatus = useMutation({
        mutationKey: ['update-payment-status'],
        mutationFn: ({ paymentId, status }) => PaymentService.updatePaymentStatus(paymentId, {status}),
        onSuccess: (data) => {
            if (data.status === 'success') {
                Message.success(data.message || 'Cập nhật trạng thái thanh toán thành công');
                queryDetailAppointment.refetch(); // Tải lại dữ liệu lịch khám
            }else {
                Message.error(data.message || 'Cập nhật trạng thái thanh toán thất bại');
            }
        },
        onError: (error) => {
            Message.error(error?.message || 'Cập nhật trạng thái thanh toán thất bại');
        }
    });
    const mutationConfirmAppointment = useMutation({
        mutationKey: ['confirm-appointment'],
        mutationFn: AppointmentService.confirmAppointment,
        onSuccess: (data) => {
            if (data.status === 'success') {
                Message.success(data.message || 'Xác nhận lịch khám thành công');
                queryDetailAppointment.refetch(); // Tải lại dữ liệu lịch khám
            }else {
                Message.error(data.message || 'Xác nhận lịch khám thất bại');
            }
        },
        onError: (error) => {
            Message.error(error?.message || 'Xác nhận lịch khám thất bại');
        }
    });
    const { data: appointment, isLoading: isLoadingAppointment } = queryDetailAppointment;
    const appointmentData = appointment?.data || {};
    const handleUpdatePaymentStatus = (paymentId) => {
        mutationUpdatePaymentStatus.mutate({
            paymentId: paymentId,
            status: 'paid',
        });
    };
    const handleConfirmAppointment = (appointmentId) => {
        mutationConfirmAppointment.mutate(appointmentId);
    };

    
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
                            actions={[
                                <ButtonComponent
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleConfirmAppointment(appointmentData.appointmentId)}
                                    disabled={appointmentData.status === "confirmed"} // tránh xác nhận lại
                                >
                                    Xác nhận lịch khám
                                </ButtonComponent>,
                            ]}
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
                        <LoadingComponent isLoading={mutationUpdatePaymentStatus.isPending}>
                            <StyledCard
                                title="Thông tin thanh toán"
                                extra={
                                    <Tag color={getStatusPaymentColor(appointmentData?.payment?.status)}>
                                    {convertStatusPayment(appointmentData?.payment?.status)}
                                    </Tag>
                                }
                                actions={[
                                    <ButtonComponent
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={() => handleUpdatePaymentStatus(appointmentData?.payment?.id)}
                                        disabled={appointmentData?.payment?.status === "paid"}
                                    >
                                        Xác nhận đã thanh toán
                                    </ButtonComponent>,
                                ]}
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
                        </LoadingComponent>
                    </Col>
                </Row>
            </LoadingComponent>
        </>
    )
}

export default DetailAppointmentPage