// Admin sinflarni yozuv yoki yangi shaxsiy kod yaratmasdan o'qiydi.
import { listClasses } from './class-service.mjs';
export const adminClasses = () => listClasses(true);
