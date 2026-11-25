# chaitanyaraj238.github.io

Personal research website of **Chaitanya Raj**, PhD researcher in computational hydrology,
AQUARIUS Research Lab, Czech University of Life Sciences Prague.

Live site: https://chaitanyaraj238.github.io/

A plain static site (HTML, CSS, JavaScript). No build step, no dependencies to install.
GitHub Pages serves it directly from the root of the `main` branch.

## Updating content

Almost everything you will want to change lives in **`assets/js/data.js`**:

| To change…                         | Edit in `data.js`         |
|------------------------------------|---------------------------|
| Publications                       | `publications`            |
| Research projects                  | `projects`                |
| Supervisors, co-authors, lab mates | `people`                  |
| Places on the network map          | `places` (lat/lon + entries) |
| Academic timeline                  | `timeline`                |
| PhD title, questions, models       | `phd`                     |
| Email, ORCID, Scholar, etc.        | `links`                   |
| "Last updated" in the footer       | `lastUpdated`             |

Search the file for `TODO` to find information that is still missing.
A field set to `null` is simply not shown.

Text that rarely changes (hero, About, PhD context, research themes, toolkit) is in `index.html`.

### Common tasks
- **Add a paper:** copy an entry in `publications`, change the fields, set `featured: true` to pin it to the top.
- **Add a collaborator:** add them to `people` (group `"coauthor"`, with `match` set to how their name appears in author lists, e.g. `"Smith, J."`), and add or extend a `places` entry with `kind: "coauthor"`.
- **Replace the CV:** overwrite `assets/docs/Chaitanya_Raj_CV.pdf` (keep the file name).
- **Replace the photo:** overwrite `assets/img/profile.jpg` and `assets/img/profile.webp` (portrait, about 720 × 900 px).

## Preview locally
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure
```
index.html                 page structure and static text
assets/css/style.css       design tokens (colours, fonts) and layout
assets/js/data.js          ALL editable content
assets/js/main.js          navigation, projects, publications, people, timeline, workflow
assets/js/viz.js           hero forecast schematic and compound-event explainer
assets/js/map.js           research network map
assets/vendor/             d3-array, d3-geo, topojson-client, Natural Earth 110m land (self-hosted)
assets/fonts/              Newsreader, Instrument Sans, JetBrains Mono (self-hosted, OFL)
assets/docs/               CV (PDF)
assets/img/                photo and social-sharing card
```

## Notes
- The hero forecast and the compound-event explainer use synthetic data generated in the browser and are labelled as such on the page.
- The map draws coastlines only (Natural Earth 110m land); no political boundaries are shown.
- Fonts: Newsreader, Instrument Sans, JetBrains Mono (SIL Open Font License). Map libraries: d3 (ISC), topojson-client (ISC), world-atlas / Natural Earth (public domain).
