import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Form, Input, Row, Col, Typography, Select, DatePicker, Radio, Space, Divider, Card, Upload } from "antd";
import { DegreeService } from '@/services/DegreeService'
import { DoctorService } from '@/services/DoctorService'
import AddressService from '@/services/AddressService';
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent'
import ButtonComponent from '@/components/ButtonComponent/ButtonComponent'
import CKEditorComponent from '@/components/CKEditorComponent/CKEditorComponent';
import ModalCreateDegree from '@/components/ModalCreateDegree/ModalCreateDegree';
import AddressFields from '@/components/AddressFields/AddressFields';
import * as Message from '@/components/Message/Message'
import dayjs from 'dayjs';

const { Title } = Typography;
const InfoDoctor = ({ id }) => {
    const [formUpdateDoctor] = Form.useForm();
    const [formCreateDegree] = Form.useForm();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [isOpenModalCreateDegree, setIsOpenModalCreateDegree] = useState(false);
    const [editorData, setEditorData] = useState("");
    const getNameByCode = (list, code) => list.find(i => i.code === code)?.name || '';
    const queryGetAllDegrees = useQuery({
        queryKey: ['getAllDegrees'],
        queryFn: DegreeService.getAllDegrees,
        refetchOnWindowFocus: false,
        retry: 1,
    });
    const queryGetDoctor = useQuery({
        queryKey: ['doctorDetail', id],
        queryFn: () => DoctorService.getDoctor(id),
        enabled: !!id,
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
    const mutationUpdateDoctor = useMutation({
        mutationKey: ['updateDoctor'],
        mutationFn: ({ id, formData }) => DoctorService.updateDoctor(id, formData),
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
    const { data: doctor, isLoading: isLoadingDoctor } = queryGetDoctor;
    const { data: degrees, isLoading: isLoadingDegrees } = queryGetAllDegrees;
    const { isPending: isPendingCreateDegree } = mutationCreateDegree;
    const degreeData = degrees?.data?.degrees || [];
    const doctorData = useMemo(() => doctor?.data || {}, [doctor]);
    // Gọi API lấy tỉnh
    useEffect(() => {
        const res = AddressService.getAllProvinces();
        res.then((data) => { setProvinces(data); });
    }, [doctorData]);
    const handleProvinceChange = async (provinceCode) => {
        const res = await AddressService.getDistrictsByProvince(provinceCode);

        setDistricts(res);
        setWards([]);

        // Reset trong form nếu cần
        formUpdateDoctor.setFieldsValue({
            district: undefined,
            ward: undefined,
        });
    };
    const handleDistrictChange = async (districtCode) => {

        const res = await AddressService.getWardsByDistrict(districtCode);
        setWards(res);
        formUpdateDoctor.setFieldsValue({
            ward: undefined,
        });
    };
    const handleWardChange = (wardCode) => {
        // Không cần làm gì thêm ở đây, chỉ cần cập nhật ward trong form
        formUpdateDoctor.setFieldsValue({
            ward: wardCode,
        });

    };
    useEffect(() => {
        const fetchAddressData = async () => {
            if (!doctorData) return;

            try {
                const rawAddress = doctorData.person?.address || '';
                const parts = typeof rawAddress === 'string'
                    ? rawAddress.split(',').map(p => p.trim())
                    : [];
                const [specificAddress = '', wardName = '', districtName = '', provinceName = ''] = parts;

                // --- Tìm mã ---
                const provinceObj = provinces?.find((p) => p.name === provinceName);
                const provinceCode = provinceObj?.code;

                let districtObj, wardObj;
                let districtCode, wardCode;
                let districtsData = [], wardsData = [];

                // --- Lấy danh sách quận/huyện ---
                if (provinceCode) {
                    districtsData = await AddressService.getDistrictsByProvince(provinceCode);
                    setDistricts(districtsData);
                    districtObj = districtsData.find((d) => d.name === districtName);
                    districtCode = districtObj?.code;
                }

                // --- Lấy danh sách phường/xã ---
                if (districtCode) {
                    wardsData = await AddressService.getWardsByDistrict(districtCode);
                    setWards(wardsData);
                    wardObj = wardsData.find((w) => w.name === wardName);
                    wardCode = wardObj?.code;
                }

                // --- Gán giá trị vào form ---
                formUpdateDoctor.setFieldsValue({
                    email: doctorData?.account?.email,
                    phone: doctorData?.account?.phone,
                    fullName: doctorData?.person?.fullName,
                    degreeId: doctorData?.degree?.degreeId,
                    dateOfBirth: doctorData?.person?.dateOfBirth
                        ? dayjs(doctorData?.person?.dateOfBirth)
                        : null,
                    gender: doctorData?.person?.gender,
                    specificAddress: specificAddress || undefined,
                    province: provinceObj ? provinceObj.code : undefined,
                    district: districtObj ? districtObj.code : undefined,
                    ward: wardObj ? wardObj.code : undefined,
                    bio: doctorData?.bio,
                    notes: doctorData?.notes,
                    avatar: doctorData?.person?.avatar
                        ? [
                            {
                                uid: '-1',
                                name: doctorData?.person?.avatar,
                                status: 'done',
                                url: `${import.meta.env.VITE_APP_BACKEND_URL}${doctorData?.person?.avatar}`,
                            },
                        ]
                        : [],
                });

                setEditorData(doctorData?.bio || '');
            } catch (error) {
                console.error('Lỗi khi load địa chỉ bác sĩ:', error);
            }
        };

        fetchAddressData();
    }, [doctorData, formUpdateDoctor, provinces]);
    const handleOnUpdateDoctor = (values) => {
        const hasAddressChange =
            values.specificAddress ||
            values.ward ||
            values.district ||
            values.province;
        const formData = new FormData();
        const fileObj = values.avatar?.[0]?.originFileObj;
        if (fileObj instanceof File) {
            formData.append("avatar", fileObj);
        } else if (values.avatar?.[0]?.url) {
            const avatarUrl = values.avatar[0].url;
            const imageName = avatarUrl.replace(import.meta.env.VITE_APP_BACKEND_URL, ""); // Lấy lại phần tên file
            formData.append("oldImage", imageName);
        } else {
            // Không có ảnh và cũng không dùng ảnh cũ → đã xoá
            formData.append("isImageDeleted", true);
        }
        // --- Các field khác ---
        const dataToAppend = {
            email: values.email,
            phone: values.phone,
            password: values.password, // chỉ append nếu có
            fullName: values.fullName,
            degreeId: values.degreeId,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth
                ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
                : null,
            address: hasAddressChange
                ? `${values.specificAddress || ''}, ${getNameByCode(wards, values.ward) || ''}, ${getNameByCode(districts, values.district) || ''}, ${getNameByCode(provinces, values.province) || ''}`
                : doctorData?.person?.address,
            bio: values.bio,
            notes: values.notes,
        };

        Object.entries(dataToAppend).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "undefined" && value !== "null") {
                formData.append(key, value);
            }
        });
        mutationUpdateDoctor.mutate({ id, formData });
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
        setEditorData("");
    };
    return (
        <>
            <Card>
                <LoadingComponent isLoading={isLoadingDoctor}>
                    <Form
                        form={formUpdateDoctor}
                        layout='vertical'
                        name="formUpdateDoctor"
                        labelCol={{ span: 8 }}
                        onFinish={handleOnUpdateDoctor}
                    >

                        <Title level={5}>Thông tin tài khoản</Title>
                        <Divider style={{margin: '8px 0'}}/>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { type: "email", message: "Email không hợp lệ" },
                                { required: true, message: "Vui lòng nhập email" }]
                            }
                        >
                            <Input placeholder="Nhập email" style={{ width: "50%" }} />
                        </Form.Item>

                        <Form.Item 
                            label="Số điện thoại" 
                            name="phone" 
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input placeholder="Nhập số điện thoại" style={{ width: "50%" }}/>
                        </Form.Item>

                        <Form.Item label="Mật khẩu" name="password">
                            <Input.Password placeholder="Để trống nếu không đổi mật khẩu" style={{ width: "50%" }} />
                        </Form.Item>
                    

                        
                        <Title level={5}>Thông tin cá nhân</Title>
                        <Divider style={{margin: '8px 0'}}/>
                        <Form.Item
                            label="Ảnh đại diện"
                            name="avatar"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
                            initialValue={[]}
                            extra="Chọn ảnh đại diện (jpg, jpeg, png, gif, webp) tối đa 1 file"
                        >
                            <Upload
                                beforeUpload={() => false}
                                maxCount={1}
                                accept=".jpg, .jpeg, .png, .gif, .webp"
                                onRemove={() => formUpdateDoctor.setFieldsValue({ avatar: [] })}
                                fileList={formUpdateDoctor.getFieldValue("avatar") || []}
                                listType="picture-card"

                            >
                                <ButtonComponent icon={<UploadOutlined />}>
                                </ButtonComponent>
                            </Upload>

                        </Form.Item>
                        <Form.Item
                            label="Họ tên"
                            name="fullName"
                            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                            
                        >
                            <Input placeholder="Nhập họ tên" style={{width:"50%"}}/>
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
                                style={{width:"50%"}}
                            />
                        </Form.Item>

                        <Form.Item label="Tiểu sử" name="bio">
                            <CKEditorComponent
                                editorData={editorData}
                                onChange={(data) => formUpdateDoctor.setFieldsValue({ bio: data })}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Ghi chú"
                            name="notes"
                        >
                            <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                        </Form.Item>

                        <Form.Item label="Ngày sinh" name="dateOfBirth">
                            <DatePicker format="DD/MM/YYYY" style={{ width: "50%" }} />
                        </Form.Item>

                        <Form.Item label="Giới tính" name="gender">
                            <Radio.Group name="gender">
                                <Radio value="male">Nam</Radio>
                                <Radio value="female">Nữ</Radio>
                                <Radio value="other">Khác</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Title level={5}>Địa chỉ</Title>
                        <Divider style={{margin: '8px 0'}}/>
                        <AddressFields
                            provinces={provinces}
                            districts={districts}
                            wards={wards}
                            onProvinceChange={handleProvinceChange}
                            onDistrictChange={handleDistrictChange}
                            onWardChange={handleWardChange}
                            layout="horizontal"
                        />
                           

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
            </Card>
            <ModalCreateDegree
                formCreate={formCreateDegree}
                isPendingCreate={isPendingCreateDegree}
                isModalOpenCreate={isOpenModalCreateDegree}
                handleCreateDegree={handleCreateDegree}
                handleCloseCreateDegree={handleCloseCreateDegree}
            />
        </>
    )
}

export default InfoDoctor