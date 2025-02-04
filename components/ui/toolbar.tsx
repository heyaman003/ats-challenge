"use client"
import { Editor } from '@tiptap/react';
import { useState, useEffect } from 'react';

// Remove unused imports from the toolbar:
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Link2Icon,
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  TableIcon,
  UndoIcon,
  RedoIcon,
  AtomIcon,
  TextCursorInputIcon,
  TypeIcon,
} from 'lucide-react';
// Remove PaletteIcon and SquareCodeIcon
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColorPicker } from '@/components/ui/colorPicker';
// import { Input } from '@/components/ui/input';

interface ToolbarProps {
  editor: Editor | null;
}

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Georgia', value: 'Georgia' },
];

// const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

export function Toolbar({ editor }: ToolbarProps) {
  const [isMounted, setIsMounted] = useState(false);

  if (!editor) return null;
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    let url =null;
    if(isMounted){
       url = (typeof window !== "undefined") && window.prompt("Enter the URL", previousUrl);
    }
    if (url === null) return;
    
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetMark("link").run();
      return;
    }
  
    editor.chain().focus().extendMarkRange("link").setLink({ href: url ? url : "" }).run();
  };
  

  const addSection = (section: string) => {
    const sections = {
      summary: '<h2>Professional Summary</h2><p>[Your summary here]</p>',
      experience: '<h2>Work Experience</h2><ul><li>[Your experience items]</li></ul>',
      education: '<h2>Education</h2><ul><li>[Your education items]</li></ul>',
      skills: '<h2>Skills</h2><ul><li>[Your skills]</li></ul>'
    };
    editor.chain().focus().insertContent(sections[section as keyof typeof sections]).run();
  };

  const insertTable = () => {
    editor.chain().focus()
      .insertTable({
        rows: 2, // Default number of rows
        cols: 3, // Default number of columns
        withHeaderRow: true, // Include a header row
      })
      .run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted w-[90%] items-center ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <TextCursorInputIcon className="h-4 w-4 mr-2" />
            Sections
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='z-[100]'>
          <DropdownMenuItem onClick={() => addSection('summary')}>Professional Summary</DropdownMenuItem>
          <DropdownMenuItem onClick={() => addSection('experience')}>Work Experience</DropdownMenuItem>
          <DropdownMenuItem onClick={() => addSection('education')}>Education</DropdownMenuItem>
          <DropdownMenuItem onClick={() => addSection('skills')}>Skills</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <TypeIcon className="h-4 w-4 mr-2" />
            Font
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[120px] z-[100]">
          {FONT_FAMILIES.map((font) => (
            <DropdownMenuItem
              key={font.value}
              onSelect={() => editor.chain().focus().setFontFamily(font.value).run()}
            >
              {font.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <AtomIcon className="h-4 w-4 mr-2" />
            Size
          </Button>
        </DropdownMenuTrigger>
        
      </DropdownMenu>

<ColorPicker

  label="Text Color"
  color={editor.getAttributes('textStyle').color || '#000000'}
  onChange={(color) => editor.chain().focus().setColor(color).run()}
  onClear={() => editor.chain().focus().unsetColor().run()}
/>

<ColorPicker
  label="Highlight"
  color={editor.getAttributes('highlight').color || '#ffff00'}
  onChange={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
  onClear={() => editor.chain().focus().unsetHighlight().run()}
/>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeftIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenterIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRightIcon className="h-4 w-4" />
      </Toggle>

      <Button onClick={insertTable} size="sm" variant="outline">
        <TableIcon className="h-4 w-4 mr-2" />
        Table
      </Button>

      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        size="sm"
        variant="outline"
      >
        <UndoIcon className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        size="sm"
        variant="outline"
      >
        <RedoIcon className="h-4 w-4" />
      </Button>  <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <button
        type="button"
        onClick={setLink}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Link2Icon className="h-4 w-4" />
      </button>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>
      {/* You can add additional controls such as strikethrough, undo/redo, etc. */}
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
