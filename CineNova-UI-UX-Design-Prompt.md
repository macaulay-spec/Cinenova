Below is the complete, production-grade design prompt reverse-written from exactly what is in the preview. It is written so another designer or AI can rebuild this interface pixel-for-pixel without seeing the app.

# CineNova — UI/UX & Visual Design Prompt

## 1. Product premise
Build a multi-screen premium streaming interface — phone, tablet, laptop, TV — for a licensed film and series catalogue named **CineNova**. One account, every screen. The interface must feel like a cinema foyer at low light: dark, warm, quiet, and confident. Content is the only bright thing on screen; chrome recedes. Nothing decorative competes with artwork.

## 2. Art direction
- **Register:** cinematic premium dark. Restrained, editorial, adult. Not neon, not glassy-playful, not "AI purple gradient".
- **Emotional target:** the half-second of hush before a projector starts.
- **Rule of one accent:** exactly one saturated colour in the entire product — a warm amber-red. It marks the primary action, the active tab, and playback progress. Nothing else.
- **No pure black, no pure white.** Backgrounds are warm near-black (a whisper of orange in the hue). Type is warm ivory, never #FFF.
- Reject: rounded-bubbly cards, drop-shadow stacking, multi-colour category chips, gradient text, glow borders on everything.

## 3. Colour system (semantic tokens only, oklch, never hardcoded in components)
- `background` — warm near-black `oklch(0.11 0.006 60)`
- `foreground` — warm ivory `oklch(0.95 0.014 85)`
- `surface` `oklch(0.15 0.008 60)` / `surface-raised` `oklch(0.19 0.01 60)` — cards, list containers, search field
- `primary` amber-red `oklch(0.58 0.196 27)` with ivory `primary-foreground`
- `secondary` `oklch(0.22 0.012 60)` — inert tracks, ghost buttons
- `muted-foreground` `oklch(0.68 0.014 75)` — all metadata, all secondary copy
- `border` `oklch(0.26 0.01 60)` — hairlines only, 1px, never 2px except selected avatar rings
- `gold` `oklch(0.82 0.11 78)` — reserved solely for star ratings
- `ember` `oklch(0.68 0.17 45)` — reserved for charts/heat, unused in chrome

Three composite tokens carry the whole cinematic feel:
- `--gradient-hero`: bottom-up scrim, opaque background at 4%, 82% background at 34%, transparent by 82% — so key art dissolves into the page instead of ending at an edge.
- `--gradient-poster`: shorter bottom-up scrim on posters, transparent by 62%.
- `--shadow-cinematic`: `0 24px 60px -20px black/0.8` — a single deep, soft, low-spread shadow; posters float, they do not glow.

## 4. Typography
- **Display:** Archivo 600–800, uppercase, letter-spacing `0.06em`, line-height `0.95`. Used for every page H1, hero title, and section headings. Tight, stacked, poster-like.
- **Wordmark:** Archivo 600, uppercase, letter-spacing `0.24em` — "Cine" in ivory, "Nova" in amber-red. Never italic, never a logo mark.
- **Body:** DM Sans 400/500/700, sentence case, antialiased.
- **Metadata line:** 11–12px, muted, separated by middot ` · ` — year · runtime · quality · rating chip.
- **Eyebrow label:** 11px, 700, uppercase, letter-spacing `0.28em`, amber-red — used only for "CINENOVA ORIGINAL".
- Scale discipline: page H1 24px mobile → 40px desktop; hero H1 36px → 72px; body 14px; captions 11–12px.

## 5. Geometry & spacing
- Base radius `0.5rem`; posters and cards use `rounded-md`, avatars and icon buttons are perfect circles, chips are pills.
- Page gutters `px-4` mobile → `px-8` desktop, vertical rhythm `py-6`.
- Rows spaced `mt-8`; horizontal card gap `12px`.
- Poster aspect ratio strictly **2:3**; stills and continue-watching cards strictly **16:9**.
- Lists are single bordered containers with `divide-y` hairlines — never a stack of separated cards.

## 6. Navigation architecture
Two navs from one source of truth: Home, Search, My List, Downloads, Profile.
- **Desktop/tablet:** fixed top bar, 64px, wordmark left, four text links, right cluster of a search icon and a circular initial avatar. Inactive links muted, active link ivory (exact matching for Home).
- **Mobile:** fixed bottom tab bar, five items, 20px icon over a 10px label, active tab amber-red; body carries `pb-20` so content never hides under it.
- **Header duality:** on Home and Title detail the header is transparent over key art (`background/95 → transparent` top-down gradient, no border, content starts at y=0 so art bleeds behind it). Everywhere else it is solid `background/90` with `backdrop-blur-md` and a bottom hairline, and content is pushed down.
- **TV/10-foot variant:** the same five destinations as a vertical left rail, focus state = amber-red left indicator + ivory label, and every control enlarged for remote distance.

## 7. Screen-by-screen specification

**Profile gate ("Who's watching?")** — no shell, no nav. Centred column, max 2xl. Wordmark, then uppercase display H1 "Who's watching?". Grid of avatars, 2-up mobile / 4-up up. Each avatar: 80→96px circle, 2px border, 24px initial, background a per-profile dark tinted hue. Selected = amber-red border; hover = 60% amber. Name below in muted with a small lock glyph for PIN profiles and a bordered `KIDS` micro-badge. A dashed-border "Add Profile" tile closes the grid. Footer note explains kid rating limits and PIN-before-playback. Choosing a profile persists and routes to Home.

**Home** — full-bleed hero: 62vh mobile (min 420px) / 78vh desktop key art, hero scrim, content bottom-left. Order: amber eyebrow → giant uppercase title → tagline → metadata row with bordered rating chip → action cluster. Actions: solid amber **Play** with filled play glyph, translucent bordered **My List** (label swaps to "In My List" when saved), ghost bordered **More Info**. Then rails: **Continue Watching** first as 16:9 stills, 224px mobile / 288px desktop, centre circular translucent play badge, 3px amber progress bar pinned to the card's bottom edge, name plus "S1:E4" or "38 min left" beneath. Then curated 2:3 poster rails, 112px mobile / 160px desktop, year as caption. Every rail header is a small semibold heading followed by a chevron affordance. Rails scroll horizontally with hidden scrollbars. Page closes with a hairline footer stating that titles are licensed and that playback, downloads, and territories are governed by rights windows.

**Search** — display H1 + one line of intent copy. Search field: bordered `surface` row, magnifier glyph, transparent borderless input, clear × appearing only when populated. Below, a single horizontally scrollable filter strip led by a sliders glyph: All / Movies / Series, a vertical hairline divider, then genre pills. Pills are muted-outline by default and fully filled amber when active, with `aria-pressed`. A muted result line reads `Results for "…" · N titles`, or `Top results` when idle. Results are a 2:3 poster grid, 3-up mobile / 4-up sm / 6-up lg, captioned `year · Movie|Series`. Empty state is a bordered panel: bold "No titles match that search" plus guidance that spelling, genre browsing, or territory availability may be the cause.

**Title detail** — key art hero at 52vh / 70vh with scrim and a floating circular translucent back button top-left. Hero holds optional amber "CINENOVA ORIGINAL" eyebrow, uppercase title, metadata row, and a gold star rating. Below: synopsis at 90% ivory, max 2xl. Action row: amber Play, My List toggle, Download, Share. **Download is rights-aware** — when permitted it is an active bordered control; when not, it renders as a dimmed non-interactive "Download unavailable". Then an underline tab bar (Overview / Episodes / More Like This) with a 2px amber underline on the active tab, defaulting to Episodes for series. Overview is a definition-list grid, 2-up mobile / 4-up desktop, label muted 12px above ivory 14px value: Director, Cast, Audio, Subtitles, Genres, Availability. Episodes is a hairline-divided list: 96×56 still, "1. Into the Abyss", one-line truncated synopsis, runtime, circular outlined play button. More Like This is the same poster grid as Search. Unknown or unlicensed IDs render a dedicated "Title unavailable" state explaining catalogue or territory absence, with a route home.

**Player** — chromeless, no app shell. Full-viewport frame, top-down gradient so both control zones stay legible. Top bar: circular back, title plus "S1:E1 · Into the Abyss" or quality, cast glyph right. Subtitles render as a centred, max-width, blurred translucent caption block floating above the controls, and disappear entirely when set to Off. Bottom stack, three tiers: (1) elapsed / seek / total — the seek track is a 1px pill filled amber to the playhead and `secondary` beyond it; (2) centred transport — back-10, a 56px circular translucent outlined play/pause, forward-10, plus next-episode for series; (3) secondary controls — Subtitles, current audio track, current quality, and fullscreen pushed right on desktop. Each opens a 208px popover anchored bottom-right above the controls: `popover/95` with blur, hairline-separated capitalised header, option rows that turn amber with a ✓ when selected, and close on choose. Failure state is "Playback unavailable" explaining territory or plan entitlement.

**My List** — display H1, then a hairline-divided list: 44×64 poster, name, `runtime · year · quality`, and a trash icon that turns amber on hover with a descriptive aria-label. Empty state panel invites browsing with an amber CTA. Beneath, a "Continue Watching" horizontal strip of 16:9 stills with amber progress bars and "24 min left" captions.

**Downloads** — display H1. First a bordered `surface` card for **Smart Downloads** with a real switch (`role="switch"`, 44×24 pill, amber when on, ivory knob sliding 2px→22px) and a Wi-Fi glyph subtitle reading "On · Wi-Fi only". Then a hairline-divided list per download: poster thumb, name, `runtime · quality`, a 1px rounded progress track, and a status line — `1.2 GB · 64% downloaded`, `Completed · expires in 6 days`, or an expired label. Progress is amber while active and muted-grey once expired. Trailing 36px circular outlined status affordance: pause while downloading, amber alert when expired, check when complete. A footer row states total titles and storage used on the left, and on the right that downloads require a valid entitlement and expire per rights window.

## 8. Interaction & motion
- Poster and still hover: `scale(1.04)` over 500ms, ease-out. That is the signature motion — used nowhere else at that duration.
- All colour transitions 150–200ms. Amber CTAs dim via opacity on hover, never change hue.
- Focus is always visible using the amber ring token; TV focus is a scale plus ring, never a colour-only change.
- No parallax, no autoplaying carousels, no entrance animations on scroll. The catalogue is the spectacle.

## 9. Accessibility & semantics
Single H1 per screen. Every image carries descriptive alt naming the title and the asset type ("… poster artwork", "… key art", "… still"). Icon-only controls carry aria-labels; toggles use `role="switch"` + `aria-checked`; filter pills use `aria-pressed`; the seek input has an sr-only "Seek" label. All body and metadata text clears 4.5:1 against its surface. Off-screen artwork is lazy-loaded with explicit width/height to prevent layout shift.

## 10. Rights-aware UX law (non-negotiable)
Default-deny. Any action tied to an entitlement — playback, download, territory, plan — renders in one of three explicit states: allowed, disabled with a plain-language reason, or an unavailable page that names the cause (not licensed in your territory, not on your plan, rights window closed). The UI never shows a hopeful control that fails on click, and never exposes provider or upstream media URLs.
