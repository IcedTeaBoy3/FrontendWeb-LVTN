
import { Space, Input, Form, Select, Radio, Typography, Divider, DatePicker, Upload, Row, Col, Card } from "antd";
import dayjs from 'dayjs';
import {
    PlusOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { DoctorService as DoctorServiceService } from "@/services/DoctorService";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as Message from "@/components/Message/Message";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import CKEditorComponent from '@/components/CKEditorComponent/CKEditorComponent';
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { DegreeService } from "@/services/DegreeService";
import DoctorWorkplace from "../DoctorDetailPage/components/DoctorWorkplace";
import DoctorSpecialty from "../DoctorDetailPage/components/DoctorSpecialty";
import DoctorService from "../DoctorDetailPage/components/DoctorService";
import AddressFields from "@/components/AddressFields/AddressFields";
import AddressService from "@/services/AddressService";
import ModalCreateDegree from '@/components/ModalCreateDegree/ModalCreateDegree';
const { Text, Title } = Typography;
const DoctorInfo = () => {
  const user = useSelector((state) => state.auth.user);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [editorData, setEditorData] = useState("");
  const [isOpenModalCreateDegree, setIsOpenModalCreateDegree] = useState(false);
  const [formCreate] = Form.useForm();
  const [formUpdateDoctor] = Form.useForm();
 const getNameByCode = (list, code) => list.find(i => i.code === code)?.name || '';
  const queryGetDoctor = useQuery({
    queryKey: ['doctor-info', user?.doctor?.doctorId],
    queryFn: () => DoctorServiceService.getDoctor(user?.doctor?.doctorId),
    enabled: !!user?.doctor?.doctorId,
  });
  const mutationUpdateDoctor = useMutation({
    mutationKey: ['updateDoctor'],
    mutationFn: ({ id, formData }) => DoctorServiceService.updateDoctor(id, formData),
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
    queryKey: ['createDegree'],
    mutationFn: DegreeService.createDegree,
    onSuccess: (data) => {
      if (data.status == 'success') {
        Message.success(data.message);
        formUpdateDoctor.setFieldsValue({
          degreeId: data.data.degreeId,
        });
        setIsOpenModalCreateDegree(false);
        queryGetAllDegrees.refetch();
      } else {
        Message.error(data.message);
      }
    },
    onError: (error) => {
      Message.error(error.response.data.message || "Có lỗi xảy ra, vui lòng thử lại!");
    },
  });
  const queryGetAllDegrees = useQuery({
    queryKey: ['getAllDegrees'],
    queryFn: DegreeService.getAllDegrees,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const { data: doctorData, isLoading:isLoadingDoctor} = queryGetDoctor;
  const { data: degrees, isLoading: isLoadingDegrees } = queryGetAllDegrees;
  const isPendingUpdateDoctor = mutationUpdateDoctor.isPending;
  const isPendingCreate = mutationCreateDegree.isPending;
  const doctorInfo = doctorData?.data || {};
  const degreeData = degrees?.data?.degrees || [];
  // Gọi API lấy tỉnh
  useEffect(() => {
    const res = AddressService.getAllProvinces();
    res.then((data) => { setProvinces(data); });
  }, [doctorInfo]);
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
    if (!doctorInfo) return;

    try {
      const rawAddress = doctorInfo.person?.address || '';
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
        email: doctorInfo?.account?.email,
        phone: doctorInfo?.account?.phone,
        fullName: doctorInfo?.person?.fullName,
        degreeId: doctorInfo?.degree?.degreeId,
        dateOfBirth: doctorInfo?.person?.dateOfBirth
            ? dayjs(doctorInfo?.person?.dateOfBirth)
            : null,
        gender: doctorInfo?.person?.gender,
        specificAddress: specificAddress || undefined,
        province: provinceObj ? provinceObj.code : undefined,
        district: districtObj ? districtObj.code : undefined,
        ward: wardObj ? wardObj.code : undefined,
        bio: doctorInfo?.bio,
        notes: doctorInfo?.notes,
        avatar: doctorInfo?.person?.avatar
          ? [
            {
              uid: '-1',
              name: doctorInfo?.person?.avatar,
              status: 'done',
              url: `${import.meta.env.VITE_APP_BACKEND_URL}${doctorInfo?.person?.avatar}`,
            },
          ]
          : [],
      });
      setEditorData(doctorInfo?.bio || '');
      } catch (error) {
        // console.error('Lỗi khi load địa chỉ bác sĩ:', error);
      }
    };

    fetchAddressData();
  }, [doctorInfo, formUpdateDoctor, provinces]);
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
      fullName: values.fullName,
      degreeId: values.degreeId,
      dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : null,
      gender: values.gender,
      address: hasAddressChange
          ? `${values.specificAddress || ''}, ${getNameByCode(wards, values.ward) || ''}, ${getNameByCode(districts, values.district) || ''}, ${getNameByCode(provinces, values.province) || ''}`
          : doctorInfo?.person?.address,
      bio: values.bio,
    };
    Object.entries(dataToAppend).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "undefined" && value !== "null") {
        formData.append(key, value);
      }
    });
    mutationUpdateDoctor.mutate({ id: user?.doctor?.doctorId, formData });
  };
  const handleCancelUpdateDoctor = () => {
    formUpdateDoctor.resetFields();
    setEditorData("");
    
  };
  const handleCreateDegree = () => {
    formCreate.validateFields().then((values) => {
      mutationCreateDegree.mutate(values);
    })
  };
  const handleCloseCreateDegree = () => {
    setIsOpenModalCreateDegree(false);
  };
  return (
    <>
      <LoadingComponent isLoading={isLoadingDoctor || isPendingUpdateDoctor}>
        <Card
          title={<Title level={4} style={{margin:0}}>Thông tin bác sĩ</Title>}
        >
          <Form
            form={formUpdateDoctor}
            layout='vertical'
            name="formUpdateDoctor"
            onFinish={handleOnUpdateDoctor}
          >
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
                  Chọn ảnh
                </ButtonComponent>
              </Upload>
            </Form.Item>
            <Form.Item
              label="Họ tên"
              name="fullName"

              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ tên" style={{ width: "50%" }}/>
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
                style={{ width: "50%" }}
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
              <CKEditorComponent
                editorData={editorData}
                onChange={(data) => formUpdateDoctor.setFieldsValue({ bio: data })}
              />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} placeholder="Nhập ghi chú"/>
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
        </Card>
      </LoadingComponent>
      <ModalCreateDegree  
        formCreate={formCreate}
        isPendingCreate={isPendingCreate}
        isModalOpenCreate={isOpenModalCreateDegree}
        handleCreateDegree={handleCreateDegree}
        handleCloseCreateDegree={handleCloseCreateDegree}
      />
      <br />
      <br />
      <DoctorWorkplace id={user?.doctor?.doctorId} />
      <br />
      <DoctorSpecialty id={user?.doctor?.doctorId} />
      <br />
      <DoctorService id={user?.doctor?.doctorId} />
    </>
  )
}

export default DoctorInfo