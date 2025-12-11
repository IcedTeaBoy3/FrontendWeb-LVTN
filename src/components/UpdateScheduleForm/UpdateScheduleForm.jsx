import { useEffect, useState } from "react";
import { Form, Select, DatePicker, Tag, Space } from "antd";
const { CheckableTag } = Tag;
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import dayjs from "dayjs";

export default function UpdateScheduleForm({ form, onSubmit, setIsDrawerOpen, initialData }) {
  const [slotGroup, setSlotGroup] = useState({
    morning: [],
    afternoon: [],
    evening: [],
  });
 

  const [selectedSlots, setSelectedSlots] = useState([]);
  const handleSelectSlot = (slotValue, checked) => {
    setSelectedSlots((prev) =>
      checked ? [...prev, slotValue] : prev.filter((v) => v !== slotValue)
    );
  };

  const SHIFT_TIME = {
    morning: [dayjs("08:00", "HH:mm"), dayjs("12:00", "HH:mm")],
    afternoon: [dayjs("13:00", "HH:mm"), dayjs("17:00", "HH:mm")],
    evening: [dayjs("18:00", "HH:mm"), dayjs("22:00", "HH:mm")],
  };

  // 👉 Generate slot cho ca
  const generateSlots = (range) => {
    const duration = form.getFieldValue("slotDuration") || 30;
    
    const start = range[0];
    const end = range[1];

    const created = [];
    let cursor = start;

    while (
      cursor.add(duration, "minute").isBefore(end) ||
      cursor.add(duration, "minute").isSame(end)
    ) {
      const s = cursor;
      const e = cursor.add(duration, "minute");

      created.push({
        label: `${s.format("HH:mm")} - ${e.format("HH:mm")}`,
        value: `${s.toISOString()}|${e.toISOString()}`,
      });

      cursor = e;
    }

    return created;
  };

  const handleShiftChange = (selectedShifts) => {
    const newGroup = { morning: [], afternoon: [], evening: [] };
    let autoSelect = [];

    selectedShifts.forEach((shift) => {
      const range = SHIFT_TIME[shift];
      const slots = generateSlots(range);
      newGroup[shift] = slots;

      // 👉 gom tất cả slot vào selected
      autoSelect = [...autoSelect, ...slots.map(s => s.value)];
    });

    setSlotGroup(newGroup);

    // 👉 Nếu đang tạo mới (không có initialData)
    if (!initialData) {
      setSelectedSlots(autoSelect);   // check ALL slot
    } else {
      // 👉 Nếu đang update → chỉ giữ slot hợp lệ
      setSelectedSlots(prev => prev.filter(v => autoSelect.includes(v)));
    }
  };


  useEffect(() => {
    if (!initialData) return;

    form.setFieldsValue({
      workday: dayjs(initialData.workday),
      slotDuration: initialData.slotDuration,
      shiftName: initialData.shifts?.map(s => s.name) || [],
    });

    const restoredGroup = { morning: [], afternoon: [], evening: [] };
    const restoredSelected = [];

    initialData.shifts.forEach((shift) => {
      restoredGroup[shift.name] = shift.slots.map((s) => {
        const v = `${s.startTime}|${s.endTime}`;
        restoredSelected.push(v);
        return {
          label: `${dayjs(s.startTime).format("HH:mm")} - ${dayjs(s.endTime).format("HH:mm")}`,
          value: v,
        };
      });
    });

    setSlotGroup(restoredGroup);
    setSelectedSlots(restoredSelected);
  }, [initialData]);


  return (
    <Form form={form} layout="vertical">
      {/* Ngày làm việc */}
      <Form.Item
        label="Ngày làm việc"
        name="workday"
        rules={[
          { required: true, message: "Vui lòng chọn ngày làm việc!" },
          {
            validator: (_, value) => {
              if (value && value.day() === 0) {
                return Promise.reject("Phòng khám không làm việc Chủ nhật!");
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
      </Form.Item>

      {/* Thời lượng */}
      <Form.Item label="Thời gian khám" name="slotDuration">
        <Select
          onChange={() => {
            const shifts = form.getFieldValue("shiftName") || [];
            handleShiftChange(shifts);
          }}
          options={[
            { label: "15 phút", value: 15 },
            { label: "20 phút", value: 20 },
            { label: "30 phút", value: 30 },
            { label: "45 phút", value: 45 },
            { label: "60 phút", value: 60 },
          ]}
        />
      </Form.Item>

      {/* Ca */}
      <Form.Item
        label="Ca làm việc"
        name="shiftName"
        rules={[{ required: true, message: "Vui lòng chọn ca!" }]}
      >
        <Select
          mode="multiple"
          placeholder="Chọn ca"
          onChange={handleShiftChange}
          options={[
            { label: "Ca sáng (08:00 – 12:00)", value: "morning" },
            { label: "Ca chiều (13:00 – 17:00)", value: "afternoon" },
            { label: "Ca tối (18:00 – 22:00)", value: "evening" },
          ]}
        />
      </Form.Item>

      {/* Slot hiển thị */}
      <Form.Item label="Khung giờ" name="slot">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Object.entries(slotGroup).map(([shift, slotList]) =>
            slotList.length > 0 ? (
              <div key={shift}>
                <strong>
                  {shift === "morning"
                    ? "Ca sáng"
                    : shift === "afternoon"
                    ? "Ca chiều"
                    : "Ca tối"}
                </strong>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {slotList.map((slot) => (
                    <CheckableTag
                      key={slot.value}
                      checked={selectedSlots.includes(slot.value)}
                      // onChange={(checked) => handleSelectSlot(slot.value, checked)}
                      style={{
                        padding: "6px 10px",
                        fontSize: 14,
                        borderRadius: 6,
                      }}
                    >
                      {slot.label}
                    </CheckableTag>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 18, span: 6 }}>
        <Space>
          <ButtonComponent type="default" onClick={() => setIsDrawerOpen(false)}>
            Huỷ
          </ButtonComponent>
          <ButtonComponent type="primary" onClick={() => onSubmit()}>
            Lưu
          </ButtonComponent>
        </Space>
      </Form.Item>
    </Form>
  );
}
