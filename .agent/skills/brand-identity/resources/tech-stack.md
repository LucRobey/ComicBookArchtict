# Preferred Tech Stack & Implementation Rules

When generating code or UI components for ARC 3.0, strictly adhere to the "Modern Drafting Board" aesthetic. It should feel like a contemporary, clean engineering tool—grounded and professional, without being "sci-fi" or "retro Windows".

## Core Stack
* **Framework:** React (TypeScript) + Vite
* **Styling Engine:** Tailwind CSS
* **Component Library:** shadcn/ui (Clean, flat styling)
* **Icons:** Lucide React

## Visual Implementation Guidelines (The "Modern Drafting Board" Aesthetic)

### 1. Tailwind & Theming
* Utilize the color tokens defined in `design-tokens.json`.
* **Backgrounds:** Use a uniform flat blue (`bg-[#1E3A8A]`) for the main workspace background. This is the "blueprint table".
* **UI Panels:** Sidebar, headers, and floating dialogs should use a clean off-white/drafting paper color (`bg-[#FAFAF9]`). This creates a sharp contrast against the blue background.
* **Text:** Use dark graphite (`text-gray-800`) on the light panels.
* **No Glows:** Do NOT use drop shadows, glowing text, or neon cyan highlights. Keep it flat and grounded. A subtle, modern shadow (`shadow-sm`) on panels is acceptable to separate them from the blue background.

### 2. Component Patterns
* **Buttons:** Modern, flat buttons. Primary buttons use the solid blue. Secondary buttons are outlined or use light gray backgrounds. 
* **Typography:** `Space Grotesk` for headings to give a subtle architectural feel, `Inter` for clean body readability. `IBM Plex Mono` for code/scripting.
* **Inputs:** Clean borders (`border-gray-300`), white backgrounds, very slight border radius (`rounded-sm`).

### 3. Forbidden Patterns
* Do NOT use 1990s retro bevels (no `border-outset`, no thick gray Windows 95 panels).
* Do NOT use futuristic, cyber, or sci-fi elements (no neon glows).
* Do NOT use heavy, dark mode for the UI panels (except Phase 3). The panels are light (paper), the background is dark (blueprint).
