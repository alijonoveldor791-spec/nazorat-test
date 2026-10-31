// HTTP marshrut tavsifini yaratish uchun umumiy yordamchi.
export const route = (method, path, handle, status = 200) => ({ method, path, handle, status, admin: false });
export const adminRoute = (method, path, handle, status = 200) => ({
  method,
  path,
  handle,
  status,
  admin: true,
});
