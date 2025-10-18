import styled from 'styled-components';
import { List } from 'antd';
export const CalendarCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 80px;
  overflow-y: auto;
  padding: 2px 4px;
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;

  /* Ẩn thanh cuộn xấu xí */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d9d9d9;
    border-radius: 4px;
  }
`;

export const CalendarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f6f9ff;
  border-radius: 6px;
  padding: 4px 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e8f1ff;
    transform: translateY(-1px);
  }
`;

export const CalendarText = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  line-height: 1.2;
`;

export const CalendarTime = styled.div`
  font-weight: 600;
  color: #1677ff;
`;

export const CalendarPatient = styled.div`
  color: #555;
  font-size: 11px;
`;

// 🧩 Styled Components
export const AppointmentList = styled(List)`
  background: #fff;
  border-radius: 10px;
`;

export const AppointmentItem = styled(List.Item)`
  padding: 10px 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fbff;
    transform: translateY(-1px);
  }

  .ant-list-item-meta-title {
    font-weight: 600;
    color: #1677ff;
  }

  .ant-list-item-meta-description {
    font-size: 13px;
    color: #555;
  }
`;

export const EmptyText = styled.p`
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px 0;
`;