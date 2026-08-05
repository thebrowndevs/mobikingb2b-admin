'use client';
import React, { useEffect, useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';

function RTEFieldGlobal({ name, content, setValue }) {
    const editorRef = useRef();

    // If `content` prop changes (e.g. from defaultValues), update the editor
    useEffect(() => {
        if (!editorRef.current) return;
        const editorInstance = editorRef.current.getInstance();
        if (content !== editorInstance.getMarkdown()) {
            editorInstance.setMarkdown(content || '');
        }
    }, [content]);

    // On every change in the editor, push markdown back into RHF
    const handleChange = () => {
        if (!editorRef.current) return;
        const editorInstance = editorRef.current.getInstance();
        const newContent = editorInstance.getMarkdown();
        setValue(name, newContent, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className="w-full bg-white text-primary">
            <Editor
                ref={editorRef}
                initialValue={content || ''}
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                autofocus={false}
                height="500px"
                onChange={handleChange}
            />
        </div>
    );
}

export default RTEFieldGlobal;
