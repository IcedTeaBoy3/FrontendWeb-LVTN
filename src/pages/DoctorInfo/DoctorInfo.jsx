
import { Space, Input, Form, Select, Radio, Typography, Divider, Dropdown, DatePicker, Upload, Tag, Popover, Row, Col, Card } from "antd";
import dayjs from 'dayjs';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    ExportOutlined,
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
import ModalCreateDegree from '@/components/ModalCreateDegree/ModalCreateDegree';
const { Text, Title } = Typography;
const DoctorInfo = () => {
  const user = useSelector((state) => state.auth.user);
  const [editorData, setEditorData] = useState("");
  const [isOpenModalCreateDegree, setIsOpenModalCreateDegree] = useState(false);
  const [formCreate] = Form.useForm();
  const [formUpdateDoctor] = Form.useForm();
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
        formUpdateDoctor.setFieldValues({

        })
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
  useEffect(() => {
    if (doctorData) {
      formUpdateDoctor.setFieldsValue({
        email: doctorInfo?.account?.email,
        phone: doctorInfo?.account?.phone,
        fullName: doctorInfo?.person?.fullName,
        degreeId: doctorInfo?.degree?.degreeId, // hoặc doctorData.degree?.degreeId
        dateOfBirth: doctorInfo?.person?.dateOfBirth
            ? dayjs(doctorInfo?.person?.dateOfBirth)
            : null,
        gender: doctorInfo?.person?.gender,
        address: doctorInfo?.person?.address,
        avatar:
          [
            {
              uid: '-1',
              name: doctorInfo?.person?.avatar,
              status: 'done',
              url: `${import.meta.env.VITE_APP_BACKEND_URL}${doctorInfo?.person?.avatar}`,
            },
          ],
      });
      setEditorData(doctorInfo?.bio || ""); // Cập nhật dữ liệu ban đầu cho CKEditor
    }
  }, [doctorData, formUpdateDoctor]);
  const handleOnUpdateDoctor = (values) => {
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
      // phone: values.phone,
      // password: values.password, // chỉ append nếu có
      fullName: values.fullName,
      degreeId: values.degreeId,
      dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : null,
      gender: values.gender,
      address: values.address,
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
              <Input placeholder="Nhập họ tên" style={{ width: "30%" }}/>
            </Form.Item>
            <Form.Item
              label="Học vị"
              name="degreeId"
              rules={[{ required: true, message: "Vui lòng chọn học vị" }]}
            >
              <Select
                name="degreeId"
                placeholder="Chọn học vị"
                showSearch
                style={{ width: "30%" }}
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

            <Form.Item label="Ngày sinh" name="dateOfBirth">
              <DatePicker format="DD/MM/YYYY" style={{ width: "30%" }} />
            </Form.Item>

            <Form.Item label="Giới tính" name="gender">
              <Radio.Group name="gender">
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
                <Radio value="other">Khác</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address">
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ" style={{ width: "50%" }}/>
            </Form.Item>
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