import Highlighter from "react-highlight-words";
export const normalizeVietnamese = (str = "") => {
  return str
    .toLowerCase()
    .normalize("NFD")                 // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xoá dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .trim();
};


/**
 * Highlight text dùng chung
 * @param {string | number} text - text gốc
 * @param {string} keyword - từ khóa tìm kiếm
 * @param {object} options
 */
export const highlightText = (
  text,
  keyword,
  options = {}
) => {
  if (!text || !keyword) return text;

  const {
    className = "highlight-text",
    caseSensitive = false,
  } = options;

  // Tách nhiều từ: "tim mach" → ["tim", "mach"]
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
};