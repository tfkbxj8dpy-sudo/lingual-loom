import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Highlighter,
  List,
  ListOrdered,
  Undo,
  Redo
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Start typing...",
  minHeight = "150px"
}: RichTextEditorProps) => {
  const highlightColors = [
    { name: 'Yellow', color: '#ffc078' },
    { name: 'Green', color: '#8ce99a' },
    { name: 'Blue', color: '#74c0fc' },
    { name: 'Pink', color: '#faa2c1' },
    { name: 'Purple', color: '#d0bfff' },
    { name: 'Orange', color: '#ffa94d' },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-3 py-2',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          title="Underline"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          title="Strikethrough"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={editor.isActive('highlight') ? "default" : "ghost"}
              size="sm"
              title="Highlight"
              className="h-8 w-8 p-0"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {highlightColors.map((color) => (
              <DropdownMenuItem
                key={color.color}
                onClick={() => editor.chain().focus().toggleHighlight({ color: color.color }).run()}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-4 h-4 rounded border border-border" 
                  style={{ backgroundColor: color.color }}
                />
                <span>{color.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded border border-border bg-background" />
              <span>Remove Highlight</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-px h-8 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="Numbered List"
        />
        <div className="w-px h-8 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          title="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          title="Redo"
        />
      </div>
      <div 
        className="overflow-y-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
        {!editor.getText() && (
          <p className="text-muted-foreground text-sm px-3 py-2 pointer-events-none absolute">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
};