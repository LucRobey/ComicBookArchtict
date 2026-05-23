#!/usr/bin/env python3
import os
import sys
import json
import re
from google import genai
from google.genai import types

def run_agent_merge():
    print("Initializing Agentic Lore Merging...")
    
    # Check for API key
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
              "Please set GEMINI_API_KEY in your environment/terminal and restart the dev server to run the merge.", 
              file=sys.stderr)
        sys.exit(1)
        
    # Paths
    user_lore_path = 'data/user_lore.json'
    lore_style_path = 'data/lore_style.json'
    visual_style_path = 'data/visual_style.json'
    final_lore_path = 'data/final_lore.json'
    
    # Load files
    if not os.path.exists(user_lore_path):
        print(f"Error: User lore file not found at {user_lore_path}", file=sys.stderr)
        sys.exit(1)
        
    if not os.path.exists(lore_style_path):
        print(f"Error: Lore style file not found at {lore_style_path}", file=sys.stderr)
        sys.exit(1)
        
    if not os.path.exists(visual_style_path):
        print(f"Error: Visual style file not found at {visual_style_path}", file=sys.stderr)
        sys.exit(1)
        
    with open(user_lore_path, 'r', encoding='utf-8') as f:
        user_lore_data = f.read()
    with open(lore_style_path, 'r', encoding='utf-8') as f:
        lore_style_data = f.read()
    with open(visual_style_path, 'r', encoding='utf-8') as f:
        visual_style = json.load(f)
        visual_style_data = json.dumps(visual_style, indent=2)
        
    system_instruction = (
        "You are an expert narrative architect and comic book editor. "
        "Your task is to merge the user's raw story concepts with a researched comic book style to produce a cohesive series bible. "
        "You MUST output a single valid JSON object containing the 'final_lore' key. "
        "Do not include any conversational text or markdown wrapping outside of the JSON."
    )
    
    prompt = f"""
Analyze the raw inputs below and perform a creative, high-quality, and coherent lore fusion.
 
INPUT DATA:
1. USER LORE (Raw story and world inputs):
{user_lore_data}
 
2. LORE STYLE (Researched narrative tropes & character guidelines):
{lore_style_data}
 
3. VISUAL STYLE (Aesthetic dna and visual rules):
{visual_style_data}
 
INSTRUCTIONS:
1. Establish a Narrative Blend:
   - Combine the user's genre with the style's signature genre.
   - Combine the user's tone with the style's narrative pacing and comedy/drama rules.
   - Set the era to integrate the style's visual era.
2. Adapt the Core Conflict:
   - Translate the user's core conflict into an exciting narrative engine driven by the style's thematic tropes. Do not perform character extraction or adaptation in this step.
3. Combine World Rules:
   - Keep user rules intact, and append style narrative rules.
   - Resolve any direct contradictions by prioritizing the user's rules but adapting their presentation to match the style.
4. Integrate Thematic Tropes:
   - Map how the researched tropes manifest in the story's events.
 
OUTPUT SCHEMA:
Your output must be a JSON object structured exactly as follows:
{{
  "final_lore": {{
    "_schema_version": "1.1",
    "_description": "Active inspired lore of the project. Result of merging user_lore.json and lore_style.json.",
    "inspiration_reference": {{
      "comic_title": "[Reference comic name, e.g., The Adventures of Tintin]",
      "style_family": "[e.g., Belgian Ligne Claire]",
      "era": "[Setting/era of the reference style]",
      "key_inspirations_applied": [ "Pacing and comedy rules", "Classic adventure layout" ]
    }},
    "narrative_blend": {{
      "world_type": "[User world_type]",
      "genre_blend": "[Synthesized genre blend]",
      "tone_blend": "[Synthesized tone blend]",
      "era_setting": "[Synthesized era/setting]",
      "core_conflict_translation": {{
        "original_user_conflict": "[Original core_conflict text]",
        "adapted_conflict_concept": "[New adapted conflict concept combining conflict with style's tropes]",
        "primary_style_plot_drivers": [ /* names of style thematic tropes applied */ ]
      }}
    }},
    "blended_world_rules": [
      {{
        "rule": "[rule title/name]",
        "derived_from": "[User Lore or Lore Style (Reference Comic Name)]",
        "application_in_story": "[how it is applied in scenes]"
      }}
    ],
    "integrated_tropes": [
      {{
        "trope_name": "[trope name]",
        "source_trope_description": "[description]",
        "manifestation_in_scenario": "[how it manifests in this specific story]"
      }}
    ],
    "humor_and_pacing_rules": {{
      "humor_mechanisms_applied": [ /* humor tropes applied from guidelines */ ],
      "pacing_tempo_rules": [ /* pacing rules */ ]
    }}
  }}
}}
"""
 
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction=system_instruction
            )
        )
    except Exception as e:
        print(f"Error calling Gemini API: {e}", file=sys.stderr)
        sys.exit(1)
        
    response_text = response.text
    if not response_text:
        print("Error: Received empty response from Gemini API", file=sys.stderr)
        sys.exit(1)
        
    # Clean output if any markdown blocks exist (usually shouldn't because of response_mime_type)
    cleaned_text = response_text.strip()
    if cleaned_text.startswith("```"):
        match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned_text, re.DOTALL)
        if match:
            cleaned_text = match.group(1)
            
    try:
        data = json.loads(cleaned_text)
    except Exception as e:
        print(f"Error: Agent output is not valid JSON. Error: {e}\nRaw output was:\n{response_text}", file=sys.stderr)
        sys.exit(1)
        
    if "final_lore" not in data:
        print("Error: Agent output is missing 'final_lore' key.", file=sys.stderr)
        sys.exit(1)
        
    # Write output files
    with open(final_lore_path, 'w', encoding='utf-8') as f:
        json.dump(data["final_lore"], f, indent=2, ensure_ascii=False)
    print(f"Successfully generated and wrote {final_lore_path}")

if __name__ == '__main__':
    run_agent_merge()
