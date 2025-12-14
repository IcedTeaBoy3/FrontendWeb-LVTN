import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import ModalDetailPatient from '@/components/ModalDetailPatient/ModalDetailPatient';
import AttachmentsSection from '@/components/AttachmentsSection/AttachmentsSection';
import {convertStatusPayment, getStatusPaymentColor} from '@/utils/status_payment_utils';
import { convertShiftNameToLabel } from '@/utils/shiftName_utils';
import { convertPaymentType } from '@/utils/paymentType_utils';
import { convertMethodPayment } from '@/utils/method_utils';
import { Descriptions, Image, Space, Tag,Button, Typography } from 'antd';
import { convertRole } from '@/utils/role_utils';
import { useState } from 'react';
import dayjs from 'dayjs';
const { Text,Title } = Typography;
const DrawerDetailAppointment = ({visible, appointmentDetail, onClose, onComplete, onCancel}) => {
    const {
        appointmentNumber,
        appointmentCode,
        patientProfile,
        doctorService,
        schedule,
        slot,
        status,
        symptoms,
        symptomsImage,
        payment,
        medicalResult,
        createdAt,
        cancelledBy,
        cancelReason,
        cancelledAt,
    } = appointmentDetail || {};
    const [isOpenModalDetailPatient, setIsOpenModalDetailPatient] = useState(false);
    return (
        <>
            <DrawerComponent
                title="Chi tiết lịch khám"
                placement="right"
                isOpen={visible}
                onClose={onClose}
                width={window.innerWidth < 768 ? "100%" : "800px"}
                forceRender
            >
                 <ModalDetailPatient
                    patientProfile={patientProfile}
                    isOpenModalDetailPatient={isOpenModalDetailPatient}
                    handleCloseModalDetailPatient={() => setIsOpenModalDetailPatient(false)}
                />
                <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    styles={{
                        label: { width: '30%', fontWeight: 'bold'},
                        content: { width: '70%', fontSize: 15}
                    }}
                >
                
                    <Descriptions.Item label="STT"><Text style={{color:'green',fontSize:18,fontWeight:'bold'}}> 
                        {appointmentNumber || "Chưa cập nhật"}
                    </Text></Descriptions.Item>
                    <Descriptions.Item label="Mã lịch khám">{appointmentCode}</Descriptions.Item>
                    <Descriptions.Item label="Ngày khám">
                    {schedule?.workday ? dayjs(schedule.workday).format("DD/MM/YYYY") : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giờ khám">
                        {slot ? `${dayjs(slot.startTime).format("HH:mm")} - ${dayjs(slot.endTime).format("HH:mm")} (${convertShiftNameToLabel(slot?.shift?.name)})` : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Triệu chứng" span={2}>
                        {symptoms || <Text type="secondary">Không có</Text>}
                    </Descriptions.Item>

                    {symptomsImage && (
                        <Descriptions.Item label="Ảnh triệu chứng" span={2}>
                        <Image
                            src={`${import.meta.env.VITE_APP_BACKEND_URL}${symptomsImage}`}
                            alt="Triệu chứng"
                            width={150}
                            fit="cover"
                            style={{ borderRadius: 8 }}
                        />
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Ngày tạo">
                    {createdAt ? dayjs(createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                    </Descriptions.Item>
                    { status === "cancelled" && (
                        <>
                            <Descriptions.Item label="Người huỷ lịch khám">
                                {cancelledBy ? convertRole(cancelledBy) : <Text type="secondary">Chưa huỷ</Text>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do huỷ lịch khám">
                                {cancelReason || <Text type="secondary">Không có</Text>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày huỷ lịch khám">
                                {cancelledAt
                                    ? dayjs(cancelledAt).format("DD/MM/YYYY HH:mm")
                                    : <Text type="secondary">Chưa huỷ</Text>}
                            </Descriptions.Item>
                        </>
                    )}

                </Descriptions>
            
                <Title level={5} style={{margin:'12px 0'}}>Thông tin bệnh nhân</Title>
                <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    styles={{
                        label: { width: '30%', fontWeight: 'bold'},
                        content: { width: '70%', fontSize: 15}
                    }}
                >
                    <Descriptions.Item label="Mã bệnh nhân">
                        {patientProfile?.patientProfileCode || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">
                        {patientProfile?.person?.fullName || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT">
                        {patientProfile?.person?.phone || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                        {patientProfile?.person?.dateOfBirth
                        ? dayjs(patientProfile.person.dateOfBirth).format("DD/MM/YYYY")
                        : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                        {patientProfile?.person?.gender === "male" ? "Nam" : "Nữ"}
                    </Descriptions.Item>
                    <Descriptions.Item>
                        <Button 
                            type='primary' 
                            ghost
                            onClick={() => setIsOpenModalDetailPatient(true)}
                        >
                            Xem chi tiết
                        </Button>
                    </Descriptions.Item>
                   

                </Descriptions>
                <Title level={5} style={{margin:'12px 0'}}>Thông tin bác sĩ</Title>
                <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    styles={{
                        label: { width: '30%', fontWeight: 'bold'},
                        content: { width: '70%', fontSize: 15}
                    }}
                >
                    <Descriptions.Item label="Bác sĩ phụ trách">
                        {doctorService?.doctor?.person?.fullName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chuyên khoa">
                        {doctorService?.service?.specialty?.name || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dịch vụ">
                        {doctorService?.service?.name}
                    </Descriptions.Item>
                    
                </Descriptions>
                
                <Title level={5} style={{margin:"12px 0"}}>Thông tin thanh toán</Title>
                {payment ? (
                    <Descriptions
                        bordered
                        column={1}
                        size="middle"
                        styles={{
                            label: { width: '30%', fontWeight: 'bold'},
                            content: { width: '70%', fontSize: 15}
                        }}
                    >
                    <Descriptions.Item label="Trạng thái thanh toán" span={2}>
                        <Tag color={getStatusPaymentColor(payment.status)}>{convertStatusPayment(payment.status)}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Hình thức khám">
                    {convertPaymentType(payment?.paymentType) || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                    {convertMethodPayment(payment?.method) || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số tiền">
                    {payment?.amount
                        ? `${payment.amount.toLocaleString()} VND`
                        : "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày thanh toán">
                    {payment?.payAt
                        ? dayjs(payment.payAt).format("DD/MM/YYYY HH:mm")
                        : "Chưa cập nhật"}
                    </Descriptions.Item>
                </Descriptions>
                ) : (
                    <Tag color="orange">Chưa có thông tin</Tag>
                )}
                <br />
                <Title level={5}>Thông tin kết quả khám</Title>
                {medicalResult ? (
                    <Descriptions
                        bordered
                        column={1}
                        size="middle"
                        styles={{
                            label: { width: '30%', fontWeight: 'bold'},
                            content: { width: '70%', fontSize: 15}
                        }}
                    >
                    <Descriptions.Item label="Chẩn đoán">{medicalResult.diagnosis || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Toa thuốc">{medicalResult.prescription || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{medicalResult.notes || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Tệp đính kèm">
                        <AttachmentsSection attachments={medicalResult.attachments} twoLevel={true} />
                    </Descriptions.Item>
                    

                </Descriptions>
                ) : (
                    <Tag color="orange">Chưa có kết quả khám</Tag>
                )}
                <div style={{ textAlign: "right", marginTop: 24 }}>
                    <Space>
                        {status == "confirmed" && (
                            <>
                                <Button type="primary" danger onClick={onCancel} >
                                    Huỷ lịch khám
                                </Button>
                                <Button type="primary" onClick={onComplete}>
                                Hoàn thành & Nhập kết quả khám
                                </Button>
                            </>
                        )}
                        <Button onClick={onClose}>Đóng</Button>
                    </Space>
                </div>
            </DrawerComponent>
        </>
    )
}

export default DrawerDetailAppointment