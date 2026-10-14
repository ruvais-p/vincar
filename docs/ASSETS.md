# Artwork and font notes

- `src/components/Illustration.astro`: original, hand-authored vector placeholder artwork created for this implementation. `variant="hero"` is L1 (buyer examining a car with a magnifier); `variant="about"` is L2 (two people discussing a car and history sheet). Both share the four required colours and a consistent contour weight. They are marked decorative with `aria-hidden`, and have explicit 620 × 340 dimensions. No third-party Aurora artwork, photos, or competitor assets are incorporated.
- The attachment named “Aurora Team Illustrations hover grid.webp” was not available in the workspace. Style direction was taken from the user's written description. The SVGs are deliberately original placeholders, not licensed Aurora assets. Replace the two variants in `Illustration.astro` with final commissioned/licensed artwork, preserving dimensions and empty/decorative alternatives. This note identifies their placeholder status; they are not silently substituted stock.
- `Icon.astro`, favicon, social image, and guide graphics are simple original SVG paths. No external icon or font dependency.
- Font stack: Arial, Helvetica, sans-serif; no font file is redistributed, downloaded, or represented as commercially licensed artwork.
- The social image is SVG; some social crawlers require PNG/JPEG. Export a branded 1200 × 630 raster after the final name/domain is confirmed. This is a documented production finishing task.
- The homepage review carousel uses clearly labeled illustrative sample reviews and the existing vehicle illustration. No actual endorsements, vehicle-maker marks, user totals, or ratings are used. Supported-make pages are intentionally absent because no actual coverage contract exists.

## Vincar brand assets

The user supplied the Vincar logos on 14 October 2026. The original PNGs are copied unchanged into `public/images/vincar-logo-header.png` (orange V, black lettering) and `public/images/vincar-logo-footer.png` (white outline). Layout.astro uses the respective image for each location, with responsive sizing, intrinsic dimensions and brand-name alt text. These supplied brand assets replace the original text wordmarks; the illustration placeholders remain separate.
