
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const formatTime = (time) => {
    return time ? `${new Date(time?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(time?.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : "Chưa có giờ khám";
}