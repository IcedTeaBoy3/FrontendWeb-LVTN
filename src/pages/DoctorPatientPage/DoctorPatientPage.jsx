import { useQuery } from "@tanstack/react-query"
import { AppointmentService } from "@/services/AppointmentService";
import { useSelector } from "react-redux";
import { useState } from "react";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import DrawerComponent from "@/components/DrawerComponent/DrawerComponent";
import ModalDetailPatient from "./components/ModalDetailPatient";
import { EyeOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { Dropdown, Typography, Timeline, Tag} from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import { convertGender } from "@/utils/gender_utils";
import { convertStatusAppointment, getStatusColor} from "@/utils/status_appointment_utils";
import dayjs from "dayjs";
const { Title, Text} = Typography;
const DoctorPatientPage = () => {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rowSelected, setRowSelected] = useState(null);
  const [patientSelected, setPatientSelected] = useState(null);
  const [isOpenModalDetailPatient, setIsOpenModalDetailPatient] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    type: "checkbox",
  };
  const user = useSelector((state) => state.auth.user);
  const doctorId = user?.doctor?.doctorId;
  const queryGetDoctorPatients = useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: () => AppointmentService.getDoctorPatients(doctorId),
    enabled: !!doctorId,
  });
  const queryGetDoctorPatientHistory = useQuery({
    queryKey: ['doctor-patient-history', doctorId, rowSelected],
    queryFn: () => AppointmentService.getDoctorPatientHistory(doctorId, rowSelected),
    enabled: !!doctorId && !!rowSelected,
  });
  const { data: doctorPatientsData, isLoading: isLoadingDoctorPatients } = queryGetDoctorPatients;
  const { data: doctorPatientHistoryData, isLoading: isLoadingDoctorPatientHistory } = queryGetDoctorPatientHistory;
  const patients = doctorPatientsData?.data || [];
  const historyRecords = doctorPatientHistoryData?.data || [];
  const dataTable = patients.map((patient, index) => ({
    key: patient.patientProfileId,
    index: index + 1,
    idCard: patient?.idCard,
    insuranceCode : patient?.insuranceCode,
    patientProfileCode: patient?.patientProfileCode,
    fullName: patient?.person?.fullName,
    dateOfBirth: dayjs(patient?.person?.dateOfBirth).format('DD/MM/YYYY'),
    gender: convertGender(patient?.person?.gender),
  }));
  const handleCloseModalDetailPatient = () => {
    setIsOpenModalDetailPatient(false);
  }
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: 'Mã bệnh nhân',
      dataIndex: 'patientProfileCode',
      key: 'patientProfileCode',
    },
    {
      title: 'Số CMND/CCCD',
      dataIndex: 'idCard',
      key: 'idCard',
    },
    {
      title: 'Mã bảo hiểm y tế',
      dataIndex: 'insuranceCode',
      key: 'insuranceCode',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const itemActions = [
          { key: "detail", label: "Xem chi tiết", icon: <EyeOutlined style={{ fontSize: 16 }} /> },
          { type: "divider" },
          { key: "history", label: "Xem lịch sử khám", icon: <EditOutlined style={{ fontSize: 16 }} /> },
        ];

        const onMenuClick = ({ key, domEvent }) => {
          setRowSelected(record.key);
          domEvent.stopPropagation(); // tránh chọn row khi bấm menu
          if (key === "detail") return handleViewDetailPatient(record.key);
          if (key === "history") return handleViewPatientHistory(record.key);
        };

        return (
          <Dropdown
            menu={{ items: itemActions, onClick: onMenuClick }}
            trigger={["click"]}
            placement="bottomLeft"
            zIndex={1000} // Đặt z-index cao
            getPopupContainer={() => document.body}
          >
            <ButtonComponent
              type="default"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()} // tránh select row/expand khi bấm nút
            />
          </Dropdown>
        );
      },
    },
  ];
  const handleViewDetailPatient = (patientProfileId) => {
    const patient = patients.find((p) => p.patientProfileId === patientProfileId);
    setPatientSelected(patient);
    setIsOpenModalDetailPatient(true);
  };
  const handleViewPatientHistory = () => {
    // Mở Drawer để xem lịch sử khám bệnh
    setIsOpenDrawer(true);
  };
  return (
    <>
      <Title level={4}>Danh sách bệnh nhân</Title>
      <TableStyle
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataTable}
        loading={isLoadingDoctorPatients}
        pagination={pagination}
        onChange={(page, pageSize) => {
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize,
          }));
        }}
      />
      <ModalDetailPatient
        patientProfile={patientSelected}
        isOpenModalDetailPatient={isOpenModalDetailPatient}
        handleCloseModalDetailPatient={handleCloseModalDetailPatient}
      />
      <DrawerComponent
        title="Lịch sử khám bệnh"
        width={600}
        open={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
      >
        <LoadingComponent isLoading={isLoadingDoctorPatientHistory}>
          <Timeline 
            mode="left"
            items={historyRecords.map((record) => ({
              label: dayjs(record?.schedule?.workday).format('DD/MM/YYYY'),
              children: (
                <div>
                  <p><b>Bác sĩ:</b> {record.doctorService?.doctor?.person?.fullName}</p>
                  <p><b>Dịch vụ:</b> {record.doctorService?.service?.name}</p>
                  <p><b>Triệu chứng:</b> {record.symptoms || "Không có"}</p>
                  <p><b>Kết quả:</b> {record.medicalResult?.diagnosis || "Chưa có"}</p>
                  <p><b>Ghi chú:</b> {record.medicalResult?.note || "—"}</p>
                  <Tag color={getStatusColor(record.status)}>
                    {convertStatusAppointment(record.status)}
                  </Tag>
                </div>
              ),
            }))}
          />
          

        </LoadingComponent>
      </DrawerComponent>
    </>
  )
}

export default DoctorPatientPage