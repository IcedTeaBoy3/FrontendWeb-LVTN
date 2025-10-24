import ModalComponent from "@/components/ModalComponent/ModalComponent";
import dayjs from "dayjs";
import { convertGender } from "@/utils/gender_utils";
import { Descriptions } from "antd";
const ModalDetailPatient = ({patientProfile, isOpenModalDetailPatient, handleCloseModalDetailPatient}) => {
  return (
    <ModalComponent
      title="Chi tiết bệnh nhân"
      open={isOpenModalDetailPatient}
      onCancel={handleCloseModalDetailPatient}
      width={600}
      footer={null}
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Mã bệnh nhân">{patientProfile?.patientProfileCode}</Descriptions.Item>
        <Descriptions.Item label="Số CMND/CCCD">{patientProfile?.idCard}</Descriptions.Item>
        <Descriptions.Item label="Mã bảo hiểm y tế">{patientProfile?.insuranceCode}</Descriptions.Item>
        <Descriptions.Item label="Họ và tên">{patientProfile?.person?.fullName ?? '--'}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{dayjs(patientProfile?.person?.dateOfBirth).format('DD/MM/YYYY') ?? '--'}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">{convertGender(patientProfile?.person?.gender) ?? '--'}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{patientProfile?.person.address ?? '--'}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{patientProfile?.person?.phone ?? '--'}</Descriptions.Item>
        <Descriptions.Item label="Email">{patientProfile?.person?.email ?? '--'}</Descriptions.Item>
        <Descriptions.Item label="Dân tộc">{patientProfile?.person?.ethnic ?? '--'}</Descriptions.Item>
        <Descriptions.Item label="Nghề nghiệp">{patientProfile?.person?.job ?? '--'}</Descriptions.Item>
      </Descriptions>
    </ModalComponent>
  )
}

export default ModalDetailPatient