import { TableStyled } from "./style"
import { ConfigProvider } from "antd"
import viVN from "antd/es/locale/vi_VN";

const TableStyle = ({ rowSelection, columns, dataSource, loading, pagination, onChange, ...rests }) => {
    return (
        <ConfigProvider
            locale={viVN}     
        >
            <TableStyled 
                rowSelection={rowSelection} 
                rowKey={"key"}
                columns={columns} 
                scroll={{ x: "max-content" }}
                dataSource={dataSource} 
                locale={{
                    emptyText: "Không có dữ liệu tài khoản",
                    filterConfirm: "Lọc",
                    filterReset: "Xóa lọc",
                    triggerDesc: "Sắp xếp giảm dần",
                    triggerAsc: "Sắp xếp tăng dần",
                    cancelSort: "Hủy sắp xếp",
                    pagination: {
                        item: "mục",
                        page: "Trang",
                        of: "của",
                        total: "Tổng cộng",
                    }
    
                }}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    position: ["bottomCenter"],
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total}`,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "8", "10", "20", "50"],
                    showQuickJumper: true,
                    onChange: onChange,
                }}
                {...rests} 
            />
        </ConfigProvider>
        
    )
}

export default TableStyle