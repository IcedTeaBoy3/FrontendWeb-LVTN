
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MedicalResultService } from '@/services/MedicalResultService';
import LoadingCompoent from '@/components/LoadingComponent/LoadingComponent';
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent';
import ModalDetailPatient from '@/components/ModalDetailPatient/ModalDetailPatient';
import AttachmentsSection from '@/components/AttachmentsSection/AttachmentsSection';

import { convertGender} from '@/utils/gender_utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Typography ,Descriptions, Row, Col, Divider} from 'antd';
import  dayjs from 'dayjs';
const { Title, Text } = Typography;
const DetailMedicalResultPage = () => {
    const [isOpenModalDetailPatient, setIsOpenModalDetailPatient] = useState(false);
    const { id } = useParams();
    const navigation = useNavigate();
    const { data, isLoading, error } = useQuery({
        queryKey: ['medicalResult', id],
        queryFn: () => MedicalResultService.getMedicalResult(id),
        enabled: !!id,
    });
    const medicalResult = data?.data || {};
    const { doctorService, patientProfile } = medicalResult.appointment || {};
    const { appointment } = medicalResult || {};
    const handleBack = () => {
        navigation(-1);
    };
    return (
        <>
        
            <ButtonComponent
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ fontSize: 18, padding: 0 }}
            >Chi tiết kết quả khám</ButtonComponent>
            <Divider style={{margin: '12px 0'}}/>
            <LoadingCompoent isLoading={isLoading}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Title level={5}>Thông tin lịch khám</Title>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Mã lịch khám">
                                <Text>{appointment?.appointmentCode || '--'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày khám">
                                <Text>{dayjs(appointment?.schedule?.workday).format('DD/MM/YYYY') || '--'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ khám">
                                <Text>
                                    {appointment?.slot?.startTime && appointment?.slot?.endTime
                                        ? `${dayjs(appointment.slot.startTime).format('HH:mm')} - ${dayjs(appointment.slot.endTime).format('HH:mm')}`
                                        : '--'}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Bác sĩ">
                                <Text>{doctorService?.doctor?.person?.fullName || '--'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Dịch vụ y tế">
                                <Text>{doctorService?.service?.name || '--'}</Text>
                            </Descriptions.Item>
                            
                        </Descriptions>
                        <Title level={5} style={{ marginTop: 24 }}>Thông tin bệnh nhân</Title>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Họ và tên">
                                <Text>{patientProfile?.person?.fullName || '--'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                <Text>{patientProfile?.person?.dateOfBirth ? dayjs(patientProfile.person.dateOfBirth).format('DD/MM/YYYY') : '--'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                <Text>{convertGender(patientProfile?.person?.gender) || '--'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="">
                                <ButtonComponent
                                    type="primary"
                                    ghost
                                    onClick={() => setIsOpenModalDetailPatient(true)}
                                >
                                    Xem chi tiết
                                </ButtonComponent>
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col span={12}>
                        <Title level={5}>Kết quả khám</Title>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Chẩn đoán">
                                <Text>{medicalResult.diagnosis}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đơn thuốc">
                                <Text>{medicalResult.prescription}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                <Text>{medicalResult.notes}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tệp đính kèm">
                                <AttachmentsSection attachments={medicalResult.attachments} />
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            
            </LoadingCompoent>
            <ModalDetailPatient
                patientProfile={patientProfile}
                isOpenModalDetailPatient={isOpenModalDetailPatient}
                handleCloseModalDetailPatient={() => {
                    setIsOpenModalDetailPatient(false);
                }}
            />
        </>
    )
}

export default DetailMedicalResultPage