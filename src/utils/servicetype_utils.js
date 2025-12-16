
export const convertServiceTypeToLabel = (type) => {
    switch (type) {
        case "booking":
            return "Khám bệnh";
        case "consultation":
            return "Tư vấn";
        case "health-check":
            return "Khám sức khỏe";
        case "other":
            return "Khác";
        default:
            return "Khác";
    }
}