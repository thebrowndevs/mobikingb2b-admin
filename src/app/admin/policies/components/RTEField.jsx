"use client"
import React, { useEffect, useRef } from "react";
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';

function RTEField({ content, setValue }) {
    const editorRef = useRef();

    useEffect(() => {
        if (editorRef.current) {
            const editorInstance = editorRef.current.getInstance();
            const newContent = editorInstance.getMarkdown();
            setValue('content', newContent)
        }
    }, [content])

    const handleChange = () => {
        if (editorRef.current) {
            const editorInstance = editorRef.current.getInstance();
            const newContent = editorInstance.getMarkdown();

            setValue('content', newContent)
        }
    }

    return (
        <div className=" w-full mx-auto bg-white text-primary">
            <div className="bg-white">
                <Editor
                    ref={editorRef}
                    initialValue={content || ""}
                    initialEditType="wysiwyg"
                    useCommandShortcut={true}
                    autofocus={false}
                    height="600px"
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}

export default RTEField;

