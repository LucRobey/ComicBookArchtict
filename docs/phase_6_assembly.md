# 🤖 Phase 6: Assembly

**App Tab:** 🧩 Assembly
**Master Guide:** [← MASTER_GUIDE.md](../MASTER_GUIDE.md)
**Upstream:** [Phase 4/5 →](phase_4_images.md) | [Phase 3B →](phase_3_script.md) (Panel Script)
**Downstream:** Final output (no further phases)

---

## What This Phase Does

Final production step. Panel images are composited into full pages and speech bubbles / caption boxes are added using the approved dialogue from `data/script.json`. The Comic Studio Assembly tab is the primary tool here. This phase is primarily **human-operated**.

---

## Inputs

| File | Path |
|------|------|
| Panel images | `data/images/page_N/panel_N.png` |
| Script | `data/script.json` |
| Panel structure | `data/panels.json` |
| Layout state (auto-created by app) | `data/assembly/pages/page_N/layout.json` |

---

## Output

| What | Path |
|------|------|
| Final page images | `data/assembly/pages/page_N/final.png` |
| Page layout JSON | `data/assembly/pages/page_N/layout.json` |

---

## `layout.json` Schema (app-managed)

Do not generate this — the app creates and manages it. You can read it to understand assembly progress.

```json
{
  "page_number": 1,
  "status": "in_progress",
  "panels": [
    {
      "panel_number": 1,
      "image_path": "../../images/page_1/panel_1.png",
      "position": { "x": 0, "y": 0, "w": 1200, "h": 800 },
      "dialogue_boxes": [
        {
          "dialogue_id": "d_1_1_1",
          "text": "Sunday. 9:04 AM.",
          "type": "caption",
          "position": { "x": 40, "y": 40 }
        }
      ]
    }
  ]
}
```

`status`: `"not_started"` | `"in_progress"` | `"done"`

`dialogue_id` must reference a real ID in `data/script.json`.

---

## Starting the App

```powershell
cd app
npm run dev
# → http://localhost:5173/
```

---

## App: 🧩 Assembly Tab

The Assembly tab has two sub-views toggled by a sub-bar below the phase tabs:

**Page Assembly view:**
- **Sidebar** (left, `200px`) — lists all pages from `data/pages.json`. Active page highlighted with blue accent ring. CSS class: `.sidebar` / `.page-nav-btn.active`.
- **Canvas** (center) — white page canvas (`800×1131px`). Drag panel images and dialogue bubbles via react-rnd. CSS class: `.canvas-container`.
- **Properties Panel** (right, `280px`) — shows position, size, z-index, bubble style, font size, tail direction for the selected element. CSS class: `.properties-panel`.
- **Export Page button** (top-right) — `POST /api/save-layout`. CSS class: `.export-btn`.

**QA Review Board view:**
- Two-column layout: **Page Panels** (left) and **Flagged Modifications** (right). CSS class: `.qa-board-content` → `.qa-column`.
- Left column lists all panels placed on the active page. Each panel shows a thumbnail and a **Flag Issue** button (`.flag-btn`).
- Right column shows modification cards (`.qa-mod-card`) with a type selector (Edit / Enhance / Restart), optional character name input, and a notes textarea (`.form-field`).
- **Export QA Report** button (`.btn-success`) — `POST /api/save-modifications`. Exports a `.md` file to `data/assembly/modifications/`.
- Page selector dropdown (`.page-select`) in the header bar to switch pages.

---

## App API Reference

All paths are relative to the project root (`architecture 3.0/`), not to `app/`.

### Load JSON
```
GET /api/load?path=data%2Fscript.json
```
Response: `{ "data": {...} }` or `{ "error": "..." }`

### Save JSON
```
POST /api/save
Body: { "path": "data/panels.json", "content": {...} }
(Note: Do NOT stringify `content` before sending — the server stringifies it automatically.)
```

### Save QA report (markdown)
```
POST /api/save-qa
Body: { "path": "qa/script/qa_report_phase3_[TIMESTAMP].md", "content": "..." }
```

---

## QA Reports → `qa/assembly/` *(write manually)*

Assembly QA is written in plain text — no automatic 🚩 buttons in this tab.

### Common issue types:

```markdown
## Page 3, Panel 2 — [BUBBLE_PLACEMENT]
* **Dialogue ID:** d_3_2_1
* **Issue:** Bubble covers CHARACTER_A's face.
* **Fix:** Move to bottom-right corner. Adjust tail.

## Page 1, Panel 3 — [MISSING_TEXT]
* **Dialogue ID:** d_1_3_2
* **Issue:** Not lettered yet.

## Page 2, Panel 1 — [WRONG_IMAGE]
* **Issue:** Panel 1 has the panel_2 image loaded.
* **Fix:** Load data/images/page_2/panel_1.png.
```

---

## Agent Assist: Lettering Reference

To help the human letter a page, read `data/script.json` and output:

```
PAGE 1, PANEL 2
d_1_2_1  | NARRATOR    | caption | "Sunday. 9:04 AM."
d_1_2_2  | CHARACTER_A | speech  | "Has anyone seen the—"
d_1_2_3  | CHARACTER_B | speech  | "Left side of the table."
```

---

## Agent Rules

1. Do NOT modify `data/script.json` during assembly. If a dialogue error is found, report and ask if Phase 3 should be reopened.
2. Do NOT modify panel images during assembly. If a visual error is found, report and ask if Phase 4/5 should be reopened.
3. `layout.json` is the app's state — read it to understand progress; do not overwrite unless asked to automate layout.
4. Every `dialogue_id` in `layout.json` must reference a real ID in `data/script.json`.
5. After all pages assembled and exported, update `PRODUCTION_STATUS.md`: Phase 6 → `[APPROVED]`
