# Prompt untuk repo `wedding-be`: multi-tenant, endpoint panel Kiwara CMS, strip 3 foto

> Salin isi bagian **Prompt** ke Claude Code (atau asisten lain) yang dijalankan di root
> repo `wedding-be`. Bagian **Latar** hanya konteks untuk pembaca manusia.
>
> **Status:** perubahan ini sudah diterapkan di `wedding-be` pada commit
> `41c8857 feat: multi-tenant events/users, panel endpoints, strip layout, file-name fix`
> (18 Sep 2026, belum di-push). Dokumen ini adalah kontrak yang dipakai Kiwara CMS dan bisa
> dijalankan ulang bila repo BE perlu dibangun dari awal.

## Latar

Dua aplikasi tamu mengunggah ke satu backend `wedding-be`:

- `wedding-fe` (Zainab & Ziad) — halaman `/ucapan`, bingkai **single** (1 foto persegi).
- `photobooth-fe` (Risa & Rayen) — bingkai **single** dan **strip** (3 foto 4:3 dalam satu komposit).

Sebelum perubahan ini BE hanya punya `POST /guestbook-images`, `POST /guestbook-messages`,
`GET /guestbook-messages/:id`. Tidak ada endpoint list/hapus, tidak ada penanda event
(data dua pasangan bercampur), dan field `layout` yang dikirim photobooth-fe dibuang.
Ada juga dua bug: nama file `guestbook_<detik>.jpeg` bertabrakan dalam satu request
(`image_link` dan `framed_image_link` menunjuk file yang sama), dan `migration/migrate.go`
men-drop semua tabel setiap kali dijalankan.

Kiwara CMS (repo ini) membutuhkan:

- **Multi-tenant**: entitas `Event` (pasangan), user `admin` (vendor Kiwara, lihat semua)
  dan `user` (pasangan, hanya event miliknya). Satu event boleh punya banyak user.
- Endpoint panel untuk list/detail/hapus ucapan & foto, statistik, serta CRUD event & user.
- Dukungan strip 3 foto (`layout`, `image_links`) sesuai
  `photobooth-fe/docs/backend-prompt-strip-3-foto.md`.

## Prompt

Kamu bekerja di repo Go (gin + gorm + Postgres) `wedding-be`, modul
`gitlab.com/alatus1/wedding-be`. Kerjakan semua bagian di bawah, lalu pastikan
`gofmt -l .` kosong dan `go build ./... && go vet ./... && go test ./...` bersih.

### 0. Keamanan dulu

1. `migration/migrate.go`: hapus seluruh blok TEMP `DropTable(...)`. Tambahkan
   `&entity.Event{}` ke `AutoMigrate`.
2. `config/viper.go` (baru): loader tunggal `load()` (`sync.Once`). Bila env `CONFIG_FILE`
   terisi pakai `viper.SetConfigFile`, selain itu `config.yaml` di CWD; panggil
   `viper.AutomaticEnv()`. Panggil `load()` di semua `initialize*Config` dan hapus
   pemanggilan `viper.New()/SetConfigName` yang berulang.
3. `.gitignore` (baru): `config.local.yaml`, `rest`, `bin/`, `asset-storage/`, `cover.out`.
4. `config.yaml` **jangan** dipakai untuk uji lokal (menunjuk DB produksi). Buat
   `config.local.yaml` (tidak di-commit) ke Postgres lokal; semua run lokal memakai
   `CONFIG_FILE=config.local.yaml go run ./cmd/...`.

### 1. Entity

- `entity/event.go` (baru):
  `Event{ID; Slug string gorm:"size:64;uniqueIndex;not null"; Name string gorm:"size:128;not null"; BrideName; GroomName; EventDate *time.Time gorm:"type:date"; IsActive bool gorm:"not null;default:true"; CreatedAt; UpdatedAt}`.
- `entity/enum.go`: `type GuestbookLayout string`, `LayoutSingle = "single"`, `LayoutStrip = "strip"`, `IsValid()`.
- `entity/user.go` += `EventID *uint gorm:"index"`, `Event *Event json:"-"`, `IsActive bool gorm:"not null;default:true"`.
- `entity/guestbook_message.go` += `EventID *uint gorm:"index"`, `Event *Event json:"-"`.
- `entity/guestbook_image.go` += `EventID *uint gorm:"index"`, `Event *Event json:"-"`,
  `Layout string gorm:"size:16;not null;default:'single'"`,
  `ImageLinks []string gorm:"type:jsonb;serializer:json"`,
  `GuestbookMessage *GuestbookMessage json:"-" gorm:"foreignKey:GuestbookMessageID"`.
  `ImageLink` tetap = foto pertama (kompatibel klien lama).
- `entity/global.go` += `AppTimeZone = "Asia/Jakarta"`.

Semua kolom baru nullable atau berdefault → `AutoMigrate` aman untuk baris lama
(`layout` terisi `single`, `event_id` NULL, `is_active` true).

### 2. valueobject & repository

- `valueobject/enum.go`: operator `IsNull "IS NULL"`, `IsNotNull "IS NOT NULL"`;
  `Association` += `Order string`; tipe `RawWhere{SQL; Args}`;
  `EventScope{EventID *uint; OnlyNull bool}` dengan `Filter(column) *FilterItem`,
  `SQL(column) (string, []any)`, `Matches(eventID *uint) bool`.
  `condition.go`: lewati validasi nilai kosong untuk IsNull/IsNotNull.
  `query.go`: `WhereRaw`, `GetRawWheres`, `WithPreloadOrder(entity, order)`; `PaginationParam` += `RawWheres`.
- `repository/base.go`: helper `applyConditions` (dipakai Find/FindOne/Delete/Pagination,
  termasuk IS NULL / IS NOT NULL / BETWEEN), `applyRawWheres`, `applyAssociations`
  (Preload dengan `Order` → `db.Preload(e, func(tx) tx.Order(order))`). Selalu **reassign**
  hasil chain gorm. `Pagination`: search ILIKE dikelompokkan dalam satu `db.Where(group)`
  (perbaiki bug `A AND x ILIKE ? OR y ILIKE ?`); Preload dan Select hanya pada item query,
  bukan count query.
- `repository/event_repo.go` (baru): `FindBySlug`, `FindActiveBySlug`,
  `CountUsage(eventID) (users, messages, images int64, error)`.
- `repository/guestbook_image_repo.go`: `LinkToMessage(ctx, ids, messageID, eventID *uint)`
  → `Updates` += `"event_id": gorm.Expr("COALESCE(event_id, ?)", *eventID)`;
  tambah `FindOrphansByIDs(ids)` dan `CountByFileLink(link)` (cegah hapus file yang masih
  dirujuk baris lain — data lama berbagi nama file).
- `repository/guestbook_message_repo.go`: `FindDetail(id)` = Preload Images (`"order" ASC`) + Event.
- `repository/guestbook_stats_repo.go` (baru): `CountMessages(scope)`, `CountImages(scope)`,
  `DailyMessages/DailyImages(scope, since)` via `Raw(...).Scan`, memakai
  `COUNT(*) FILTER (WHERE ...)` dan
  `to_char(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')` group by hari.

### 3. Auth context, JWT, middleware

- `util/authctx/authctx.go` (baru): `Auth{UserID uint; Role appjwt.Role; EventID *uint}`,
  `With/FromContext`, `IsAdmin()`, dan
  `ResolveEventScope(auth, requested *string) (valueobject.EventScope, error)`:
  role user → event miliknya (403 bila nil); admin → kosong/`all` = semua,
  `none`/`null` = baris `event_id IS NULL`, angka = event itu, lainnya (termasuk `0`) → 400.
- `util/appjwt/jwt.go`: `CustomClaims` dan `AuthJwt` += `EventID *uint` (`json:"event_id,omitempty"`).
- `middleware/auth_middleware.go`: simpan `authctx.Auth` ke context (tetap simpan
  `user_id`/`role` lama untuk log middleware).
- `util/apperror/resource_state_error.go` += `NewResourceConflictError(msg)` (409).
- `util/util.go` += `AppLocation()`, `ParseDateIn()`.

### 4. DTO

- `dto/event.go` (baru): `EventBrief{ID, Slug, Name}` + `NewEventBrief`;
  `EventCreateRequest`/`EventUpdateRequest` (`slug`, `name` wajib; `bride_name`, `groom_name`;
  `event_date *string` YYYY-MM-DD; `is_active *bool`); `EventListParam{Page, Limit, Search, IsActive}`;
  `EventResponse`.
- `dto/user.go` (baru): `UserCreateRequest{Name, Email, Password min=8, Role oneof=admin user, EventID *uint, IsActive *bool}`,
  `UserUpdateRequest`, `UserResetPasswordRequest{NewPassword min=8}`,
  `UserListParam{Page, Limit, Search, Role, EventID *string}`, `UserResponse` (tanpa password, `Event *EventBrief`).
- `dto/auth.go`: hapus `RegisterRequest`; `LoginResponse` += `EventID *uint`, `Event *EventBrief`, `IsActive`;
  `ProfileResponse{ID, Name, Email, Role, EventID, Event, IsActive}`.
- `dto/guestbook.go`: `GuestbookImageItem{ID, Layout, ImageLink, ImageLinks, FramedImageLink, Order, CreatedAt}`
  + `NewGuestbookImageItem` (normalisasi: layout kosong → `single`, `ImageLinks` kosong → `[ImageLink]`),
  dipakai respons publik **dan** panel. `GuestbookImageUploadResponse` += `Layout`, `ImageLinks`.
  Baru: `GuestbookMessageListParam`, `GuestbookMessagePanelItem`, `GuestbookImageListParam`,
  `GuestbookImagePanelItem` (embed item + `GuestbookMessageID`, `GuestbookMessage *{ID, Fullname}`, `Event *EventBrief`),
  `GuestbookStatsParam`, `GuestbookStatsResponse`.

### 5. Usecase

- `usecase/event_resolver.go`: `resolveEventID(ctx, eventRepo, slug) (*uint, error)` —
  `""` → nil; tidak ada/nonaktif → 400 `event tidak ditemukan`.
- `usecase/event_usecase.go`: List (search slug/name/bride/groom, filter `is_active`,
  sort `created_at desc`), Create/Update (slug `^[a-z0-9]+(-[a-z0-9]+)*$`, unik), Detail,
  Delete (409 bila `CountUsage` > 0, sertakan jumlahnya di pesan).
  Catatan gorm: `IsActive=false` saat create diabaikan karena tag `default` dan RETURNING;
  setelah create paksa nilai false lewat `Update` dengan `Select`.
- `usecase/user_usecase.go`: role user wajib `event_id` yang ada (400/404); role admin
  `event_id` harus nil (400); email unik; tidak boleh nonaktifkan/turunkan/hapus diri sendiri
  (403, berdasarkan `authctx`). List: search name/email, filter role, `event_id` via
  `ResolveEventScope`, Preload Event. `ResetPassword` hash baru.
- `usecase/auth_usecase.go`: hapus `Register`; `Login` Preload Event, tolak `!IsActive`
  dengan error kredensial yang sama; token & respons memuat `event_id`/`event`;
  `GetProfile` → `ProfileResponse`.
- `usecase/guestbook_image_usecase.go`: deps += eventRepo.
  `UploadGuestbookImageInput{Layout; ImageLinks []string; FramedImageLink; EventSlug}`.
  `ListGuestbookImages(param)`: `SortBy "guestbook_images.created_at" desc`, search
  `guestbook_messages.fullname`, filter scope pada `guestbook_images.event_id`, `layout`
  (`all` = tanpa filter), `linked` → IS NOT NULL / IS NULL pada `guestbook_message_id`
  (`all|linked|orphan`, lainnya 400); `Select("guestbook_images.*")`,
  `WithJoin("LEFT JOIN guestbook_messages ON guestbook_messages.id = guestbook_images.guestbook_message_id")`,
  Preload `GuestbookMessage`, `Event`. Semua kolom terkualifikasi tabel.
  `DeleteGuestbookImage(id)`: 404 bila di luar scope; hapus baris lalu file best-effort
  dengan guard `CountByFileLink`.
- `usecase/guestbook_message_usecase.go`: deps += eventRepo. Input += `EventSlug`; bila kosong
  dan ada `ImageIDs`, warisi event dari orphan pertama yang punya `EventID`; `LinkToMessage`
  meneruskan event. `ListGuestbookMessages(param)`: search fullname/message, scope,
  `has_voice` (IS NOT NULL/IS NULL), `date_from`/`date_to` (tengah malam WIB, half-open),
  `has_photo` via `RawWhere` `EXISTS (SELECT 1 FROM guestbook_images gi WHERE gi.guestbook_message_id = guestbook_messages.id)`;
  `WithPreloadOrder("Images", "\"order\" ASC")`, `WithPreload("Event")`.
  `DetailGuestbookMessage(id)` (404 bila `!scope.Matches`).
  `DeleteGuestbookMessage(id)`: kumpulkan link (dedupe: image_link, image_links, framed, voice)
  → transaksi hapus gambar + pesan → hapus file best-effort, dengan guard rujukan.
- `usecase/guestbook_stats_usecase.go`: `GetStats(param)` → 4 panggilan repo → isi 14 hari (0 bila kosong).

### 6. Handler

- `handler/guestbook_image_handler.go` `UploadGuestbookImage`: `layout := c.DefaultPostForm("layout", "single")`
  (validasi); `files := form.File["images"]`, fallback `form.File["image"]`; single = tepat 1,
  strip = tepat 3 (400 `strip layout requires exactly 3 image(s), got N`); `framed_image` wajib;
  `event_slug` opsional; simpan berurutan; bila usecase gagal hapus file yang sudah tersimpan;
  respons **201 tanpa envelope** (seperti sebelumnya). Tambah `ListGuestbookImages`, `DeleteGuestbookImage`.
- `handler/guestbook_message_handler.go`: baca `event_slug`; `saveVoice` memakai
  `upload.UniqueFileName("voice", ext)`; hapus file suara bila usecase gagal. Tambah
  `ListGuestbookMessages`, `DetailGuestbookMessage` (→ `dto.Response{Data}`), `DeleteGuestbookMessage`.
- `handler/guestbook_stats_handler.go`, `handler/event_handler.go`, `handler/user_handler.go` (baru),
  pola `example_handler.go`. Create event/user mengembalikan **201** dengan objek lengkap di `data`.
- `handler/auth_handler.go`: hapus `Register`; ambil id dari `authctx.FromContext`.

### 7. Router & wiring

`router/router.go`:

```go
auth.POST("/login", ...)                 // POST /auth/register DIHAPUS

protected := router.Group("/api", middleware.Auth(appjwt.RoleAdmin, appjwt.RoleUser))
protected.GET("/me"); protected.PUT("/change-password")
protected.GET("/guestbook-messages"); protected.GET("/guestbook-messages/:id"); protected.DELETE("/guestbook-messages/:id")
protected.GET("/guestbook-images");   protected.DELETE("/guestbook-images/:id")
protected.GET("/guestbook-stats")

adminPanel := router.Group("/api/admin", middleware.Auth(appjwt.RoleAdmin))
adminPanel.GET|POST("/events"); adminPanel.GET|PUT|DELETE("/events/:id")
adminPanel.GET|POST("/users");  adminPanel.GET|PUT|DELETE("/users/:id"); adminPanel.PUT("/users/:id/reset-password")
```

Grup `admin` lama (`/api/examples`, `/api/images`, `/api/pdfs`, `/api/emails`) tetap.
`cmd/rest/main.go`: tambah `eventRepo`, `guestbookStatsRepo`, `NewEventUsecase(eventRepo)`,
`NewUserUsecase(userRepo, eventRepo, hash)`, `NewGuestbookMessageUsecase(msgRepo, imgRepo, eventRepo, tx)`,
`NewGuestbookImageUsecase(imgRepo, eventRepo)`, `NewGuestbookStatsUsecase(statsRepo)`, handler baru,
dan daftarkan di `router.Handlers`.

### 8. Perbaikan util

- `util/upload/upload.go`: `SaveFile` += `os.O_TRUNC`; `UniqueFileName(prefix, ext)` =
  `prefix_<UnixNano>_<hex 4 byte crypto/rand>ext`; `StoragePathFromPublicURL(url) (string, bool)`
  (whitelist dir `/images|/voices|/pdfs|/qrcodes`, `filepath.Base` → cegah traversal);
  `RemovePublicURL(url)` (NotExist = sukses).
- `util/image/image.go`: ganti semua `fmt.Sprintf("%s_%d...", time.Now().Unix())` di
  `ImageValidationCompress`, `ImageValidation`, `PDFValidationAndSave` dengan `upload.UniqueFileName`.

### 9. Seed & config

- `config/admin_config.go` (baru): `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`; tambahkan
  kunci kosong ke `config.yaml` (nilai diisi pemilik).
- `migration/seed.go`: `SeedAdmin` idempoten (upsert by email; skip bila `ADMIN_*` kosong;
  log bahwa password admin di-reset tiap run), `SeedEvents` `FirstOrCreate` slug `zainab-ziad`
  ("Zainab & Ziad") dan `risa-rayen` ("Risa & Rayen"). Hapus `SeedUsers`/`SeedExamples`.
- `cmd/seed`, `cmd/migrate`: `logger.Log.Fatal` bila koneksi gagal.
- README: dokumentasikan `event_slug`, `event_id=none`, endpoint baru, `CONFIG_FILE`.

### Kontrak respons

Envelope `dto.Response`: `{message?, data, current_page?, current_item?, total_page?, total_item?}`
(field paginasi di level atas). Endpoint publik lama **tidak berubah bentuk**
(`POST /guestbook-images` dan `GET /guestbook-messages/:id` tetap tanpa envelope), hanya bertambah field.

| Method | Path | Role | Catatan |
|---|---|---|---|
| POST | `/auth/login` | publik | `data` += `event_id`, `event:{id,slug,name}\|null`, `is_active`; user nonaktif → 401 |
| GET | `/api/me` | admin, user | `{id,name,email,role,event_id,event,is_active}` |
| PUT | `/api/change-password` | admin, user | `{old_password,new_password}` |
| POST | `/guestbook-images` | publik | multipart: `event_slug?`, `layout?` (`single`\|`strip`), `images` 1–3 file (atau `image` lama), `framed_image`. Respons 201 `{id, layout, image_link, image_links[], framed_image_link}` |
| POST | `/guestbook-messages` | publik | multipart: `fullname`, `message?`, `voice?`, `image_ids` (JSON array), `event_slug?` (jika kosong, warisi dari gambar) |
| GET | `/guestbook-messages/:id` | publik | `images[]` += `id`, `layout`, `image_links`, `order`, `created_at` |
| GET | `/api/guestbook-messages` | admin, user | `?page&limit&search&event_id&has_photo&has_voice&date_from&date_to`; user dipaksa ke event miliknya; admin `event_id=<id>`/`none` |
| GET / DELETE | `/api/guestbook-messages/:id` | admin, user | 404 bila di luar scope; DELETE menghapus baris gambar + pesan + file (asli, image_links, bingkai, suara) |
| GET | `/api/guestbook-images` | admin, user | `?page&limit&event_id&layout&linked=all\|linked\|orphan&search` (nama tamu via JOIN) |
| DELETE | `/api/guestbook-images/:id` | admin, user | hapus baris + file |
| GET | `/api/guestbook-stats` | admin, user | `?event_id` → `{total_messages,total_images,total_single,total_strip,total_with_voice,total_orphan_images,daily:[{date,messages,images}×14]}` |
| GET / POST | `/api/admin/events` | admin | list `?page&limit&search&is_active`; create `{slug,name,bride_name,groom_name,event_date,is_active}` → 201 |
| GET / PUT / DELETE | `/api/admin/events/:id` | admin | DELETE 409 bila masih ada user/pesan/gambar |
| GET / POST | `/api/admin/users` | admin | list `?page&limit&search&role&event_id`; create `{name,email,password,role,event_id,is_active}` → 201 |
| GET / PUT / DELETE | `/api/admin/users/:id` | admin | tidak boleh hapus/nonaktifkan/turunkan diri sendiri (403) |
| PUT | `/api/admin/users/:id/reset-password` | admin | `{new_password}` |

Bentuk item:

- **Message**: `{id, fullname, message|null, voice_link|null, created_at, event:{id,slug,name}|null, images:[Image]}`
- **Image**: `{id, layout, image_link, image_links:string[]|null, framed_image_link|null, order, created_at, guestbook_message_id|null, guestbook_message:{id,fullname}|null, event|null}`
- **Event**: `{id, slug, name, bride_name, groom_name, event_date|null, is_active, created_at, updated_at}`
- **User**: `{id, name, email, role, event_id|null, event|null, is_active, created_at, updated_at}` — tanpa password.

### Verifikasi

```bash
gofmt -l . && go build ./... && go vet ./... && go test ./...
psql -c 'CREATE DATABASE wedding_be_local'                       # sekali
CONFIG_FILE=config.local.yaml go run ./cmd/migrate/migrate.go
CONFIG_FILE=config.local.yaml go run ./cmd/seed/seed.go
CONFIG_FILE=config.local.yaml go run ./cmd/rest/main.go          # http://localhost:6027
```

Skenario curl yang harus lolos (urut): `POST /auth/register` → 404 · login admin → `/api/me`
role admin · `GET /api/admin/events` berisi 2 event seed · slug "Bad Slug" → 400 · user tanpa
`event_id` → 400 · admin dengan `event_id` → 400 · buat user Zainab (event 1) & Risa (event 2),
login keduanya · upload legacy (`image`+`framed_image`, tanpa slug) → 201 `event` null · upload
single dengan `event_slug=zainab-ziad` · upload strip 3 `images` dengan `event_slug=risa-rayen` →
`image_links` 3 URL berbeda, `framed_image_link` bukan salah satunya · strip 2 foto → 400 ·
`event_slug=nope` → 400 · `ls asset-storage/images | sort | uniq -d` kosong · pesan tanpa slug
dengan `image_ids=[S]` mewarisi event · pesan dengan slug + suara · `GET /guestbook-messages/:id`
tetap tanpa envelope dan `images[]` punya `layout`/`image_links` · list sebagai Zainab hanya
pesannya, sebagai Risa hanya pesannya, admin `event_id=none` hanya baris legacy · filter
`search`, `has_photo`, `has_voice`, `date_from/date_to`, `linked=orphan&layout=strip` ·
`GET /api/guestbook-stats` 14 entri harian · detail pesan Risa dengan token Zainab → 404 ·
`GET /api/admin/events` dengan token user → 403 · `DELETE /api/guestbook-messages/<id>` → semua
file (asli, bingkai, suara) hilang dari disk · `DELETE /api/admin/events/2` → 409 · hapus diri
sendiri → 403 · nonaktifkan user → login 401 · reset password → login dengan password baru.

### Rilis produksi

1. Isi `ADMIN_NAME/EMAIL/PASSWORD` di `config.yaml` produksi.
2. Build binari baru; jalankan `cmd/migrate` **sekali** (aditif; blok DropTable sudah hilang),
   lalu `cmd/seed` (admin Kiwara + 2 event), lalu ganti container.
3. Token JWT lama tanpa `event_id` tetap valid sampai kedaluwarsa; perubahan event/`is_active`
   user berlaku saat login berikutnya.
4. Baris lama (`event_id` NULL, `image_link == framed_image_link`) dibiarkan; admin melihatnya
   lewat `event_id=none`; CMS menampilkan catatan "foto asli & bingkai identik (data lama)".

### Batasan

- Jangan mengubah `deploy-dev-manual.sh`, rahasia di `config.yaml` (selain menambah kunci `ADMIN_*`),
  atau repo FE.
- Tetap gin + gorm + imaging; komentar kode mengikuti bahasa file yang bersangkutan.
