import { Card, Typography, Divider } from 'antd';
import PieChart from "@/components/PieChart/PieChart";
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
const COLORSSTATUS= ['#faad14', '#1890ff', '#52c41a', '#f5222d'];

const statusNameMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã huỷ',
};
const { Title } = Typography;
const StatusAppointment = ({data, isLoading}) => {
    const pieChartData = Object.entries(data).map(([key, value]) => ({
        name: statusNameMap[key] || key,
        value: value,
    }));
    return (
        <Card style={{ borderRadius: 16}}>
            <LoadingComponent isLoading={isLoading}>
                <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>
                    Biểu đồ trạng thái lịch hẹn
                </Title>
                <PieChart
                    outerRadius={130}
                    COLORS={COLORSSTATUS}
                    data={pieChartData || []}
                />
                <Divider />
                <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Tổng số lịch hẹn: {Object.values(data).reduce((sum, val) => sum + val, 0)}</div>
                <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Hoàn thành: {data['completed'] || 0}</div>
            </LoadingComponent>
        </Card>
    )
}

export default StatusAppointment