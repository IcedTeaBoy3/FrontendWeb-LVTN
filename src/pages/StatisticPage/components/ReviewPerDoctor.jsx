import React from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent'
import TableStyle from '@/components/TableStyle/TableStyle'
import { Card, Typography, Divider, Splitter,Rate  } from 'antd'
import { useState } from 'react'
const { Title } = Typography

const ReviewPerDoctor = ({data, isLoading}) => {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5});
    const dataTableAvgRating = data?.map((item, index) => ({
        key: item.doctorId || index,
        index: index + 1,
        doctorName: item.doctorName,
        averageRating: item.averageRating,
        ratingCount: item.ratingCount,
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
            title: 'Tên bác sĩ',
            dataIndex: 'doctorName',
            key: 'doctorName',
        },
        {
            title: 'Đánh giá trung bình',
            dataIndex: 'averageRating',
            key: 'averageRating',
            sorter: (a, b) => a?.averageRating - b?.averageRating,
            render: (value) => <Rate allowHalf disabled defaultValue={value} />
        },
        {
            title: 'Số lượt đánh giá',
            dataIndex: 'ratingCount',
            key: 'ratingCount',
            sorter: (a, b) => a?.ratingCount - b?.ratingCount,
        },
    ];
    return (
        <LoadingComponent isLoading={isLoading}>
            <Splitter style={{ height: 500 }}>
                <Splitter.Panel defaultSize="40%">
                    <Card>
                        <Title level={4} style={{marginBottom:16}}>Top bác sĩ được đánh giá cao nhất</Title>
                        <TableStyle
                            dataSource={dataTableAvgRating}
                            columns={columns}
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
                <Splitter.Panel defaultSize="50%">
                    <Card>
                        <Title level={4} style={{textAlign:'center',marginBottom:16}}>Biểu đồ cột đánh giá trung bình của mỗi bác sĩ</Title>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                layout="vertical"
                                data={data}
                                margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="doctorName"
                                type="category"
                                width={150}
                                tick={{ fontSize: 13 }}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="averageRating"
                                fill="#faad14"
                                name="Đánh giá trung bình"
                                radius={[0, 5, 5, 0]} // bo góc cho đẹp
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

export default ReviewPerDoctor