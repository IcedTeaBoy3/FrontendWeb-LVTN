import { DatePicker, Divider, Typography, Row,Card, Splitter} from "antd";
import { StyleTabs } from "@/pages/Dashboard/style";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import { FilePdfOutlined } from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
    const handleExportPDF = async () => {
        let input;
        if (tabKey === 'range') {
            input = document.getElementById('report-day');
        } else if (tabKey === 'month') {
            input = document.getElementById('report-month');
        } else if (tabKey === 'year') {
            input = document.getElementById('report-year');
        }
        if (!input) return;

        // Hiển thị trạng thái đang xử lý (nếu muốn)
        const canvas = await html2canvas(input, {
            scale: 2, // tăng độ nét
            useCORS: true, // cho phép lấy ảnh từ chart
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        // Tính tỉ lệ ảnh để vừa khổ A4
        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save("Baocaodoanhthu.pdf");
    };
    return (
        <Card style={{ borderRadius: 16}}>
            <StyleTabs
                activeKey={tabKey}
                onChange={setTabKey}
                type="card"
                size="medium"
                items={[
                    // ====== THEO KHOẢNG NGÀY ======
                    {
                        key: 'range',
                        label: 'Theo khoảng ngày',
                        children: (
                            <>                   
                                <Row justify={'space-between'} style={{ marginBottom: 30 }}>
                                    <RangePicker
                                        onChange={onChangeDateRange}
                                        format="DD/MM/YYYY"
                                        value={dateRange.length === 2 ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : []}
                                        placeholder={['Từ ngày', 'Đến ngày']}
                                        size="large"
                                        style={{ marginBottom: 20 }}
                                    />
                                    <ButtonComponent
                                        type="primary"
                                        size="medium"
                                        icon={<FilePdfOutlined />}
                                        onClick={handleExportPDF}
                                        style={{ marginBottom: 16 }}
                                    >
                                        Xuất báo cáo PDF
                                    </ButtonComponent>
                                </Row>
                               <LoadingComponent isLoading={isLoading}>
                                    <div id="report-day">   {/* 👈 vùng sẽ chụp PDF */}
                                        <Splitter layout="vertical" style={{ height: 1000 }}>
                                            {/* --- Biểu đồ doanh thu --- */}
                                            <Splitter.Panel defaultSize="50%">
                                            <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                                Biểu đồ doanh thu theo khoảng ngày{" "}
                                                {dateRange.length === 2
                                                ? `từ ${new Date(dateRange[0]).toLocaleDateString("vi-VN")} đến ${new Date(dateRange[1]).toLocaleDateString("vi-VN")}`
                                                : ""}
                                            </Title>
                                            <ResponsiveContainer width="100%" height={350}>
                                                <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                                                <XAxis dataKey="date" label={{ value: "Ngày", position: "insideBottomRight", offset: 0 }} />
                                                <YAxis label={{ value: "Doanh thu (VND)", angle: -90, position: "insideLeft" }} />
                                                <Tooltip
                                                    formatter={(value) =>
                                                    new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(value)
                                                    }
                                                />
                                                <Line type="monotone" dataKey="totalRevenue" stroke={lineColor} strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                            </Splitter.Panel>

                                            {/* --- Biểu đồ số lịch khám --- */}
                                            <Splitter.Panel defaultSize="50%">
                                            <Title level={5} style={{ textAlign: "center", marginBottom: 16 }}>
                                                Biểu đồ số lịch khám theo khoảng ngày{" "}
                                                {dateRange.length === 2
                                                ? `từ ${new Date(dateRange[0]).toLocaleDateString("vi-VN")} đến ${new Date(dateRange[1]).toLocaleDateString("vi-VN")}`
                                                : ""}
                                            </Title>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorAppointment" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                                                <XAxis dataKey="date" label={{ value: "Ngày", position: "insideBottomRight", offset: 0 }} />
                                                <YAxis label={{ value: "Số lịch khám", angle: -90, position: "insideLeft" }} />
                                                <Tooltip formatter={(value) => value.toLocaleString("vi-VN")} />
                                                <Line type="monotone" dataKey="totalAppointments" stroke={lineColor} strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                            </Splitter.Panel>
                                        </Splitter>
                                    </div>
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
                                <Row justify={'space-between'} style={{ marginBottom: 30 }}>


                                    <DatePicker
                                        picker="month"
                                        onChange={onChangeMonth}
                                        format="MM/YYYY"
                                        value={selectedMonth && selectedYear ? dayjs().month(selectedMonth - 1).year(selectedYear) : null}
                                        placeholder="Chọn tháng"
                                        size="large"
                                        style={{ marginBottom: 20 }}
                                    />
                                    <ButtonComponent
                                        type="primary"
                                        size="medium"
                                        icon={<FilePdfOutlined />}
                                        onClick={handleExportPDF}
                                        style={{ marginBottom: 16 }}
                                    >
                                        Xuất báo cáo PDF
                                    </ButtonComponent>
                                </Row>
                                <LoadingComponent isLoading={isLoading}>
                                    <div id="report-month">   {/* 👈 vùng sẽ chụp PDF */}
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
                                    </div>
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
                                <Row justify={'space-between'} style={{ marginBottom: 30 }}>
                                    
                                    <DatePicker
                                        picker="year"
                                        onChange={onChangeYear}
                                        format="YYYY"
                                        value={selectedYear ? dayjs().year(selectedYear) : null}
                                        placeholder="Chọn năm"
                                        size="large"
                                        style={{ marginBottom: 20 }}
                                    />
                                    <ButtonComponent
                                        type="primary"
                                        size="medium"
                                        icon={<FilePdfOutlined />}
                                        onClick={handleExportPDF}
                                        style={{ marginBottom: 16 }}
                                    >
                                        Xuất báo cáo PDF
                                    </ButtonComponent>
                                </Row>

                                <LoadingComponent isLoading={isLoading}>
                                    <div id="report-year">   {/* 👈 vùng sẽ chụp PDF */}
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
                                    </div>
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