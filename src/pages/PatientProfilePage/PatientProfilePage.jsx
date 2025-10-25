import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { PatientProfileService } from '@/services/PatientProfileService'
import AddressService from '@/services/AddressService'
import { Space, Input, Button, Form, Radio, Typography, Popover, Divider, Dropdown, Upload, Tag, Image, Avatar, Row, Col,DatePicker,Select, Descriptions  } from "antd";
import Highlighter from "react-highlight-words";
import TableStyle from "@/components/TableStyle/TableStyle";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import ethnicGroups from '@/data/ethnicGroups.js'
import dayjs from 'dayjs';
import { convertGender } from '@/utils/gender_utils';
import { StyledCard } from '../DoctorPage/style';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    UploadOutlined,
    ExportOutlined,
} from "@ant-design/icons";
const { Text, Title } = Typography;
const PatientProfilePage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [patientProfile, setPatientProfile] = useState(null);
    const [formUpdate] = Form.useForm();
    const getNameByCode = (list, code) => list.find(i => i.code === code)?.name || '';

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
    // phân trang
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
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
     // Gọi API lấy tỉnh
    useEffect(() => {
        const res = AddressService.getAllProvinces();
        res.then((data) => { setProvinces(data); });
    }, [patientProfile]);
    const handleProvinceChange = async (provinceCode) => {
        const res = await AddressService.getDistrictsByProvince(provinceCode);

        setDistricts(res);
        setWards([]); // Reset xã vì huyện mới chưa được chọn

        // Reset trong form nếu cần
        formUpdate.setFieldsValue({
            district: undefined,
            ward: undefined,
        });
    };
    const handleDistrictChange = async (districtCode) => {

        const res = await AddressService.getWardsByDistrict(districtCode);
        setWards(res);
        formUpdate.setFieldsValue({
            ward: undefined,
        });
    };
    const handleWardChange = (wardCode) => {
        // Không cần làm gì thêm ở đây, chỉ cần cập nhật ward trong form
        formUpdate.setFieldsValue({
            ward: wardCode,
        });

    };
    const queryGetAllPatientProfiles = useQuery({
        queryKey: ['getAllPatientProfiles'],
        queryFn: () => PatientProfileService.getAllPatientProfiles({ status: '', page: 1, limit: 1000 }),
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const mutationDeletePatientProfile = useMutation({
        mutationKey: ['deletePatientProfile'],
        mutationFn: (patientProfileId) => PatientProfileService.deletePatientProfile(patientProfileId),
        onSuccess: (data) => {
            if(data?.status === "success"){
                Message.success(data?.message || "Xoá hồ sơ bệnh nhân thành công");
                queryGetAllPatientProfiles.refetch();
                setIsModalOpenDelete(false);
                setRowSelected(null);
            }else{
                Message.error(data?.message || "Xoá hồ sơ bệnh nhân thất bại");
            }

        },
        onError: (error) => {
            Message.error(error?.message || "Xoá hồ sơ bệnh nhân thất bại");
        }
    });
    const mutationDeleteManyPatientProfiles = useMutation({
        mutationKey: ['deleteManyPatientProfiles'],
        mutationFn: (patientProfileIds) => PatientProfileService.deleteManyPatientProfiles(patientProfileIds),
        onSuccess: (data) => {
            if(data?.status === "success"){
                Message.success(data?.message || "Xoá nhiều hồ sơ bệnh nhân thành công");
                queryGetAllPatientProfiles.refetch();
                setSelectedRowKeys([]);
                setIsModalOpenDeleteMany(false);
            }else{
                Message.error(data?.message || "Xoá nhiều hồ sơ bệnh nhân thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Xoá nhiều hồ sơ bệnh nhân thất bại");
        }
    });
    const mutationUpdatePatientProfile = useMutation({
        mutationKey: ['updatePatientProfile'],
        mutationFn: ({ patientProfileId, data }) => PatientProfileService.updatePatientProfile(patientProfileId, data),
        onSuccess: (data) => {
            if(data?.status === "success"){
                Message.success(data?.message || "Cập nhật hồ sơ bệnh nhân thành công");
                queryGetAllPatientProfiles.refetch();
                setIsDrawerOpen(false);
                formUpdate.resetFields();
            }else{
                Message.error(data?.message || "Cập nhật hồ sơ bệnh nhân thất bại");
            }
        },
        onError: (error) => {
            Message.error(error?.message || "Cập nhật hồ sơ bệnh nhân thất bại");
        }
    });
    function findEthnic(ethnicGroups, value) {
        if (!value) return null;
        return ethnicGroups.find(
            (item) => item.name === value || item.code === value
        )?.name || null;
    }

    const { data: patientProfiles, isLoading: isLoadingPatientProfiles } = queryGetAllPatientProfiles;
    const { isPending: isPendingDelete } = mutationDeletePatientProfile;
    const { isPending: isPendingDeleteMany } = mutationDeleteManyPatientProfiles;
    const { isPending: isPendingUpdate } = mutationUpdatePatientProfile;
    const data = patientProfiles?.data?.patientprofiles || [];
    const dataTable = data?.map((item, index) => ({
        key: item.patientProfileId,
        patientProfileCode: item.patientProfileCode,
        index: index + 1,
        idCard: item.idCard,
        insuranceCode: item.insuranceCode || <Text type="secondary">Chưa cập nhật</Text>,
        fullName: item.person.fullName || <Text type="secondary">Chưa cập nhật</Text>,
        dateOfBirth: item.person.dateOfBirth,
        gender: item.person.gender,
    }));
   
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Mã bệnh nhân",
            dataIndex: "patientProfileCode",
            key: "patientProfileCode",
            ...getColumnSearchProps("patientProfileCode"),
        },
        {
            title: "CCCD/CMND",
            dataIndex: "idCard",
            key: "idCard",
            ...getColumnSearchProps("idCard"),
        },
        {
            title: "Mã bảo hiểm",
            dataIndex: "insuranceCode",
            key: "insuranceCode",
            ...getColumnSearchProps("insuranceCode"),
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            ...getColumnSearchProps("fullName"),
        },
        {
            title: "Ngày sinh",
            dataIndex: "dateOfBirth",
            key: "dateOfBirth",
        
            render: (text) => dayjs(text).format("DD/MM/YYYY"),
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            filters: [
                { text: "Nam", value: "male" },
                { text: "Nữ", value: "female" },
                { text: "Khác", value: "other" },
            ],
            onFilter: (value, record) => record.gender.startsWith(value),
            filterMultiple: false,
            render: (text) => (
                <Tag color={text === "male" ? "blue" : text === "female" ? "pink" : "gray"}>
                    {text === "male" ? "Nam" : text === "female" ? "Nữ" : "Khác"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                const itemActions = [
                    { key: "detail", label: "Xem chi tiết", icon: <EyeOutlined style={{ fontSize: 16 }} /> },
                    { type: "divider" },
                    { key: "edit", label: "Chỉnh sửa", icon: <EditOutlined style={{ fontSize: 16 }} /> },
                    { type: "divider" },
                    { key: "delete", label: <Text type="danger">Xoá</Text>, icon: <DeleteOutlined style={{ fontSize: 16, color: "red" }} /> },
                ];

                const onMenuClick = ({ key, domEvent }) => {
                    setRowSelected(record.key);
                    domEvent.stopPropagation(); // tránh chọn row khi bấm menu
                    if (key === "detail") return handleViewPatientProfile(record.key);
                    if (key === "edit") return handleEditPatientProfile(record.key);
                    if (key === "delete") return handleShowConfirmDelete();
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
    const handleShowConfirmDelete = () => {
        setIsModalOpenDelete(true);
    };
    const handleEditPatientProfile = async (id) => {
        const patient = data.find((item) => item.patientProfileId === id);
        
        if(patient){
            setIsDrawerOpen(true);
            setPatientProfile(patient);
           // Tách địa chỉ
            const parts = patient.person.address.split(',').map((p) => p.trim());
            const [specificAddress, wardName, districtName, provinceName] = parts;

            // Tìm mã
            const provinceObj = provinces.find((p) => p.name === provinceName);
            const provinceCode = provinceObj?.code;

            let districtObj, wardObj;
            let districtCode, wardCode;
            let districtsData = [], wardsData = [];

            if (provinceCode) {
                districtsData = await AddressService.getDistrictsByProvince(provinceCode);
                setDistricts(districtsData);
                districtObj = districtsData.find((d) => d.name === districtName);
                districtCode = districtObj?.code;
            }

            if (districtCode) {
                wardsData = await AddressService.getWardsByDistrict(districtCode);
                setWards(wardsData);
                wardObj = wardsData.find((w) => w.name === wardName);
                wardCode = wardObj?.code;
            }

            formUpdate.setFieldsValue({
                patientProfileCode: patient.patientProfileCode,
                idCard: patient.idCard,
                insuranceCode: patient.insuranceCode,
                fullName: patient.person.fullName,
                dateOfBirth: patient.person.dateOfBirth ? dayjs(patient.person.dateOfBirth) : null,
                gender: patient.person.gender,
                phone: patient.person.phone,
                ethnicGroup: patient.person.ethnic,
                relation: patient.relation,
                specificAddress: specificAddress || '',
                ward: wardCode || undefined,
                district: districtCode || undefined,
                province: provinceCode || undefined,
            });
        }
    };
    const handleViewPatientProfile = (id) => {
        const patient = data.find((item) => item.patientProfileId === id);
        if(patient){
            setPatientProfile(patient);
            setIsModalDetailOpen(true);
        }
    };
    const handleOkDelete = () => {
        if(rowSelected){
            mutationDeletePatientProfile.mutate(rowSelected);
        }
    };
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
        setRowSelected(null);
    };
    const handleOkDeleteMany = () => {
        if(selectedRowKeys.length > 0){
            mutationDeleteManyPatientProfiles.mutate(selectedRowKeys);
        }
    };
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
    };
    const handleOnUpdatePatientProfile = () => {
        formUpdate.validateFields().then((validatedValues) => {
            const hasAddressChange =
                validatedValues.specificAddress ||
                validatedValues.ward ||
                validatedValues.district ||
                validatedValues.province;
            const person = {
                fullName: validatedValues.fullName,
                dateOfBirth: validatedValues.dateOfBirth ? dayjs(validatedValues.dateOfBirth).toISOString() : null,
                gender: validatedValues.gender,
                phone: validatedValues.phone,
                ethnic: validatedValues.ethnicGroup,
                address: hasAddressChange
                ? `${validatedValues.specificAddress || ''}, ${getNameByCode(wards, validatedValues.ward) || ''}, ${getNameByCode(districts, validatedValues.district) || ''}, ${getNameByCode(provinces, validatedValues.province) || ''}`
                : patientProfile?.person?.address,
            };
            

            const updatedValues = {
                idCard: validatedValues.idCard,
                patientProfileCode: validatedValues.patientProfileCode,
                insuranceCode: validatedValues.insuranceCode,
                person,
                relation: validatedValues.relation,
            };

            mutationUpdatePatientProfile.mutate({ patientProfileId: rowSelected, data: updatedValues });
        });
    };

    const menuProps = {
        items: [
            {
                key: "export",
                label: "Xuất file",
                icon: <ExportOutlined style={{ fontSize: 16 }} />,
            },
            {
                type: "divider"
            },
            {
                key: "delete",
                label: <Text type="danger">Xoá tất cả</Text>,
                icon: <DeleteOutlined style={{ color: "red", fontSize: 16 }} />,
                onClick: () => setIsModalOpenDeleteMany(true),
            },
        ],
    };
    const handleSelectedAll = () => {
        if (selectedRowKeys.length === dataTable.length) {
            setSelectedRowKeys([]);
        } else {
            setSelectedRowKeys(dataTable.map(item => item.key));
        }
    };

    return (
        <>
            <Title level={4}>Danh sách bệnh nhân</Title>
            
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <ButtonComponent
                    type="primary"
                    // onClick={() => setIsModalOpenCreate(true)}
                    icon={<PlusOutlined />}
                    style={{ marginRight: 8 }}
                >
                    Thêm mới
                </ButtonComponent>
                <ButtonComponent    
                    type="default"
                
                >
                    Xuất file
                    <ExportOutlined style={{ fontSize: 16, marginLeft: 8 }} />
                </ButtonComponent>
            </div>
            <BulkActionBar
                selectedRowKeys={selectedRowKeys}
                handleSelectedAll={handleSelectedAll}
                menuProps={menuProps}
            />

            
            <TableStyle
                rowSelection={rowSelection}
                columns={columns}
                loading={isLoadingPatientProfiles}
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
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá bệnh nhân</span>
                    </span>
                }
                open={isModalOpenDelete}
                onOk={handleOkDelete}
                onCancel={handleCancelDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDelete}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            hồ sơ bệnh nhân này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá bệnh nhân</span>
                    </span>
                }
                open={isModalOpenDeleteMany}
                onOk={handleOkDeleteMany}
                onCancel={handleCancelDeleteMany}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteMany}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            {selectedRowKeys.length} hồ sơ bệnh nhân đã chọn không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <DrawerComponent
                title="Chi tiết bệnh nhân"
                placement="right"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={window.innerWidth < 768 ? "100%" : 700}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdate}>
                    <Form
                        name="formUpdate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        labelAlign="left"
                       
                        onFinish={handleOnUpdatePatientProfile}
                        autoComplete="off"
                        form={formUpdate}
                    >

                        <StyledCard style={{ marginBottom: 16 }}
                            title="Thông tin tài khoản"
                            
                        >
                            
                            {/* Hiển thị thông tin tài khoản email, user name */}
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={8}>
                                    <Text strong>Email:</Text>
                                </Col>
                                <Col span={16}>
                                    <Text>{patientProfile?.account?.email || 'Chưa cập nhật'}</Text>
                                </Col>
                            </Row>
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={8}>
                                    <Text strong>Tên tài khoản:</Text>
                                </Col>
                                <Col span={16}>
                                    <Text>{patientProfile?.account?.userName || 'Chưa cập nhật'}</Text>
                                </Col>
                            </Row>
                                  
                        </StyledCard>
                        <StyledCard 
                            style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 12,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden',
                            }}
                            title="Thông tin bệnh nhân"
                        >

                            <Form.Item
                                label="Mã hồ sơ"
                                name="patientProfileCode"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập mã hồ sơ!",
                                    },
                                ]}
                            >
                                <Input name="patientProfileCode" />
                            </Form.Item>
                            <Form.Item
                                label="CCCD"
                                name="idCard"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập CCCD!",
                                    },
                                ]}
                            >
                                <Input name="idCard" />
                            </Form.Item>
                            <Form.Item
                                label="Mã bảo hiểm"
                                name="insuranceCode"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập mã bảo hiểm!",
                                    },
                                ]}
                            >
                                <Input name="insuranceCode" />
                            </Form.Item>
                            <Form.Item
                                label="Họ và tên"
                                name="fullName"
                            
                            >
                                <Input name="fullName" />
                            </Form.Item>
                            <Form.Item
                                label="Ngày sinh"
                                name="dateOfBirth"
                                
                            >
                                <DatePicker 
                                    style={{ width: '100%' }}  
                                    format={"DD/MM/YYYY"}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Giới tính"
                                name="gender"
                            
                            >
                                <Radio.Group>
                                    <Radio value="male">Nam</Radio>
                                    <Radio value="female">Nữ</Radio>
                                    <Radio value="other">Khác</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item
                                label="SĐT"
                                name="phone"
                            >
                                <Input name="phone" />
                            </Form.Item>
                            <Form.Item
                                label="Dân tộc"
                                name="ethnicGroup"
                            >
                                <Select
                                    options={ethnicGroups.map(group => ({
                                        label: group.name,
                                        value: group.code
                                    }))}
                                    placeholder="Chọn dân tộc"
                                    notFoundContent="Chưa có dữ liệu"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                label="Mối quan hệ"
                                name="relation"
                            >
                                <Radio.Group direction="vertical">
                                    <Radio value="self">Bản thân</Radio>
                                    <Radio value="parent">Cha/Mẹ</Radio>
                                    <Radio value="spouse">Vợ/Chồng</Radio>
                                    <Radio value="sibling">Anh/Chị/Em</Radio>
                                    <Radio value="child">Con</Radio>
                                    <Radio value="other">Khác</Radio>
                                </Radio.Group>

                            </Form.Item>
                            <Title level={5}>Địa chỉ</Title>
                            <Divider style={{margin: '16px 0'}}/>
                            <Form.Item
                                label="Tỉnh/Thành phố"
                                name="province"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn tỉnh/thành phố!",
                                    }
                                ]}
                            >
                                <Select
                                    options={provinces.map(province => ({
                                        label: province.name,
                                        value: province.code
                                    }))}
                                    showSearch
                                    placeholder="Chọn quận/huyện"
                                    notFoundContent="Chưa có dữ liệu"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    onChange={handleProvinceChange}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Quận/Huyện"
                                name="district"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn quận/huyện!",
                                    }
                                ]}
                            >
                                <Select
                                    options={districts.map(district => ({
                                        label: district.name,
                                        value: district.code
                                    }))}
                                    showSearch
                                    placeholder="Chọn quận/huyện"
                                    notFoundContent="Chưa có dữ liệu"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    onChange={handleDistrictChange}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Phường/Xã"
                                name="ward"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn phường/xã!",
                                    }
                                ]}
                            >
                                <Select
                                    options={wards.map(ward => ({
                                        label: ward.name,
                                        value: ward.code
                                    }))}
                                    showSearch
                                    placeholder="Chọn quận/huyện"
                                    notFoundContent="Chưa có dữ liệu"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    onChange={handleWardChange}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Địa chỉ cụ thể"
                                name="specificAddress"
                            >
                                <Input.TextArea name="specificAddress" rows={3} />
                            </Form.Item>
                            <Form.Item
                                label={null}
                                wrapperCol={{ offset: 18, span: 6 }}
                            >
                                <Space>
                                    <ButtonComponent
                                        type="default"
                                        onClick={() => setIsDrawerOpen(false)}
                                    >
                                        Huỷ
                                    </ButtonComponent>
                                    <ButtonComponent
                                        type="primary"
                                        htmlType="submit"
                                    >
                                        Lưu
                                    </ButtonComponent>
                                </Space>
                            </Form.Item>
                        </StyledCard>  
                                     
                    </Form>
                </LoadingComponent>
            </DrawerComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
                    <span>Thông tin chi tiết</span>
                    </span>
                }
                open={isModalDetailOpen}
                onCancel={() => setIsModalDetailOpen(false)}
                footer={null}
                centered
                style={{ borderRadius: 8 }}
            >
                <Title level={5}>Thông tin tài khoản</Title>
                <Descriptions column={1} bordered size='small' style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Email">{patientProfile?.account?.email || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Tên tài khoản">{patientProfile?.account?.userName || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                </Descriptions>
               
                <Title level={5}>Thông tin bệnh nhân</Title>
                <Descriptions column={1} bordered size='small'>
                    <Descriptions.Item label="Mã hồ sơ">{patientProfile?.patientProfileCode || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="CCCD">{patientProfile?.idCard || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Mã bảo hiểm">{patientProfile?.insuranceCode || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">{patientProfile?.person?.fullName || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{patientProfile?.person?.dateOfBirth ? dayjs(patientProfile.person.dateOfBirth).format("DD/MM/YYYY") : <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Giới tính">{convertGender(patientProfile?.person?.gender) || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{patientProfile?.person?.phone || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Dân tộc">{findEthnic(ethnicGroups, patientProfile?.person?.ethnic) || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{patientProfile?.person?.address || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
                </Descriptions>
            </ModalComponent>
        </>
    )
}

export default PatientProfilePage