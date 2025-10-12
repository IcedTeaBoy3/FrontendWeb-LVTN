export const convertPaymentType = (type) => { 
    switch (type) {
        case "service":
            return "Khám dịch vụ";
        case "insurance":
            return "BHYT";
        default:
            return "Không xác định";
    }
}