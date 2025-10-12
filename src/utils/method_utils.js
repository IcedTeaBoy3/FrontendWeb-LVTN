export const convertMethodPayment = (method) => {
    switch (method) {
        case "cash":
            return "Tiền mặt";
        case "online":
            return "Trực tuyến";
        default:
            return "Không xác định";
    }
};
