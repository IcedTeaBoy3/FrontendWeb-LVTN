
import { useNavigate, useLocation } from "react-router-dom"
import { Space, Input, Form, Select, Radio, Typography, Divider, Dropdown, DatePicker, Upload, Tag, Popover } from "antd";
import TableStyle from "@/components/TableStyle/TableStyle";
import Highlighter from "react-highlight-words";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import defaultImage from "@/assets/default_image.png";
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, CheckOutlined } from "@ant-design/icons";
import { useState, useRef} from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
// Thiết lập ngôn ngữ cho dayjs
dayjs.locale("vi");
const { Text, Title } = Typography;
const DoctorAppointmentDate = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const searchInput = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [rowSelected, setRowSelected] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  console.log("state", state);
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
        setSelectedRowKeys(selectedKeys);
    },
    type: "checkbox",
  };
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
                <ButtonComponent
                    onClick={() => handleReset(clearFilters, confirm)}
                    size="small"
                    style={{ width: 90 }}
                >
                    Xóa
                </ButtonComponent>
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
      title: "Bệnh nhân",
      dataIndex: "patientName",
      key: "patientName",
      ...getColumnSearchProps("patientName"),
    },
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        // const itemActions = [
        //   { key: "detail", label: "Xem chi tiết", icon: <EyeOutlined style={{ fontSize: 16 }} /> },
        //   { type: "divider" },
        //   { key: "edit", label: "Chỉnh sửa", icon: <EditOutlined style={{ fontSize: 16 }} /> },
        //   { type: "divider" },
        //   { key: "delete", label: <Text type="danger">Xoá</Text>, icon: <DeleteOutlined style={{ fontSize: 16, color: "red" }} /> },
        // ];

        // const onMenuClick = ({ key, domEvent }) => {
        //   setRowSelected(record.key);
        //   domEvent.stopPropagation(); // tránh chọn row khi bấm menu
        //   // if (key === "detail") return handleViewDoctor(record.key);
        //   // if (key === "edit") return handleEditDoctor(record.key);
        //   // if (key === "delete") return handleShowConfirmDelete();
        // };

        return (
          <>
            <ButtonComponent
              type="primary"
              icon={<CheckOutlined style={{ fontSize: 16 }} />}
              onClick={() => {}}
              disabled={record.status !== 'confirmed'}
            >
              Hoàn thành khám
            </ButtonComponent>
          </>
        );
      },
    },
  ].filter(Boolean);
  const dataTable = state?.list?.map((item, index) => {
      return {
        key: item.id,
        appointmentNumber: item.appointmentNumber,
        patientName: item.patientName,
        date: item.date,
        time: item.time,
        status: item.status,
      };
  });
  console.log("date",state?.date);  
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
    </>
  )
}

export default DoctorAppointmentDate