
export const getColorForShiftName = (shiftName) => {
    switch (shiftName) {
        case 'morning':
            return { bg: "#e6f7ff", color: "#0050b3" };
        case 'afternoon':
            return { bg: "#fff7e6", color: "#ad4e00" };
        case 'evening':
            return { bg: "#f9e6ff", color: "#722ed1" };
        default:
            return { bg: "#f0f0f0", color: "#000000" };
    }
}
export const convertShiftNameToLabel = (shiftName) => {
    switch (shiftName) {
        case 'morning':
            return 'Ca sáng';
        case 'afternoon':
            return 'Ca chiều';
        case 'evening':
            return 'Ca tối';
        default:
            return 'Ca không xác định';
    }
}