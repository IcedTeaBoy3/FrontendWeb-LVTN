import { useNavigate, useParams } from 'react-router-dom';
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import TabsComponent from '@/components/TabsComponent/TabsComponent';
import InfoDoctor from './components/InfoDoctor';
import DoctorWorkplace from './components/DoctorWorkplace';
import DoctorSpecialty from './components/DoctorSpecialty';
import DoctorService from './components/DoctorService';
import DoctorSchedule from './components/DoctorSchedule';
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
            children: <DoctorService id={id} />,
            icon: <AppstoreOutlined style={{ fontSize: 18 }} />
        },
        {
            key: "5",
            label: `Lịch làm việc`,
            children: <DoctorSchedule id={id} />,
            icon: <CalendarOutlined style={{ fontSize: 18 }} />
        }
    ];
    return (
        <>
            <ButtonComponent
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ fontSize: 20, padding: 0 }}
            >Chi tiết bác sĩ</ButtonComponent>
            <div style={{ padding: '16px', background: '#fff', marginTop: '16px 0' }}>

                <TabsComponent
                    type="card"
                    
                    defaultActiveKey="1"
                    items={items}
                />
            </div>
        </>
    )
}

export default DoctorDetailPage