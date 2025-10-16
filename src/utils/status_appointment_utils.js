
export const convertStatusAppointment = (status) => {
    switch (status) {
        case "pending":
            return "Chờ xác nhận";
        case "confirmed":
            return "Đã xác nhận";
        case "completed":
            return "Đã hoàn thành";
        case "cancelled":
            return "Đã hủy";
        default:
            return "Không xác định";
    }
};
export const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "orange";
        case "confirmed":
            return "blue";
        case "completed":
            return "green";
        case "cancelled":
            return "red";
        default:
            return "gray";
    }
};
