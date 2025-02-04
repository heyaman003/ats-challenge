'use client';

import { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import {DownloadIcon} from 'lucide-react'
import { Toolbar } from '@/components/ui/toolbar';
// import { Button } from './button';
import { generateResumePdf } from '../function/pdf-generator';
// Corrected imports for Tiptap extensions
import {
  Color,
} from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Table from '@tiptap/extension-table';
import Highlight from '@tiptap/extension-highlight';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
// import Link  from 'next/link';
import Link from '@tiptap/extension-link';
interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}


const getEditorContent = (htmlResponse: string[]): string => {
  const pageEndDelimiter = /<i>\d+\/\d+&nbsp;<\/i>/i;
  return htmlResponse
    .filter((data) => !pageEndDelimiter.test(data))
    .map((data) => `<p>${data}</p>`)
    .join('');
};

export default function TiptapEditor({
  content,
  onChange,
}: TiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
              
        
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
          },
        },
      }),
      Link.configure({
        openOnClick: false, 
        autolink: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),  
      Highlight.configure({
        multicolor: true, // Enable multiple highlight colors
      }),
      Heading.configure({
        levels: [2, 3],
      }),
      Table.configure({
        resizable: true, // Enable resizable columns
        HTMLAttributes: {
          class: 'resume-table', // Add a class for custom styling
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
FontFamily,
    Color,
      BulletList,
      OrderedList,
      ListItem,
      TextStyle,
      Bold,
      Italic,
      Underline,
     
    ],
    content: Array.isArray(content) ?getEditorContent(content):content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none',
        placeholder: 'Start writing your resume here...',
      },
    },
  });

  useEffect(() => {
    if (editor && content && hasInitialized) {
      const newContent = Array.isArray(content) ? getEditorContent(content) : content;
      const currentContent = editor.getHTML(); 
  
      if (newContent !== currentContent) {
        editor.commands.setContent(newContent, false); 
      }
    }
  }, [content, editor, hasInitialized]);
  

  useEffect(() => {
    if (editor && content && !hasInitialized) {
      editor.commands.setContent(content);
      setHasInitialized(true);
    }
  }, [content, editor, hasInitialized]);

  if (!isMounted || !editor) return <div>Loading...</div>;
  const handleDownload = async () => {
    const editorContent = Array.isArray(content) ? getEditorContent(content) : content;
    console.log(editorContent, "editorContent");
  
    if (editorContent) {
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = editorContent;
      
      await generateResumePdf(contentDiv);
    }
  };
  
  return (
    <div className="space-y-4 h-full overflow-y-auto relative"> 
  
    <div className="flex justify-between sticky top-0 z-[100]">
   
        <Toolbar   editor={editor} />
        <button className="w-[60px]" onClick={handleDownload}>
    <DownloadIcon/></button>    
      </div>  
        
      <div id="editor-content" className="p-4 border rounded-lg ">
        <EditorContent  editor={editor} />
      </div>
    </div>
  );
}
