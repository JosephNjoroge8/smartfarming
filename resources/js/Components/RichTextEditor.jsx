import React, { useRef, useEffect } from 'react';

export default function RichTextEditor({ id, value, onChange }) {
  const editorRef = useRef(null);
  const uniqueId = `${id}-${Math.random().toString(36).substring(2, 9)}`;
  
  useEffect(() => {
    let editor = null;
    const initEditor = () => {
      if (window.tinymce) {
        // Ensure we don't duplicate editors
        window.tinymce.remove(`#${uniqueId}`);
        
        window.tinymce.init({
          selector: `#${uniqueId}`,
          height: 300,
          menubar: false,
          license_key: 'gpl',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
            'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 
            'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          setup: function(ed) {
            editor = ed;
            ed.on('change', function() {
              onChange(ed.getContent());
            });
            
            ed.on('init', function() {
              ed.setContent(value || '');
            });
          }
        }).then(editors => {
          editorRef.current = editors[0];
        });
      }
    };

    // Load TinyMCE if not already loaded
    if (!window.tinymce) {
      const script = document.createElement('script');
      script.src = '/tinymce/js/tinymce/tinymce.min.js';
      script.onload = initEditor;
      document.head.appendChild(script);
    } else {
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(initEditor, 0);
    }
    
    // Clean up when component unmounts
    return () => {
      if (window.tinymce) {
        window.tinymce.remove(`#${uniqueId}`);
      }
    };
  }, [id]); // Add id as dependency to ensure it reinitializes if id changes
  
  return (
    <div className="mt-1 rounded-md shadow-sm">
      <textarea
        id={uniqueId}
        defaultValue={value || ''}
        className="hidden"
      />
      {!window.tinymce && (
        <div className="border border-gray-300 rounded-md p-2 min-h-[300px] bg-gray-50">
          Loading editor...
        </div>
      )}
    </div>
  );
}