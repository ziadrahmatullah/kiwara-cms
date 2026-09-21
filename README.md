# Kiwara CMS

Panel admin untuk buku tamu & photobooth pernikahan **Kiwara**. Menampilkan ucapan tamu,
foto asli dan foto berbingkai (termasuk bingkai strip 3 foto), serta pengelolaan event dan
pengguna. Backend: [`wedding-be`](https://zz-wedding-api.abdulghaniglobal.com) (Go, gin + gorm).

## Fitur

| Menu | Isi |
|---|---|
| Dashboard | Stat tile (ucapan, foto, bingkai 1/3 foto, pesan suara), grafik 14 hari + tampilan tabel, ucapan & foto terbaru |
| Galeri Foto | Grid foto dengan mode **Bingkai** / **Foto asli**, filter tata letak & keterhubungan, lightbox (tab bingkai/asli, navigasi ←/→, unduh per file atau semua, hapus) |
| Ucapan | Daftar berfilter (nama/pesan, foto, suara, rentang tanggal), detail dengan pesan, pemutar suara, foto, unduh semua, hapus |
| Event *(admin)* | CRUD event pasangan (slug, nama, pengantin, tanggal, status aktif) |
| Pengguna *(admin)* | CRUD akun, penugasan ke event, reset password, nonaktifkan |
| Ganti Password | Ubah password akun sendiri |

### Peran & scope

- **admin** (vendor Kiwara): melihat semua event. Selector event di header membatasi dashboard,
  galeri, dan ucapan ke satu event, semua event, atau **Tanpa event** (data lama sebelum ada penanda event).
- **user** (pasangan): hanya melihat data event miliknya; menu Administrasi disembunyikan dan
  rute admin menampilkan "Akses ditolak".

## Menjalankan

Prasyarat: Node.js >= 20.19.

```bash
cp .env.example .env      # isi VITE_API_URL
npm install
npm run dev               # http://localhost:5173
```

| Script | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan Vite |
| `npm run build` | `tsc -b` lalu `vite build` ke `dist/` |
| `npm run preview` | Sajikan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Pemeriksaan tipe saja |

Variabel lingkungan:

| Nama | Contoh | Keterangan |
|---|---|---|
| `VITE_API_URL` | `http://localhost:6027` | Base URL wedding-be tanpa trailing slash |

## Struktur

```
src/
├── types/api.ts            # tipe kontrak API (satu sumber kebenaran)
├── lib/utils.ts            # cn(), slugify(), getInitials()
├── shared/
│   ├── components/ui/      # primitif (button, card, dialog, select, badge, segmented, …)
│   ├── components/layout/  # Sidebar, Header, Breadcrumbs, EventScopeSelector, CommandPalette
│   ├── components/         # ConfirmDialog, Pagination, EmptyState, ErrorState, RequireRole, …
│   ├── config/             # navigation.ts (menu + adminOnly), breadcrumbs.ts
│   ├── hooks/              # useEffectiveEventScope (pemaksaan scope per peran), …
│   ├── lib/                # apiClient, download, format, files, images, queryClient
│   └── store/              # useUIStore, useEventScopeStore (zustand + persist)
└── domains/<domain>/       # auth, dashboard, gallery, ucapan, events, users, settings
    ├── services/           # pemanggilan API + normalisasi {items, pagination}
    ├── hooks/              # react-query (query key ikut parameter scope)
    └── components/         # halaman & komponen domain
```

Pola per domain meniru `dmi-cms`: `services → hooks → components`, satu barrel `index.ts`.

## Backend

Kontrak endpoint, model multi-tenant, dan langkah implementasi backend ada di
[`docs/backend-prompt-kiwara-cms.md`](docs/backend-prompt-kiwara-cms.md). Ringkasan:

- Login `POST /auth/login` mengembalikan `role`, `event_id`, `event`.
- Panel (admin & user): `GET/DELETE /api/guestbook-messages(/:id)`, `GET/DELETE /api/guestbook-images(/:id)`,
  `GET /api/guestbook-stats`. Role user dipaksa ke event miliknya; admin memakai `?event_id=<id>` atau `event_id=none`.
- Admin: `/api/admin/events`, `/api/admin/users`, `PUT /api/admin/users/:id/reset-password`.
- Unggahan publik menerima `event_slug`, `layout` (`single`|`strip`), dan 1–3 file `images`.

## Deploy (Vercel)

1. Import repo, framework **Vite**, build `npm run build`, output `dist`.
2. Set env `VITE_API_URL` ke URL produksi wedding-be.
3. `vercel.json` sudah berisi rewrite SPA (semua rute selain aset → `index.html`).
