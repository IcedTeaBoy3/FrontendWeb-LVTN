import styled from "styled-components";
import { CKEditor } from "@ckeditor/ckeditor5-react";

export const StyledCKEditor = styled(CKEditor)`
  .ck.ck-editor__top {
    position: sticky;
    top: 100px; 
    z-index: 100;
    background: #fff;
  }

  /* Vùng soạn thảo */
  .ck.ck-editor__main {
    min-height: 300px;   /* chiều cao tối thiểu */
    max-height: 600px;   /* giới hạn chiều cao tối đa */
    overflow-y: auto;    /* cuộn dọc trong vùng editor */
  }

  /* Giúp nội dung hiển thị dễ nhìn */
  .ck-content {
    padding: 16px;
    line-height: 1.6;
  }
`;
