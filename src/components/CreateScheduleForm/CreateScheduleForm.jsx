import { useEffect, useState } from "react";
import { Form, Select, DatePicker, Tag } from "antd";
import dayjs from "dayjs";

export default function CreateScheduleForm({ form }) {
  const [selectedSlots, setSelectedSlots] = useState([]);
  
  const [slotGroup, setSlotGroup] = useState({
    morning: [],
    afternoon: [],
    evening: [],
  });

  const SHIFT_TIME = {
    morning: [dayjs("08:00", "HH:mm"), dayjs("12:00", "HH:mm")],
    afternoon: [dayjs("13:00", "HH:mm"), dayjs("17:00", "HH:mm")],
    evening: [dayjs("18:00", "HH:mm"), dayjs("22:00", "HH:mm")],
  };

  // 👉 Tạo slot theo range
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
    let allSlots = [];

    selectedShifts.forEach((shift) => {
      const slots = generateSlots(SHIFT_TIME[shift]);
      newGroup[shift] = slots;

      // Thu tất cả slot của các ca đã chọn
      allSlots = [...allSlots, ...slots.map((s) => s.value)];
    });

    setSlotGroup(newGroup);

    // Auto chọn tất cả slot
    setSelectedSlots(allSlots);
    form.setFieldsValue({ slot: allSlots });
  };
  const toggleSlot = (value) => {
    let newSelected;

    if (selectedSlots.includes(value)) {
      newSelected = selectedSlots.filter((v) => v !== value);
    } else {
      newSelected = [...selectedSlots, value];
    }

    setSelectedSlots(newSelected);
    form.setFieldsValue({ slot: newSelected });
  };


  useEffect(() => {
    const initShifts = ["morning", "afternoon", "evening"];
    form.setFieldsValue({ shiftName: initShifts });
    handleShiftChange(initShifts);

    // không set slot ở đây
  }, []);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        slotDuration: 30,
        shiftName: ["morning", "afternoon", "evening"], // mặc định 3 ca
      }}
    >
        {/* Ngày làm việc */}
        <Form.Item 
        label="Ngày làm việc" 
        name="workday" 
        rules={[ 
            { required: true, message: "Vui lòng chọn ngày làm việc!", }, 
            { validator: (_, value) => { 
              if (value && value.day() === 0) { 
                return Promise.reject("Phòng khám không làm việc vào ngày Chủ nhật!"); } return Promise.resolve(); 
              } 
            } 
        ]}> 
          <DatePicker 
            style={{ width: "100%" }} 
            format="DD/MM/YYYY" 
            disabledDate={(current) => current && current < dayjs().add(1, "day").startOf("day") } 
          /> 
        </Form.Item>
        {/* Thời lượng */}
        <Form.Item label="Thời gian khám" name="slotDuration">
            <Select
              onChange={() => {
                const s = form.getFieldValue("shiftName") || [];
                handleShiftChange(s);
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

        {/* Ca làm việc */}
        <Form.Item
          label="Ca làm việc"
          name="shiftName"
          rules={[{ required: true, message: "Vui lòng chọn ca làm việc!" }]}
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

        {/* SLOT THEO TỪNG CA */}
        <Form.Item
          label="Khung giờ"
          name="slot"
        >
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
                    <Tag.CheckableTag
                      key={slot.value}
                      checked={selectedSlots.includes(slot.value)}
                      onChange={() => toggleSlot(slot.value)}
                      style={{
                        padding: "6px 12px",
                        fontSize: 14,
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {slot.label}
                    </Tag.CheckableTag>
                  ))}
                  </div>
              </div>
              ) : null
          )}
          </div>
        </Form.Item>
    </Form>
  );
}
