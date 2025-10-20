import styled from 'styled-components';
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