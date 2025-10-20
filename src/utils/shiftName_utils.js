
export const getColorForShiftName = (shiftName) => {
    switch (shiftName) {
        case 'Ca sáng':
            return { bg: "#e6f7ff", color: "#0050b3" };
        case 'Ca chiều':
            return { bg: "#fff7e6", color: "#ad4e00" };
        case 'Ca tối':
            return { bg: "#f9e6ff", color: "#722ed1" };
        default:
            return { bg: "#f0f0f0", color: "#000000" };
    }
}