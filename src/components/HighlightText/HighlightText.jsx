import Highlighter from "react-highlight-words";
import { normalizeVietnamese } from "@/utils/search_utils";

export default function HighlightText({
  text,
  keyword,
  className = "highlight-text",
  caseSensitive = false,
}) {
  if (!text || !keyword) return text;

  const searchWords = normalizeVietnamese(keyword)
    .split(/\s+/)
    .filter(Boolean);

  return (
    <Highlighter
      highlightClassName={className}
      searchWords={searchWords}
      autoEscape
      caseSensitive={caseSensitive}
      textToHighlight={text.toString()}
    />
  );
}
