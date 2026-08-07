# ZST LABS API — End-to-End Integration Report

Verified live against `https://zstlab.cyou` (2026-08-02) with the CineNova API key. All requests in this
report were made with `apikey=<key>` and returned real catalogue data. This is the definitive contract
the CineNova provider adapter must match.

---

## 1. Connection essentials

| Item | Value |
|---|---|
| **Base URL** | `https://zstlab.cyou` (do NOT append `/api` to the base — the paths carry it) |
| **Auth** | Either `x-api-key: <key>` **header** OR `apikey=<key>` **query param**. Both work. |
| **Response envelope** | Every endpoint returns `{ status, statusCode, creator, endpoint, data }` |
| **Default env** | `PROVIDER_ROUTING=gzmovie`, `GZMOVIE_BASE_URL=https://zstlab.cyou`, `GZMOVIE_ENABLED=true` |

### Auth examples
```
curl "https://zstlab.cyou/api/search?query=avengers&apikey=YOUR_KEY"
curl "https://zstlab.cyou/api/homepage" -H "x-api-key: YOUR_KEY"
```

### Common envelope shape
```json
{
  "status": true,
  "statusCode": 200,
  "creator": "Godszeal (ZST LABS)",
  "endpoint": "/api/search",
  "data": { }
}
```
- `status: false` + `statusCode: 400` + `error: "query parameter is required"` occurs for an **empty
  `query`** on `/api/search`. Never call search with an empty query.

---

## 2. Identity model (critical)

Every title has two stable identifiers:

- **`subjectId`** — numeric string, the canonical id (e.g. `5154075108704669480`). Used as CineNova `id`
  and the primary key for item-details / media.
- **`detailPath`** — URL slug (e.g. `the-avengers-ChBgfByIJ86`). Used as CineNova `slug` (the `/title/…`
  route) and passed to `/api/media`.

A `subjectType` field classifies the content:
- `1` = **movie**
- `2` = **series/TV**
- `6` = **music** (unused for now)

Each title object in search/home/trending/recommendations carries: `subjectId`, `subjectType`, `title`,
`description`, `releaseDate`, `duration` (seconds), `genre` (comma-separated), `cover` (`{ url, width,
height, size, format, blurHash }`), `countryName`, `imdbRatingValue` (string), `subtitles`
(comma-separated languages), `hasResource` (bool), `detailPath`, `stills`, `staffList`.

---

## 3. Endpoints (verified live)

### 3.1 `GET /api/homepage`
**Params:** none.

Returns the editorial home. Content is nested — NOT a flat items array:
- `data.topPickList` — array
- `data.homeList` — array
- `data.platformList` — `[{ name, uploadBy }]` (Netflix, PrimeVideo, Disney, …)
- `data.operatingList` — array of blocks; the **banners** live at
  `operatingList[].banner.items[]`, where each banner item wraps its full detail in `.subject`:

```
operatingList[0].banner.items[0] = {
  id, title, image: { url, ... },
  url: "https://h5.aoneroom.com/detail/...",
  subjectId, subjectType,
  subject: { subjectId, subjectType, title, description, releaseDate, duration,
             genre, cover: { url, ... }, countryName, imdbRatingValue, detailPath, ... },
  detailPath
}
```

**Adapter requirement:** extract banners from `operatingList[].banner.items[].subject`. The
`detailPath` is on the banner item AND on the nested `subject`.

### 3.2 `GET /api/search`
**Params:** `query` (required, non-empty), `page` (1-based), `perPage`, `subjectType` (`ALL`, `1`, `2`).

- Empty `query` → **400** `"query parameter is required"`.
- Response: `data.items[]` (same title shape as §2) + `data.pager { hasMore, nextPage, page,
  perPage, totalCount }` + `data.counts[]`.
- `data.source` = `"moviebox"` (the search backend).
- Verified: `query=avengers` → 200, 277 total results (AVENGERS, The Avengers, Avengers: Endgame, …).

### 3.3 `GET /api/item-details`
**Params:** `subjectId` (required).

Returns full detail:
- `data.subject` — title metadata (includes `description`, `genre`, `cover`, `countryName`,
  `imdbRatingValue`, `trailer.videoAddress.url` for the trailer mp4, `detailPath`, `isSeries`).
- `data.stars[]` — cast/crew: `{ staffId, staffType, name, character, avatarUrl, detailPath }`.
  - `staffType: 2` = **director**
  - `staffType: 1` = **actor** (role in `character`)
  - `staffType: 3` = **writer**
- `data.resource.seasons[]` — `{ se, maxEp, allEp: "1,2,3,...", resolutions: [{ resolution, epNum }] }`
- `data.seasons[]` (top-level, duplicated) — same shape; `seasonCount`, `isSeries`.
- `data.metadata` + `data.url` + `data.referer` (referer is `https://h5.aoneroom.com/`).

### 3.4 `GET /api/trending`
**Params:** `page`, `perPage`.
**Response:** `data.subjectList[]` (NOT `items`) — same title shape. `data.pager`.

### 3.5 `GET /api/recommendations`
**Params:** `subjectId`, `page`, `perPage`.
**Response:** `data.items[]` — same title shape.

### 3.6 `GET /api/hot-movies-series`
**Response:** `data.movie[]` and `data.tv[]` — same title shape.

### 3.7 `GET /api/popular-searches`
**Response:** `data.everyoneSearch[]` — `[{ title }]`.

### 3.8 `GET /api/media` (playback source)
**Params:** `subjectId`, `detailPath`, `season`, `episode`.

Returns the playable source:
```
data.downloads.data.downloads[] = [
  { id, url: "https://bcdnxw.hakunaymatata.com/bt/xxx.mp4?sign=...&t=...",
    resolution: 360, size: "61121214" },
  { id, url: ".../convert-h264/yyy.mp4?sign=...&t=...", resolution: 720, size: "147214159" }
]
data.downloads.data.captions[]
data.downloads.data.hasResource  // true if a source exists
data.subtitles.data.downloads[]  // same list (captions/subtitles)
```

- The `url` is a **signed mp4** on CDN host `bcdnxw.hakunaymatata.com` with `?sign=…&t=…` (expiring).
- **Some titles have `hasResource:false` and an empty `downloads` array** — e.g. The Avengers returned
  empty; Genesis returned real 360p/720p mp4s. The adapter must handle empty downloads gracefully
  (fall back / show "unavailable").
- Choose the **highest `resolution`** entry as the playback source.

### 3.9 `POST /api/stream`
Documented endpoint for the actual playback session; same body as `/api/media`. Not exercised in this
pass (POST, not GET). The adapter currently uses `GET /api/media` for the source, which is sufficient
for the mp4 playback URL.

---

## 4. Media hosts (server-side allowlist)

| Host | Role |
|---|---|
| `bcdnxw.hakunaymatata.com` | Signed mp4 stream CDN |
| `pbcdnw.aoneroom.com` | Poster / artwork images |
| `macdn.aoneroom.com` | Trailer mp4s / media images |
| `image.tmdb.org` | TMDB artwork (from the alternative moviebox path) |

CineNova validates the **playback source host + HTTPS protocol** before serving. Signed URLs are
short-lived and never persisted.

---

## 5. Known gotchas (all confirmed)

1. **Search rejects empty `query` (400).** Guard every search call with a non-empty fallback term.
2. **Homepage banners are nested**, not a flat `items` array. Must read `operatingList[].banner.items[]`.
3. **Trending uses `subjectList`,** not `items` — a different key than search/recommendations.
4. **`hasResource` can be `false`** → empty downloads → no playable source for some titles.
5. **Two identity fields must stay in sync:** `subjectId` (id) and `detailPath` (slug). The `/title/{slug}`
   route must map slug → subjectId for item-details/media.
6. **`imdbRatingValue` is a string**, and may be `"0"` (meaning no rating).
7. **`countryName` is a full name** ("United States", "Nigeria", "Hongkong, China") — needs mapping to
   ISO-2 for territory logic, with a sane default.
8. **`genre` is comma-separated** — split on `,`.
9. **`duration` is seconds** (0 for series). Convert to minutes for the UI.
10. **Media `url` uses `&amp;`** in some payloads — decode entities before use.
11. **Referer may be required** by the CDN: `data.metadata.referer = "https://h5.aoneroom.com/"`.
    If direct playback is blocked, a server-side referer may be needed.

---

## 6. Recommended CineNova mapping

| ZST LABS | CineNova |
|---|---|
| `subjectId` | `TitleDetail.id` |
| `detailPath` | `TitleDetail.slug` |
| `subjectType` (1/2) | `kind` (movie/series) |
| `title` | `title` |
| `description` | `synopsis` |
| `releaseDate` / `duration` | `releaseYear` / `runtimeSeconds` |
| `genre` (split) | `genres[]` |
| `countryName` (→ISO2) | `countries[]` |
| `cover.url` | `artwork[].url` (poster) |
| `imdbRatingValue` | rating chip (gold) |
| `data.stars[]` (staffType 2=director, 1=cast) | `directors[]`, `cast[]` |
| `data.seasons[]` / `allEp` | `seasons[].episodes[]` |
| `/api/media` highest-res download.url | `PlaybackSource.playbackUrl` |

---

## 7. Resilience guarantees already in place

- **FallbackCatalogueProvider** — if ZST LABS throws or returns empty, the mock licensed catalogue is
  served so the UI never shows a blank "warming up" state.
- **Redacted logging** — provider failures log path + status, never the key or signed URL.
- **Host allowlist + HTTPS check** — only approved CDNs serve playback.
- **Empty-query guard** on search so it never 400s.
- **Homepage banner extraction** from `operatingList[].banner.items[]`.

---

## 8. To verify live on Render after deploy

1. `GET /api/v1/admin/provider-health` → expect `"provider":"gzmovie","status":"healthy"`.
2. `GET /api/v1/catalogue` → hero + rails should be **real ZST LABS titles** (not mock).
3. `GET /api/v1/search?q=avengers` → real Avengers results.
4. `GET /title/{slug}` for a slug from search → detail page with cast/directors.
5. `POST /api/v1/playback/session` for a title with `hasResource:true` → returns a signed mp4 URL.
