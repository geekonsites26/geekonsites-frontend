# GOS V2 Frontend Standards

These requirements apply to Phase 2 and every subsequent GOS frontend phase.
They are acceptance criteria for each redesigned page, not deferred Android or
iOS conversion work.

## Product Targets

The same GOS interface must work well in:

- Android and iOS apps
- Capacitor WebView
- Mobile browsers
- Tablets
- Laptop and desktop browsers

Mobile is a first-class product. Do not implement it as a compressed desktop
layout or depend on browser-only interaction assumptions.

## Required Viewports

Design and validate mobile first at:

- 360 x 800
- 375px width
- 390 x 844
- 412 x 915

Then validate representative tablet, laptop, and desktop widths.

Every redesigned page must have:

- No horizontal scrolling or clipped content
- No overlapping fixed elements
- Readable responsive typography
- Touch-friendly controls
- Correct mobile navigation and safe bottom spacing
- Usable forms and mobile-appropriate dialogs
- Smooth, lightweight animation

## Layout And Scrolling

- Prefer flexible grid, flex, and responsive containers.
- Do not rely on fixed desktop widths or unnecessary `min-width` values.
- Images must be responsive and use stable aspect ratios and `object-fit`.
- Lazy-load below-the-fold imagery and keep asset sizes practical.
- Use natural vertical scrolling and no scroll hijacking.
- Avoid nested scrolling unless the interaction genuinely requires it.
- Prevent unwanted horizontal drag in browsers and WebViews.

## Touch And Interaction

- Give buttons, links, icon controls, toggles, radios, checkboxes, and tappable
  cards comfortable touch targets. Aim for at least 44 x 44 CSS pixels for
  primary interactive targets.
- Critical actions cannot depend on hover. Every hover affordance needs an
  equivalent focus and touch interaction.
- Do not open critical flows in new tabs unless an external destination
  specifically requires it.
- App-like transactional pages need an obvious in-app back action while
  preserving browser and router history behavior.

## Navigation And Safe Areas

- Preserve and improve `MobileBottomNav`.
- Content on pages using bottom navigation must clear the navigation bar.
- Fixed or sticky controls must not overlap bottom navigation, fields, modals,
  or keyboard input areas.
- Apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` only where
  fixed chrome, status areas, gesture areas, or sticky actions require them.
- Do not apply safe-area padding globally without a specific layout need.

## Capacitor And Android

- Treat Capacitor WebView as a primary runtime for every frontend phase.
- Keep `viewport-fit=cover` in the viewport metadata so device safe-area values
  are available to fixed app chrome.
- Test fixed headers, bottom navigation, dialogs, and sticky actions with Android
  gesture navigation and three-button navigation.
- Background video must pause when off-screen or when the app enters the
  background. Prefer compressed H.264 MP4 assets and avoid decoding multiple
  videos at the same time.
- Never rely on hover, browser refresh controls, opening a new tab, or desktop
  keyboard behavior for a required workflow.
- Preserve Android system back behavior by using router navigation and history
  rather than hard-coded page replacement where possible.
- During local development, image updates placed under the Downloads project's
  `public/images` directory are synchronized into the active project by Vite.
  Video files are deliberately excluded so Android-optimized encodes are never
  replaced by large source exports.

## Forms And Keyboard

- Fields are full width on mobile with readable labels, validation, and spacing.
- Form control text must remain at least 16px where needed to prevent iOS zoom.
- Use meaningful input types such as `email`, `tel`, `number`, `date`, and
  `time`, plus suitable `inputMode` and autocomplete attributes.
- Focused fields and primary actions must remain reachable when the software
  keyboard is open.
- Avoid fixed CTA bars when they would obscure fields or conflict with the
  keyboard.
- Modal forms must never exceed the viewport width.

## Modals And Sheets

- Centered dialogs are appropriate on larger screens.
- Prefer bottom sheets or near-full-screen dialogs on phones when content or
  forms need more room.
- Dialog content must scroll naturally, the close action must remain reachable,
  and the keyboard must not trap form fields.
- Backdrops must cover the complete active viewport, including safe areas where
  appropriate.

## Transactional Actions

Booking, payment, tracking, and service-completion pages may use mobile sticky
or fixed actions when they materially improve the workflow. Such actions must:

- Clear `MobileBottomNav`
- Respect device safe areas
- Stay readable when the keyboard opens
- Never hide form fields or validation

## Performance And Motion

- Do not add large libraries, oversized imagery, autoplay video, or heavy
  background assets without a demonstrated need.
- Framer Motion should primarily animate opacity and transforms.
- Avoid continuous decorative motion and effects that perform poorly on
  mid-range mobile hardware.
- Navigation must never wait for decorative animation.

## Loading And Resilience

Every API-dependent screen must provide clear states for:

- Loading
- Error
- Retry, where recovery is possible
- Empty results

Never leave an API-dependent screen as an unexplained blank surface.

## Cross-Platform Visual Direction

Use one consistent GOS visual system across web, Android, and iOS. The product
should feel comfortable on each platform without closely imitating either
native Android or native iOS styling.

## Phase Completion Checklist

A redesigned page is complete only after checking:

1. No horizontal overflow
2. No clipped content
3. No overlapping fixed elements
4. Touch-friendly controls
5. Readable responsive typography
6. Correct mobile navigation behavior
7. Safe bottom and status-area spacing
8. Form and keyboard usability
9. Modal or sheet usability
10. Acceptable animation and asset performance

Mobile issues discovered within a phase must be fixed in that phase.
