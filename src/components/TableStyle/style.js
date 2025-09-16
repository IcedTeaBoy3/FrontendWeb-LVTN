import styled from "styled-components";
import { Table } from "antd";

export const TableStyled = styled(Table)`
  /* ====== Table wrapper ====== */

  /* ====== Header ====== */
  .ant-table-thead > tr > th {
    background: #e6f7ff;
    color: #002766;
    font-weight: 600;
    text-align: center;
    border-bottom: 2px solid #bae7ff;
  }

  /* ====== Body ====== */
  .ant-table-tbody > tr > td {
    padding: 12px;
    vertical-align: middle;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f0f9ff !important;
  }

  /* ====== Filter & Sort icons ====== */
  .ant-table-filter-trigger,
  .ant-table-column-sorter,
  .ant-table-column-sorter-up,
  .ant-table-column-sorter-down,
  .anticon.anticon-search {
    color: rgba(0, 0, 0, 0.65);
    transition: color 0.2s ease;
  }

  .ant-table-filter-trigger.active {
    color: #1890ff;
  }

  /* ====== Pagination ====== */
  .ant-table-pagination {
    margin: 16px 0;
    display: flex;
    justify-content: center;
  }

  /* Quick jumper input */
  .ant-pagination-options-quick-jumper input {
    border-radius: 6px;
    border: 1px solid #91d5ff;
    padding: 2px 8px;
    transition: all 0.2s;
  }

  .ant-pagination-options-quick-jumper input:focus {
    border-color: #1890ff;
    box-shadow: 0 0 4px rgba(24, 144, 255, 0.4);
  }
`;
