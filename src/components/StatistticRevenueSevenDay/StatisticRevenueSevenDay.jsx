import { Card } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
const lineColor = '#0096ff';
const StatisticRevenueSevenDay = ({data, isLoading}) => {
    const styleLabel = { fontSize: 14, fontWeight: 600, fill: '#555' };
    return (
        <>
            <Card>
                <LoadingComponent isLoading={isLoading}>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data} margin={{ top: 20, right: 40, left: 30, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                        <XAxis 
                            dataKey="date" 
                            label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0, style: styleLabel }} 
                        />
                        <YAxis 
                            label={{ 
                                value: 'Doanh thu (VND)', 
                                angle: -90, 
                                position: 'insideLeft',
                                
                                style: styleLabel
                            }} 
                        />
                        <Tooltip
                            formatter={(value) =>
                                new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                            }).format(value)
                            }
                        />
                        <Line type="monotone" dataKey="totalRevenue" stroke={lineColor} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </LoadingComponent>
            </Card>
        </>
    )
}

export default StatisticRevenueSevenDay