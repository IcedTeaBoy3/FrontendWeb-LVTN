
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent'
import TableStyle from '@/components/TableStyle/TableStyle'
import { Typography,Splitter, Tag, Card} from 'antd'
import { useState } from 'react'
const { Title } = Typography

const DoctorPerSpecialty = ({data, isLoading}) => {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
    });
    const dataTable = data?.map((doctor,index) => ({
        key: doctor.doctorId,
        index: index + 1,
        doctorName: doctor.doctorName,
        specialtyCount: doctor.specialties.length,
        specialties: doctor.specialties
    }))
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            sorter: (a, b) => a.index - b.index,
            width: 100,
        },
        {
            title: 'Tên bác sĩ',
            dataIndex: 'doctorName',
            key: 'doctorName',
        },
        {
            title: 'Chuyên khoa',
            dataIndex: 'specialties',
            key: 'specialties',
            render: (specialties) => (
                <>
                    {specialties.map((specialty) => (
                        <Tag color="blue" key={specialty.specialtyId}>{specialty.specialtyName}</Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Số chuyên khoa',
            dataIndex: 'specialtyCount',
            key: 'specialtyCount',
            sorter: (a, b) => a.specialtyCount - b.specialtyCount,
        },
       
    ]
    return (   
        <LoadingComponent isLoading={isLoading}>
            <Splitter style={{ height: 500, gap: '16px' }}>
                <Splitter.Panel defaultSize="40%">
                    <Card>
                        <Title level={4}>Danh sách bác sĩ</Title>
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
                        <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>Biểu đồ cột số chuyên khoa của mỗi bác sĩ</Title>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={data}
                                layout="vertical" // 👈 Cột nằm ngang
                                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="doctorName"
                                    type="category"
                                    width={150}
                                    tick={{ fontSize: 13 }}
                                />
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        value,
                                        props.payload.specialties
                                        ? props.payload.specialties.map(s => s.specialtyName).join(", ")
                                        : name
                                    ]}
                                />
                                <Legend />
                                <Bar
                                    dataKey="specialtyCount"
                                    fill="#1976d2"
                                    name="Số chuyên khoa"
                                    radius={[0, 5, 5, 0]}
                                    barSize={25}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Splitter.Panel>   

            </Splitter>
            
        </LoadingComponent>
    )
}

export default DoctorPerSpecialty