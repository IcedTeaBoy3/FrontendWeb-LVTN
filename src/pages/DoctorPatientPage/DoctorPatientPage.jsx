import { useQuery } from "@tanstack/react-query"
import { AppointmentService } from "@/services/AppointmentService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import DrawerComponent from "@/components/DrawerComponent/DrawerComponent";
import ModalDetailPatient from "@/components/ModalDetailPatient/ModalDetailPatient";
import { EyeOutlined, EditOutlined, MoreOutlined,SearchOutlined, CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Dropdown, Typography, Timeline, Tag, Input, Space, Button, Card } from "antd";
import Highlighter from "react-highlight-words";
import TableStyle from "@/components/TableStyle/TableStyle";
import { convertGender } from "@/utils/gender_utils";
import { convertStatusAppointment, getStatusColor} from "@/utils/status_appointment_utils";
import dayjs from "dayjs";
const { Title, Text, Paragraph} = Typography;
const DoctorPatientPage = () => {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rowSelected, setRowSelected] = useState(null);
  const [patientSelected, setPatientSelected] = useState(null);
  const [isOpenModalDetailPatient, setIsOpenModalDetailPatient] = useState(false);
  const navigate = useNavigate();
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
   // Tìm kiếm
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const getColumnSearchProps = (dataIndex) => ({
      filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
      }) => (
          <div style={{ padding: 8 }}>
              <Input
                  ref={searchInput}
                  placeholder={`Tìm theo ${dataIndex}`}
                  value={selectedKeys[0]}
                  onChange={(e) =>
                      setSelectedKeys(e.target.value ? [e.target.value] : [])
                  }
                  onPressEnter={() =>
                      handleSearch(selectedKeys, confirm, dataIndex)
                  }
                  style={{ marginBottom: 8, display: "block" }}
              />
              <Space>
                  <ButtonComponent
                      type="primary"
                      onClick={() =>
                          handleSearch(selectedKeys, confirm, dataIndex)
                      }
                      icon={<SearchOutlined />}
                      size="small"
                      style={{ width: 90 }}
                  >
                      Tìm
                  </ButtonComponent>
                  <Button
                      onClick={() => handleReset(clearFilters, confirm)}
                      size="small"
                      style={{ width: 90 }}
                  >
                      Xóa
                  </Button>
              </Space>
          </div>
      ),
      filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
          record[dataIndex]
              ?.toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
      filterDropdownProps: {
        onOpenChange: (open) => {
          if (open) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        },
      },
      render: (text) =>
        searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: "#91d5ff", padding: 0 }} // màu bạn chọn
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        ) : (
          text
        ),
  });
  // sửa lại để xóa cũng confirm luôn
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText("");
    confirm(); // refresh bảng sau khi clear
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
      ...getColumnSearchProps('patientProfileCode'),
    },
    {
      title: 'Số CMND/CCCD',
      dataIndex: 'idCard',
      key: 'idCard',
      ...getColumnSearchProps('idCard'),
    },
    {
      title: 'Mã bảo hiểm y tế',
      dataIndex: 'insuranceCode',
      key: 'insuranceCode',
      ...getColumnSearchProps('insuranceCode'),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      ...getColumnSearchProps('fullName'),
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
      filters: [
        { text: 'Nam', value: 'Nam' },
        { text: 'Nữ', value: 'Nữ' },
        { text: 'Khác', value: 'Khác' },
      ],
      onFilter: (value, record) => record.gender === value,
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
              label: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ color: "#1677ff", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarOutlined /> {dayjs(record.appointmentDate).format("DD/MM/YYYY")}
                  </div>
                  <div style={{ color: "green",fontWeight:"bold", display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockCircleOutlined /> {dayjs(record.slot.startTime).format("HH:mm")} - {dayjs(record.slot.endTime).format("HH:mm")}
                  </div>
                </div>
              ),
              children: (
                <Card 
                  actions={[
                    <ButtonComponent
                      type="primary"
                      ghost
                      onClick={() => navigate(`/doctor/patients/${record.medicalResult._id}`)}
                    >Xem chi tiết</ButtonComponent>
                  ]}
                >
                  <Paragraph ellipsis><Text strong>Dịch vụ khám: </Text>{record.doctorService?.service?.name || "Chưa cập nhật"}</Paragraph>
                  <Paragraph ellipsis><Text strong>Triệu chứng: </Text>{record.symptoms || "Chưa cập nhật"}</Paragraph>
                  <Paragraph ellipsis><Text strong>Kết quả: </Text>{record.medicalResult?.diagnosis || "Chưa cập nhật"}</Paragraph>
                  <Paragraph ellipsis><Text strong>Ghi chú: </Text>{record.medicalResult?.note || "—"}</Paragraph>
                 
                  <Tag color={getStatusColor(record.status)}>
                    {convertStatusAppointment(record.status)}
                  </Tag>
                </Card>
              ),
            }))}
          />
          

        </LoadingComponent>
      </DrawerComponent>
    </>
  )
}

export default DoctorPatientPage