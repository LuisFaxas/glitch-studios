"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import { useImperativeHandle, forwardRef } from "react"
import { TiptapToolbar } from "./tiptap-toolbar"

export interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  onInsertImage?: () => void
}

export interface TiptapEditorRef {
  insertImage: (src: string, alt?: string) => void
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  function TiptapEditor({ content, onChange, placeholder, onInsertImage }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Image,
        Link.configure({ openOnClick: false }),
        Placeholder.configure({
          placeholder: placeholder || "Start writing...",
        }),
        Underline,
      ],
      content,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
    })

    useImperativeHandle(ref, () => ({
      insertImage(src: string, alt?: string) {
        if (editor) {
          editor.chain().focus().setImage({ src, alt: alt || "" }).run()
        }
      },
    }))

    return (
      <div className="border border-[#333333] bg-[#000000]">
        <TiptapToolbar editor={editor} onInsertImage={onInsertImage} />
        <EditorContent
          editor={editor}
          className="tiptap-editor min-h-[300px] p-4 text-[#f5f5f0] font-sans text-[15px] leading-relaxed focus-within:border-[#f5f5f0] [&_.tiptap]:outline-none [&_.tiptap]:min-h-[300px] [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:text-[#555] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_h2]:text-[22px] [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-6 [&_.tiptap_h2]:mb-3 [&_.tiptap_h3]:text-[18px] [&_.tiptap_h3]:font-bold [&_.tiptap_h3]:mt-4 [&_.tiptap_h3]:mb-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-[#333] [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-[#888] [&_.tiptap_pre]:bg-[#111] [&_.tiptap_pre]:p-4 [&_.tiptap_pre]:font-mono [&_.tiptap_pre]:text-sm [&_.tiptap_a]:text-[#f5f5f0] [&_.tiptap_a]:underline [&_.tiptap_img]:max-w-full [&_.tiptap_img]:h-auto [&_.tiptap_img]:my-4"
        />
      </div>
    )
  }
)
