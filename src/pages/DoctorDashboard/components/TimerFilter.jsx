import React, { useState } from "react";
import { Select, Space } from "antd";

const { Option } = Select;

const TimeFilter = ({ onChange }) => {
    const [value, setValue] = useState("today");

    const handleChange = (val) => {
        setValue(val);
        onChange(val);
    };

    return (
        <Space>
            <Select
                value={value}
                style={{ width: 160 }}
                onChange={handleChange}
                options={[
                { value: "today", label: "Hôm nay" },
                { value: "week", label: "Tuần này" },
                { value: "month", label: "Tháng này" },
                { value: "all", label: "Toàn thời gian" },
                ]}
            />
        </Space>
    );
};

export default TimeFilter;
