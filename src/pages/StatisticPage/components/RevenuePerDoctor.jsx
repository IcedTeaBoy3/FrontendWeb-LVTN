import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Typography } from "antd";
const { Title } = Typography;
const RevenuePerDoctor = ({data, isLoading}) => {
    return (
        <LoadingComponent isLoading={isLoading}>
            <Card>
                <Title level={4}>Biểu đồ doanh thu của mỗi bác sĩ</Title>
                <br/>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="doctorName"  
                            label={{ 
                                value: 'Bác sĩ', 
                                position: 'insideBottomRight',
                                style: { fontSize: 14, fontWeight: 600, fill: '#555' }
                            }} 
                            angle={-10} 
                            textAnchor="end"
                        />
                        <YAxis label={{
                            value: 'Doanh thu (VNĐ)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: -10,
                            style: { textAnchor: 'middle', fontSize: 14, fontWeight: 600, fill: '#555' }
                        }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalRevenue" fill="#8884d8" name="Doanh thu" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </LoadingComponent>
    )
}

export default RevenuePerDoctor