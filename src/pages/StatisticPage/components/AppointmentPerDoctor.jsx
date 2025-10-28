
import React from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent'
import { Card, Typography } from 'antd'
const { Title } = Typography
const COLORS = {
    pending: '#faad14',
    confirmed: '#1890ff',
    completed: '#52c41a',
    cancelled: '#f5222d',
};
const statusNameMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
};
const AppointmentPerDoctor = ({data, isLoading, title}) => {
    return (
        <LoadingComponent isLoading={isLoading}>
            <Card>
                <Title level={4} style={{textAlign:'center',marginBottom:16}}>Biểu đồ cột số lịch khám của mỗi bác sĩ</Title>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="doctorName" />
                    <YAxis label={{ value: 'Số lịch', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                        formatter={(value, name) => [value, statusNameMap[name]]} // đổi tên tooltip
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        formatter={(value) => statusNameMap[value] || value} // đổi tên legend
                    />
                    <Bar dataKey="pending" stackId="a" fill={COLORS.pending} />
                    <Bar dataKey="confirmed" stackId="a" fill={COLORS.confirmed} />
                    <Bar dataKey="completed" stackId="a" fill={COLORS.completed} />
                    <Bar dataKey="cancelled" stackId="a" fill={COLORS.cancelled} />
                
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </LoadingComponent>
    )
}

export default AppointmentPerDoctor