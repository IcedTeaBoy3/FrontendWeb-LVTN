import dayjs from 'dayjs';
const SHIFT_TIME = {
    morning: {
      start: dayjs('08:00', 'HH:mm'),
      end: dayjs('12:00', 'HH:mm'),
      label: 'Ca sáng',
    },
    afternoon: {
      start: dayjs('13:00', 'HH:mm'),
      end: dayjs('17:00', 'HH:mm'),
      label: 'Ca chiều',
    },
    evening: {
      start: dayjs('18:00', 'HH:mm'),
      end: dayjs('22:00', 'HH:mm'),
      label: 'Ca tối',
    },
  };

export const validateShiftTime = (form) => ({
    validator(_, value) {
        if (!value) return Promise.resolve();

        const shiftName = form.getFieldValue('name');
        const config = SHIFT_TIME[shiftName];

        if (!config) return Promise.resolve();

        const { start, end, label } = config;

        // ⏰ nằm trong khung ca
        if (value.isBefore(start) || value.isAfter(end)) {
        return Promise.reject(
            new Error(`Thời gian ${label} phải trong khoảng ${start.format('HH:mm')} – ${end.format('HH:mm')}`)
        );
        }

        const startTime = form.getFieldValue('startTime');
        const endTime = form.getFieldValue('endTime');

        // 🔁 start < end
        if (startTime && endTime && !startTime.isBefore(endTime)) {
        return Promise.reject(
            new Error('Thời gian bắt đầu phải trước thời gian kết thúc')
        );
        }

        return Promise.resolve();
    },
});
export const getDisabledTimeByShift = (form) => {
    const shiftName = form.getFieldValue('name');
    const config = SHIFT_TIME[shiftName];
    if (!config) return {};

    const startHour = config.start.hour();
    const endHour = config.end.hour();

    return {
        disabledHours: () =>
        Array.from({ length: 24 }, (_, h) => h).filter(
            (h) => h < startHour || h > endHour
        ),
    };
};