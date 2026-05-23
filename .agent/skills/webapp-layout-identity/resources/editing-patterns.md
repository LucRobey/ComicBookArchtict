# ARC 3.0: Editing Interaction Patterns

> This document defines **how data is edited** across every panel, page, and phase of ARC 3.0.
> All edit interactions must follow these rules to ensure a consistent user experience.
> Read this alongside [`layout-identity.md`](layout-identity.md) and [`visual-identity.md`](visual-identity.md).

---

## 0. The Golden Rule

**Edit mode is always initiated by a single "Edit" button, never implicitly.** A user reading content must never accidentally trigger an edit. All save/commit actions are explicit — there is no auto-save unless documented as a deliberate exception.

---

## 1. Page-Level Text Editing

### Trigger
A single **Edit button** (top-right of the page header or content zone) activates edit mode for the **entire page or panel**.

### Behavior
- All editable text fields on the page simultaneously become `<textarea>` or `<input>` elements
- The Edit button transforms into a **Save button**
- A **Cancel button** appears alongside Save (discards all changes made since entering edit mode)
- Fields that are not editable in this context remain as read-only display elements

### Visual State
- Editable fields gain a visible border: `border border-border-accent` (blue accent)
- Background shifts slightly: `bg-panel-raised` on the input area to signal interactivity
- A **floating action bar** anchors to the bottom of the content zone, containing Save and Cancel

### Constraints
- Text-only fields (strings, paragraphs, labels) use this mode
- Do **not** use this pattern for structured data (lists, cards, dropdowns) — see sections below
- The Save action **commits all fields at once**, not field-by-field

### Voice & Tone
- Edit button label: `Edit` (plain)
- Save button label: `Commit` (aligned with brand vocabulary)
- Cancel button label: `Discard`

---

## 2. List Editing (JSON Array / Ordered Collections)

Used for any data that is a list of items (e.g., a character's traits, a location's tags, a scenario's acts).

### Each List Item exposes (in View mode):
| Control | Position | Action |
|---|---|---|
| ▲ / ▼ | Left of item | Reorder (move up / move down) |
| ✏️ Edit | Right of item | Opens item into inline edit state |
| 🗑️ Delete | Right of item, after Edit | Removes item (with confirmation) |

### Adding a New Item
- A **`+ Add`** button lives at the bottom of the list (always visible, not just in edit mode)
- Clicking it appends a new empty item in **inline edit state**, pre-focused and ready for input
- The new item is saved individually (not part of the page-level Save)

### Inline Edit State
- The item row expands into an input field (or set of fields if multi-field)
- Two action buttons appear inline: **`Save`** and **`Cancel`**
- Focus is trapped within the item until saved or cancelled

### Reorder Behavior
- ▲ and ▼ are always visible (not just in edit mode) — reordering is a first-class action
- Moving an item triggers an immediate save of the list order (no confirmation needed)

### Delete Behavior
- Always show a **confirmation prompt** before deleting (inline text: `"Delete this item? [Confirm] [Cancel]"`)
- Do **not** use a modal for list item deletion — keep it inline
- Deleted items are removed immediately on confirm

---

## 3. Selection / Enum Editing (Dropdowns)

Used for fields that can only hold one value from a predefined set (e.g., gender, status, boolean flags, role type).

### Trigger
When the page enters **Edit Mode** (Section 1), selection fields transform from a **read-only badge or text** into a **styled `<select>` dropdown**.

### Visual Design
- Dropdown uses `bg-secondary`, `border border-border`, `border-radius: 6px`
- On focus: `border-color: var(--color-border-accent)`
- Dropdown options use the same dark surface colors — **never a white native dropdown**
- Use a custom-styled select component (not native `<select>` appearance) for full design control

### Boolean Fields
- Boolean values render as a **two-option segmented control** (`Yes / No`, `On / Off`, `Active / Inactive`)
- Do **not** use a checkbox for booleans — the segmented control is consistent with the drafting-tool aesthetic

### Save
- Selection fields save as part of the page-level **Commit** action (no individual save per field)

---

## 4. Color Editing

Used for any field that stores a color value (e.g., a character's palette color, a location's tag color).

### Trigger
Clicking the color swatch (in View mode or Edit mode) opens a **Color Picker panel**.

### Color Picker Panel
- Opens as a **floating panel** anchored near the color swatch (not a modal, not full-screen)
- Contains:
  - A hue/saturation/lightness picker
  - A hex input field
  - A small set of **Brand Palette swatches** (pulled from the project's defined palette)
- Has a **`Apply`** button and a **`Cancel`** button
- Closing the panel without clicking Apply discards the change

### Visual Design
- Panel: `bg-surface`, `border border-border`, `border-radius: 8px`, `shadow-xl`
- Position: anchored below/beside the color swatch, never obscuring it
- Z-index: `z-50` (above content, above QA drawer)

### Adding a New Color
- If the field represents adding to a palette (not editing an existing color), the same picker is used
- The `+ Add Color` action triggers the picker in "new color" mode
- On Apply, the new color is appended to the list

---

## 5. Complex Card / Entity Editing

Used when a list item or card contains multiple fields of different types (e.g., a character entry with a name, role, palette color, and traits list; a location with a name, type, description, and coordinates).

### Trigger
Each card in View mode has a dedicated **Edit button** (pencil icon, top-right corner of the card). Clicking it opens a **detail edit modal**.

### Detail Edit Modal
- **Not full-screen** — it is a centered, contained panel (overlay)
- Size: `max-w-lg` default; `max-w-2xl` for complex entities with many fields
- Background: `bg-surface`, `border border-border`, `border-radius: 10px`, `shadow-xl`
- Backdrop: `bg-black/50`, click-to-dismiss **only if no unsaved changes** (otherwise warn)
- Contains all editable fields of the card, laid out in a simple form:
  - Text fields → standard `<input>` / `<textarea>`
  - Selection fields → dropdown (see Section 3)
  - Color fields → color swatch triggering picker (see Section 4)
  - Sub-lists → mini list editor (see Section 2, compact variant)

### Modal Action Bar (bottom of modal)
| Button | Variant | Position | Action |
|---|---|---|---|
| `Delete` | Destructive (`--color-danger`) | Left | Permanently removes the card/entity |
| `Discard` | Ghost | Right (secondary) | Closes modal, discards changes |
| `Commit` | Primary (accent blue) | Right (primary) | Saves all changes and closes modal |

### Delete from Modal
- Clicking **Delete** shows an inline confirmation inside the modal (not a second modal):
  - `"Permanently remove this entity? This cannot be undone."` + `[Confirm Delete]` `[Cancel]`
- On confirm, modal closes and entity is removed from the list

### Voice & Tone
- Modal title: `Edit [Entity Type]` (e.g., `Edit Character`, `Edit Location`)
- Use brand vocabulary in labels where appropriate (`Compile`, `Commit`) but keep form labels simple and functional

---

## 6. Control Hierarchy Summary

| Data Type | Edit Trigger | Save Method | Delete Method |
|---|---|---|---|
| Plain text / paragraphs | Page-level Edit button | Page-level Commit | N/A |
| Ordered list items | Per-item inline Edit | Per-item inline Save | Per-item inline confirm |
| Enum / selection | Page-level Edit button (transforms field) | Page-level Commit | N/A |
| Color value | Click swatch (any time) | Apply in picker | N/A |
| Complex card / entity | Per-card Edit button → Modal | Modal Commit | Modal Delete → inline confirm |

---

## 7. Global Rules

### Never use auto-save
All changes are explicit. There is no silent write to the data store. Users must always perform a deliberate **Commit** or **Save** action.

### Always provide Cancel / Discard
Every edit entry point must have an escape hatch. Users must be able to exit edit mode without consequences.

### Unsaved-change protection
If a user tries to navigate away (change tab, close modal) with unsaved changes, show a brief inline warning:
> `"Unsaved changes. Commit or Discard before leaving."`
Do **not** use a browser `beforeunload` dialog — keep it in-app.

### Destructive actions require confirmation
Any action that permanently removes data (delete item, delete card, delete entity) must require a **two-step confirm**. The confirmation is always **inline** (never a second modal or a toast).

### Disabled state
When a form is submitting (async save in progress), all inputs and buttons must be visually disabled (`opacity-50`, `cursor-not-allowed`). A subtle loading spinner replaces the Commit button label.

---

## 8. Button Visual Specifications

> These specs are derived directly from the Lore phase (`lore.css` + `InlineEditableText.tsx`), which is the canonical reference implementation for editing UI across the app. When in doubt, match the Lore phase.

### 8.1 Action Icon Buttons — Delete / Edit / Flag

These are the small `24×24px` icon buttons that appear on hover next to list items, cards, and rows.

**Base anatomy** (all three share the same shell):

| Property | Value |
|---|---|
| Size | `24px × 24px` |
| Shape | `border-radius: 6px` |
| Border | none |
| Layout | `display: flex; align-items: center; justify-content: center` |
| Font size | `0.75rem` |
| Default opacity | `0` (hidden until parent hover) |
| Revealed opacity | `0.6` on parent hover → `1.0` on self hover |
| Scale on hover | `transform: scale(1.1)` |
| Transition | `opacity`, `background`, `color`, `transform` — all `var(--dur-fast, 150ms) ease` |
| Z-index | `2` |

**Per-button colour scheme:**

| Button | Default background | Default colour | Hover background | Hover colour |
|---|---|---|---|---|
| **Delete** (✕) | `rgba(239,68,68, 0.12)` | `#ef4444` | `#ef4444` | `#ffffff` |
| **Edit** (✏️) | `rgba(59,130,246, 0.10)` | `var(--accent-primary)` | `var(--accent-primary)` | `#ffffff` |
| **Flag** (🚩) | `rgba(217,119,6, 0.10)` | `#D97706` | `#D97706` | `#ffffff` |

**CSS class names:** `.lore-action-delete`, `.lore-action-edit`, `.lore-action-flag`

**Hover reveal pattern** — add `group` on the parent container, the buttons auto-reveal:
```css
/* Hidden by default */
.lore-action-delete, .lore-action-edit, .lore-action-flag { opacity: 0; }

/* 60% revealed when group hovered */
.group:hover > .lore-action-delete,
.group:hover > .lore-action-edit { opacity: 0.6; }

/* Fully visible + slight scale on self hover */
.lore-action-delete:hover,
.lore-action-edit:hover { opacity: 1; transform: scale(1.1); }
```

**Row container** when multiple action buttons sit together (e.g., flag + delete on a shot card):
```css
.lore-action-row { display: flex; gap: 4px; align-items: center; }
```

---

### 8.2 Inline Edit Save / Cancel Buttons

These appear below a textarea when a user enters edit mode on a text field (via the `InlineEditableText` component).

**Save button (`.lore-desc-save-btn`)**

| Property | Value |
|---|---|
| Padding | `5px 14px` |
| Shape | `border-radius: 16px` (pill) |
| Border | none |
| Background | `var(--accent-primary, #3b82f6)` |
| Text colour | `#ffffff` |
| Font size | `0.78rem` |
| Font weight | `600` |
| Disabled state | `opacity: 0.6; cursor: not-allowed` |
| Label states | `Save` → `Saving…` → `✓ Saved` |

**Cancel button (`.lore-desc-cancel-btn`)**

| Property | Value |
|---|---|
| Padding | `5px 14px` |
| Shape | `border-radius: 16px` (pill) |
| Border | `1px solid var(--border-color)` |
| Background | `transparent` |
| Text colour | `var(--text-muted)` → `var(--text-main)` on hover |
| Font size | `0.78rem` |

**Layout** — both buttons sit in `.lore-desc-edit-actions`:
```css
.lore-desc-edit-actions { display: flex; align-items: center; gap: 8px; }
```
Save is always **first** (left), Cancel **second** (right of Save).

**Textarea styling when in edit mode** (`.lore-desc-textarea`):
```css
width: 100%;
background: var(--bg-color);
border: 1px solid var(--accent-primary, #3b82f6);  /* blue border signals edit mode */
border-radius: 8px;
color: var(--text-main);
font-size: 0.88rem;
line-height: 1.55;
padding: 10px 12px;
resize: vertical;
font-family: inherit;
```
Focus ring: `box-shadow: 0 0 0 2px rgba(59,130,246,0.3); outline: none;`

---

### 8.3 Inline Edit Trigger Button (✏️ icon)

The ghost pencil button that appears on text hover to enter edit mode.

**`.lore-desc-edit-icon-btn`**

| Property | Value |
|---|---|
| Background | `none` |
| Border | none |
| Font size | `0.85rem` |
| Padding | `2px 4px` |
| Shape | `border-radius: 4px` |
| Default opacity | `0` |
| Revealed | `opacity: 1` when parent `.group` is hovered |
| Hover background | `rgba(255,255,255, 0.08)` |

---

### 8.4 "Add" / "+" Buttons (Section Header variant)

Used in section headers to add a new item to a list (e.g., `+ Add Rule`, `+ Add Location`, `+ Request New View`).

**`.lore-add-loc-btn`** (and equivalent patterns in other phases)

| Property | Value |
|---|---|
| Padding | `4px 12px` |
| Shape | `border-radius: 14px` (pill) |
| Border | `1px solid rgba(59,130,246, 0.35)` |
| Background | `rgba(59,130,246, 0.08)` (faint blue tint) |
| Text colour | `var(--accent-primary, #3b82f6)` |
| Font size | `0.72rem` |
| Font weight | `700` |
| Letter spacing | `0.02em` |
| Position | `margin-left: auto` (pushed to right end of section header flex row) |
| Hover background | `rgba(59,130,246, 0.18)` |
| Hover border | `var(--accent-primary)` (solid) |

> The "Add" button variant used inline (not in a header) uses a lighter `text-xs px-2 py-1` Tailwind shorthand with the same `bg-accent/10 text-accent border border-accent/20 rounded hover:bg-accent hover:text-white` pattern. Both are acceptable; pick the named CSS class for new work.

---

### 8.5 Delete Confirmation (Inline, no modal)

When the user clicks a delete action button on a list item, show an inline confirm strip — **not a modal**.

Structure (inline, replacing the row content temporarily):
```
"Remove this item? [Confirm] [Cancel]"
```

**Confirm button** — same style as the Save pill button but with danger colours:
```css
background: var(--color-danger, #ef4444);
color: #ffffff;
border-radius: 16px;
padding: 4px 12px;
font-size: 0.78rem;
font-weight: 600;
```

**Cancel** — same as the Cancel pill button above.

---

### 8.6 Button Position Summary

| Context | Edit/Save position | Delete position | Cancel position |
|---|---|---|---|
| Text row (inline edit) | Revealed on hover, right of text | — | Right of Save, in action bar below textarea |
| List item row | Right end of row (in `.lore-action-row`) | Right of Edit in `.lore-action-row` | Inline confirm strip |
| Section header | — | — | — (no delete at section level) |
| Add button | Far right of section header (`margin-left: auto`) | — | — |
| Modal footer | Right (primary) | Left (destructive) | Right of Delete, left of Save |

---

## 9. Forbidden Patterns

❌ **Never** use auto-save without an explicit "saving..." indicator and undo capability  
❌ **Never** delete data on a single click — always require confirmation  
❌ **Never** open a second modal from within a modal (e.g., for delete confirmation) — use inline confirm  
❌ **Never** use a native `<select>` with default browser styling — always apply custom styling  
❌ **Never** use checkboxes for boolean fields — use segmented controls  
❌ **Never** use a toast/snackbar as the only confirmation of a destructive action  
❌ **Never** allow horizontal overflow in edit mode — fields must wrap and grow vertically  
