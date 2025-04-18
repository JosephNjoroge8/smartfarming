import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RichTextEditor({ id, value, onChange }) {
  return (
    <Editor
      id={id}
      apiKey="your-tinymce-api-key" // You may need to get an API key from TinyMCE
      value={value}
      init={{
        height: 300,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
      onEditorChange={onChange}
    />
  );
}