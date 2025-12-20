
export const normalizeVietnamese = (str = "") => {
  return str
    .toLowerCase()
    .normalize("NFD")                 // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xoá dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .trim();
};
