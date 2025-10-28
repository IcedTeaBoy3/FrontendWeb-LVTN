import React from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent'
import { Card } from 'antd'

const AppointmentPerService = ({data, isLoading}) => {
    return (
        <LoadingComponent isLoading={isLoading}>
            <Card title="Biểu đồ số lịch khám của mỗi dịch vụ">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                        dataKey="serviceName"
                        type="category"
                        width={150}
                        tick={{ fontSize: 13 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                        dataKey="appointmentCount"
                        fill="#1976d2"
                        name="Số lịch khám"
                        radius={[0, 5, 5, 0]} // bo góc cho đẹp
                        barSize={25}
                    />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </LoadingComponent>
    )
}

export default AppointmentPerService