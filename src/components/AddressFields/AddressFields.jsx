import React from 'react';
import { Form, Select, Input, Row, Col } from 'antd';

const AddressFields = ({
  provinces = [],
  districts = [],
  wards = [],
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  layout = 'vertical', // 'vertical' | 'horizontal'
}) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <>
      {isHorizontal ? (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tỉnh/Thành phố"
                name="province"
                rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
              >
                <Select
                  options={provinces.map(p => ({ label: p.name, value: p.code }))}
                  placeholder="Chọn tỉnh/thành phố"
                  showSearch
                  onChange={onProvinceChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Quận/Huyện"
                name="district"
                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
              >
                <Select
                  options={districts.map(d => ({ label: d.name, value: d.code }))}
                  placeholder="Chọn quận/huyện"
                  showSearch
                  onChange={onDistrictChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phường/Xã"
                name="ward"
                rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
              >
                <Select
                  options={wards.map(w => ({ label: w.name, value: w.code }))}
                  placeholder="Chọn phường/xã"
                  showSearch
                  onChange={onWardChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Địa chỉ cụ thể"
                name="specificAddress"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập địa chỉ cụ thể" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ) : (
        <>
          {/* Layout dọc */}
          <Form.Item
            label="Tỉnh/Thành phố"
            name="province"
            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
          >
            <Select
              options={provinces.map(p => ({ label: p.name, value: p.code }))}
              placeholder="Chọn tỉnh/thành phố"
              showSearch
              onChange={onProvinceChange}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Quận/Huyện"
            name="district"
            rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
          >
            <Select
              options={districts.map(d => ({ label: d.name, value: d.code }))}
              placeholder="Chọn quận/huyện"
              showSearch
              onChange={onDistrictChange}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Phường/Xã"
            name="ward"
            rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
          >
            <Select
              options={wards.map(w => ({ label: w.name, value: w.code }))}
              placeholder="Chọn phường/xã"
              showSearch
              onChange={onWardChange}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Địa chỉ cụ thể"
            name="specificAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ cụ thể" />
          </Form.Item>
        </>
      )}
    </>
  );
};

export default AddressFields;
