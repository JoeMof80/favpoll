// Shared favpoll email layout. Email clients can't read CSS variables,
// so the brand token values are inlined here as literals (kept in sync
// with globals.css: primary #534AB7, secondary #EEEDFE, reveal ink
// #26215C). Table-based markup for client compatibility; the wordmark
// is text (Gmail strips SVG).

/** Escape user-provided strings before they enter email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export type EmailContent = {
  /** Hidden preview line shown by inboxes next to the subject */
  preheader?: string
  heading: string
  /** Pre-escaped HTML paragraphs — escape user content with escapeHtml */
  bodyHtml: string
  cta?: { label: string; url: string }
  /** Quiet small-print line under the body (pre-escaped HTML) */
  footnoteHtml?: string
}

const FONT_STACK =
  "'Plus Jakarta Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

export function renderEmail({
  preheader,
  heading,
  bodyHtml,
  cta,
  footnoteHtml,
}: EmailContent): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#F4F3FB;">
${
  preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>`
    : ""
}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3FB;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="padding:0 8px 16px;font-family:${FONT_STACK};font-size:22px;letter-spacing:-0.01em;color:#534AB7;">
fav<span style="opacity:0.6;">poll</span>
</td></tr>
<tr><td style="background:#FFFFFF;border:1px solid #E4E2F2;border-radius:10px;padding:32px;">
<h1 style="margin:0 0 16px;font-family:${FONT_STACK};font-size:22px;font-weight:500;letter-spacing:-0.01em;color:#26215C;">${heading}</h1>
<div style="font-family:${FONT_STACK};font-size:15px;line-height:1.7;color:#3A3654;">${bodyHtml}</div>
${
  cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td style="background:#534AB7;border-radius:7px;">
<a href="${cta.url}" style="display:inline-block;padding:10px 24px;font-family:${FONT_STACK};font-size:15px;font-weight:500;color:#FFFFFF;text-decoration:none;">${escapeHtml(cta.label)}</a>
</td></tr></table>`
    : ""
}
${
  footnoteHtml
    ? `<p style="margin:24px 0 0;font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:#6E6B7F;">${footnoteHtml}</p>`
    : ""
}
</td></tr>
<tr><td style="padding:20px 8px 0;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:#6E6B7F;">
<em>Expressions of joy, for charitable causes, in the name of those we love.</em><br>
<a href="https://favpoll.com" style="color:#534AB7;text-decoration:none;">favpoll.com</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
