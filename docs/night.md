# Night: the dashboard's dark look

The user (2026-11-04): a dark mode "not like others ... really unique to 8x. Like, wow, even in the dark mode, they
have this kind of polish", every page designed for it, part by part. The light look is **Daybreak** (the brand kit's
official light palette); the dark one is **Night**, the 8x Social hero's own world. Night is not grey on black.

## The idea

By day the window is a light pane in the night aura. At Night the window becomes the night itself: a navy-black pane
in the lit aura, the tray a deeper well in it, the cards a step up, lit faintly from above. The vertical's colour is
the light in the night:

- the lead blocks (the deep blue ones) glow on the tray beneath them;
- the chart's line glows on its own night sky;
- the lit dots (posting, the calendar's busy days, the request track, the sources' shares) shine like a city at night;
- the creators' banners are auroras, the same lights standing in the dark.

## The ladder

Every surface takes its place on one ladder, deepest first:

| Step | Token | What stands on it |
| --- | --- | --- |
| Ink blocks | `--ink-block` | 8x's own card, This browser, Performance, Full Service: deeper than the window, a hairline of light round them. |
| The tray | `--canvas` | The page's well. |
| The window, its cards | `--paper` | The sidebar, the right-hand column, every card (a hairline rim, lit faintly from above). |
| What opens over it | `--popover` | Menus, dialogs, sheets, the brand's card. |
| What floats over it | `--float` | Tooltips, toasts, the selection bar. |

Inside a card, what Daybreak draws as a white tile or chip becomes **glass**: white at 5 to 7 % with a 1 px hairline,
never a white square on the dark.

## Tokens (`app/globals.css`)

Night redefines the day's tokens on `<html data-vertical data-theme="dark">`, every value mixed from the vertical's
own, so every vertical gets its own night by the same rule:

- the grounds and greys: `--ink` (now the night's white), `--paper`, `--canvas`, `--stone`, `--border`, `--text`,
  `--text-muted`, `--mist`, the dots;
- the four card tints (sky, lilac, blue, pearl) become coloured light in their top corners;
- the one action (`--action`, `--on-action`) becomes the night's white with dark words;
- `--link`, the vertical's blue as words, brightens so small words still read.

Daybreak values of the new tokens equal what the pages had, so Daybreak did not move: every page was captured whole
before and after at 1440 and 390, and the only differences are the new brand photo and the switch.

## Each part

Each component's stylesheet ends with its own `/* ---- Night ---- */` block (`:global([data-theme="dark"]) .x`), so
every part was looked at on its own. The rules:

- **Pale blocks become the vertical's night.** The pale grounds (the chart's card, Who is posting, How far they got,
  What works, the guidelines, the posting calendar) become a deep blue lit from the top right. The engagement strip
  and the creator of the week take the accent, deep. The ended and paused campaigns are the glow and the accent,
  deep, their words white.
- **Steps rise into light.** Where Daybreak darkens a step for more (the calendar's days, the view tiers), Night
  brightens it, from a faint tint up to the glow.
- **White on the deep blue stays white.** The open plan's column turns into a window of the night ringed in white.
  The invite's field and button, the face tooltips and the white pills on blue keep their dark words.
- **The ink marks** (the lockup, the 8x) turn white by one rule; the one on a white disc keeps its ink
  (`data-ink-stays`).
- **The brand's logo** keeps its own colours on its white tile, and its edge on the dark with a hairline of light.
- **Canvas drawings** read the theme: the creators' banners redraw at Night (the ground sinks toward the ink, white
  light turns to the glow).

## The switch (`components/shell/theme-switch.tsx`)

A small toggle above Settings (the user: "really, really small"). Its track is a sliver of 8x's sky:

- **Daybreak:** a clear blue with a small cloud, the sun as the knob.
- **Night:** the vertical's deep navy with a few stars twinkling, the knob now the moon.

To a screen reader it is a switch, "Night mode". On the rail it sits centred under the icons.

## The change (`components/shell/theme.ts`)

The new look spreads out from the switch as a soft-edged pool over the old, about a second. It is a view transition,
so the page swaps at once underneath and nothing is drawn twice. With reduced motion, or where the browser has no
view transitions, the look simply changes.

The choice is kept in `localStorage` (`8x-theme`). A first visit always opens in Daybreak, whatever the device's setting; Night is a choice. A script in
`app/layout.tsx` sets the look before the first paint, so a page never shows one look and then the other.

## Checked

- Every page whole, both looks, at 1440 and 390.
- Every menu, dialog, bar and tooltip open, at Night.
- Every view at 15 widths, 320 to 2560 px, at Night: no overflow, no errors.
- The switch both ways: the stored choice and the switch's state follow.
- Every word readable, measured against what is drawn behind it (`scripts/contrast.py`): 4.5:1 for small words, 3:1
  for large. Night's muted words are a step lighter than they first were, so they read on the raised panels too; a
  flagged or dropped item's words take the quiet colour instead of fading; the calendar's figures stay white only on
  steps deep enough for them.

## Calm pass (2026-11-04)

The cobalt blocks became the accent made subtle in both looks: at Night the vertical's colour breathed into the paper,
white words on it, a faint rim of light and a soft glow beneath (no longer a bright blue block). The calendar's ramp
rises from a faint tint to a calm blue, every figure white. Night is a choice: a first visit opens in Daybreak.
