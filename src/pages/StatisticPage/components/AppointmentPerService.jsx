
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent'
import TableStyle from '@/components/TableStyle/TableStyle'
import { Card, Typography, Splitter } from 'antd'
import { useState } from 'react'
const { Title } = Typography
const AppointmentPerService = ({data, isLoading}) => {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
    });
    const dataTable = data?.map((item, index) => ({
        key: item.serviceId,
        index: index + 1,
        serviceName: item.serviceName,
        appointmentCount: item.appointmentCount,
    }));
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            sorter: (a, b) => a.index - b.index,
            width: 100,
        },
        {
            title: 'Tên dịch vụ',
            dataIndex: 'serviceName',
            key: 'serviceName',
        },
        {
            title: 'Số lịch khám',
            dataIndex: 'appointmentCount',
            key: 'appointmentCount',
            sorter: (a, b) => a.appointmentCount - b.appointmentCount,
        }
    ];
   
    return (
        <>
        
            <LoadingComponent isLoading={isLoading}>
                <Splitter style={{ height: 500, gap: '16px' }}>
                    <Splitter.Panel defaultSize="40%">
                        <Card>
                            <Title level={4}>Danh sách dịch vụ</Title>
                            <TableStyle
                            
                                columns={columns}
                                dataSource={dataTable}
                                pagination={pagination}
                                onChange={(page, pageSize) => {
                                    setPagination((prev) => ({
                                        ...prev,
                                        current: page,
                                        pageSize: pageSize,
                                    }));
                                }}
                            
                            />
                        </Card>
                    </Splitter.Panel>
                    <Splitter.Panel defaultSize="60%">
                        <Card>
                            <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>Biểu đồ cột số lịch khám của mỗi dịch vụ</Title>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    layout="vertical"
                                    data={data}
                                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                                >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    type="number" 
                                  
                                />
                                <YAxis
                                    dataKey="serviceName"
                                    type="category"
                                    width={150}
                                    tick={{ fontSize: 14,  fill: '#555' }}
                                   
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
                    </Splitter.Panel>
                </Splitter>
            
            </LoadingComponent>
        </>
    )
}

export default AppointmentPerService