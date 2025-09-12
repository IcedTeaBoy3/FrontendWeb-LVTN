import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, Divider, Skeleton } from "antd";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import InfoDoctor from '@/components/InfoDoctor/InfoDoctor';
import DoctorWorkplace from '@/components/DoctorWorkplace/DoctorWorkplace';
import DoctorSpecialty from '@/components/DoctorSpecialty/DoctorSpecialty';
import {
    ArrowLeftOutlined,
    UserOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    AppstoreOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
const DoctorDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const handleBack = () => {
        navigate(-1);
    };
    const items = [
        {
            key: "1",
            label: `Thông tin bác sĩ`,
            children: <>{id && <InfoDoctor id={id} />}</>,
            icon: <UserOutlined style={{ fontSize: 18 }} />
        },
        {
            key: "2",
            label: `Nơi làm việc`,
            children: <>
                {id && <DoctorWorkplace id={id} />}
            </>,
            icon: <HomeOutlined style={{ fontSize: 18 }} />
        },
        {
            key: "3",
            label: `Chuyên khoa`,
            children: <DoctorSpecialty id={id} />,
            icon: <MedicineBoxOutlined style={{ fontSize: 18 }} />
        },
        {
            key: "4",
            label: `Dịch vụ`,
            children: `Dịch vụ`,
            icon: <AppstoreOutlined style={{ fontSize: 18 }} />
        },
        {
            key: "5",
            label: `Lịch làm việc`,
            children: `Lịch làm việc`,
            icon: <CalendarOutlined style={{ fontSize: 18 }} />
        }
    ];
    return (
        <>
            <ButtonComponent
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ fontSize: 18, padding: 0 }}
            >Chi tiết bác sĩ</ButtonComponent>
            <Divider type="horizontal" style={{ margin: "10px 0" }} />
            <Tabs
                defaultActiveKey="1"
                items={items}
            />
        </>
    )
}

export default DoctorDetailPage