import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppointmentService } from '@/services/AppointmentService';
import { PaymentService } from '@/services/PaymentService';
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import * as Message from "@/components/Message/Message";
import {Row, Col, Typography, Divider, Tag, Descriptions, Space, Image} from 'antd';
import { getStatusColor,convertStatusAppointment } from '@/utils/status_appointment_utils';
import { StyledCard } from './style';
import { useState } from 'react';
import dayjs from 'dayjs';
import * as DatetimeUtils from '@/utils/datetime_utils';
import {convertStatusPayment,getStatusPaymentColor} from '@/utils/status_payment_utils';
import { convertPaymentType } from '@/utils/paymentType_utils';
import { convertGender } from '@/utils/gender_utils';
import { convertMethodPayment } from '@/utils/method_utils';
import {
    ArrowLeftOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import ModalDetailPatient from '@/components/ModalDetailPatient/ModalDetailPatient';
const { Title,Text,Paragraph } = Typography;
const DetailAppointmentPage = () => {
    const [isOpenModalDetailPatient, setIsOpenModalDetailPatient] = useState(false);
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
    const { patientProfile, medicalResult, doctorService } = appointmentData;

    
    return (
        <>
            <ButtonComponent
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ fontSize: 18, padding: 0 }}
            >Chi tiết lịch khám</ButtonComponent>
            <Divider style={{margin:"12px 0"}}/>
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
                                    ghost
                                    shape="round"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleConfirmAppointment(appointmentData.appointmentId)}
                                    disabled={appointmentData.status === "confirmed"} // tránh xác nhận lại
                                >
                                    Xác nhận lịch khám
                                </ButtonComponent>,
                            ]}
                        >
                        <Descriptions 
                            column={1} 
                            size="middle" 
                            bordered
                            styles={{ labelStyle: { fontWeight: 'bold' } }}
                        >
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
                            <Descriptions.Item label="Triệu chứng">
                            {appointmentData.symptoms || "Không có"}
                            
                            </Descriptions.Item>
                            <Descriptions.Item label="Ảnh triệu chứng, đơn thuốc">
                                {appointmentData.symptomImage ? (
                                    <Image
                                        width={100}
                                        src={`${import.meta.env.VITE_APP_BACKEND_URL}${appointmentData.symptomImage}`}
                                        alt="Ảnh triệu chứng"
                                    />
                                ) : (
                                    "Không có"
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt lịch khám">
                                {appointmentData.createdAt
                                    ? dayjs(appointmentData.createdAt).format("DD/MM/YYYY HH:mm")
                                    : "Chưa cập nhật"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Title level={5} style={{ margin: "16px 0 8px 0" }}>
                            Thông tin bệnh nhân
                        </Title>
                        <Descriptions
                            column={1}
                            bordered
                            size="middle"
                            styles={{ labelStyle: { fontWeight: 'bold' } }}
                        >
                            <Descriptions.Item label={<>Mã bệnh nhân</>}>
                                {patientProfile?.patientProfileCode || <Text type="secondary">Chưa cập nhật</Text>}
                            </Descriptions.Item>

                            <Descriptions.Item label={<>Họ và tên</>}>
                                {patientProfile?.person?.fullName || <Text type="secondary">Chưa cập nhật</Text>}
                            </Descriptions.Item>

                            <Descriptions.Item label={<>Số điện thoại</>}>
                                {patientProfile?.person?.phone || <Text type="secondary">Chưa cập nhật</Text>}
                            </Descriptions.Item>
                            <Descriptions.Item label={<>Giới tính</>}>
                                {convertGender(patientProfile?.person?.gender) || <Text type="secondary">Chưa cập nhật</Text>}
                            </Descriptions.Item>
                            <Descriptions.Item label={<>Ngày sinh</>}>
                                {patientProfile?.person?.dateOfBirth
                                    ? dayjs(patientProfile?.person?.dateOfBirth).format("DD/MM/YYYY")
                                    : <Text type="secondary">Chưa cập nhật</Text>}
                            </Descriptions.Item>    
                            <Space style={{ marginTop: 8 }} >
                                <ButtonComponent 
                                    type="primary" 
                                    ghost
                                    onClick={() => setIsOpenModalDetailPatient(true)}
                                >
                                    Xem chi tiết
                                </ButtonComponent>
                            </Space>
                        </Descriptions>
                            
                        <ModalDetailPatient
                            patientProfile={patientProfile}
                            isOpenModalDetailPatient={isOpenModalDetailPatient}
                            handleCloseModalDetailPatient={() => setIsOpenModalDetailPatient(false)}
                        >

                        </ModalDetailPatient>

                        <Title level={5} style={{ margin: "16px 0 8px 0" }}>
                            Thông tin bác sĩ
                        </Title>
                        <Descriptions column={1} size="medium" bordered>
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
                                        shape="round"
                                        ghost
                                        icon={<CheckOutlined />}
                                        onClick={() => handleUpdatePaymentStatus(appointmentData.payment.paymentId)}
                                        disabled={appointmentData?.payment?.status === "paid"} // tránh thanh toán lại
                                    >
                                        Xác nhận thanh toán
                                    </ButtonComponent>,

                                ]}
                                style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                            >
                                <Descriptions column={1} size="middle" bordered>
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
                        <br />
                        {medicalResult &&
                            <StyledCard
                                title="Kết quả khám bệnh"
                            >
                                <Descriptions column={1} size="middle" bordered>
                                    <Descriptions.Item label="Chuẩn đoán">
                                        {medicalResult?.diagnosis || "Chưa cập nhật"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Đơn thuốc">
                                        {medicalResult?.prescription || "Chưa cập nhật"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ghi chú">
                                        {medicalResult?.note || "Chưa cập nhật"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="File đính kèm">

                                        {medicalResult?.attachments.map((file, index) => 
                                            <Image
                                                key={index}
                                                width={100}
                                                src={`${import.meta.env.VITE_APP_BACKEND_URL}${file}`}
                                            />
                                        
                                        ) || "Chưa cập nhật"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </StyledCard>
                        }

                        
                    </Col>
                </Row>
            </LoadingComponent>
        </>
    )
}

export default DetailAppointmentPage