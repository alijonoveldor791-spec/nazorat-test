// Ochiq sinflar va ro’yxat HTTP yo’llari.
import { route } from '../../lib/route.mjs';
import { publicClasses, classStudents } from '../../services/class-service.mjs';

export const routes = [
  route('GET', '/classes', () => publicClasses()),
  route('GET', '/classes/:id/students', ({ params }) => classStudents(params.id)),
  route('GET', '/grades', async () => (await publicClasses()).map((row) => row.name)),
];
