export const normalizePhoneDigits = (value = "", maxLength = 10) =>
  String(value).replace(/\D/g, "").slice(0, maxLength);

export const formatIndianPhone = (value = "") => {
  const digits = normalizePhoneDigits(value, 10);
  if (!digits) return "";
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
};

export const isValidIndianPhone = (value = "") =>
  /^\d{10}$/.test(normalizePhoneDigits(value, 10));
