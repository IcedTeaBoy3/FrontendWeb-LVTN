export const convertRole = (role) => {
    switch (role) {
        case "admin":
            return "Quản trị viên";
        case "doctor":
            return "Bác sĩ";
        case "user":
            return "Người dùng";
        default:
            return "Khác";
    }
}