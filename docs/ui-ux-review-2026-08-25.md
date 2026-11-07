# revault.nl — UI/UX review (agency-agents)

Three personas from `agency-agents/design/` reviewed the site on 2026-08-25. Browser extension was not connected, so all findings are from source + rendered HTML.



---

# 1. UI Finish-Gate Reviewer

# UI Finish Gate — revault.nl (home, services, pricing, how-it-works, contact)

**Review method note.** The Chrome extension refused to connect on two attempts (`Browser extension is not connected`), so no screenshots at 1440/390 were taken. Every finding below is grounded in source (file:line), rendered HTML pulled with `curl` from `http://localhost:3001` (all five routes return 200 after the `as-needed` locale redirect: `/`, `/wallet-herstel`, `/tarieven`, `/werkwijze`, `/contact`), and layout arithmetic from the theme (`spacing: 6`, Container `lg` = 1200px minus 32px padding each side = 1136px content width). Items I could not verify without a viewport are marked **verify**.

## Product lens

The user is a private individual (or a notary/executor acting for one) who has lost access to a crypto wallet worth real money, is anxious, and has likely already met scam "recovery" offers. Their job on this site is a single decision: *is this outfit legitimate enough to describe my situation to, and will they take my case?* The first-read object is therefore **trust evidence plus the intake**, not the service catalogue. Highest-frequency workflow: land (often on a wallet/SEO page), scan for the no-cure-no-pay / non-custodial terms and for a real company behind the site, then submit the free assessment. Rare but high-risk: the contact form (never asking for secrets, clear next steps). Existing constraints: Next.js App Router, MUI with CSS-variable colour schemes (light/dark), next-intl NL/EN, self-hosted Plus Jakarta Sans + Outfit, one amber accent (`src/theme/theme.ts:6-8` states the brand intent: "Trust over flash").

## Design contract

**User + job:** Locked-out wallet owner (or their notary) decides whether to request a free assessment.
**First-read object:** The promise pair *no cure no pay + non-custodial*, backed by a verifiable legal entity.
**Primary action:** "Start een gratis beoordeling" → intake form.
**Density decision:** Spacious is right for a stressed reader, but every screen must earn its scroll; repeated blocks are filler here.
**Hierarchy:** headline → the two promises → the single CTA → what happens next (process) → proof (company identity, security practice).
**Interaction model:** Long-form marketing pages + one form. No dashboard, no galleries.
**Responsive priority:** At 390px the CTA must stay reachable on every page; the five-step process must keep its order; trust strip must stay legible.
**References (pattern → lesson):** Wallet Recovery Services (walletrecoveryservices.com) — fee percentage stated on the front page with the "we never take custody" line next to it → put the number and the custody rule in the same first read. Ledger's "Recovery"/support pages — the "we will never ask for your 24 words" warning is the most prominent element → the secret-warning is already on the intake, keep it. Trezor support flow — one choice ("what happened?") before anything else → the six service cards should map to the intake's "Wat is het probleem?" options. Dutch notary/legal sites (e.g. any KNB member site) — KvK number, address and a named person in the footer → this is the trust artefact a Dutch visitor looks for. Stripe pricing page — one plan visually primary, the "custom" option demoted → apply to the 20% vs maatwerk pair.
**Forbidden defaults:** outlined "badge" chip above the hero; equal-weight card grids where one card is the answer; trust strips duplicated on every page; placeholder legal text; chips used as primary navigation.
**Finish evidence required:** 1440 and 390 screenshots of all five pages in light and dark; contact form in idle / invalid-submit / loading / error / success; keyboard focus pass; contrast check on accent text.

## Decision: HOLD

## Evidence

### Critical

1. **The company is not identifiable — placeholder legal text ships.** `messages/nl.json` `footer.legal` = "Gevestigd in Nederland · KvK-nummer volgt", rendered at `src/components/Footer.tsx:71-73`. No address, no email, no phone anywhere on the five pages. `contact.form.genericError` tells the user to "mail ons rechtstreeks" but no address exists to mail; the aside at `src/app/[locale]/contact/ContactClient.tsx:105-111` says "Liever eerst bellen?" and then offers no number. For a site whose entire pitch is "we are not the scammers", this is the finding that breaks the product lens.

2. **Primary accent fails contrast in light mode.** `#B7791F` on `#F7F6F2` computes to ~3.4:1; white on `#B7791F` ~3.7:1. That colour is used for: all overline eyebrows and step numbers at 0.72rem (`src/theme/theme.ts:169,301`, `src/components/Steps.tsx:14`), text-variant buttons like "Lees de volledige werkwijze →" (`theme.ts:243-246`, `src/app/[locale]/page.tsx:75,93`), and the contained primary CTA label at 0.95rem/600 (`theme.ts:224-226`). The main call-to-action on a trust product is below AA. Dark mode (`#E2B15A` on `#0C0F14`) is fine.

3. **Five-step process renders as 4 + 1 orphan at desktop.** `src/components/Steps.tsx:11` uses `repeat(auto-fit, minmax(220px, 1fr))` with `gap: 3` (18px). At the `lg` container (1136px) five columns need 5×220 + 4×18 = 1172px > 1136, so the grid drops to four columns and step 05 "Overdracht" — the non-custodial handover that is the whole point — sits alone on a second row. Same on `/werkwijze` (`src/app/[locale]/how-it-works/page.tsx:30`). At 900–1199px it becomes 3 + 2. **verify** with a 1440 screenshot; the arithmetic is deterministic.

4. **Contact form can silently do nothing on submit.** `ContactClient.tsx:27` returns early when wallet type / issue type / consent are empty, with no error state set. MUI `TextField select required` does not reliably trigger native validation on the hidden input, so a user who skipped the two dropdowns presses "Beoordeling aanvragen" and gets no feedback. There are no field-level error messages anywhere in the form (`ContactClient.tsx:75-99`). For the one high-risk workflow on the site, the invalid state must be designed. **verify** by submitting with only name/email/description filled.

5. **Primary action is hidden on mobile on every inner page.** `src/components/Header.tsx:37` hides the whole nav cluster, including the "Gratis beoordeling" button, below `lg` (1200px); only the hamburger (`:52`) remains. On `/tarieven` and `/werkwijze` at 390px the CTA is reachable only by opening the drawer or scrolling to the CtaBand at the bottom. A tablet at 1024px also gets the hamburger.

### Significant

6. **Trust promises repeated four times in the first two viewports of home.** Hero checklist (`page.tsx:47-53`: no cure no pay, non-custodial, on location/remote) → `TrustStrip` directly beneath (`page.tsx:62`, `src/components/TrustStrip.tsx:8`: the same three plus "contract vooraf") → "Waarom Revault" (`page.tsx:79-88`: no cure no pay again, direct contact) → footer blurb. The strip is then repeated identically under the hero on services, pricing and how-it-works (`services/page.tsx:31`, `pricing/page.tsx:27`, `how-it-works/page.tsx:28`). This is the interchangeable "feature strip under hero" pattern; the copy is product-specific, the placement is not.

7. **Pricing gives the answer and the exception equal weight.** `src/app/[locale]/pricing/page.tsx:29-36` renders "20% van de herstelde waarde" and "Maatwerktarief" as two identical cards, both `variant="h2"`. The custom card's body ends with "Plan een gesprek." but contains no link; the page's only CTA is the CtaBand at the bottom. The extra-costs disclosure — the one sentence a sceptical reader is hunting for — is demoted to `body2` `text.secondary` at `:38`.

8. **Wallet landing pages are exposed as chips.** `src/app/[locale]/services/page.tsx:40-44` renders the eight wallet pages (Ledger, Trezor, MetaMask…) as outlined `Chip`s: 0.78rem text (`theme.ts:282`), 32px tall, no description. These are the highest-intent entries on the site ("my Ledger is broken") and get the lowest-affordance control on the page.

9. **Card radius is not a system.** `theme.ts:129` defines `radii.card = 16`, used by `MuiCard` (`:258`). But `Steps.tsx:13` uses `sx borderRadius: 2.5` (= 2.5 × shape 12 = 30px), `pricing/page.tsx:31` uses `borderRadius: 3` (= 36px), the contact aside uses `"20px"` (`ContactClient.tsx:105`). Four panel radii on adjacent screens; the `radii` export is unused outside the theme.

10. **Hero badge chip is a generated default.** `page.tsx:44` places an outlined `Chip` "Non-custodial wallet herstel" above the h1 — the SaaS "pill above headline" pattern. Every other page uses the `overline` eyebrow (`PageHero.tsx:10`); the home page breaks its own convention for decoration.

11. **Check marks are drawn two different ways within 200px.** Hero points use a text `"✓ "` via `::before` (`page.tsx:49`); the TrustStrip right below uses `CheckCircleOutline` (`TrustStrip.tsx:2,15`).

12. **Service cards do not connect to the intake vocabulary.** Six service slugs (`src/lib/services.ts:5-12`) vs seven `issueTypes` in the form (`ContactClient.tsx:10`). The cards (`ServiceCard.tsx`) show name + one line + arrow and give no hint of "what you need to have" even though the copy exists (`services.<slug>.need`). The card grid is the generic part; the domain content that would make it specific is one level down.

### Minor / optional

13. `CtaBand.tsx:9` uses `--app-gray-900` as background; in dark mode gray-900 is `#F4F6F9`, so the band flips to near-white. Plausibly intentional inversion — confirm it is, and check the `opacity: 0.8` body (`:16`) on both.
14. Optional labels are inconsistent: "Telefoon (optioneel)" and "Geschatte waarde (optioneel)" vs "Walletsoftware of apparaat" (also optional, unmarked) — `ContactClient.tsx:78-83`.
15. Nav says "Wallet herstel", the page h1 says "Wallet hersteldiensten", footer heading says "Diensten" (`Header.tsx:21`, `servicesPage.title`, `footer.servicesHeading`).
16. `/werkwijze` is the home process section plus one security grid; it adds no timing per step. The only time promise on the site ("binnen twee werkdagen") lives on the contact page.
17. `body { overflowX: hidden }` (`theme.ts:194`) will mask any horizontal overflow at 390px rather than surface it; run the mobile pass with it temporarily removed.
18. TrustStrip at 390px is a 2×2 grid (`TrustStrip.tsx:12`) with ~166px columns holding body copy — **verify** for cramped wrapping.

## Required before PASS

1. **Replace the legal placeholder with a real entity.** Put KvK number, registered address and a direct email (and phone if calls are offered) in `Footer.tsx:67-74` and in the contact aside (`ContactClient.tsx:105-111`); make `genericError`'s "mail ons rechtstreeks" a working `mailto:`. Verify: footer and `/contact` at 390 and 1440, both locales.
2. **Fix light-mode accent contrast.** Darken `LIGHT.accent` (`theme.ts:34`) to ≥ 4.5:1 on `#F7F6F2` with white text (roughly `#8F5A10`–`#96600F` territory), or stop using the accent for small text: give overlines and text buttons `--app-text-secondary`/primary and keep amber for icons and the contained button only. Verify with a contrast checker on: hero CTA, "Lees de volledige werkwijze →", step numbers, section eyebrows.
3. **Make the five steps hold one row at desktop.** In `Steps.tsx:11` use `gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(5, 1fr)" }` (or lower `minmax` to 200px and reduce gap), and reduce card padding at `lg` if needed. Verify at 1440, 1200, 1024, 390 that 05 "Overdracht" is never alone.
4. **Design the invalid state of the intake.** In `ContactClient.tsx:25-27` set per-field `error`/`helperText` on wallet type, issue type and consent instead of returning silently; move the error `Alert` (`:72`) or add `aria-live` so screen readers hear it; add `noValidate` and own the validation or verify native validation actually fires for the MUI selects. Verify: submit empty, submit with dropdowns empty, network failure, success — at 390 and 1440.
5. **Keep the CTA visible on mobile and tablet.** In `Header.tsx:37-54` show a `size="small"` contained "Gratis beoordeling" next to the hamburger below `lg`, or drop the breakpoint to `md` for the full nav. Verify on `/tarieven` at 390 that the CTA is in the first viewport without opening the drawer.
6. **Deduplicate the trust promises.** Keep the hero checklist on home and remove `TrustStrip` from home (`page.tsx:62`); on the three inner pages either keep the strip or the hero eyebrow, not a strip that restates the hero. Fold "no cure no pay" out of "Waarom Revault" (`page.tsx:81`) since it is already stated twice above. Verify: no promise appears more than twice above the fold + first section on any page.
7. **Give pricing a hierarchy and an action.** In `pricing/page.tsx:29-38` make "20% van de herstelde waarde" the primary panel (accent border, h1-scale number), render "Maatwerktarief" as a secondary panel with a real `LinkButton` to `/contact`, and promote the extra-cost note to body1 inside or directly beneath the primary panel. Verify at 1440 and 390 that the number, the custody rule and a CTA are in the first viewport.
8. **Promote wallet pages from chips to entries.** In `services/page.tsx:40-44` render the eight wallets as a compact list/grid of link rows (name + one line from `wallets.<slug>`), ≥ 44px tall. Verify touch targets at 390.
9. **Unify radii.** Use `radii.card` (16) from `theme.ts:129` in `Steps.tsx:13`, `pricing/page.tsx:31`, and `ContactClient.tsx:105`; reserve `radii.panel` (24) for one hero-scale surface if any. Verify visually on home (Steps next to ServiceCards).
10. **Drop the hero badge chip** (`page.tsx:44`) in favour of the same `overline` eyebrow used by `PageHero`, and use one check-mark treatment (icon or glyph) in `page.tsx:49` and `TrustStrip.tsx:15`.

## Keep

- The theme rationale and palette discipline: one amber accent, warm graphite/off-white surfaces, no gradients, no glass (`theme.ts:6-8`, the `MuiCard` and `MuiButton` overrides). Dark mode accent contrast is correct.
- The hero headline and subtitle copy ("Weer toegang tot de wallet die van u is." / the 2013 wallet.dat example) — specific to the product and honest about failure; do not rewrite.
- The intake's secret-free design: the warning `Alert` at `ContactClient.tsx:71`, the honeypot at `:74`, and the success message that tells the user *not* to reinstall or reset (`contact.success.body`). This is the most product-specific screen on the site.
- The footer "no scam recovery" disclaimer (`footer.noScamRecovery`) — a real differentiator; consider surfacing it on the home FAQ as well.
- Global `:focus-visible` outline, `SkipLink`, `prefers-reduced-motion` handling (`theme.ts:178-201`), self-hosted fonts with `display: swap` (`layout.tsx:16-27`).
- Section rhythm (`Section.tsx`: eyebrow → h2 → lede, 720px max) and the two-tone `surface` alternation — consistent and calm.
- Process step copy and the ordering intake → verification → agreement → recovery → handover; the sequence itself is the trust argument.

## PASS criteria

- On every page at 390 and 1440: the promise pair (no cure no pay, non-custodial) and one "Gratis beoordeling" action are in the first viewport, and the same promise is not restated in the next block.
- A real legal entity (KvK, address, direct email) is visible in the footer and on `/contact`; no "volgt" placeholder remains.
- All accent-coloured text and the contained CTA label meet 4.5:1 in light mode.
- Steps render 5-in-a-row at ≥ 1200px and stack in order at 390px; screenshots attached.
- Contact form has verified idle / invalid / loading / error / success states, with visible field errors and no silent submit.
- Wallet entries and every interactive element have ≥ 44px touch targets on mobile.
- Panels share one radius token; no chip badge above the hero.


---

# 2. UI Designer (design-system & a11y audit)

I have everything needed; here is the audit.

# Revault UI Audit — code-level (Next.js 15 + MUI 6)

Reviewed: `src/theme/theme.ts`, `src/theme/ThemeRegistry.tsx`, all of `src/components/*.tsx`, `src/app/[locale]/**`. Contrast ratios below are computed (WCAG 2.x relative luminance), not estimated.

## Contrast table (computed)

| Pair | Light | Dark | AA text (4.5) | AA large / UI (3.0) |
|---|---|---|---|---|
| text.primary on bg | 17.75 | 17.73 | pass | pass |
| text.secondary on bg | 7.36 | 10.47 | pass | pass |
| text.secondary on surface (`tone="surface"`) | 6.80 | 9.72 | pass | pass |
| textMuted / gray500 on bg | 6.41 | 7.27 | pass | pass |
| **accent on bg** (overlines, text buttons, blog links, ripple) | **3.37** | 9.75 | **FAIL light** | pass |
| **accent on surface** | **3.11** | 9.05 | **FAIL light** | pass |
| **onAccent on accent** (contained buttons, selected locale toggle) | **3.64** (white on #B7791F) | 9.75 | **FAIL light** | pass |
| onAccent on accentHover | 4.99 | 11.78 | pass | pass |
| accent on ink (CtaBand button, light) | 5.27 | — | pass | pass |
| **accent on CtaBand bg in dark** (#E2B15A on #F4F6F9) | — | **1.82** | — | **FAIL (focus ring / button boundary)** |
| border (#DDD9CE / #2B3342) on bg | 1.30 | 1.51 | — | **FAIL for UI boundaries** |
| gray400 on bg | 5.34 | 4.17 | pass / pass | — |

---

## Critical

**C1. Primary contained button text fails AA in light mode — `src/theme/theme.ts:139`, `:224-226`**
White (#FFFFFF) on accent #B7791F = **3.64:1** at 0.95–1rem/600 (not "large text"). This is every primary CTA (hero, header, CtaBand, contact submit, 404) plus the selected `LanguageSwitcher` toggle (`LanguageSwitcher.tsx:43`, at 0.72rem it is worse).
Fix (pick one, apply to both `LIGHT.onAccent` and `primary.contrastText`):
- `onAccent: "#0C0F14"` (ink on #B7791F = **5.27:1**; hover ink on #9A6417 = 3.85 — so also lighten hover to e.g. `#C9862A` or keep hover bg and accept it as a transient state), or
- darken `LIGHT.accent` to `#8F5E17` (white on it = **5.55:1**; as text on bg = 5.14, on surface = 4.74 — this also fixes C2) and set `accentHover: "#7A4F12"`.
Recommended: the second option — one token change fixes both the button and every accent-as-text usage.

**C2. Accent used as text in light mode fails AA — `theme.ts:34`, `:169/:301` (overline), `:243-244` (text buttons), `blog/[slug]/page.tsx:49` (`& a`), `Footer.tsx:7` (hover)**
#B7791F on #F7F6F2 = **3.37:1**, on surface = **3.11:1**. Overlines are 0.72rem (11.5px) uppercase — the smallest text on the site is the lowest-contrast. Text buttons ("Lees meer →", "Alle vragen →") and in-article links also fail.
Fix: as in C1, move light accent to `#8F5E17` (5.14 / 4.74). If you want to keep the warmer gold for non-text (logo mark, icons, focus ring), split the token: `--app-accent` (decorative, #B7791F) vs `--app-accent-text` (#8F5E17) and point `overline`, `MuiButton.text`, blog `& a`, footer hover at the text one.

**C3. Buttons have no visible keyboard focus indicator — `theme.ts:201` vs MUI ButtonBase**
The global `":focus-visible": { outline: "2px solid var(--app-accent)" }` is emitted by CssBaseline with `prepend: true` (`ThemeRegistry.tsx:13`), and MUI's `ButtonBase` root sets `outline: 0` at equal specificity later in the cascade, so it wins. With `disableElevation: true` (`theme.ts:211`) the contained button's `.Mui-focusVisible` box-shadow is also removed. The only remaining cue is the keyboard ripple pulsate, which is an animation and is killed by your reduced-motion rule (`theme.ts:178-185`). Net: `Button`, `IconButton`, `ToggleButton`, `AccordionSummary`, clickable `Chip` show no focus ring for keyboard users.
Fix in `theme.ts` components:
```ts
MuiButtonBase: {
  defaultProps: { disableRipple: false },
  styleOverrides: {
    root: {
      "&.Mui-focusVisible": { outline: "2px solid var(--app-accent)", outlineOffset: 2 },
    },
  },
},
```
(`Mui-focusVisible` is a class, so it beats `outline: 0` by source order. Keep the global `:focus-visible` for plain links.)

---

## High

**H1. Focus ring and button boundary invisible on CtaBand in dark mode — `CtaBand.tsx:9`**
`backgroundColor: var(--app-gray-900)` inverts to #F4F6F9 in dark mode (the band goes light), and the accent focus ring / button fill (#E2B15A) on that band is **1.82:1** (< 3:1, WCAG 1.4.11). In light mode the band is ink and the ring is 5.27 (fine).
Fix: give the band its own tokens instead of reusing gray-900: `--app-cta-bg: #0C0F14` in both schemes (or `#1A202A` in dark) and `--app-cta-fg: #F7F6F2`. Keeping the band dark in both modes also preserves the "vault" brand moment; currently dark mode users lose it.

**H2. Touch targets under 44px — `ThemeSwitcher.tsx:27`, `LanguageSwitcher.tsx:36-40`, `Footer.tsx:7,32,43,54`, `services/page.tsx:42`**
- ThemeSwitcher is hard-set to `28x28`.
- Language toggles: `px: 1.2, py: 0.3` with `spacing: 6` = 7.2px / 1.8px padding, 0.72rem text → roughly 22px tall.
- Footer links: 0.92rem text with `gap: 1` (6px) → ~25px tap rows, 6px apart.
- Wallet chips: MUI default 32px.
Fix: ThemeSwitcher `width/height: 40` (icon 20) with a `44` minimum hit area via `"&::before"` inset, or just `size="medium"`. Language toggle: `minHeight: 36, px: 1.5` plus the group gets `my: 0.5` so the 44px box comes from padding. Footer links: `py: 0.75, display: "inline-block"` and `gap: 0.5`. Chips: `sx={{ height: 40, px: 1 }}`.

**H3. Outlined controls' boundaries fail 3:1 — `theme.ts:236` (outlined button border #DDD9CE on bg = 1.30), `theme.ts:283` (outlined chip), `Faq.tsx:23` (accordion rules), `ThemeSwitcher.tsx:27` (`borderColor: "divider"`)**
For the outlined secondary CTA the label is 17:1 so this is arguably tolerable, but the clickable wallet chips and the ThemeSwitcher rely on their border to read as controls. Dark mode is 1.51.
Fix: add a `borderStrong` token: light `#A9A395` (≈2.1 on bg — still soft) or `#8E897C` (≈3.1); dark `#4C5668` (≈3.0 on #0C0F14). Use it for `outlinedPrimary`, `MuiChip.outlined`, and the ThemeSwitcher; keep `border`/`borderSoft` for decorative dividers.

**H4. Card radii are inconsistent across "card" surfaces**
- `MuiCard` → `radii.card` = 16 (`theme.ts:258`)
- `Steps.tsx:13` → `borderRadius: 2.5` → 2.5 × `shape.borderRadius` 12 = **30px**
- `pricing/page.tsx:31` → `borderRadius: 3` → **36px**
- `ContactClient.tsx:105` → `"20px"`
- `TextField`/`Alert` → 12, `Button` → pill
Four different radii for equivalent bordered panels. Fix: use `radii.card` everywhere (`borderRadius: \`${radii.card}px\``) or, better, render Steps/pricing/contact-aside with `<Card>` so they inherit border, bg, and hover treatment. Note the `sx` `borderRadius` multiplier trap: with `shape.borderRadius: 12`, `borderRadius: 3` means 36px, not 24px — this is likely unintentional.

---

## Medium

**M1. Two competing conventions for secondary text — `theme.ts:165` vs components**
`body1` is themed to `text.secondary` by default (so a bare `<Typography>` is grey), while `body2` is not, so every `body2` usage manually adds `color: "text.secondary"` (`Footer.tsx:22,25,68,71`, `ServiceCard.tsx:13`, `Steps.tsx:20`, `TrustStrip.tsx:18`, `blog/page.tsx:35,37`, etc.). Meanwhile `page.tsx:50` overrides body1 back to `text.primary`. This makes it impossible to reason about colour from the markup.
Fix: keep variant colours out of the typography scale (remove `color` from `body1`/`subtitle1`), and express intent at the call site or via two small wrappers (`<Lede>`, `<Muted>`). Alternatively theme `body2` to `text.secondary` too and delete the per-instance overrides — but pick one.

**M2. Spacing base of 6 fights the 4/8 grid — `theme.ts:172`**
`spacing: 6` yields 6/12/18/21/24/30/54/78 values (`p: 3.5` = 21px, `gap: 3` = 18px, `py: 9` = 54px) alongside hardcoded 20/32px container gutters (`theme.ts:207`), `10px 26px` button padding (`:215`), and `top: 12 / left: 12` (`SkipLink.tsx:11-12`). Optical rhythm is fine, but nothing lands on an 8px grid and fractional multipliers (`1.25`, `1.75`, `2.5`, `3.5`) are used everywhere to compensate.
Fix: `spacing: 8` and normalise multipliers (`p: 3` = 24, `gap: 2/3`, section `py: {xs: 8, md: 12}`); move container gutters and button padding onto the same scale.

**M3. `LanguageSwitcher` accessible names — `LanguageSwitcher.tsx:48`**
`aria-label={l}` announces "nl" / "en". Use the language names (`Nederlands` / `English`) from messages, and add `lang={l}` to each toggle. Also `Tooltip` around the group duplicates the `aria-label` — fine, but the tooltip title becomes the group's `aria-label` too via MUI; ensure they say the same thing (they do).

**M4. Header has no current-page indication — `Header.tsx:39, :67`**
Nav buttons never set `aria-current="page"` or a visual active state. Compare `usePathname()` to `item.href` and pass `aria-current` plus e.g. `color: "var(--app-accent-text)"`/underline.

**M5. Reduced motion only shortens durations; transforms still jump — `theme.ts:178-185, :220, :230, :261`**
The global rule makes transitions ~0ms, so hover `translateY(-1px/-3px)` and active `scale(0.98)` still happen instantly — a snap instead of a glide is arguably worse for motion-sensitive users. Also `scrollBehavior: "smooth"` on `html` (`:187`) is handled, good.
Fix: inside the reduced-motion block also add `".MuiButton-root:hover, .MuiButton-root:active, .MuiCard-root:hover": { transform: "none !important" }`, or gate transforms with `@media (prefers-reduced-motion: no-preference)`.

**M6. Hero "✓" check bullets are decorative text — `page.tsx:50`**
`content: '"✓ "'` in `::before` is read aloud by some screen readers as "check mark". Use `content: '"✓ "' / ""` (alt-text syntax) or a `CheckIcon aria-hidden` like TrustStrip does, so the two check-list patterns also look identical.

**M7. `Faq` question heading level is hard-coded `h3` — `Faq.tsx:29`**
On `/faq` the page has `h1` then `Section` without a title, so questions become `h3` under an `h1` (skipped `h2`). Accept a `headingLevel` prop (`"h2" | "h3"`) and pass `h2` from `faq/page.tsx:29`. Also its font-size `1.08rem`/weight 650 is a bespoke style; map it to `h6` or `h5` from the scale instead.

**M8. Blog article body colour and MDX heading scale — `blog/[slug]/page.tsx:49`**
Body paragraphs and list items are forced to `text.secondary`, so long-form reading content is grey (7.36:1 passes, but for 800-word articles primary ink is more readable). MDX `h2`/`h3` inherit browser defaults unless MUI's CssBaseline resets them — they do *not* get the `heading` font family or the `h2/h3` clamp scale. Provide `components={{ h2: props => <Typography variant="h2" component="h2" {...props}/>, ... }}` to `MDXRemote`.

---

## Low

**L1. Overline size 0.72rem (11.5px) with 0.18em tracking — `theme.ts:169`.** Used as section eyebrow, footer headings, Steps numbers, blog date line. Bump to 0.75–0.8rem; at 11.5px uppercase it strains even at proper contrast.

**L2. `h3` weight 650 / `h4` 650 — `theme.ts:161-162`.** Works only because both fonts are variable; fine, but document it. The scale jumps h1 (40–68px) → h2 (30–44) → h3 (22–28) → h4 20.8 → h5 18.4 → h6 16 → body 17: h6 (16px) is *smaller* than body1 (17px). Set h6 to 1.0625–1.125rem or drop body1 to 1rem.

**L3. Chip font 0.78rem (`theme.ts:282`) vs overline 0.72rem vs button-small 0.875rem vs footer 0.92rem vs body2 0.95rem** — five "small" sizes. Collapse to two (0.8125rem and 0.875rem).

**L4. `Header.tsx:32` toolbar `minHeight 60/68` but `AppBar` is only translucent (`color-mix … 78%`). Text scrolling behind a 78% backdrop can dip under 4.5:1 momentarily; consider 88–92%.

**L5. `ThemeSwitcher.tsx:16` renders a 28px `Skeleton` before mount; `LanguageSwitcher` renders immediately, so the header shifts by nothing but the two controls have different loading behaviour. Reserve the same box for both or render the icon button disabled until mounted.

**L6. `ServiceCard.tsx:16` arrow icon has no `aria-hidden` (MUI icons default to `aria-hidden="true"` — OK) but is `fontSize: 20` while TrustStrip uses 22 and Faq uses default 24. Pick one icon size token (20 inline, 24 standalone).

**L7. `SkipLink.tsx:23-24`** relies on `transform` to hide; under reduced-motion the transition is 0.01ms so it still appears. Good — but it lacks a focus outline of its own because it is a `Box` link (global rule applies — fine) and `zIndex 2000` sits above MUI's Drawer (1200) and Tooltip (1500), which is correct.

**L8. `ContactClient.tsx:96`** submit button `px: 7` (42px) is bespoke; use `size="large"` padding from the theme. `ContactClient.tsx:74` honeypot input uses `aria-hidden` on a focusable element (tabIndex −1 mitigates); fine.

**L9. `not-found.tsx:8`** `py: {xs: 14, md: 20}` (84/120px) doesn't match `PageHero`'s 60/84; reuse `PageHero` for consistency.

---

## What's already good

- Colour-scheme architecture: MUI `cssVariables` + `data-mui-color-scheme` with `InitColorSchemeScript` and `colorScheme: "light dark"` — no flash, no hydration mismatch, `suppressHydrationWarning` correctly scoped.
- Dark palette is genuinely tuned, not inverted: text.secondary 10.47, accent 9.75, muted 7.27 — every dark text pair passes AA comfortably.
- Light text pairs (primary 17.75, secondary 7.36, muted 6.41) all pass; the only failures are the accent, which is a single-token fix.
- `prefers-reduced-motion` block present and global; `scroll-behavior` covered.
- Skip link (`SkipLink.tsx`) with `main#main`, `<footer>`, `<section>`, `<article>`, `<ol>` for steps — semantic landmarks throughout.
- Hover styles gated behind `@media (hover: hover)` so touch devices don't get sticky hover states.
- `MuiButton.root.minHeight: 44` — primary/secondary buttons already meet the 44px target; `sizeSmall` is 38 (used only in the header CTA).
- `Card` has an explicit `&:focus-visible` outline and link-cards (`ServiceCard`, blog cards) are real anchors.
- Self-hosted variable fonts via `next/font/local` with `display: swap` and size-adjusted fallbacks — no CLS, no third-party font requests.
- `textTransform: "none"` on buttons, fluid `clamp()` type for h1–h3, tight negative tracking on display sizes — typographically confident.
- `LinkButton` fixes the MUI/next-intl `href` typing once instead of per call site.
- Component set is small and reused consistently (`PageHero` → `TrustStrip` → `Section` → `CtaBand` on every content page).

---

## Suggested fix order

1. `theme.ts`: light `accent → #8F5E17`, `accentHover → #7A4F12` (fixes C1 + C2 in one change; re-run contrast on `accentMuted`/`accentGlow` alpha values since they derive from the old hex).
2. `theme.ts`: add `MuiButtonBase` `.Mui-focusVisible` outline (C3).
3. `CtaBand.tsx` + theme: dedicated CTA band tokens (H1).
4. Touch targets in `ThemeSwitcher`, `LanguageSwitcher`, `Footer`, wallet chips (H2).
5. `borderStrong` token for outlined controls (H3); unify card radii (H4).
6. Then the Medium list, starting with M1 (typography colour convention) and M5 (reduced-motion transforms).


---

# 3. Persona Walkthrough

# Revault.nl — Persona walkthrough (home → services/tarieven → werkwijze → contact)

*Qualitative simulation based on the page source (`src/app/[locale]/**`, `src/components/**`) and copy in `messages/nl.json`. These are strong hypotheses to validate, not measured behaviour. Assumed device: mobile, `/nl` locale.*

## Site-wide observations that shape every journey

Before the personas: three structural facts dominate all three walkthroughs.

1. **There is no way to reach a human except the form.** No email address, phone number, street address, or KvK number appears anywhere (`grep mailto|tel:|@revault|+31` in `src/` and `messages/` returns nothing). The footer literally says "KvK-nummer volgt" (`messages/nl.json:36`). Yet the copy points to channels that do not exist: the form error says "Probeer het opnieuw of mail ons rechtstreeks" (`contact.form.genericError`, line 553) and the aside says "Liever eerst bellen? Zet het in uw bericht" (`contact.aside.direct`, line 583).
2. **Zero social proof, zero people.** No testimonials, no case count, no founder name or photo, no "since 20xx", no partner notaries, no press. The About page (`src/app/[locale]/about/page.tsx`) is three paragraphs of philosophy with no one behind it. The copy repeatedly says "spreek met de specialist" but never names one.
3. **The copy is excellent at honesty and boundaries** (no scam recovery, no full-seed-loss, "wij zeggen nee") — this is the site's biggest trust asset and it is spread thinly across FAQ answers instead of being used up-front.

---

## Persona 1 — Marijke, 58F, non-technical, stressed

```
Current situation: Bought ~1.5 BTC in 2013 on her late husband's advice, on a laptop with "een
programma met een oranje B". Now sees Bitcoin's price in the news. Laptop still boots, program
asks for a password she has written down wrong somewhere.
Google query:  "bitcoin wallet wachtwoord vergeten hulp"
Arrival:       Google organic, landed on home (/nl)
Seen before:   A Reddit thread (half English), one flashy "crypto recovery expert" site that
               asked for her seed phrase in a chat popup — she closed it, spooked.
Familiarity:   Low | Urgency: Days | Attachment: Anxious
Fears:         Being scammed again, being laughed at, "verkeerd klikken" and losing everything.
Trust triggers: Dutch, a real office, a phone number, a person's name, "gratis".
Contact threshold: Understands what happens next, sees it's free, feels she won't be judged.
```

### Pre-arrival
> "Ik durf niet nog een site te vertrouwen. Die vorige vroeg meteen om mijn twaalf woorden, en ik weet nog dat Ruud altijd zei: nooit aan iemand geven. Ik wil gewoon een Nederlands bedrijf, met een telefoonnummer, dat ik kan bellen."

Relevance contract: within 3 seconds the page must say *we help with forgotten wallet passwords*, *we are Dutch*, *we won't ask for your secret words*.

### Fold 1 — Hero (`page.tsx` hero, `home.hero.*`)
> "‘Weer toegang tot de wallet die van u is.’ Ja! Dat is precies wat ik wil. Bovenaan staat ‘Non-custodial wallet herstel’... geen idee wat dat is. ‘Een vergeten wachtwoord, een herstelzin met een paar verkeerde woorden, een walletbestand uit 2013’ — oh, 2013, dat ben ik. Vinkjes: betaal alleen bij succes, goed. ‘Non-custodial — wij beheren nooit uw tegoeden’ – weer dat woord. ‘Op locatie in Nederland’ — oké, Nederlands. Knop ‘Start een gratis beoordeling’. Gratis. Maar wat is een ‘beoordeling’? Moet ik dan iets opsturen?"

```
ANALYST — Fold 1
Emotional state:  hopeful, slightly lost
Trust delta:      ↑ (Dutch, "2013", "gratis", no secret-asking) / ↓ (jargon "non-custodial" x2 above fold)
LIFT:             Clarity ↓ — "non-custodial" is used as the badge AND a checkmark; means nothing to her.
                  Relevance ↑ — "vergeten wachtwoord" + "2013" hit her situation exactly.
Cialdini active:  none (Reciprocity implicit via "gratis")
Cialdini missing: Social Proof, Liking (no face, no name), Authority (no KvK, no office city)
Fogg:             M: High | A: Med | Prompt: Yes (primary CTA in fold)
CTA reachable:    Yes
Five-second test: What is this? Yes. Is it for me? Yes. What should I do? "Gratis beoordeling" — unclear what she'd be committing to.
```

### Fold 2 — TrustStrip (`TrustStrip.tsx`, `trust.*`)
> "‘No cure, no pay’ — dat ken ik van advocaten. ‘Non-custodial: Wij herstellen de toegang. U opent de wallet en verplaatst de tegoeden zelf.’ Ah — dus IK moet het daarna zelf doen? Dat kan ik niet. Verplaatsen naar waar? ‘Contract vooraf’, ‘NDA’. Het klinkt allemaal erg zakelijk. Ik ben geen bedrijf."

```
ANALYST — Fold 2
Emotional state:  reassured on money, anxious on ability
Trust delta:      ↑ (no cost upfront, contract) / ↓ ("u verplaatst zelf" reads as a burden, not a safety feature)
LIFT:             Anxiety ↑ — the non-custodial promise is framed as her responsibility, not her protection.
Cialdini missing: Liking — nothing says "we sit next to you and help you do it".
```
Note: `services.legacy-wallet.faq.two` ("desgewenst terwijl wij erbij zijn") answers exactly this fear, but is buried on a service subpage.

### Fold 3 — Services grid (`home.services.*`, six `ServiceCard`s)
> "‘Herstel gebeurt op walletniveau, niet op muntniveau.’ ... wat? Zes kaartjes. ‘Wachtwoordherstel’ — dat is de mijne. ‘Verouderde wallets — software uit de beginjaren’ — oh, misschien ook. Welke moet ik kiezen? Kan het allebei zijn? Ik klik maar op Wachtwoordherstel."

```
ANALYST — Fold 3
Emotional state:  curious, mildly confused
LIFT:             Clarity ↓ — lede "walletniveau, niet muntniveau" is an insider distinction. She has to self-diagnose across six categories with overlap.
Distraction ↑ — six equal-weight cards; no "niet zeker? begin hier".
```

### Fold 4 — Service page: Wachtwoordherstel (`services/[slug]/page.tsx`, `services.password-recovery.*`)
> "‘U weet nog een deel — een patroon, een paar woorden, een jaartal.’ Ja, dat klopt. ‘Wat wij kunnen doen: wallet.dat, keystore, Electrum, Ledger/Trezor-passphrase’ — ik herken ‘wallet.dat’ niet, misschien wel? ‘Wat wij van u nodig hebben: het walletbestand of apparaat (pas gedeeld na de overeenkomst)’ — dus ik hoef nu niks op te sturen. Fijn. Het cursieve stukje: ‘Stuur nooit herstelzinnen... per e-mail of via deze website.’ Goed, dat is precies wat de vorige site fout deed. Vraagje: ‘En als ik echt niets meer weet?’ — ‘zelden realistisch’. Hmm. Ik weet wél iets. Ik denk."

```
ANALYST — Fold 4
Emotional state:  reassured
Trust delta:      ↑↑ — "nooit per e-mail" is the strongest trust moment for this persona; contrast with the scam site is explicit.
Cialdini active:  Authority (specific file names), Commitment (she's now self-identified)
Cialdini missing: Social Proof — an anonymised "2013 wallet.dat, wachtwoord uit 14 tekens, 9 dagen" example would convert here.
CTA reachable:    No — only CtaBand at the bottom; the page has no CTA near the "need" list.
```

### Fold 5 — Tarieven (`pricing/page.tsx`, `pricing.*`)
> "‘20% van de herstelde waarde.’ Twintig procent! Dat is... veel? Van 1,5 bitcoin is dat... ik weet niet eens wat dat nu waard is. Maar als ze niks vinden betaal ik niks. En ik heb nu nul. Oké. ‘Pas verschuldigd nadat u de wallet heeft geopend en de tegoeden zelf heeft verplaatst’ — dáár is dat verplaatsen weer. Hoe betaal ik dan? In bitcoin? Via de bank?"

```
ANALYST — Fold 5
Emotional state:  accepting, uncertain
LIFT:             Clarity — "20%" is admirably clear. Missing: how/when/in what currency payment happens, and whether there's a minimum. "Herstelde waarde" is undefined (value at which moment?).
Anxiety ↑ — no worked example turns 20% into a number she can feel.
```

### Fold 6 — Werkwijze (`how-it-works/page.tsx`, `process.*`, `howItWorks.security.*`)
> "Vijf stappen. Intake, gratis. ‘Verificatie... risicogebaseerde KYC/AML-controles’ — dat zijn bankwoorden, ik neem aan dat ik mijn paspoort moet laten zien. Waarom eigenlijk? Oh — omdat ze willen weten dat het echt mijn wallet is. Dat had erbij mogen staan. ‘Overeenkomst’, ‘Herstel op systemen zonder internet’, ‘Overdracht’. Het klinkt netjes. Maar ik zie nergens hoe lang dit duurt, of wie ik dan spreek."

```
ANALYST — Fold 6
Emotional state:  reassured but distant
LIFT:             Clarity ↓ on "KYC/AML" without the plain-language reason ("zodat we zeker weten dat de wallet van u is").
Cialdini missing: Liking/Unity — process is described as a system, not as "Jan belt u binnen twee werkdagen".
```

### Fold 7 — Contact (`contact/ContactClient.tsx`, `contact.*`)
> "‘Vertel ons wat er is gebeurd.’ ‘Binnen twee werkdagen hoort u van een specialist.’ Twee dagen, oké. Gele waarschuwing: vul nooit herstelzinnen in. Goed. Naam, e-mail, telefoon (optioneel)... ‘Geschatte waarde (optioneel)’ — waarom willen ze dat NU al weten? Voordat ze me kennen? Dat voelt alsof ze kijken of ik de moeite waard ben. ‘Type wallet’ — Softwarewallet (desktop / mobiel / browser), Hardware wallet, Exchange-account, Papieren back-up, Weet ik niet zeker. Ik kies ‘Weet ik niet zeker’... nee, het is een programma op de laptop, dus software. ‘Walletsoftware of apparaat: Ledger, Electrum, MetaMask…’ — ik weet de naam niet. Laat ik leeg. ‘Wat is het probleem?’ Vergeten wachtwoord. Beschrijf uw situatie — zes regels, oké. Vinkje: ‘Ik begrijp dat Revault identiteit en eigendom verifieert... en ik ga akkoord met het privacybeleid’ — waar ís dat privacybeleid? Er is geen link. Nou ja. ‘Beoordeling aanvragen.’"

> "Rechts: ‘Wat er nu gebeurt’ — 1, 2, 3. Fijn. ‘Liever eerst bellen? Zet het in uw bericht en we sturen een planningslink.’ Dus ik kan NIET bellen. Ik kan vragen of zij mij willen bellen. Dat is niet hetzelfde. Waar zit dit bedrijf eigenlijk? Geen adres, geen nummer. Onderaan: ‘KvK-nummer volgt’. ... Volgt? Bestaan ze al?"

```
ANALYST — Fold 7
Emotional state:  hesitant → suspicious at the footer
Trust delta:      ↓↓ — "KvK-nummer volgt" + no phone/address/email at the exact moment she must hand over her name and email.
LIFT:             Anxiety ↑↑ (no channel, no legal identity); Clarity ↓ (consent references a privacy policy with no link; "Exchange-account" option contradicts FAQ/blog which say exchange accounts aren't wallets Revault handles)
Fogg:             M: High | A: Med (form is fine, 8 fields) | Prompt: Yes
Technical notes:  - MUI `TextField select required` + `handleSubmit` early-return (`if (!form.walletType || !form.issueType || !form.consent) return;`) can produce a silent no-op with no visible error if browser validation is bypassed; no field-level error rendering exists.
                  - `palette.offWhite` / `palette.accentMuted` are imported statically (`import { palette } from "@/theme/theme"`) for the aside and success alert — these will not respond to dark mode unlike the rest of the site which uses CSS vars.
                  - No confirmation that an email receipt will be sent; the reference number is shown once on screen only.
```

### Verdict — Marijke
```
Confidence score:  5/10 — copy is honest and Dutch, but no one and nothing (KvK, address, phone) stands behind it
Clarity score:     6/10 — understands "password recovery, 20%, free assessment"; does not understand non-custodial, KYC/AML, "walletniveau", what "verplaatsen" requires of her
Relevance score:   8/10 — hero and Wachtwoordherstel page match her exactly
Would I contact:   Maybe — she'd fill in the form, then hesitate at "KvK-nummer volgt" and probably sleep on it. 40% chance she comes back.

Top 3 strengths:  1) "Stuur nooit herstelzinnen... via deze website" (LIFT:Anxiety ↓ — directly contrasts the scam she just left)
                  2) "No cure, no pay" + "20%" stated plainly (LIFT:Clarity)
                  3) "Wat er nu gebeurt" aside on the contact page (Fogg:Ability)
Top 3 weaknesses: 1) No phone, address, person or KvK (Cialdini:Authority absent at point of commitment)
                  2) "Non-custodial" jargon above the fold and "u verplaatst zelf" framed as her job (LIFT:Clarity/Anxiety)
                  3) "Geschatte waarde" asked before the problem (LIFT:Anxiety — reads as qualification, not help)
Moment I almost left:      Footer of contact page — "KvK-nummer volgt"
Moment I was most engaged: Service page "Wat wij van u nodig hebben" + "nooit per e-mail"
```

---

## Persona 2 — Tom, 41M, next-of-kin, executor by default

```
Current situation: Father died 3 months ago. In the study: a Ledger Nano S, a ThinkPad with
Electrum, and a notebook page with 24 English words where two are smudged. Tom is one of three
siblings, is handling the estate, has a verklaring van erfrecht from the notary. Siblings are
nervous about "some website".
Google query:  "crypto wallet erfenis toegang overleden vader"
Arrival:       Google organic → blog post "Een crypto wallet geërfd" (content/blog/nl/crypto-wallet-geerfd-nabestaanden.mdx) → home
Seen before:   The notary's own website (no crypto info), a Belgian recovery firm in English.
Familiarity:   Low-Med (has read the blog post, understands "seed phrase" now) | Urgency: Weeks
Attachment:    Secure but accountable to siblings — needs something he can forward to them and to the notary.
Fears:         Doing something irreversible, a family fight over 20%, tax/legal exposure.
Trust triggers: Notary involvement, a legal entity, a written process, references from professionals.
Contact threshold: Sees the process is compatible with the notary, and can share a page with siblings that makes them say "oké, dit ziet er serieus uit".
```

### Pre-arrival
> "The blog post was genuinely good — it told me to photograph things and not type words into email, and that the exchange accounts are a separate route via the notary. That's the first site that didn't try to sell me something. But my sister will ask: who are these people?"

### Fold 1 — Home hero
> "‘Weer toegang tot de wallet die van u is.’ Well — it's not mine. It's the estate's. Nothing in the hero mentions inheritance. Bullets: pay only on success, non-custodial (I know what that means now), Netherlands or remote. ‘Start een gratis beoordeling’ — before I start anything I need to know whether they'll even talk to an heir."

```
ANALYST — Fold 1
Emotional state:  cautious
LIFT:             Relevance ↓ — hero speaks only to owners ("van u"). Inheritance is the 6th of 6 cards and 11th of 12 FAQs.
Fogg:             M: Med | A: High | Prompt: Yes — but prompt feels wrong-audience.
```

### Fold 3 — Services grid → "Nalatenschap en professionals" card
> "Card title: ‘Nalatenschap en professionals — Toegang tot geërfde wallets voor erfgenamen, executeurs, notarissen en advocaten.’ OK, heirs are on the list, but ‘en professionals’ makes it sound like the page is for the notary, not for me."

### Fold 4 — Inheritance service page (`services.inheritance.*`)
> "‘Als iemand overlijdt en crypto nalaat, is het technische probleem maar de helft van het verhaal.’ Yes. That's the first sentence on this whole site that sounds like it's talking to me. ‘Wat wij kunnen doen: wallets vinden en openen op apparaten van de overledene; gestructureerde overdracht onder toezicht van de notaris.’ Good — the notary can be in the room. ‘Wat wij nodig hebben: verklaring van erfrecht’ — have it. ‘Een contactpersoon bij de notaris’ — have that too. FAQ: ‘Hoe gaan jullie om met meerdere erfgenamen? Tegoeden gaan naar een wallet die de bevoegde vertegenwoordiger aanwijst’ — so I need to have a wallet ready? Who sets that up? Is that in scope?"

> "What I'm missing: is there a *cost* difference for estates? Is the 20% on the estate's value, and does the notary see the contract? And — the Ledger. Dad's PIN is unknown. The 24 words have two smudged ones. Do I need the Ledger page or the seed page or this page? I've now read three pages that partially apply."

```
ANALYST — Fold 4
Emotional state:  engaged
Trust delta:      ↑ (notary supervision, verification-first) 
LIFT:             Value Prop ↑; Clarity ↓ on scope of "handover wallet" and on which service applies when the case is a mix (inheritance + hardware + seed).
Cialdini active:  Authority (notary language), Commitment
Cialdini missing: Social Proof — "we hebben met notariskantoren in X en Y gewerkt" would settle the siblings. Zero references.
CTA reachable:    No — must scroll to CtaBand.
```

### Fold 5 — Tarieven
> "‘20% van de herstelde waarde.’ For an estate that's a real conversation. ‘Wallets met hoge waarde: maatwerktarief, lager percentage’ — what's ‘hoge waarde’? €50k? €500k? If Dad had 3 BTC, is that ‘hoog’? ‘Plan een gesprek’ — with whom? The note about extra costs (travel, data recovery partner) is fair and worded well. But my sister will ask: is 20% market rate? Nothing here helps me defend it to her."

```
ANALYST — Fold 5
LIFT:  Clarity ↓ — "hoge waarde" threshold undefined; no framing vs. alternatives ("een advocaat rekent per uur, wij niet"); no estate-specific note (fee paid by the estate, invoice to the notary, BTW?).
```

### Fold 6 — Werkwijze
> "‘Verificatie... eigendom of bevoegdheid... KYC/AML.’ Fine. ‘Locatie naar keuze: bij de notaris, desgewenst met uw adviseur.’ This is the page I'll forward to the notary. But — no company name beyond ‘Revault’, no legal entity, no KvK. The notary will ask for that in the first email."

### Fold 7 — Contact form
> "‘Type wallet’ — I have three things: a Ledger, an Electrum file, and a paper backup. One dropdown. I'll pick Hardware. ‘Wat is het probleem?’ → ‘Geërfde wallet’. OK. ‘Geschatte waarde’ — I honestly don't know; I'll skip. The description box is where everything goes. There's no field for ‘I'm the executor / I have a verklaring van erfrecht / notary contact’ — I'll type it. Consent: ‘verifieert identiteit en eigendom’ — I'm not the owner; does this apply? Submit. Success screen: ‘Uw referentie is REV-…’ and good advice: don't reset devices. I'd like to have gotten that email, since I have to forward it."

```
ANALYST — Fold 7
Emotional state:  willing, mildly frustrated by form shape
LIFT:             Ability ↓ — single-select walletType doesn't fit an estate (multiple artefacts); no executor/notary fields; consent copy says "eigendom" which technically doesn't apply to heirs (site copy elsewhere says "eigendom of bevoegdheid").
Anxiety:          "Two working days" is fine for him. No downloadable/forwardable summary for siblings or notary.
```

### Verdict — Tom
```
Confidence score:  6/10 — process and notary language are right; legal identity is absent
Clarity score:     7/10 — understands process; unclear which service page applies and what "hoge waarde" means
Relevance score:   6/10 — blog post 9/10, home 4/10, inheritance page 8/10
Would I contact:   Yes, probably — but he'll first email the notary "ken je deze?", and the notary will find no KvK.

Top 3 strengths:  1) Blog post on inheritance (Cialdini:Reciprocity — real advice before any ask)
                  2) "Onder toezicht van de notaris" / "bij de notaris" (Cialdini:Authority via third party)
                  3) Post-submit advice "reset geen apparaten" (LIFT:Anxiety ↓, shows competence)
Top 3 weaknesses: 1) Home hero is owner-only; inheritance buried (LIFT:Relevance)
                  2) Nothing forwardable: no legal entity, no professional references (Cialdini:Authority/Social Proof)
                  3) Form is built for one wallet/one owner; estates are many artefacts + a representative (Fogg:Ability)
Moment I almost left:      Home hero — "wallet die van u is" made him wonder if he was on the wrong site
Moment I was most engaged: First sentence of the inheritance service page
```

---

## Persona 3 — Daan, 33M, technical, comparing providers

```
Current situation: Software engineer. Electrum wallet from 2016, ~0.8 BTC, password was a
long diceware-ish phrase with a personal pattern. Has already run btcrecover for two weekends
on a 3080 without luck. Knows the well-known providers charge ~20%.
Google query:  "wallet recovery service netherlands electrum password"
Arrival:       Google organic → /nl/wallets/electrum
Seen before:   walletrecoveryservices.com (Dave Bitcoin), KeychainX, a couple of r/BitcoinBeginners threads
Familiarity:   High | Urgency: Browsing/weeks | Attachment: Avoidant — wants facts, hates reassurance copy
Fears:         Handing a wallet file to someone who then has the keys; vague method; paying 20% for what
               is "just hashcat with better rules"; a company that doesn't really exist yet.
Trust triggers: Named people, GitHub/PGP, precise method description, hash-only workflow, KvK, clear
               contract terms, ability to talk technically.
Contact threshold: Convinced they know more than he does AND that the key-custody problem is handled.
```

### Fold 1 — /wallets/electrum (`wallets/[slug]/page.tsx`, `wallets.electrum.*`)
> "‘Electrum wallet herstel. Versleutelde Electrum-walletbestanden, seeds in oud formaat en corrupte wallets uit elke versie sinds 2011.’ One sentence. Then the same four trust bullets everyone has, then three generic service cards. That's the whole page? This is an SEO doorway. Nothing about Electrum specifically — old-style seeds vs BIP39, 2FA wallets, the `x1/` keystore format, whether they take a hash instead of the file. Dave's site at least lists what he needs per wallet type. Back to home."

```
ANALYST — Fold 1
Emotional state:  unimpressed
Trust delta:      ↓ — thinness reads as "template site"
LIFT:             Value Prop ↓ — page adds nothing beyond title. Relevance ↑ (title matches), Clarity n/a.
Cialdini missing: Authority — the one place to demonstrate depth per wallet, and it's empty.
CTA reachable:    No (CtaBand only)
```

### Fold 2 — Home hero + TrustStrip
> "Copy's clean, no stock photos, no ‘98% success rate’ nonsense — that's a plus. ‘Non-custodial’ used correctly. ‘Systemen zonder internet’ — okay. But here's the thing: if you recover my Electrum password, *you have my password and my wallet file*. ‘U opent de wallet en verplaatst de tegoeden zelf’ is a process claim, not a technical guarantee. What stops you from sweeping it first? Nothing on this page addresses that — the honest answer is ‘nothing technical; that's what the contract, the supervised session and the reputation are for’, and I'd respect it if they said it."

```
ANALYST — Fold 2
LIFT:             Anxiety ↑ — the core technical trust problem (recoverer necessarily obtains the secret) is papered over by "non-custodial" branding rather than confronted.
Cialdini missing: Authority (no names, no track record), Social Proof
```

### Fold 3 — Tarieven
> "20%. Same as Dave, same as KeychainX. Fine, it's the market. ‘Maatwerktarief’ for ‘aanzienlijke tegoeden’ — number? None. Minimum fee? Not stated — for 0.8 BTC 20% is a lot of money for what might be a 3-day GPU run; a lower percentage or a cap would be a differentiator if they had one. How is the fee settled — on-chain to their address during the handover? That's the only practical way and it's not said. ‘Herstelde waarde’ at spot on which day? Contract says ‘zoals afgesproken’ — so, negotiable. OK."

```
ANALYST — Fold 3
LIFT:             Clarity — % clear; payment mechanics, valuation moment, minimum, and the custom threshold all unstated.
                  Urgency n/a. Value Prop ↔ parity with competitors, no differentiator except "Dutch + contract".
```

### Fold 4 — Werkwijze
> "‘Risicogebaseerde KYC/AML-controles’ — so I'll be sending ID to a company whose KvK number ‘volgt’. That's backwards. Security section: offline systems, NDA, verification, location. All good words. No specifics: air-gapped how? Do they accept a hash (`electrum2john` output) so the wallet file never leaves me? Do they delete and confirm? Terms say ‘na overdracht verwijderd’ — good, at least it's in writing. No mention of who ‘the specialist’ is, no LinkedIn, no GitHub, no talks."

```
ANALYST — Fold 4
Emotional state:  skeptical
LIFT:             Anxiety ↑ — asymmetric: they verify me, I can't verify them.
Cialdini missing: Authority — the most damaging gap for this persona. Liking — no humans.
```

### Fold 5 — About
> "‘Herstel, zonder het schimmige deel.’ Good line. ‘De versie die een notaris met een gerust hart aanbeveelt.’ Then... who are you? Three paragraphs, no name, no founding year, no background. The About page is the one place I went specifically to find a person and there isn't one. On Dave's site, it's a guy with a name and a decade of Bitcointalk history. That's the whole difference."

```
ANALYST — Fold 5
Trust delta:      ↓↓ — About page without a person is a negative signal for an avoidant, technical persona.
Cialdini missing: Authority, Liking, Social Proof — all three, on the page whose only job is those three.
```

### Fold 6 — Contact form
> "Form's fine. Honeypot, no secret fields, decent. ‘Walletsoftware of apparaat: Ledger, Electrum, MetaMask…’ free text, fine. I'd want to say ‘I can provide a hash; I have partial knowledge of structure; I've already exhausted X rules’ — that goes in the description. No option to attach nothing, good. Consent mentions a privacy policy with no link — sloppy. No PGP key or secure upload mentioned for later. ‘Twee werkdagen’ — fine. ‘Mail ons rechtstreeks’ in the error message — there's no address. That's a template leftover, which tells me how new this is."

### Verdict — Daan
```
Confidence score:  4/10 — the copy is more honest than competitors; the company is less visible than any of them
Clarity score:     8/10 — he understands exactly what's offered
Relevance score:   5/10 — wallet page was empty for his wallet; general pages are fine
Would I contact:   No, not yet — he'd bookmark it and send to Dave/KeychainX first, unless the About page gets a person and a KvK.

Top 3 strengths:  1) No hype, explicit "we can't do full seed loss / stolen funds" (LIFT:Anxiety ↓ via honesty)
                  2) Transparent 20% with extra-cost note (LIFT:Clarity)
                  3) Terms actually state fee-only-on-success and deletion after handover (Cialdini:Commitment)
Top 3 weaknesses: 1) No identifiable human or legal entity (Cialdini:Authority)
                  2) Custody-of-secret problem not addressed technically (LIFT:Anxiety)
                  3) Wallet landing pages have no wallet-specific content (LIFT:Value Prop)
Moment I almost left:      /wallets/electrum, immediately
Moment I was most engaged: Reading terms § Vergoeding and § Non-custodial — concrete, binding language
```

---

## Where the personas agree and conflict

| Need | Marijke | Tom | Daan |
|---|---|---|---|
| Phone / address / KvK / a person | Critical | Critical (for notary) | Critical |
| Plain-language "non-custodial", "KYC" | Critical | Helpful | Neutral (would tolerate a tooltip) |
| Inheritance visible on home | Neutral | Critical | Neutral |
| Payment mechanics / minimum / valuation moment | Helpful | Critical | Critical |
| Deep per-wallet technical content | Harmful if above fold | Neutral | Critical |
| Social proof / references | Wants a face | Wants notary references | Wants track record, not testimonials |
| Estimated-value field position | Off-putting | Neutral | Neutral |

The site currently serves *nobody's* trust need at the point of conversion, while its honesty copy serves all three. The conflict is only in depth: Daan wants technical density where Marijke wants warmth — that belongs on wallet/service subpages and About, not the home hero.

---

## Consolidated, prioritised recommendations

### Quick wins (< 1 day)

**1. Put a real channel and legal identity on the site.**
Framework: Cialdini:Authority, LIFT:Anxiety. All three personas.
- Add email (+ ideally phone and city) to `Footer.tsx` and to the contact aside in `src/app/[locale]/contact/ContactClient.tsx`.
- Replace `footer.legal` "KvK-nummer volgt" (`messages/nl.json:36`, `en.json:36`) with the real number the moment it exists; until then remove the line — "volgt" is worse than silence.
- Fix `contact.form.genericError` ("mail ons rechtstreeks", line 553) and `contact.aside.direct` ("Liever eerst bellen?", line 583) so they don't reference non-existent channels, or make the channels exist.

**2. Link the privacy policy from the consent checkbox.**
`ContactClient.tsx` consent `FormControlLabel` — the label text (`contact.form.consent`, line 550) mentions "het privacybeleid" with no `<Link href="/privacy">`. Use `t.rich` with a link chunk. Also change "identiteit en eigendom" to "identiteit en eigendom of bevoegdheid" for heirs.

**3. Move "Geschatte waarde" to the end of the form and make it a range select.**
LIFT:Anxiety (Marijke: "kijken of ik de moeite waard ben"). In `ContactClient.tsx` reorder the grid so `estimatedValue` follows `description`; consider `MenuItem` ranges (`< €5k / €5–50k / €50k+ / weet ik niet`) which also serves the `pricing.custom` threshold.

**4. Remove or reframe the "Exchange-account" wallet type.**
`contact.walletTypes.exchange` (line 559) contradicts `faq.items.wrongAddress`/the blog ("een exchange-account is geen wallet... rechtstreeks bij de exchange"). Either drop it from `WALLET_TYPES` in `ContactClient.tsx`, or keep it and show inline helper text: "Voor exchange-accounts kunt u direct bij de exchange terecht; wij helpen daar niet bij."

**5. Plain-language the two jargon hotspots above the fold.**
`home.hero.badge` "Non-custodial wallet herstel" → e.g. "Wallet herstel — u houdt zelf de sleutels"; `home.hero.points.two` → "Wij krijgen nooit beheer over uw tegoeden — u opent de wallet zelf, desgewenst met ons ernaast". `process.verification.body` / `howItWorks.security.verification.body`: add the *reason* before "KYC/AML" ("zodat we zeker weten dat de wallet van u is").

**6. Surface "wij helpen ook erfgenamen" on the home hero.**
LIFT:Relevance for Tom. Add a fourth hero point or a one-line under the subtitle in `home.hero.*`; rename the service card `services.inheritance.name` from "Nalatenschap en professionals" to "Geërfde wallets (nabestaanden en notarissen)".

**7. Make form failure visible.**
`ContactClient.tsx handleSubmit` silently returns when a select/consent is missing. Add `error`/`helperText` to the two `select` fields and the checkbox, or a top-level `Alert` — a stressed user who clicks and sees nothing happen will leave.

**8. Fix hard-coded light palette in the contact page.**
`ContactClient.tsx` imports `palette` from `@/theme/theme` for the aside background (`palette.offWhite`) and success alert (`palette.accentMuted`, `palette.accent`). Everywhere else uses `var(--app-*)`. In dark mode this renders an off-white box on a dark page. Swap to CSS vars.

### Major improvements (days)

**9. Give the company a face on About and a "who you'll talk to" on Contact.**
Cialdini:Authority/Liking. `src/app/[locale]/about/page.tsx` needs: founder name(s), background, founding year, photo, city, KvK, and for Daan a technical CV line (tooling, years). Add a small "Uw specialist: [naam]" block to the contact aside. This is the single highest-leverage change for all three personas.

**10. Add a "Waarom 20% en wat betekent het concreet" block on Tarieven.**
`src/app/[locale]/pricing/page.tsx` + `pricing.*`: worked example ("Wallet met €10.000 → vergoeding €2.000, pas na overdracht"), the valuation moment ("koers op de dag van overdracht"), how it's settled (on-chain during the supervised transfer, or EUR invoice), whether there's a minimum, and a concrete threshold for `pricing.custom` ("vanaf ca. €X"). For Tom: one sentence on estates (fee paid by the estate; invoice can go to the notary).

**11. Confront the key-custody question head-on.**
Add a FAQ item (`faq.items.*` and on `how-it-works`) titled roughly "Als jullie mijn wachtwoord vinden, hebben jullie toch toegang?" with the honest answer: yes, at that moment, which is why the handover happens in a supervised session, the contract binds it, and (if true) a hash-only workflow is possible for password cases so the wallet file never leaves the client. Daan's whole objection lives here; Marijke's "verplaatsen" fear is the same question from the other side.

**12. Make the inheritance journey cohesive.**
- Contact form: when `issueType === "inheritance"`, reveal fields for role (erfgenaam / executeur / notaris / advocaat), whether a verklaring van erfrecht exists, and notary contact; allow multiple artefacts (change `walletType` to multi-select or add a "meerdere / weet ik niet" option with helper text).
- Link the inheritance service page (`services/[slug]`) to the blog post and vice-versa; on the inheritance service page explain who provides the destination wallet ("wij helpen de vertegenwoordiger een nieuwe wallet aan te maken, in de sessie").
- Add a downloadable/printable "Zo werkt het voor nabestaanden en notarissen" one-pager Tom can forward.

**13. Add a CTA after "Wat wij van u nodig hebben" on service pages and after the pricing cards.**
`services/[slug]/page.tsx` and `pricing/page.tsx` only convert via the bottom `CtaBand`. Insert a `LinkButton href="/contact"` after the need-list and after the pricing note — that's the "enough moment" for Marijke and Tom.

**14. Fill the wallet landing pages.**
`wallets/[slug]/page.tsx` renders hero + TrustStrip + 3 cards. Add per-wallet sections to `wallets.<slug>` in the messages: typical failure modes, what to send / not send, whether hash-only is possible, version notes (Electrum old seeds vs BIP39, Bitcoin Core wallet.dat eras, MultiBit .key), and a short FAQ. Daan bounced on this page in seconds; it's also the SEO entry point.

**15. Post-submit: send and say you send a confirmation email.**
`contact.success.body` should state "U ontvangt een bevestiging per e-mail met dit referentienummer" (and the API should send it). Tom needs to forward it; Marijke will close the tab and lose the reference.

### Strategic opportunities

**16. A 60-second self-triage ("Kan mijn wallet hersteld worden?")** — 3–4 questions (what do you have left / what kind of wallet / what do you remember) ending in "kansrijk / misschien / niet, en waarom". Cialdini:Commitment + Reciprocity; replaces Marijke's six-card self-diagnosis and the current "which of three pages applies" problem for Tom. Could live at `/check` and pre-fill the contact form.

**17. Anonymised case notes instead of testimonials.** Three short "zaak" cards (wallet type, what was left, outcome, duration, no names) on home and pricing. Serves Daan (evidence), Tom (forwardable), Marijke (people like me) without the fake-review smell the About page rightly disowns.

**18. Professional-partner track.** A "Voor notarissen en advocaten" page with a process sheet, sample agreement outline, and contact for professionals. Tom's notary is the real gatekeeper; give the notary something to read.

**19. Promote the scam-recognition blog post to a trust component.** `content/blog/nl/wallet-herstel-scams-herkennen.mdx` is the best differentiator on the site. A "Hoe herkent u een betrouwbare hersteldienst — en toets ons eraan" box on home/About turns the site's honesty into a checklist the visitor scores Revault against (Cialdini:Commitment via self-persuasion).

---

**Files touched most often above:** `messages/nl.json` / `messages/en.json` (copy), `src/app/[locale]/contact/ContactClient.tsx` (form order, validation, consent link, palette, inheritance fields), `src/components/Footer.tsx` (identity/contact), `src/app/[locale]/about/page.tsx` (people), `src/app/[locale]/pricing/page.tsx` (worked example, mechanics), `src/app/[locale]/wallets/[slug]/page.tsx` (depth), `src/app/[locale]/services/[slug]/page.tsx` (mid-page CTA).