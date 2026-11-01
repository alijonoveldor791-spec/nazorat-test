// Ko'rinib turgan matnni nusxalaydi; clipboard rad etilishini yashirmaydi.
import { toast } from '../components/toast.js';
export async function copyText(value) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard mavjud emas.');
    await navigator.clipboard.writeText(value);
    toast('ID nusxalandi.');
    return true;
  } catch {
    toast("Nusxalanmadi. IDni belgilab, qo'lda nusxalang.", true);
    return false;
  }
}
