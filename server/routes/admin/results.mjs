// Natijalar va qayta topshirish ruxsatining HTTP adapterlari.
import {adminRoute} from '../../lib/route.mjs';
import {listResults,findResult,deleteResult,allowRetake} from '../../services/result-service.mjs';
export const routes = [
  adminRoute('GET','/admin/results',() => listResults()),
  adminRoute('GET','/admin/results/:id',({params}) => findResult(params.id)),
  adminRoute('DELETE','/admin/results/:id',({params}) => deleteResult(params.id)),
  adminRoute('POST','/admin/results/:id/retake',({params}) => allowRetake(params.id)),
];
