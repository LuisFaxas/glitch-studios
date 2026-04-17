"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import { useEffect } from "react"

export function MarkdownPreviewPane({ html }: { html: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: false }), Underline],
    content: html,
    editable: false,
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== html) {
      editor.commands.setContent(html, { emitUpdate: false })
    }
  }, [editor, html])

  return (
    <div className="border-l border-[#222222] bg-[#000000] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#000000] border-b border-[#222222] p-3">
        <span className="font-mono text-[11px] text-[#555555] uppercase tracking-[0.1em]">
          Live Preview
        </span>
      </div>
      <EditorContent
        editor={editor}
        className="tiptap-editor p-6 text-[#f5f5f0] font-sans text-[15px] leading-relaxed [&_.tiptap]:outline-none [&_.tiptap]:min-h-[400px] [&_.tiptap_h2]:text-[22px] [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-6 [&_.tiptap_h2]:mb-3 [&_.tiptap_h3]:text-[18px] [&_.tiptap_h3]:font-bold [&_.tiptap_h3]:mt-4 [&_.tiptap_h3]:mb-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-[#333] [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-[#888] [&_.tiptap_a]:text-[#f5f5f0] [&_.tiptap_a]:underline [&_.tiptap_img]:max-w-full [&_.tiptap_img]:h-auto [&_.tiptap_img]:my-4"
      />
    </div>
  )
}
