import styled from "styled-components"
import {Table} from 'antd'
export const TableStyled = styled(Table)`
    & .ant-table-thead>tr>th {
        background: #91d5ff;
        color: #000; 
    }
    /* icon filter */
    & .ant-table-filter-trigger,
    & .ant-table-column-sorter,
    & .ant-table-column-sorter-up,
    & .ant-table-column-sorter-down,
    & .anticon.anticon-search {
        color: rgba(0, 0, 0, 0.75); /* đậm hơn mặc định */
    }

    & .ant-table-filter-trigger.active {
        color: #096dd9; /* xanh đậm hơn khi active */
    }

`