import axios from "axios";
import { toast } from "sonner";

export interface DownloadItem {
  url: string;
  filename: string;
}

/**
 * Unduh file dari URL publik sebagai blob lalu simpan dengan nama tertentu.
 * Memakai axios polos (tanpa header Authorization) supaya tidak memicu preflight
 * ke host file yang CORS-nya `*`. Bila gagal, buka di tab baru.
 */
export async function downloadBlob(url: string, filename: string): Promise<boolean> {
  try {
    const res = await axios.get<Blob>(url, { responseType: "blob", timeout: 60_000 });
    const objectUrl = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    return true;
  } catch {
    window.open(url, "_blank", "noopener");
    toast.info("Unduhan dibuka di tab baru");
    return false;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Unduh beberapa file berurutan (browser membatasi unduhan beruntun). */
export async function downloadMany(
  files: DownloadItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    await downloadBlob(f.url, f.filename);
    onProgress?.(i + 1, files.length);
    if (i < files.length - 1) await sleep(400);
  }
}

/** Pembungkus toast progres untuk downloadMany. */
export async function downloadManyWithToast(files: DownloadItem[], label = "file"): Promise<void> {
  if (files.length === 0) return;
  const id = toast.loading(`Mengunduh 0/${files.length} ${label}…`);
  try {
    await downloadMany(files, (done, total) => {
      toast.loading(`Mengunduh ${done}/${total} ${label}…`, { id });
    });
    toast.success(`${files.length} ${label} diunduh.`, { id });
  } catch {
    toast.error("Sebagian unduhan gagal.", { id });
  }
}
