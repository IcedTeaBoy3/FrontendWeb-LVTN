
export const convertGender = (gender) => {
    switch (gender) {
        case "male":
            return "Nam";
        case "female":
            return "Nữ";
        default:
            return "Khác";
    }
}