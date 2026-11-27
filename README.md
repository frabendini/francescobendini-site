# Francesco Bendini — independent website

This repository is for rebuilding francescobendini.com independently of Flazio. The current public website remains unchanged during development.

## Planned files
- `index.html` — home
- `about.html` — About / CV
- `styles.css` — responsive design
- `sculpture.js` — interactive 3D sculpture
- `fonts/` — original fonts once supplied
- `models/` — optional local 3D assets

## Design requirements
- White background and dark typography.
- Desktop alignment farther left than on the current Flazio site.
- PORTFOLIO ENG, PORTFOLIO ITA, ABOUT / CV in a single vertical column.
- Responsive mobile header, with FRANCESCO and BENDINI on separate lines.
- Interactive sculpture at bottom right.
- Existing GitHub Pages portfolio PDF links retained.

## Deployment
GitHub Pages will be enabled after the first site version is uploaded and checked. No domain or DNS changes yet.

## Production launch checklist (SEO)
- Keep all preview pages `noindex,follow` until the custom domain is verified.
- At launch use canonical URLs on the final verified HTTPS hostname; update Open Graph and Twitter image/URL metadata to that hostname.
- Publish sitemap.xml at the domain root with these seven paths: /, /about/, /statement/, /portrait/, /work-work-work/, /pasta/, /gorgos/. Do not list portfolio PDFs.
- Publish robots.txt at the domain root allowing crawl and pointing to the production sitemap. A project-subpath robots.txt is not effective at the github.io hostname root.
- Portfolio requirement: prevent PDF indexing using HTTP X-Robots-Tag: noindex. Verify final delivery architecture, including old github.io PDF URLs and other publicly reachable copies; nofollow alone is not sufficient. Do not block crawling of URLs that need to expose noindex.
- Verify portfolio headers and domain redirects before removing staging noindex. Submit production sitemap via Google Search Console after launch.
- Social previews currently reuse existing artwork photographs (WebP); verify platform compatibility and crop, and replace with dedicated JPEG/PNG if needed.
