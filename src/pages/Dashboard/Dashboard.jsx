import { Form, Input, Button, Upload, Card as AntCard, Row as AntRow, Col as AntCol, Select, Typography, Divider, DatePicker,Statistic } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardService } from "@/services/DashboardService";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import styled from "styled-components";
import { UserOutlined, UserSwitchOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Legend } from 'recharts';
const { RangePicker } = DatePicker;
const { Title } = Typography;
import { StyleTabs } from "./style";
const Row = styled(AntRow)`
  margin-top: 24px;
`;

const Col = styled(AntCol)`
  @media (max-width: 768px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
`;

const Card = styled(AntCard)`
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border-color: 1px solid #1890ff;
  }

  .ant-card-body {
    padding: 24px 16px;
  }

  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-bottom: 12px;
    color: white;
    font-size: 22px;
  }

  .stat-title {
    font-weight: 500;
    color: #4a4a4a;
    margin-bottom: 4px;
  }
`;

// Màu riêng cho từng thẻ
const colorMap = {
  users: "#1890ff",
  doctors: "#52c41a",
  appointments: "#faad14",
  revenue: "#f5222d",
};
const Dashboard = () => {
    const [tabKey, setTabKey] = useState('range');
    const [dateRange, setDateRange] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const onChangeDateRange = (values) => {
        if(values && values.length === 2) {
            const startDate = values[0].startOf('day').toISOString();
            const endDate = values[1].endOf('day').toISOString();
            setDateRange([startDate, endDate]);
        } else {
            setDateRange([]);
        }
    };
    const onChangeMonth = (date) => {
        if (date) {
            setSelectedMonth(date.month() + 1); // month() trả 0–11
            setSelectedYear(date.year());
        } else {
            setSelectedMonth(null);
            setSelectedYear(null);
        }
    };

    const onChangeYear = (date) => {
        if (date) {
            setSelectedYear(date.year());
        } else {
            setSelectedYear(null);
        }
    };
    const queryGetAdminDashboard = useQuery({
        queryKey: ['getAdminDashboard'],
        queryFn: () => DashboardService.getAdminOverview(),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const queryGetAdminRevenue = useQuery({
        queryKey: ['getAdminRevenue', tabKey, dateRange, selectedMonth, selectedYear],
        queryFn: async () => {
            if (tabKey === 'range' && dateRange.length === 2) {
                return await DashboardService.getAdminRevenue({
                    type: 'range',
                    start: dateRange[0],
                    end: dateRange[1],
                });
            }

            if (tabKey === 'month' && selectedMonth && selectedYear) {
                return await DashboardService.getAdminRevenue({
                    type: 'month',
                    month: selectedMonth,
                    year: selectedYear,
                });
            }

            if (tabKey === 'year' && selectedYear) {
                return await DashboardService.getAdminRevenue({
                    type: 'year',
                    year: selectedYear,
                });
            }

            return null;
        },
        enabled: Boolean(
            (tabKey === 'range' && dateRange.length === 2) ||
            (tabKey === 'month' && selectedMonth && selectedYear) ||
            (tabKey === 'year' && selectedYear)
        ),
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const { data: overview, isLoading: isLoadingOverview } = queryGetAdminDashboard;
    const { data: revenue, isLoading: isLoadingRevenue} = queryGetAdminRevenue;
    
    const overviewData = overview?.data || {};
    const revenueData = revenue?.data || [];
    const lineColor =
    tabKey === 'range' ? '#1890ff' : tabKey === 'month' ? '#52c41a' : '#faad14';
    return (
        <>
           <Title level={4}>Thống kê tổng quan</Title>
           <LoadingComponent isLoading={isLoadingOverview} >
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Card>
                            <div className="icon-wrapper" style={{ background: colorMap.users }}>
                                <UserOutlined />
                            </div>
                            <Statistic
                                title="Tổng số người dùng"
                                value={overviewData.totalUsers || 0}
                                valueStyle={{ color: colorMap.users, fontWeight: 700 }}
                            />
                        </Card>
                    </Col>

                    <Col span={6}>
                        <Card>
                            <div className="icon-wrapper" style={{ background: colorMap.doctors }}>
                                <UserSwitchOutlined />
                            </div>
                            <Statistic
                                title="Tổng số bác sĩ"
                                value={overviewData.totalDoctors || 0}
                                valueStyle={{ color: colorMap.doctors, fontWeight: 700 }}
                            />
                        </Card>
                    </Col>

                    <Col span={6}>
                        <Card>
                            <div className="icon-wrapper" style={{ background: colorMap.appointments }}>
                                <CalendarOutlined />
                            </div>
                            <Statistic
                                title="Lịch khám hôm nay"
                                value={overviewData.appointmentsToday || 0}
                                valueStyle={{ color: colorMap.appointments, fontWeight: 700 }}
                            />
                        </Card>
                    </Col>

                    <Col span={6}>
                        <Card>
                            <div className="icon-wrapper" style={{ background: colorMap.revenue }}>
                                <DollarOutlined />
                            </div>
                            <Statistic
                                title="Doanh thu hôm nay (VNĐ)"
                                value={overviewData.revenueToday || 0}
                                precision={0}
                                valueStyle={{ color: colorMap.revenue, fontWeight: 700 }}
                                formatter={(value) =>
                                    value.toLocaleString("vi-VN", { minimumFractionDigits: 0 })
                                }
                            />
                        </Card>
                    </Col>
                </Row>
            </LoadingComponent>
            <Title level={4} style={{ marginTop: '24px' }}>Thống kê doanh thu</Title>
            <StyleTabs
                activeKey={tabKey}
                onChange={setTabKey}
                items={[
                    // ====== THEO KHOẢNG NGÀY ======
                    {
                        key: 'range',
                        label: 'Theo khoảng ngày',
                        children: (
                            <>
                            
                            <RangePicker
                                onChange={onChangeDateRange}
                                format="DD/MM/YYYY"
                                placeholder={['Từ ngày', 'Đến ngày']}
                                size="large"
                                style={{ marginBottom: 20 }}
                            />
                            <Card style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                                <LoadingComponent isLoading={isLoadingRevenue}>
                                    <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                        Biểu đồ doanh thu theo khoảng ngày {dateRange.length === 2 ? `từ ${new Date(dateRange[0]).toLocaleDateString('vi-VN')} đến ${new Date(dateRange[1]).toLocaleDateString('vi-VN')}` : ''}
                                    </Title>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                            <XAxis dataKey="date" label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0 }} />
                                            <YAxis label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft' }} />
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
                        ),
                    },

                    // ====== THEO THÁNG ======
                    {
                        key: 'month',
                        label: 'Theo tháng',
                        children: (
                            <>
                                <DatePicker
                                    picker="month"
                                    onChange={onChangeMonth}
                                    placeholder="Chọn tháng"
                                    size="large"
                                    style={{ marginBottom: 20 }}
                                />
                                <LoadingComponent isLoading={isLoadingRevenue}>
                                    <Card style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ doanh thu theo tháng {selectedMonth && selectedYear ? `${selectedMonth}/${selectedYear}` : ''}
                                        </Title>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                                <XAxis dataKey="date" label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(v) => v.toLocaleString('vi-VN') + ' ₫'} />
                                                <Line type="monotone" dataKey="totalRevenue" stroke={lineColor} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </LoadingComponent>
                            </>
                        ),
                    },

                    // ====== THEO NĂM ======
                    {
                        key: 'year',
                        label: 'Theo năm',
                        children: (
                            <>
                                <DatePicker
                                    picker="year"
                                    onChange={onChangeYear}
                                    placeholder="Chọn năm"
                                    size="large"
                                    style={{ marginBottom: 20 }}
                                />
                                <LoadingComponent isLoading={isLoadingRevenue}>
                                    <Card style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                                        <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                            Biểu đồ doanh thu năm {selectedYear || ''}
                                        </Title>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                               <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(v) => v.toLocaleString('vi-VN') + ' ₫'} />
                                                <Line type="monotone" dataKey="totalRevenue" stroke={lineColor} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </LoadingComponent>
                            </>
                        ),
                    },
                ]}
            />

            
           
        </>
    )
}

export default Dashboard