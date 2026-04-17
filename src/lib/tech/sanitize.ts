import "server-only"
import DOMPurify from "isomorphic-dompurify"

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4",
  "p", "strong", "em", "u", "br",
  "ul", "ol", "li",
  "a", "img",
  "blockquote", "code", "pre", "hr",
]

const ALLOWED_ATTR = ["href", "src", "alt", "title", "width", "height", "target", "rel"]

const FORBID_TAGS = ["script", "style", "iframe", "object", "embed"]
const FORBID_ATTR = ["style", "onerror", "onclick", "onload", "onmouseover", "onmouseout", "onfocus", "onblur"]

let hookRegistered = false

function ensureHooks() {
  if (hookRegistered) return
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href")
      if (href && /^https?:\/\//i.test(href)) {
        node.setAttribute("target", "_blank")
        node.setAttribute("rel", "noopener noreferrer")
      }
    }
  })
  hookRegistered = true
}

export function sanitizeReviewBody(html: string): string {
  ensureHooks()
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS,
    FORBID_ATTR,
  })
}
