import { DatePicker, Divider, Typography } from "antd";
import { StyleTabs,Card } from "@/pages/Dashboard/style";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
const { Title } = Typography;
const { RangePicker } = DatePicker;
 
const StatisticByTime = ({
    tabKey,
    setTabKey,
    dateRange,
    onChangeDateRange,
    selectedMonth,
    onChangeMonth,
    selectedYear,
    onChangeYear,
    revenueData,
    appointmentData,
    isLoading,
}) => {
    const lineColor =
    tabKey === 'range' ? '#1890ff' : tabKey === 'month' ? '#52c41a' : '#faad14';
    return (
        <Card style={{ borderRadius: 16, marginTop: 30 }}>
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
                                    value={dateRange.length === 2 ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : []}
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                    size="large"
                                    style={{ marginBottom: 20 }}
                                />
                            
                                <LoadingComponent isLoading={isLoading}>
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
                                    <Divider />
                                    <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                        Biểu đồ số lịch khám theo khoảng ngày {dateRange.length === 2 ? `từ ${new Date(dateRange[0]).toLocaleDateString('vi-VN')} đến ${new Date(dateRange[1]).toLocaleDateString('vi-VN')}` : ''}
                                    </Title>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorAppointment" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                            <XAxis dataKey="date" label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0 }} />
                                            <YAxis label={{ value: 'Số lịch khám', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip
                                                formatter={(value) => value.toLocaleString('vi-VN')}
                                            />
                                            <Line type="monotone" dataKey="totalAppointments" stroke={lineColor} strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </LoadingComponent>

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
                                    format="MM/YYYY"
                                    value={selectedMonth && selectedYear ? dayjs().month(selectedMonth - 1).year(selectedYear) : null}
                                    placeholder="Chọn tháng"
                                    size="large"
                                    style={{ marginBottom: 20 }}
                                />
                                <LoadingComponent isLoading={isLoading}>
                                
                                    <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                        Biểu đồ doanh thu tháng {selectedMonth && selectedYear ? `${selectedMonth}/${selectedYear}` : ''}
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
                                    <Divider />
                                    <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                        Biểu đồ số lịch khám tháng {selectedMonth && selectedYear ? `${selectedMonth}/${selectedYear}` : ''}
                                    </Title>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorAppointment" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                            <XAxis dataKey="date" label={{ value: 'Ngày', position: 'insideBottomRight', offset: 0 }} />
                                            <YAxis label={{ value: 'Số lịch khám', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip
                                                formatter={(value) => value.toLocaleString('vi-VN')}
                                            />
                                            <Line type="monotone" dataKey="totalAppointments" stroke={lineColor} strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                
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
                                    format="YYYY"
                                    value={selectedYear ? dayjs().year(selectedYear) : null}
                                    placeholder="Chọn năm"
                                    size="large"
                                    style={{ marginBottom: 20 }}
                                />
                                <LoadingComponent isLoading={isLoading}>
                                
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
                                    <Divider />
                                    <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                        Biểu đồ số lịch khám năm {selectedYear || ''}
                                    </Title>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorAppointment" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0"/>
                                            <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottomRight', offset: 0 }} />
                                            <YAxis label={{ value: 'Số lịch khám', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
                                            <Line type="monotone" dataKey="totalAppointments" stroke={lineColor} strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </LoadingComponent>
                            </>
                        ),
                    },
                ]}
            />
        </Card>
    )
}

export default StatisticByTime