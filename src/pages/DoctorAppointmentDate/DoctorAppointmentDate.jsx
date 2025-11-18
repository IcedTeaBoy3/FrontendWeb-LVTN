
import { useLocation } from "react-router-dom"
import { Space, Input, Form, Typography, Dropdown, Upload, Tag, Button, DatePicker } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import * as Message from "@/components/Message/Message";
import { SearchOutlined, EyeOutlined, MoreOutlined, ExclamationCircleOutlined ,UploadOutlined, CheckCircleFilled  } from "@ant-design/icons";
import { useState, useRef} from "react";
import { useSelector } from "react-redux";
import { useQuery,useMutation } from '@tanstack/react-query';
import { AppointmentService } from '@/services/AppointmentService';
import { MedicalResultService } from "@/services/MedicalResultService";
import { convertStatusAppointment, getStatusColor } from '@/utils/status_appointment_utils';
import { convertStatusPayment, getStatusPaymentColor } from '@/utils/status_payment_utils';
import DrawerDetailAppointment from "./components/DrawerDetailAppointment";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import {formatDate, formatTime} from "@/utils/datetime_utils";
import dayjs from "dayjs";
import "dayjs/locale/vi";
// Thiết lập ngôn ngữ cho dayjs
dayjs.locale("vi");
const { Text, Title } = Typography;
const DoctorAppointmentDate = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formCreate] = Form.useForm();
  const searchInput = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [rowSelected, setRowSelected] = useState(null);
  const [appointmentDetail, setAppointmentDetail] = useState(null);
  const [isOpenModalCancel, setIsOpenModalCancel] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const doctorId = user?.doctor?.doctorId;
  const { state } = location;
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    type: "checkbox",
  };

  const queryGetAllDoctorAppointments = useQuery({
    queryKey: ['doctor-appointments', state?.list[0]?.date],
    queryFn: () => AppointmentService.getDoctorAppointments(doctorId, { date: dayjs(state?.list[0]?.date,"DD/MM/YYYY").format("YYYY-MM-DD") }),
    keepPreviousData: true,
  });
  const mutationCreateMedicalResult = useMutation({
    mutationKey: ['create-medical-result'],
    mutationFn: (medicalResultData) => MedicalResultService.createMedicalResult(medicalResultData),
    onSuccess: (data) => {
      Message.success(data.message || "Tạo kết quả khám thành công");
      setIsOpenModal(false);
      if(isDrawerOpen) setIsDrawerOpen(false);
      formCreate.resetFields();
      queryGetAllDoctorAppointments.refetch();
    },
    onError: (error) => {
      Message.error("Tạo kết quả khám thất bại: " + (error?.message || "Lỗi không xác định"));
    },
  });
  const mutationCancelAppointment = useMutation({
    mutationKey: ['cancel-appointment'],
    mutationFn: AppointmentService.cancelAppointment,
    onSuccess: (data) => {
      Message.success(data.message || "Huỷ lịch khám thành công");
      setIsOpenModalCancel(false);
      if(isDrawerOpen) setIsDrawerOpen(false);
      queryGetAllDoctorAppointments.refetch();
    },
    onError: (error) => {
      Message.error(error?.response?.data?.message || "Huỷ lịch khám thất bại: Lỗi không xác định");
    }
  });
  const getColumnSearchProps = (dataIndex, type = "text") => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
        {type === "date" ? (
            // 🔹 Nếu là kiểu ngày
            <DatePicker
            format="DD/MM/YYYY"
            value={selectedKeys[0] ? dayjs(selectedKeys[0], "DD/MM/YYYY") : null}
            onChange={(date) =>
                setSelectedKeys(date ? [date.format("DD/MM/YYYY")] : [])
            }
            style={{ marginBottom: 8, display: "block" }}
            />
        ) : (
            // 🔹 Nếu là kiểu text (giữ nguyên ô search của bạn)
            <Input
            ref={searchInput}
            placeholder={`Tìm theo ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: "block" }}
            />
        )}

        <Space>
            <ButtonComponent
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
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
    onFilter: (value, record) => {
        if (type === "date") {
        return dayjs(record[dataIndex], "DD/MM/YYYY").isSame(
            dayjs(value, "DD/MM/YYYY"),
            "day"
        );
        }
        return record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    filterDropdownProps: {
        onOpenChange: (open) => {
        if (open && type === "text") {
            setTimeout(() => searchInput.current?.select(), 100);
        }
        },
    },
    render: (text) =>
        searchedColumn === dataIndex ? (
        <Highlighter
            highlightStyle={{ backgroundColor: "#91d5ff", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
        />
        ) : (
        text
        ),
    });

  // sửa lại để Xóa cũng confirm luôn
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
  const columns = [
    {
      title: "STT",
      dataIndex: "appointmentNumber",
      key: "appointmentNumber",
      width: 80,
      ...getColumnSearchProps("appointmentNumber"),
    },
    {
      title: "Mã lịch khám",
      dataIndex: "appointmentCode",
      key: "appointmentCode",
      ...getColumnSearchProps("appointmentCode"),
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patientName",
      key: "patientName",
      ...getColumnSearchProps("patientName"),
    },
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
      ...getColumnSearchProps("date", "date"),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      ...getColumnSearchProps("time"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {convertStatusAppointment(status)}
        </Tag>
      ),
      filters: [
        { text: 'Đã hủy', value: 'canceled' },
        { text: 'Đã hoàn thành', value: 'completed' },
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Chờ xác nhận', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (paymentStatus) => (
        <Tag color={getStatusPaymentColor(paymentStatus)}>
          {convertStatusPayment(paymentStatus)}
        </Tag>
      ),
      filters: [
        { text: 'Chưa thanh toán', value: 'unpaid' },
        { text: 'Đã thanh toán', value: 'paid' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const itemActions = [
          { key: "detail", label: "Xem chi tiết", icon: <EyeOutlined style={{ fontSize: 16 }} /> },
          
        ];
        if(record.status == "confirmed"){
          itemActions.push({ type: "divider" });
          itemActions.push({ key: "complete", label: "Hoàn thành", icon: <CheckCircleFilled style={{ fontSize: 16,color:'green' }} /> });
          itemActions.push({ type: "divider" });
          itemActions.push({ key: "cancel", label: "Huỷ lịch khám", icon: <ExclamationCircleOutlined style={{ fontSize: 16,color:'red' }} /> });

        }

        const onMenuClick = ({ key, domEvent }) => {
          setRowSelected(record.key);
          domEvent.stopPropagation(); // tránh chọn row khi bấm menu
          if (key === "detail") return handleViewAppointment(record.key);
          if (key === "complete") return handleCompleteAppointment(record.key);
          if (key === "cancel") return setIsOpenModalCancel(true);
        };

        return (
          <>
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
                onClick={(e) => e.stopPropagation()} 
              />
            </Dropdown>
          </>
        );
      },
    },
  ].filter(Boolean);
  const {data: appointments, isLoading: isLoadingDoctorAppointments} = queryGetAllDoctorAppointments;
  const appointmentsData = appointments?.data?.appointments || [];
  const dataTable = appointmentsData?.map((appointment, index) => {
    return {
      key: appointment.appointmentId,
      appointmentNumber: appointment.appointmentNumber,
      appointmentCode: appointment.appointmentCode,
      patientName: appointment.patientProfile?.person?.fullName || '--',
      date: formatDate(appointment.schedule.workday),
      time: formatTime(appointment?.slot),
      paymentStatus: appointment.payment?.status,
      status: appointment.status,
    };
  });
  const handleViewAppointment = (appointmentId) => {
    const appointment = appointmentsData.find(app => app.appointmentId === appointmentId);
    if(!appointment) return;
    setAppointmentDetail(appointment);
    setIsDrawerOpen(true);
  };
  const handleCompleteAppointment = (appointmentId) => {
    setRowSelected(appointmentId);
    setIsOpenModal(true);
  };
  const handleCreateMedicalResult = async () => {
    try {
      // ✅ Validate form trước khi gửi
      const values = await formCreate.validateFields();

      const formData = new FormData();
      formData.append("appointment", rowSelected);
      formData.append("diagnosis", values.diagnosis);
      formData.append("prescription", values.prescription || "");
      formData.append("notes", values.notes || "");

      // ✅ Xử lý file đính kèm (nếu có)
      if (Array.isArray(values.attachments)) {
        values.attachments.forEach((file) => {
          if (file.originFileObj) {
            formData.append("attachments", file.originFileObj);
          }
        });
      }

      // ✅ Gọi mutation (axios/fetch/RTK query,...)
      mutationCreateMedicalResult.mutate(formData);

    } catch (error) {
      // console.error("Lỗi khi gửi form:", error);
    }
  };

  const handleOkCancelConfirm = () => {
    mutationCancelAppointment.mutate(rowSelected);
  };
  const handleCancelConfirm = () => {
    setIsOpenModalCancel(false);
  };

  return (
    <>
      <Title level={4}>
        Lịch khám ngày{" "}
        {state?.list[0] ? state?.list[0]?.date : "Chưa chọn ngày"}
      </Title>
    
      <TableStyle
        rowSelection={rowSelection}
        emptyText="Không có lịch khám nào"
        columns={columns}
        loading={isLoadingDoctorAppointments}
        dataSource={dataTable}
        pagination={pagination}
        onChange={(page, pageSize) => {
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize,
          }));
        }}
      />
      
      <ModalComponent
        title="Hoàn thành cuộc hẹn"
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleCreateMedicalResult}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form
          name="formCreateMedicalResult"
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete="off"
          labelAlign="left"
          scrollToFirstError
          form={formCreate}
        >
        {/* 🧩 Chẩn đoán (bắt buộc) */}
          <Form.Item
            label="Chẩn đoán"
            name="diagnosis"
            rules={[{ required: true, message: "Vui lòng nhập chẩn đoán" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập chẩn đoán của bác sĩ..." />
          </Form.Item>

          {/* 💊 Toa thuốc */}
          <Form.Item
            label="Toa thuốc"
            name="prescription"
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung toa thuốc (nếu có)..." />
          </Form.Item>

          {/* 📝 Ghi chú */}
          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú thêm (nếu có)..." />
          </Form.Item>

          {/* 📎 Ảnh / file đính kèm */}
          <Form.Item
            label="Tệp đính kèm"
            name="attachments"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
            rules={[
              {
                validator: (_, value = []) => {
                  if (value.length > 5) {
                    return Promise.reject(new Error("Chỉ được chọn tối đa 5 tệp"));
                  }

                  return Promise.resolve();
                },
              },
            ]}
            extra="Chọn tối đa 5 ảnh hoặc file PDF"
          >
            <Upload
              listType="picture-card"
              multiple
              maxCount={5}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              beforeUpload={(file, fileList) => {
                const isValidType = [
                  "image/jpeg",
                  "image/png",
                  "image/jpg",
                  "image/gif",
                  "image/webp",
                  "application/pdf",
                ].includes(file.type);
                if (!isValidType) {
                  Message.error("Chỉ được chọn file ảnh hoặc PDF!");
                  return Upload.LIST_IGNORE;
                } 
                if (fileList.length > 5) {
                  Message.error("Bạn chỉ được chọn tối đa 5 tệp!");
                  return Upload.LIST_IGNORE;
                }

                return false; // không upload tự động
              }}
            >
              <ButtonComponent type="dashed" icon={<UploadOutlined />}>
                Chọn tệp
              </ButtonComponent>
            </Upload>
          </Form.Item>
        </Form>
      </ModalComponent>
      <ModalComponent
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
            <span style={{ fontWeight: 600 }}>Huỷ lịch khám</span>
          </span>
        }
        open={isOpenModalCancel}
        onOk={handleOkCancelConfirm}
        onCancel={handleCancelConfirm}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ 
          type: "primary", 
          danger: true, 
        }}
        centered
        style={{ borderRadius: 12 }}
    >
      <LoadingComponent isLoading={mutationCancelAppointment.isPending} >
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <Text style={{ fontSize: 16 }}>
            Bạn có chắc chắn muốn{" "}
            <Text strong type="danger">
              huỷ
            </Text>{" "}
            lịch khám này không ( bệnh nhân không đến khám )?
          </Text>
        </div>
      </LoadingComponent>
      </ModalComponent>
      <DrawerDetailAppointment
        visible={isDrawerOpen}
        appointmentDetail={appointmentDetail}
        onClose={() => setIsDrawerOpen(false)}
        onComplete={() => setIsOpenModal(true)}
        onCancel={() => setIsOpenModalCancel(true)}
      />
    </>
  )
}

export default DoctorAppointmentDate