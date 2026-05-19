# Pipeline 08 — Location Shot Image Generation

**Phase:** 0 (Pre-Production — Geography)
**Runs after:** Pipeline 09 (location sheets must exist before images can be generated)
**Output target:** `data/images/locations/[loc_id]/[shot_id].png` — one image per shot per variant
**Triggered by:** After Pipeline 09 has written location sheets, or when a new variant/shot is added.

---

## What This Pipeline Does

Reads the shot library from each location's `location_sheet.md` (via `geography.json`) and generates one image per shot. Each location may have one or more **variants** (e.g., Morning / Night), each with its own set of shots.

The cover image (`data/images/locations/[loc_id].png`) for a location card is the first variant's first shot, or the location's own `image` field if defined separately.

---

## Input Requirements

```
data/geography.json                               ← location list (schema v1.4)
data/locations/[loc_id]/location_sheet.md         ← shot library (written by Pipeline 09)
data/lore.json                                    ← visual_style (universal style suffix)
```

If `geography.json` or `lore.json` is missing → stop. Run Pipelines 01 + 03 first.
If a location has no `location_sheet` path → run Pipeline 09 for that location first.

---

## Geography Schema — What This Pipeline Reads

### Multi-variant location (e.g., The Office)
```json
{
  "id": "loc_office",
  "variants": [
    {
      "id": "morning",
      "label": "Morning",
      "image": "data/images/locations/loc_office_day.png",
      "shots": [
        {
          "id": "wide_entrance",
          "image": "data/images/locations/loc_office_day/wide_entrance.png",
          "prompt_suffix": "wide establishing shot from entrance doorway, morning light..."
        }
      ]
    },
    {
      "id": "night",
      "label": "Night",
      "image": "data/images/locations/loc_office_night.png",
      "shots": [...]
    }
  ]
}
```

### Flat location (e.g., The Café)
```json
{
  "id": "loc_cafe",
  "image": "data/images/locations/loc_cafe.png",
  "shots": [
    {
      "id": "wide_entrance",
      "image": "data/images/locations/loc_cafe/wide_entrance.png",
      "prompt_suffix": "wide establishing shot café from entrance..."
    }
  ]
}
```

---

## Prompt Formula

All shot prompts are assembled as:

```
[shot.prompt_suffix], [lore.visual_style], no human figures, no text, no speech bubbles
```

**Hard rules enforced on every image:**
- ⚠ **No human figures.** Characters are placed by Phase 4 (Generation).
- ⚠ **No text**, no readable labels, signs, or screen content.
- ⚠ **Flat fills only** — no photographic gradients, no lens flares.
- ⚠ Style must match `lore.visual_style` exactly. Do not deviate.
- ⚠ All shots within the same variant must be consistent: same space, same light, same materials.

---

## Step 1 — Build the Image Queue

Walk every location in `geography.locations[]`:

**If the location has `variants[]`:**
- For each variant in `variants[]`:
  - For each shot in `variant.shots[]`:
    - Check if `shot.image` path exists on disk.
    - If missing → add `{ loc_id, variant_id, shot_id, prompt_suffix }` to queue.
  - Check if `variant.image` (the variant cover) exists.
    - If missing → it will be generated as the first shot of that variant, or separately if defined.

**If the location is flat (no `variants[]`):**
- For each shot in `location.shots[]`:
  - Check if `shot.image` path exists.
  - If missing → add to queue.
- Check if `location.image` exists.

**Skip any image that already exists on disk** unless the user has flagged it.

---

## Step 2 — Generate Missing Images

For each item in the queue:

1. Assemble the full prompt:
   ```
   [shot.prompt_suffix], [lore.visual_style], no human figures, no text, no speech bubbles
   ```

2. Generate the image.

3. Save to `shot.image` path (create directory if needed).

4. If this is the first shot of a variant and the variant has no separate `image` field, the generated file also serves as the variant cover (update `variant.image` accordingly).

---

## Step 3 — Update geography.json

After generation, confirm all `shot.image` and `variant.image` paths in `geography.json` point to existing files. If any paths changed during generation, update them via `POST /api/save`.

---

## Step 4 — Output Summary

Report per location:
```
loc_office — Morning: 3/3 shots generated ✓
loc_office — Night:   3/3 shots generated ✓
loc_cafe:             3/3 shots generated ✓
```

---

## Flag Handling

Flags are written by the UI to `qa/lore/` as `.md` files. Each file contains an action token in its `[HEADER]`. Scan `qa/lore/` before running this pipeline and process all unresolved flags.

Image flags come in **two modes**, determined by the filename and the token inside:

---

### Mode A — `REGENERATE_SHOT` (re-generate from scratch)

**File pattern:** `qa/lore/flag_shot_regenerate_{loc}_{variant}_{ts}.md`  
**Token:** `[REGENERATE_SHOT:{loc_id}:{variant_id}:{shot_id}]`

The user wants a completely new image. The existing image is discarded.

1. Read the `* **Current prompt suffix:**` field from the flag file.
2. Read the `* **Prompt changes:**` field — these are the user's modifications to the prompt.
3. Apply the changes: adjust the `prompt_suffix` in `geography.json` for this shot.
4. Assemble the full new prompt: `[updated prompt_suffix], [lore.visual_style], no human figures, no text, no speech bubbles`
5. Generate a new image.
6. Overwrite the file at `shot.image`.
7. Update `geography.json` with the new (or same) image path.
8. Do not touch any other shot.
9. Append `[APPLIED]` to the QA flag file.

---

### Mode B — `MODIFY_SHOT` (edit existing image)

**File pattern:** `qa/lore/flag_shot_modify_{loc}_{variant}_{ts}.md`  
**Token:** `[MODIFY_SHOT:{loc_id}:{variant_id}:{shot_id}]`

The user wants the existing image adjusted, not replaced from scratch (img2img / inpainting).

1. Read the `* **Source image:**` field — this is the existing image path to load.
2. Read the `* **Changes to apply:**` field — these are the user's edit instructions.
3. Pass the source image to the image generator as the base image.
4. Use the `Changes to apply:` text as the edit/modification prompt.
5. Save the result to the same `shot.image` path (overwrite).
6. Do not regenerate from scratch; do not modify `prompt_suffix`.
7. Append `[APPLIED]` to the QA flag file.

---

### Other flag types

- **`REGENERATE_LOCATION_IMAGE:{loc_id}`** → regenerate the cover image (`variant.image` or `location.image`). Treated as a full re-generate (Mode A) using the first shot's prompt.
- **`REGENERATE_PALETTE:{loc_id}:{variant_id}`** → produce a new colour palette for this location/variant and update the `palette[]` array in `geography.json`.
- **`MODIFY_LIGHTING:{loc_id}:{variant_id}`** → update the `lighting_summary` string in `geography.json` per the `Direction:` note.

All flag processing is **surgical**: only the specific shot, variant, or field referenced in the flag is touched. Never regenerate unrelated images.

---

## Adding New Variants or Shots

When new variants or shots are added to `geography.json` by Pipeline 09:
1. Run Pipeline 08 for the affected location only.
2. Do not regenerate images that already exist for other variants/shots of the same location.

---

## ⚠ Phase Isolation

- This pipeline generates **empty spaces only**. Never include characters.
- Time-of-day is determined by the **variant** — not by the location name.
- Each variant's shots must be internally consistent (same lighting, same ambient conditions).
- Variant shots must be visually distinguishable from each other (morning vs. night must look categorically different for the same space).
