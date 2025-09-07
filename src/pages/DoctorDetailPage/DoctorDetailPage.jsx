import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom';
import { DoctorService } from '@/services/DoctorService';
import { DoctorWorkplaceService } from '@/services/DoctorWorkplaceService';
import { DoctorSpecialtyService } from '@/services/DoctorSpecialtyService';
import { WorkplaceService } from '@/services/WorkplaceService';
import { PositionService } from '@/services/PositionService';
import { DegreeService } from '@/services/DegreeService';
import { SpecialtyService } from '@/services/SpecialtyService';
import { Space, Input, Button, Form, Select, Radio, Typography, Popover, Divider, Dropdown, Menu, DatePicker, Row, Col, Tag, Skeleton, Checkbox, InputNumber } from "antd";
import Highlighter from "react-highlight-words";
import { TableStyled } from './style';
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ModalComponent from "@/components/ModalComponent/ModalComponent";
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar';
import * as Message from "@/components/Message/Message";
import { AnimatePresence } from "framer-motion";
import dayjs from 'dayjs';
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    ExportOutlined,
    PlusOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
const { Text, Title } = Typography;
const DoctorDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isOpenModalCreateDoctorSpecialty, setIsOpenModalCreateDoctorSpecialty] = useState(false);
    const [isOpenModalCreateDoctorWorkplace, setIsOpenModalCreateDoctorWorkplace] = useState(false);
    const [isDrawerOpenWorkplace, setIsDrawerOpenWorkplace] = useState(false);
    const [isDrawerOpenSpecialty, setIsDrawerOpenSpecialty] = useState(false);
    const [isModalOpenDeleteWorkplace, setIsModalOpenDeleteWorkplace] = useState(false);
    const [isModalOpenDeleteSpecialty, setIsModalOpenDeleteSpecialty] = useState(false);
    const [isOpenModalCreateDegree, setIsOpenModalCreateDegree] = useState(false);
    const [rowSelectedWorkplace, setRowSelectedWorkplace] = useState(null);
    const [rowSelectedSpecialty, setRowSelectedSpecialty] = useState(null);
    const [selectedRowKeySpecialties, setSelectedRowKeySpecialties] = useState([]);
    const [selectedRowKeyWorkplaces, setSelectedRowKeyWorkplaces] = useState([]);
    const [formCreateDoctorWorkplace] = Form.useForm();
    const [formUpdateDoctorWorkplace] = Form.useForm();
    const [formCreateDoctorSpecialty] = Form.useForm();
    const [formUpdateDoctorSpecialty] = Form.useForm();
    const [formUpdateDoctor] = Form.useForm();
    const [formCreateDegree] = Form.useForm();
    const rowSelectionWorkplaces = {
        selectedRowKeyWorkplaces,
        onChange: (selectedKeys) => {
            setSelectedRowKeyWorkplaces(selectedKeys);
        },
        type: "checkbox",
    };
    const rowSelectionSpecialties = {
        selectedRowKeySpecialties,
        onChange: (selectedKeys) => {
            setSelectedRowKeySpecialties(selectedKeys);
        },
        type: "checkbox",
    };
    // phân trang
    const [paginationWorkplaces, setPaginationWorkplaces] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [paginationSpecialties, setPaginationSpecialties] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const queryGetDoctor = useQuery({
        queryKey: ['doctorDetail'],
        queryFn: () => DoctorService.getDoctor(id),
        enabled: !!id,
    });
    const queryGetAllWorkplaces = useQuery({
        queryKey: ['getAllWorkplaces'],
        queryFn: WorkplaceService.getAllWorkplaces,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetAllPositions = useQuery({
        queryKey: ['getAllPositions'],
        queryFn: PositionService.getAllPositions,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetAllDegrees = useQuery({
        queryKey: ['getAllDegrees'],
        queryFn: DegreeService.getAllDegrees,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetAllSpecialties = useQuery({
        queryKey: ['getAllSpecialties'],
        queryFn: SpecialtyService.getAllSpecialties,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetAllWorkplacesByDoctor = useQuery({
        queryKey: ['getWorkplacesByDoctor', id],
        queryFn: () => DoctorWorkplaceService.getWorkplacesByDoctor(id),
        enabled: !!id,
    });
    const queryGetAllSpecialtiesByDoctor = useQuery({
        queryKey: ['getSpecialtiesByDoctor', id],
        queryFn: () => DoctorSpecialtyService.getSpecialtiesByDoctor(id),
        enabled: !!id,
    });
    const mutationCreateDoctorWorkplace = useMutation({
        mutationKey: ['createDoctorWorkplace'],
        mutationFn: DoctorWorkplaceService.createDoctorWorkplace,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                formCreateDoctorWorkplace.resetFields();
                setIsOpenModalCreateDoctorWorkplace(false);
                queryGetAllWorkplacesByDoctor.refetch();
            } else {
                Message.error(data.message || "Thêm nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Thêm nơi làm việc thất bại");
        }
    });
    const mutationDeleteDoctorWorkplace = useMutation({
        mutationKey: ['deleteDoctorWorkplace'],
        mutationFn: DoctorWorkplaceService.deleteDoctorWorkplace,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setRowSelectedWorkplace(null);
                setIsModalOpenDeleteWorkplace(false);
                queryGetAllWorkplacesByDoctor.refetch();
            } else {
                Message.error(data.message || "Xoá nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Xoá nơi làm việc thất bại");
        }

    });
    const mutationUpdateDoctorWorkplace = useMutation({
        mutationKey: ['updateDoctorWorkplace'],
        mutationFn: ({ id, data }) => DoctorWorkplaceService.updateDoctorWorkplace(id, data),
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setIsDrawerOpenWorkplace(false);
                setRowSelectedWorkplace(null);
                formUpdateDoctorWorkplace.resetFields();
                queryGetAllWorkplacesByDoctor.refetch();
            } else {
                Message.error(data.message || "Cập nhật nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Cập nhật nơi làm việc thất bại");
        }
    });
    const mutationCreateDoctorSpecialty = useMutation({
        mutationKey: ['createDoctorSpecialty'],
        mutationFn: DoctorSpecialtyService.assignDoctorToSpecialty,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                formCreateDoctorSpecialty.resetFields();
                setIsOpenModalCreateDoctorSpecialty(false);
                queryGetAllSpecialtiesByDoctor.refetch();
            } else {
                Message.error(data.message || "Thêm chuyên khoa thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Thêm chuyên khoa thất bại");
        }
    });
    const mutationDeleteDoctorSpecialty = useMutation({
        mutationKey: ['deleteDoctorSpecialty'],
        mutationFn: DoctorSpecialtyService.removeDoctorFromSpecialty,
        onSuccess: (data) => {
            if (data.status == "success") {
                Message.success(data.message);
                setRowSelectedSpecialty(null);
                setIsModalOpenDeleteSpecialty(false);
                queryGetAllSpecialtiesByDoctor.refetch();
            } else {
                Message.error(data.message || "Xoá chuyên khoa thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Xoá chuyên khoa thất bại");
        }
    });
    const mutationUpdateDoctorSpecialty = useMutation({
        mutationKey: ['updateDoctorSpecialty'],
        mutationFn: ({ id, data }) => DoctorSpecialtyService.updateDoctorSpecialty(id, data),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data.message);
                setIsDrawerOpenSpecialty(false);
                setRowSelectedSpecialty(null);
                formUpdateDoctorSpecialty.resetFields();
                queryGetAllSpecialtiesByDoctor.refetch();
            } else {
                Message.error(data.message || "Cập nhật nơi làm việc thất bại");
            }
        },
        onError: (error) => {
            Message.error(error.response.data.message || "Cập nhật nơi làm việc thất bại");
        }
    });
    const mutationUpdateDoctor = useMutation({
        mutationKey: ['updateDoctor'],
        mutationFn: ({ id, ...data }) => DoctorService.updateDoctor(id, data),
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                queryGetDoctor.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật bác sĩ thất bại. Vui lòng thử lại!");
        },
    });
    const mutationCreateDegree = useMutation({
        mutationKey: ['createDegree'],
        mutationFn: DegreeService.createDegree,
        onSuccess: (data) => {
            if (data?.status == "success") {
                Message.success(data?.message);
                formCreateDegree.resetFields();
                formUpdateDoctor.setFieldValue("degreeId", data?.data?.degreeId);
                setIsOpenModalCreateDegree(false);
                queryGetAllDegrees.refetch();
            } else {
                Message.error(data?.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Thêm bằng cấp thất bại. Vui lòng thử lại!");
        },
    });
    const { data: doctor, isLoading: isLoadingDoctor } = queryGetDoctor;
    const { data: doctorWorkplace, isLoading: isLoadingWorkplacesByDoctor } = queryGetAllWorkplacesByDoctor;
    const { data: doctorSpecialties, isLoading: isLoadingSpecialtiesByDoctor } = queryGetAllSpecialtiesByDoctor;
    const { data: workplaces, isLoading: isLoadingWorkplaces } = queryGetAllWorkplaces;
    const { data: positions, isLoading: isLoadingPositions } = queryGetAllPositions;
    const { data: specialties, isLoading: isLoadingSpecialties } = queryGetAllSpecialties;
    const { data: degrees, isLoading: isLoadingDegrees } = queryGetAllDegrees;
    const { isPending: isPendingCreateDoctorWorkplace } = mutationCreateDoctorWorkplace;
    const { isPending: isPendingDeleteDoctorWorkplace } = mutationDeleteDoctorWorkplace;
    const { isPending: isPendingUpdateDoctorWorkplace } = mutationUpdateDoctorWorkplace;
    const { isPending: isPendingCreateDegree } = mutationCreateDegree;
    const { isPending: isPendingCreateDoctorSpecialty } = mutationCreateDoctorSpecialty;
    const { isPending: isPendingUpdateDoctorSpecialty } = mutationUpdateDoctorSpecialty;
    const workplaceData = workplaces?.data?.workplaces || [];
    const positionData = positions?.data?.positions || [];
    const specialtyData = specialties?.data?.specialties || [];
    const degreeData = degrees?.data?.degrees || [];
    const doctorData = useMemo(() => doctor?.data || {}, [doctor]);
    const doctorWorkplaceData = doctorWorkplace?.data || [];
    const doctorSpecialtyData = doctorSpecialties?.data || [];
    console.log('doctorSpecialtyData', doctorSpecialtyData);
    useEffect(() => {
        if (doctorData) {
            formUpdateDoctor.setFieldsValue({
                email: doctorData.user?.email,
                phone: doctorData.user?.phone,
                name: doctorData.user?.name,
                degreeId: doctorData.degree?.degreeId, // hoặc doctorData.degree?.degreeId
                bio: doctorData?.bio,
                dateOfBirth: doctorData.user?.dateOfBirth
                    ? dayjs(doctorData.user?.dateOfBirth)
                    : null,
                gender: doctorData.user?.gender,
                address: doctorData.user?.address,
            });
        }
    }, [doctorData, formUpdateDoctor]);
    const columnsWorkplaces = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Nơi làm việc",
            dataIndex: "workplace",
            key: "workplace",
            sorter: (a, b) => a.name?.length - b.name?.length,
            render: (name) => {
                return name ? <Text>{name}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Chức vụ",
            dataIndex: "degree",
            key: "degree",
        },
        {
            title: "Nơi làm việc chính",
            dataIndex: "isPrimary",
            key: "isPrimary",
            filters: [
                { text: "Có", value: true },
                { text: "Không", value: false },
            ],
            onFilter: (value, record) => record.isPrimary === value,
            filterMultiple: false,
            render: (isPrimary) => {
                return isPrimary ? "✅" : "❌";
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                return (
                    <Space size="middle">
                        <ButtonComponent
                            size="small"
                            icon={<EditOutlined />}
                            type="primary"
                            onClick={() => handleEditWorkplace(record.key)}
                        >Sửa</ButtonComponent>
                        <ButtonComponent
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                setIsModalOpenDeleteWorkplace(true);
                            }}
                        >Xoá</ButtonComponent>
                    </Space>
                );
            },
        },
    ].filter(Boolean);
    const columnSpecialties = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: "Chuyên khoa",
            dataIndex: "specialty",
            key: "specialty",
            render: (specialty) => {
                return specialty ? <Text>{specialty}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Kinh nghiệm (năm)",
            dataIndex: "yearsOfExperience",
            key: "yearsOfExperience",
            sorter: (a, b) => a.yearsOfExperience - b.yearsOfExperience,
            render: (yearsOfExperience) => {
                return yearsOfExperience ? <Text>{yearsOfExperience}</Text> : <Text type="secondary">Chưa cập nhật</Text>;
            }
        },
        {
            title: "Nơi làm việc chính",
            dataIndex: "isPrimary",
            key: "isPrimary",
            filters: [
                { text: "Có", value: true },
                { text: "Không", value: false },
            ],
            onFilter: (value, record) => record.isPrimary === value,
            filterMultiple: false,
            render: (isPrimary) => {
                return isPrimary ? "✅" : "❌";
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                return (
                    <Space size="middle">
                        <ButtonComponent
                            size="small"
                            icon={<EditOutlined />}
                            type="primary"
                            onClick={() => handleEditSpecialty(record.key)}
                        >Sửa</ButtonComponent>
                        <ButtonComponent
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                setIsModalOpenDeleteSpecialty(true);
                            }}
                        >Xoá</ButtonComponent>
                    </Space>
                );
            },
        },
    ];
    const dataTableWorkplaces = doctorWorkplaceData?.map((item, index) => {
        return {
            key: item.doctorWorkplaceId,
            index: index + 1,
            workplace: item.workplace?.name,
            degree: item.position?.title,
            isPrimary: item.isPrimary,
        };
    });
    const dataTableSpecialties = doctorSpecialtyData?.map((item, index) => {
        return {
            key: item.doctorSpecialtyId,
            index: index + 1,
            specialty: item.specialty?.name,
            yearsOfExperience: item.yearsOfExperience,
            isPrimary: item.isPrimary,
        };
    });
    const handleBack = () => {
        navigate(-1);
    };
    const handleEditWorkplace = (key) => {
        const doctorWorkplace = doctorWorkplaceData?.find(wp => wp.doctorWorkplaceId === key);
        if (doctorWorkplace) {
            formUpdateDoctorWorkplace.setFieldsValue({
                workplaceId: doctorWorkplace.workplace?.workplaceId,
                positionId: doctorWorkplace.position?.positionId,
                isPrimary: doctorWorkplace.isPrimary,
            });
            setIsDrawerOpenWorkplace(true);
        }
    }
    const handleCreateDoctorWorkplace = () => {
        formCreateDoctorWorkplace.validateFields().then((values) => {
            mutationCreateDoctorWorkplace.mutate({
                ...values,
                doctorId: id
            });
        });
    };
    const handleCloseCreateDoctorWorkplace = () => {
        setIsOpenModalCreateDoctorWorkplace(false);
    };
    const handleOkDeleteWorkplace = () => {
        mutationDeleteDoctorWorkplace.mutate(rowSelectedWorkplace)
    };
    const handleCancelDeleteWorkplace = () => {
        setIsModalOpenDeleteWorkplace(false);
    };
    const handleOnUpdateDoctorWorkplace = (values) => {
        mutationUpdateDoctorWorkplace.mutate({ id: rowSelectedWorkplace, data: { ...values, doctorId: id } });
    };
    const handleOnUpdateDoctor = (values) => {
        mutationUpdateDoctor.mutate({ id: id, ...values });
    };
    const handleCreateDegree = () => {
        formCreateDegree.validateFields().then((values) => {
            mutationCreateDegree.mutate(values);
        });
    };
    const handleCloseCreateDegree = () => {
        setIsOpenModalCreateDegree(false);
    };
    const handleCancelUpdateDoctor = () => {
        formUpdateDoctor.resetFields();
    };
    const handleCreateDoctorSpecialty = () => {
        formCreateDoctorSpecialty.validateFields().then((values) => {
            mutationCreateDoctorSpecialty.mutate({
                ...values,
                doctorId: id
            });
        });
    };
    const handleCloseCreateDoctorSpecialty = () => {
        setIsOpenModalCreateDoctorSpecialty(false);
    };
    const handleEditSpecialty = (key) => {
        const doctorSpecialty = doctorSpecialtyData?.find(sp => sp.doctorSpecialtyId === key);
        if (doctorSpecialty) {
            formUpdateDoctorSpecialty.setFieldsValue({
                specialtyId: doctorSpecialty.specialty?.specialtyId,
                yearsOfExperience: doctorSpecialty.yearsOfExperience,
                isPrimary: doctorSpecialty.isPrimary,
            });
            setIsDrawerOpenSpecialty(true);
        }
    };
    const handleOkDeleteSpecialty = () => {
        mutationDeleteDoctorSpecialty.mutate(rowSelectedSpecialty)
    };
    const handleCancelDeleteSpecialty = () => {
        setIsModalOpenDeleteSpecialty(false);
    };
    const handleOnUpdateDoctorSpecialty = (values) => {
        mutationUpdateDoctorSpecialty.mutate({
            id: rowSelectedSpecialty, data: { ...values, doctorId: id }
        });
    }

    return (
        <>
            <ButtonComponent
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ fontSize: 18, padding: 0 }}
            >Thông tin bác sĩ</ButtonComponent>
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <LoadingComponent isLoading={isLoadingDoctor}>

                <Form
                    form={formUpdateDoctor}
                    layout='vertical'
                    initialValues={{
                        email: doctorData.user?.email,
                        phone: doctorData.user?.phone,
                        name: doctorData.user?.name,
                        degreeId: doctorData.degree?.degreeId,
                        bio: doctorData?.bio,
                        dateOfBirth: doctorData.user?.dateOfBirth ? dayjs(doctorData.user?.dateOfBirth) : null,
                        gender: doctorData.user?.gender,
                        address: doctorData.user?.address,
                    }}
                    onFinish={handleOnUpdateDoctor}
                >
                    <Row gutter={32}>
                        {/* Thông tin tài khoản */}
                        <Col span={12}>
                            <Title level={5}>Thông tin tài khoản</Title>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { type: "email", message: "Email không hợp lệ" },
                                    { required: true, message: "Vui lòng nhập email" }]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>

                            <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>

                            <Form.Item label="Mật khẩu" name="password">
                                <Input.Password placeholder="Để trống nếu không đổi mật khẩu" />
                            </Form.Item>
                        </Col>

                        {/* Thông tin cá nhân */}
                        <Col span={12}>
                            <Title level={5}>Thông tin cá nhân</Title>

                            <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                                <Input placeholder="Nhập họ tên" />
                            </Form.Item>

                            <Form.Item
                                label="Bằng cấp"
                                name="degreeId"
                                rules={[{ required: true, message: "Vui lòng chọn bằng cấp" }]}
                            >
                                <Select
                                    name="degreeId"
                                    placeholder="Chọn bằng cấp"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                    popupRender={menu => (
                                        <LoadingComponent isLoading={isLoadingDegrees}>
                                            {menu}
                                            <Divider style={{ margin: '4px 0' }} />
                                            <div
                                                style={{
                                                    padding: '8px',
                                                    color: '#1890ff',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setIsOpenModalCreateDegree(true)}
                                            >
                                                <PlusOutlined /> Thêm bằng cấp mới
                                            </div>
                                        </LoadingComponent>
                                    )}
                                    options={degreeData?.map(degree => ({
                                        label: degree.title,
                                        value: degree.degreeId
                                    }))}

                                />
                            </Form.Item>

                            <Form.Item label="Tiểu sử" name="bio">
                                <Input.TextArea rows={4} placeholder="Nhập tiểu sử" />
                            </Form.Item>

                            <Form.Item label="Ngày sinh" name="dateOfBirth">
                                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item label="Giới tính" name="gender">
                                <Radio.Group name="gender">
                                    <Radio value="male">Nam</Radio>
                                    <Radio value="female">Nữ</Radio>
                                    <Radio value="other">Khác</Radio>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item label="Địa chỉ" name="address">
                                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24} style={{ textAlign: "right" }}>

                            <Space>
                                <ButtonComponent
                                    type="default"
                                    onClick={handleCancelUpdateDoctor}
                                >
                                    Huỷ
                                </ButtonComponent>
                                <ButtonComponent
                                    type="primary"
                                    htmlType="submit"
                                >
                                    Lưu thay đổi
                                </ButtonComponent>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </LoadingComponent>
            <LoadingComponent isLoading={isPendingCreateDegree}>
                <ModalComponent
                    title="Thêm mới bằng cấp"
                    open={isOpenModalCreateDegree}
                    onOk={handleCreateDegree}
                    onCancel={handleCloseCreateDegree}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDegree"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        form={formCreateDegree}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Tên bằng cấp"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >
                            <Input
                                name="title"
                                placeholder="Nhập vào tên bằng cấp"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Viết tắt"
                            name="abbreviation"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên viết tắt!",
                                },
                            ]}
                        >
                            <Input
                                name="abbreviation"
                                placeholder="Nhập vào tên viết tắt"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="description"

                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Nhập mô tả chi tiết tại đây..."
                            />
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <Title level={4}>Nơi làm việc</Title>
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá nơi làm việc</span>
                    </span>
                }
                open={isModalOpenDeleteWorkplace}
                onOk={handleOkDeleteWorkplace}
                onCancel={handleCancelDeleteWorkplace}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteDoctorWorkplace}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            nơi làm việc này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <LoadingComponent isLoading={isPendingCreateDoctorWorkplace}>
                <ModalComponent
                    title="Thêm mới nơi làm việc"
                    open={isOpenModalCreateDoctorWorkplace}
                    onOk={handleCreateDoctorWorkplace}
                    onCancel={handleCloseCreateDoctorWorkplace}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDoctorWorkplace"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        initialValues={{ isPrimary: true }}
                        autoComplete="off"
                        form={formCreateDoctorWorkplace}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Nơi làm việc"
                            name="workplaceId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi làm việc"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingWorkplaces ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={workplaceData.map((wp) => ({
                                    label: wp.name,
                                    value: wp.workplaceId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Chức vụ"
                            name="positionId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chức vụ!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi chức vụ"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingPositions ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={positionData.map((pos) => ({
                                    label: pos.title,
                                    value: pos.positionId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Nơi làm việc chính"
                            name="isPrimary"

                        >
                            <Radio.Group>
                                <Radio value={true}>Có</Radio>
                                <Radio value={false}>Không</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <DrawerComponent
                title="Chi tiết nơi làm việc"
                placement="right"
                isOpen={isDrawerOpenWorkplace}
                onClose={() => setIsDrawerOpenWorkplace(false)}
                width={window.innerWidth < 768 ? "100%" : 700}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdateDoctorWorkplace}>

                    <Form
                        name="formUpdateDoctorWorkplace"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        onFinish={handleOnUpdateDoctorWorkplace}
                        form={formUpdateDoctorWorkplace}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Nơi làm việc"
                            name="workplaceId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi làm việc"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingWorkplaces ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={workplaceData.map((wp) => ({
                                    label: wp.name,
                                    value: wp.workplaceId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Chức vụ"
                            name="positionId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chức vụ!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn nơi chức vụ"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingPositions ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={positionData.map((pos) => ({
                                    label: pos.title,
                                    value: pos.positionId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Nơi làm việc chính"
                            name="isPrimary"

                        >
                            <Radio.Group>
                                <Radio value={true}>Có</Radio>
                                <Radio value={false}>Không</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            label={null}
                            wrapperCol={{ offset: 18, span: 6 }}
                        >
                            <Space>
                                <ButtonComponent
                                    type="default"
                                    onClick={() => setIsDrawerOpenWorkplace(false)}
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
                    </Form>
                </LoadingComponent>

            </DrawerComponent>
            <TableStyled
                rowSelection={rowSelectionWorkplaces}
                rowKey={"key"}
                columns={columnsWorkplaces}
                scroll={{ x: "max-content" }}
                loading={isLoadingWorkplacesByDoctor}
                dataSource={dataTableWorkplaces}
                locale={{
                    emptyText: "Không có dữ liệu",
                    filterConfirm: "Lọc",
                    filterReset: "Xóa lọc",
                }}
                pagination={{
                    current: paginationWorkplaces.current,
                    pageSize: paginationWorkplaces.pageSize,
                    position: ["bottomCenter"],
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} nơi làm việc`,
                    showSizeChanger: true, // Cho phép chọn số dòng/trang
                    pageSizeOptions: ["5", "8", "10", "20", "50"], // Tuỳ chọn số dòng
                    showQuickJumper: true, // Cho phép nhảy đến trang
                    onChange: (page, pageSize) => {
                        setPaginationWorkplaces((prev) => ({
                            ...prev,
                            current: page,
                            pageSize: pageSize,
                        }));
                    },
                }}
                onRow={(record) => ({
                    onClick: () => {
                        setRowSelectedWorkplace(record.key);
                    },
                })}
            />
            <ButtonComponent
                type="primary"
                icon={<PlusOutlined />}
                style={{ margin: "16px 0" }}
                onClick={() => setIsOpenModalCreateDoctorWorkplace(true)}
            >Thêm nơi làm việc</ButtonComponent>

            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <Title level={4}>Chuyên khoa</Title>
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <LoadingComponent isLoading={isPendingCreateDoctorSpecialty}>
                <ModalComponent
                    title="Thêm mới chuyên khoa"
                    open={isOpenModalCreateDoctorSpecialty}
                    onOk={handleCreateDoctorSpecialty}
                    onCancel={handleCloseCreateDoctorSpecialty}
                    width={600}
                    cancelText="Huỷ"
                    okText="Thêm"
                >
                    <Form
                        name="formCreateDoctorSpecialty"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        initialValues={{ isPrimary: true }}
                        autoComplete="off"
                        form={formCreateDoctorSpecialty}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialtyId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn chuyên khoa"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingSpecialties ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={specialtyData.map((sp) => ({
                                    label: sp.name,
                                    value: sp.specialtyId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Năm kinh nghiệm"
                            name="yearsOfExperience"
                            rules={[

                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === undefined) {
                                            return Promise.resolve();
                                        }

                                        if (!Number.isInteger(value) || value < 0) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm phải là số nguyên dương!")
                                            );
                                        }

                                        if (value > 25) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm không được lớn hơn 25!")
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            label="Chuyên khoa chính"
                            name="isPrimary"
                            valuePropName="checked"
                        >
                            <Checkbox></Checkbox>
                        </Form.Item>
                    </Form>
                </ModalComponent>
            </LoadingComponent>
            <ModalComponent
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 20 }} />
                        <span>Xoá chuyên khoa</span>
                    </span>
                }
                open={isModalOpenDeleteSpecialty}
                onOk={handleOkDeleteSpecialty}
                onCancel={handleCancelDeleteSpecialty}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered
                style={{ borderRadius: 8 }}
            >
                <LoadingComponent isLoading={isPendingDeleteDoctorWorkplace}>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Text>
                            Bạn có chắc chắn muốn{" "}
                            <Text strong type="danger">
                                xoá
                            </Text>{" "}
                            chuyên khoa này không?
                        </Text>
                    </div>
                </LoadingComponent>
            </ModalComponent>
            <DrawerComponent
                title="Chi tiết chuyên khoa"
                placement="right"
                isOpen={isDrawerOpenSpecialty}
                onClose={() => setIsDrawerOpenSpecialty(false)}
                width={window.innerWidth < 768 ? "100%" : 700}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdateDoctorSpecialty}>

                    <Form
                        name="formUpdateDoctorSpecialty"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "10px" }}
                        autoComplete="off"
                        onFinish={handleOnUpdateDoctorSpecialty}
                        form={formUpdateDoctorSpecialty}
                        labelAlign="left"
                    >
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialtyId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chuyên khoa",
                                },
                            ]}
                        >

                            <Select
                                showSearch
                                placeholder="Chọn chuyên khoa"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent={
                                    isLoadingSpecialties ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : "Không tìm thấy"
                                }
                                options={specialtyData.map((sp) => ({
                                    label: sp.name,
                                    value: sp.specialtyId
                                }))}
                            ></Select>

                        </Form.Item>
                        <Form.Item
                            label="Năm kinh nghiệm"
                            name="yearsOfExperience"
                            rules={[

                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === undefined) {
                                            return Promise.resolve();
                                        }

                                        if (!Number.isInteger(value) || value < 0) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm phải là số nguyên dương!")
                                            );
                                        }

                                        if (value > 25) {
                                            return Promise.reject(
                                                new Error("Số năm kinh nghiệm không được lớn hơn 25!")
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            label="Chuyên khoa chính"
                            name="isPrimary"
                            valuePropName="checked"
                        >
                            <Checkbox></Checkbox>
                        </Form.Item>
                        <Form.Item
                            label={null}
                            wrapperCol={{ offset: 18, span: 6 }}
                        >
                            <Space>
                                <ButtonComponent
                                    type="default"
                                    onClick={() => setIsDrawerOpenWorkplace(false)}
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
                    </Form>
                </LoadingComponent>

            </DrawerComponent>
            <TableStyled
                rowSelection={rowSelectionSpecialties}
                rowKey={"key"}
                columns={columnSpecialties}
                scroll={{ x: "max-content" }}
                loading={isLoadingSpecialtiesByDoctor}
                dataSource={dataTableSpecialties}
                locale={{
                    emptyText: "Không có dữ liệu",
                    filterConfirm: "Lọc",
                    filterReset: "Xóa lọc",
                }}
                pagination={{
                    current: paginationSpecialties.current,
                    pageSize: paginationSpecialties.pageSize,
                    position: ["bottomCenter"],
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} chuyên khoa`,
                    showSizeChanger: true, // Cho phép chọn số dòng/trang
                    pageSizeOptions: ["5", "8", "10", "20", "50"], // Tuỳ chọn số dòng
                    showQuickJumper: true, // Cho phép nhảy đến trang
                    onChange: (page, pageSize) => {
                        setPaginationSpecialties((prev) => ({
                            ...prev,
                            current: page,
                            pageSize: pageSize,
                        }));
                    },
                }}
                onRow={(record) => ({
                    onClick: () => {
                        setRowSelectedSpecialty(record.key);
                    },
                })}
            />
            <ButtonComponent
                type="primary"
                icon={<PlusOutlined />}
                style={{ margin: "16px 0" }}
                onClick={() => setIsOpenModalCreateDoctorSpecialty(true)}
            >Thêm chuyên khoa</ButtonComponent>
        </>
    )
}

export default DoctorDetailPage