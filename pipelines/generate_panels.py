#!/usr/bin/env python3
import os
import sys
import json
import re
import time
from google import genai
from google.genai import types

def run_panel_structuring():
    print("Initializing Panel Structuring Agent (Page-by-Page Mode)...")
    
    # Check for API key in environment
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fallback to search for .env in current or parent directories
        for env_path in ['.env', 'app/.env', '../.env', '../../.env']:
            if os.path.exists(env_path):
                try:
                    with open(env_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.strip().startswith('GEMINI_API_KEY='):
                                api_key = line.strip().split('=', 1)[1].strip().strip('"\'')
                                os.environ["GEMINI_API_KEY"] = api_key
                                break
                except Exception:
                    pass
            if api_key:
                break
                
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is not set.\n"
              "Please set GEMINI_API_KEY in your environment/terminal to run the generator.", 
              file=sys.stderr)
        sys.exit(1)
        
    # Input/Output paths
    pages_path = 'data/pages.json'
    scenes_path = 'data/scenario_scenes.json'
    scene_script_path = 'data/scene_script.json'
    panel_style_path = 'data/panel_style.json'
    intro_pages_path = 'data/intro_pages.json'
    output_panels_path = 'data/panels.json'
    
    # Verify input files exist
    required_files = [pages_path, scenes_path, scene_script_path, panel_style_path, intro_pages_path]
    for path in required_files:
        if not os.path.exists(path):
            print(f"Error: Required input file not found: {path}", file=sys.stderr)
            sys.exit(1)
            
    # Load files
    with open(pages_path, 'r', encoding='utf-8') as f:
        pages_data = json.load(f)
    with open(scenes_path, 'r', encoding='utf-8') as f:
        scenes_data = json.load(f)
    with open(scene_script_path, 'r', encoding='utf-8') as f:
        scene_script_data = json.load(f)
    with open(panel_style_path, 'r', encoding='utf-8') as f:
        panel_style_data = json.load(f)
    with open(intro_pages_path, 'r', encoding='utf-8') as f:
        intro_pages_data = json.load(f)

    system_instruction = (
        "You are an expert comic book draftsman, layout artist, and storyboard designer. "
        "Your task is to take a page's pacing plan, associated scene definitions, script beats, and style guidelines "
        "and divide that single page of a comic book into panels with explicit framing, visual actions, characters present, "
        "layout templates, focal elements, characters acting details (facial expression, pose/gesture, internal thoughts), "
        "environment details, and composition notes. "
        "You MUST output a single valid JSON object representing the page. "
        "Do not include any conversational text or markdown wrapping outside of the JSON."
    )
    
    client = genai.Client()
    
    pages = pages_data.get("pages", [])
    output_pages = []
    
    for idx, page in enumerate(pages):
        page_num = page.get("page_number")
        print(f"Generating panels for Page {page_num} of {len(pages)-1}...")
        
        # Gather associated scene IDs
        associated_scene_ids = []
        if page.get("scene_id") is not None:
            associated_scene_ids.append(page["scene_id"])
        
        for assoc in page.get("scenes_associated", []):
            if isinstance(assoc, dict) and assoc.get("scene_id") is not None:
                associated_scene_ids.append(assoc["scene_id"])
            elif isinstance(assoc, int):
                associated_scene_ids.append(assoc)
        
        associated_scene_ids = list(set(associated_scene_ids))
        
        # Filter scenes
        page_scenes = [s for s in scenes_data.get("scenes", []) if s.get("scene_id") in associated_scene_ids]
        
        # Filter scripts
        page_scripts = [s for s in scene_script_data.get("scenes", []) if s.get("scene_id") in associated_scene_ids]
        
        # Intro pages
        page_intro = None
        if page.get("type") == "character_intro":
            for ip in intro_pages_data.get("intro_pages", []):
                if ip.get("page_number") == page_num:
                    page_intro = ip
                    break
        
        prompt = f"""
Analyze the input data below and generate the structured panel breakdown layout for Page {page_num}.

PAGE PACING & FOCUS:
Page Number: {page_num}
Page Type: {page.get('type')}
Layout Proposal Raw: {page.get('layout_proposal')}
Narrative Focus: {page.get('focus')}
Characters Present: {json.dumps(page.get('characters_present', []))}
Setting/Location: {json.dumps(page.get('setting_and_location', {}))}

ASSOCIATED SCENES CONTEXT:
{json.dumps(page_scenes, indent=2)}

SCRIPT BEATS FOR THIS PAGE:
{json.dumps(page_scripts, indent=2)}

PANEL STYLE SIGNATURE PATTERNS:
{json.dumps(panel_style_data.get('signature_patterns', []), indent=2)}

INSTRUCTIONS:
1. Cover Page (Page 0):
   - Map Page 0 to a single splash panel using layout_template "custom_full_page_splash".
   - Describe the cover art focus in the action description, focal_element, and environment_details.

2. Character Intro Pages (Pages 1 & 2):
   - Do NOT generate from scratch. Map these from the provided COMPLETED CHARACTER INTRO data below if available.
   - Extract panel_number, and map the keyframe_action to "action", the shot_type to "framing", characters from character_choreography to "characters_present", and tags.
   - Map `cinematic_framing` properties to `composition_notes` (e.g. "[shot_type] at [camera_angle], feels [camera_lens_feel]").
   - Map `character_choreography` elements to `characters_acting` array: map `expression_override` to `expression`, and default `pose_and_gesture` and `internal_state` from the intro page storyline context.
   - Use `intro_pages` tags for tags, and describe the focus inside `focal_element`.

3. Story Pages (Page 3 onwards):
   - Divide this page's script beats into panels. Use the layout_proposal and panel counts target from pages.json/scene_script.json.
   - Assign this page a matching layout_template from the signature_patterns in panel_style.json.
   - For each panel, define:
     - panel_number (1-indexed starting at 1)
     - framing (MUST be one of the exact allowed values: "Wide Establishing Shot", "Medium shot", "Medium two-shot", "Close-up", "Extreme close-up", "Over-the-shoulder", "Dynamic low angle", "Bird's eye view", "POV shot")
     - action (Present-tense visual description of the panel focus. NO DIALOGUE.)
     - characters_present (Array of character IDs present in the panel frame, e.g. ["CHARACTER_A", "CHARACTER_B"])
     - tags (Array of strings representing panel traits, e.g. "[ESTABLISHING]" for first panel of a scene, or project-specific tags)
     - focal_element (The specific visual anchor of the camera shot, e.g. the metal butter knife, the steam from the cup)
     - characters_acting (Array of objects describing the physical, emotional, and acting states of each character present in this panel)
       - character_id (The ID of the character, e.g. "CHARACTER_A")
       - expression (Facial expressions matching their panel-specific emotions in scene_script.json)
       - pose_and_gesture (Physical body language and posture, e.g. "leaning over engine, gesturing with hand")
       - internal_state (What the character is feeling or thinking in this exact panel beat, providing subtext context)
     - environment_details (Panel-specific atmospheric, ambient, or background elements)
     - composition_notes (Camera lens choices, camera height angles, depth of field details, or composition guides)

4. Constraints:
   - Never give two consecutive panels on a page the same framing.
   - Limit the characters present in any single panel to 3.
   - The action descriptions should contain only visual information (descriptions of physical acts, expressions, lighting, environments).
"""

        if page_intro:
            prompt += f"""
COMPLETED CHARACTER INTRO FOR THIS PAGE:
{json.dumps(page_intro, indent=2)}
"""

        prompt += """
OUTPUT FORMAT:
Your output must be a single valid JSON object structured exactly as follows:
{
  "page_number": """ + str(page_num) + """,
  "layout_proposal_raw": \"""" + str(page.get('layout_proposal')) + """\",
  "layout_template": "[select template id, e.g. tintin_cinematic_6panel]",
  "panels": [
    {
      "panel_number": 1,
      "framing": "Wide Establishing Shot",
      "action": "[Visual action text]",
      "characters_present": ["CHARACTER_A"],
      "tags": ["[ESTABLISHING]"],
      "focal_element": "[specific focus subject]",
      "characters_acting": [
        {
          "character_id": "CHARACTER_A",
          "expression": "[facial expressions]",
          "pose_and_gesture": "[body language posture]",
          "internal_state": "[internal thoughts and emotions]"
        }
      ],
      "environment_details": "[ambient and setting details]",
      "composition_notes": "[lens, angle, composition instructions]"
    }
  ]
}
"""

        max_retries = 5
        success = False
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        system_instruction=system_instruction
                    )
                )
                response_text = response.text
                if not response_text:
                    raise ValueError("Received empty response from Gemini API")
                    
                cleaned_text = response_text.strip()
                if cleaned_text.startswith("```"):
                    match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned_text, re.DOTALL)
                    if match:
                        cleaned_text = match.group(1)
                        
                page_data = json.loads(cleaned_text)
                
                # Basic validation
                if "page_number" not in page_data or "panels" not in page_data:
                    raise ValueError("Missing 'page_number' or 'panels' in response.")
                    
                output_pages.append(page_data)
                success = True
                break
            except Exception as e:
                err_str = str(e)
                if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                    print(f"Rate limit (429) hit for Page {page_num}. Sleeping 35 seconds before retry...", file=sys.stderr)
                    time.sleep(35)
                else:
                    print(f"Attempt {attempt+1} failed for Page {page_num}: {e}. Retrying...", file=sys.stderr)
                    time.sleep(2)
                
        if not success:
            print(f"Error: Failed to generate panels for Page {page_num} after {max_retries} attempts.", file=sys.stderr)
            sys.exit(1)
            
        # Proactive spacing delay between pages to avoid hitting the RPM limit
        if idx < len(pages) - 1:
            time.sleep(5)
            
    # Combine all pages and write output
    final_output = {
        "pages": sorted(output_pages, key=lambda x: x["page_number"])
    }
    
    with open(output_panels_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)
    print(f"\nSuccessfully generated and wrote all {len(pages)} pages to {output_panels_path}")

if __name__ == '__main__':
    run_panel_structuring()
