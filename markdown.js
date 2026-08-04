// markdown.js — 관's Log 전용 초경량 마크다운 렌더러
// 지원 문법: **굵게**, *기울임*, # ~ ### 제목, [텍스트](url), ![대체텍스트](url),
//           !video[설명](url), 빈 줄로 구분되는 문단
// 보안: 원문을 먼저 escape한 뒤에만 마크다운 패턴을 태그로 치환하므로
//       사용자가 입력한 <script> 등 원시 HTML은 절대 실행되지 않습니다.

function mdEscapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderMarkdown(src) {
  if (!src) return '';

  const blocks = src.split(/\n{2,}/);

  const html = blocks.map(block => {
    const escaped = mdEscapeHtml(block);

    const headingMatch = escaped.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length + 2; // # -> h3, ## -> h4, ### -> h5
      return `<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`;
    }

    // 영상: !video[설명](url)
    const videoMatch = escaped.match(/^!video\[(.*?)\]\((.*?)\)$/);
    if (videoMatch) {
      const url = videoMatch[2];
      if (/^https:\/\//.test(url)) {
        return `<video controls preload="metadata" style="max-width:100%;border-radius:4px;" src="${url}"></video>`;
      }
      return '';
    }

    // 이미지 단독 줄: ![대체텍스트](url)
    const imageMatch = escaped.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      const [, alt, url] = imageMatch;
      if (/^https:\/\//.test(url)) {
        return `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:4px;display:block;">`;
      }
      return '';
    }

    return `<p>${inlineMarkdown(escaped).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

function inlineMarkdown(escapedText) {
  return escapedText
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((https:\/\/.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function stripMarkdown(src) {
  return (src || '')
    .replace(/!video\[.*?\]\(.*?\)/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*]/g, '')
    .trim();
}
