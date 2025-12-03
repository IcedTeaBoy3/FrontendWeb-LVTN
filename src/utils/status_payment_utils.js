
export const convertStatusPayment = (status) => {
    switch (status) {
        case "paid":
            return "Đã thanh toán";
        case "unpaid":
            return "Chưa thanh toán";
        case "expired":
            return "Hết hạn";
        case "refunded":
            return "Đã hoàn tiền";
        default:
            return "Không xác định";
    }
}
export const getStatusPaymentColor = (status) => {
    switch (status) {
        case "paid":
            return "green";
        case "unpaid":
            return "red";
        case "expired":
            return "gray";
        case "refunded":
            return "orange";
        default:
            return "gray";
    }
}