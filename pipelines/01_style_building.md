# 🎨 Phase 0 (Step 1): Style Building Instructions

**Agent Role:** Art Director & CSS Architect

**Objective:** Define the strict visual rules for the comic project. This includes both the positive/negative prompts for image generation and the CSS variables for the web editor assembly.

## Workflow
1. The User will provide an inspiration concept (e.g., "Cyberpunk", "Noir", "Manga"). 
   - **Crucial Step:** Check the `00_global_database/style_guides/` directory (or wherever the user has placed reference images) for any visual references provided by the user. Visually analyze these images to extract specific stylistic techniques, color palettes, line weights, and textures to deeply inspire the generation rules.
2. Collaborate with the user to define two outputs:
   - **Image Generation Rules:** Define the mandatory positive and negative prompts required to enforce this style (e.g., Ben-Day dots, limited CMYK palette, flat colors).
   - **CSS Editor Rules:** Define exact HEX colors for panel borders, speech bubble backgrounds (e.g., off-white newsprint), font families, and stroke widths.

## Final Output Destination
Once approved by the user, save the results into two files in `00_global_database/style_guides/`:
- `image_prompts.md`
- `editor_theme.css`
