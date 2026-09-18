import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, Loader2, RotateCcw } from "lucide-react";
import type { Event, EventPayload } from "@/types/api";
import { slugify } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { NotFound } from "@/shared/components/NotFound";
import { useCreateEvent, useEvent, useUpdateEvent } from "../hooks/useEvents";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface FormState {
  name: string;
  slug: string;
  bride_name: string;
  groom_name: string;
  event_date: string;
  is_active: boolean;
}

const EMPTY: FormState = { name: "", slug: "", bride_name: "", groom_name: "", event_date: "", is_active: true };

function toFormState(ev: Event | undefined): FormState {
  if (!ev) return EMPTY;
  return {
    name: ev.name ?? "",
    slug: ev.slug ?? "",
    bride_name: ev.bride_name ?? "",
    groom_name: ev.groom_name ?? "",
    event_date: ev.event_date?.slice(0, 10) ?? "",
    is_active: ev.is_active,
  };
}

export function EventForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { data: existing, isLoading, isError } = useEvent(id);

  if (isEdit && isError) {
    return (
      <NotFound
        title="Event tidak ditemukan"
        description="Event yang kamu buka tidak ada."
        backTo="/panel/events"
        backLabel="Kembali ke Event"
      />
    );
  }

  // key memaksa remount saat data event tiba, sehingga state awal diambil dari props tanpa effect.
  return (
    <EventFormBody
      key={existing ? `event-${existing.id}` : isEdit ? "loading" : "new"}
      id={id}
      isEdit={isEdit}
      loading={isEdit && isLoading}
      initial={toFormState(existing)}
    />
  );
}

interface EventFormBodyProps {
  id?: string;
  isEdit: boolean;
  loading: boolean;
  initial: FormState;
}

function EventFormBody({ id, isEdit, loading, initial }: EventFormBodyProps) {
  const navigate = useNavigate();
  const createMut = useCreateEvent();
  const updateMut = useUpdateEvent();
  const pending = createMut.isPending || updateMut.isPending;

  const [form, setForm] = useState<FormState>(initial);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
    setErrors((e) => ({ ...e, name: undefined, slug: undefined }));
  };

  const regenerateSlug = () => {
    setSlugTouched(false);
    set("slug", slugify(form.name));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Nama event wajib diisi.";
    if (!form.slug.trim()) next.slug = "Slug wajib diisi.";
    else if (!SLUG_RE.test(form.slug)) next.slug = "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: EventPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      bride_name: form.bride_name.trim(),
      groom_name: form.groom_name.trim(),
      event_date: form.event_date ? form.event_date : null,
      is_active: form.is_active,
    };
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload });
        toast.success("Event diperbarui.");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Event dibuat.");
      }
      navigate("/panel/events");
    } catch {
      /* error sudah ditampilkan oleh apiClient */
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/panel/events")} aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Event" : "Tambah Event"}</h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Perbarui detail event pernikahan." : "Daftarkan event pernikahan baru."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/panel/events")} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" disabled={pending || loading}>
            {pending && <Loader2 className="animate-spin" />}
            Simpan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Detail Event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
              <Skeleton className="h-9 w-48" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Nama event <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Zainab & Ziad"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoFocus={!isEdit}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <Button type="button" variant="ghost" size="sm" onClick={regenerateSlug} disabled={!form.name.trim()}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Buat ulang dari nama
                  </Button>
                </div>
                <Input
                  id="slug"
                  className="font-mono"
                  placeholder="zainab-ziad"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase());
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Huruf kecil, angka, dan tanda hubung. Dipakai sebagai <code className="font-mono">event_slug</code> oleh
                  aplikasi ucapan.
                </p>
                {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bride">Nama pengantin wanita</Label>
                  <Input id="bride" value={form.bride_name} onChange={(e) => set("bride_name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="groom">Nama pengantin pria</Label>
                  <Input id="groom" value={form.groom_name} onChange={(e) => set("groom_name", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5 sm:max-w-xs">
                <Label htmlFor="event_date">Tanggal acara</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) => set("event_date", e.target.value)}
                />
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Switch id="is_active" checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Event aktif</Label>
                  <p className="text-xs text-muted-foreground">
                    Event nonaktif menolak upload baru dari aplikasi ucapan dan tidak muncul di pemilih event.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
