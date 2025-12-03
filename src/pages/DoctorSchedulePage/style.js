import styled from 'styled-components';
import { Calendar } from "antd";
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

export const ShiftTag = styled.div`
  background-color: ${(props) => props.bg || "#e6f7ff"};
  color: ${(props) => props.color || "#0050b3"};
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

export const ShiftTime = styled.div`
  font-size: 11px;
  color: #595959;
`;

export const EmptyText = styled.p`
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px 0;
`;

export const StyledCalendar = styled(Calendar)`
  /* --------- Header ---------- */
  .ant-picker-calendar-header {
    padding: 16px;
    background-color: ${({ theme }) => theme.primaryDark};
    border-radius: 10px 10px 0 0;
    color: white;
    font-weight: 600;        /* Header đậm hơn */
  }
  .ant-picker-calendar-header .ant-picker-calendar-year-select,
  .ant-picker-calendar-header .ant-picker-calendar-month-select {
    font-weight: 600;        /* Năm / Tháng đậm */
  }
    /* --------- Tiêu đề thứ (Sun, Mon...) ---------- */
  .ant-picker-content th {
    font-weight: 700;
    font-size: 16px;
    color: ${({ theme }) => theme.primary};
  }

  .ant-picker-panel .ant-picker-body {
    border: 1px solid #f0f0f0;
    
  }
  .ant-picker-calendar-mode-switch {
    button {
      color: ${({ theme }) => theme.primaryDark};
      &:hover {
        color: ${({ theme }) => theme.primary};
      }
    }
  }

  /* --------- Ngày ---------- */
  .ant-picker-cell {
    transition: 0.2s ease;
  }

  /* --------- Ngày ---------- */
  .ant-picker-cell-inner {
    border-radius: 8px;
    font-weight: 500;     
  }

  /* Hover ngày */
  .ant-picker-cell:hover .ant-picker-cell-inner {
    background: ${({ theme }) => theme.primaryLight};
  }

  /* Ngày được chọn */
  .ant-picker-cell-selected .ant-picker-cell-inner {
    background: ${({ theme }) => theme.primary};
    color: white;
    font-weight: 600;
  }

  /* Hôm nay */
  .ant-picker-cell-today .ant-picker-cell-inner {
    border: 1px solid ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primaryDark};
  }

  /* Ngày disabled */
  .ant-picker-cell-disabled .ant-picker-cell-inner {
    background: #f5f5f5 !important;
    color: #bfbfbf !important;
  }

  /* --------- Tuần/Tháng view ---------- */
  .ant-picker-panel {
    border-radius: 10px;
    overflow: hidden;
  }
`;