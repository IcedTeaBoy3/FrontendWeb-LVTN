
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { StyledCKEditor } from "./style";
const CKEditorComponent = ({ editorData, onChange }) => {
  return (
    <StyledCKEditor
        editor={ClassicEditor}
        config={{
            toolbar: [
                "heading",       // h1, h2, h3, p
                "bold",          // <b> hoặc <strong>
                "italic",        // <i> hoặc <em>
                "underline",     // <u>
                "link",          // <a>
                "bulletedList",  // <ul><li>
                "numberedList",  // <ol><li>
            ],
            heading: {
                options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                ]
            }
        }}
        data={editorData}
        onChange={(event, editor) => {
            const data = editor.getData();
            onChange(data);
        }}
    />
  )
}

export default CKEditorComponent