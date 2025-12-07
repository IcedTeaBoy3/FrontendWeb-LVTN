export const convertAppointmentType = (type) => {
    switch (type) {
        case "in-person": return "Khám trực tiếp";
        case "telehealth": return "Khám trực tuyến";
        default: return "Không xác định";
    }
};
