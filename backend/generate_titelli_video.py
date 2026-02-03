import os
import sys
import time

# Set environment variable directly
os.environ['EMERGENT_LLM_KEY'] = 'sk-emergent-f7b660f6d3b5fA5846'

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

scenes = [
    {
        "name": "scene1_reveil",
        "prompt": """Cinematic scene of a person waking up in a luxurious modern Swiss apartment at sunrise. 
A well-dressed butler arrives with a beautiful breakfast tray with croissants, fresh juice, and newspaper. 
Warm golden morning light. Premium lifestyle advertisement. 4K cinematic quality."""
    },
    {
        "name": "scene2_soins_travail",
        "prompt": """Professional spa therapist giving a relaxing massage to a business person in a modern office setting. 
The person looks peaceful and relaxed before starting work. Clean, bright, contemporary workspace. 
Premium corporate wellness. 4K cinematic quality."""
    },
    {
        "name": "scene3_chauffeur",
        "prompt": """Elegant chauffeur in uniform opening the door of a luxury black Mercedes for a well-dressed professional. 
Beautiful Swiss city street in background. Morning commute in style. 
Premium transportation service advertisement. 4K cinematic quality."""
    },
    {
        "name": "scene4_livraison_panier",
        "prompt": """A happy mother receiving a beautiful gourmet food basket delivery at her home door. 
She pays with her phone contactless payment. Warm family atmosphere. 
Premium delivery service. 4K cinematic quality."""
    },
    {
        "name": "scene5_soiree_soins",
        "prompt": """Group of elegant women friends enjoying a home spa party with professional beauticians. 
Candles, champagne, face masks, manicures. Luxurious living room at night. 
Girls night out at home. Premium wellness experience. 4K cinematic quality."""
    },
    {
        "name": "scene6_shopping_minuit",
        "prompt": """Stylish young people shopping online on tablets and phones at midnight in a cozy modern apartment. 
Packages being delivered even at night by drone. 24/7 shopping convenience. 
E-commerce premium lifestyle. 4K cinematic quality."""
    },
    {
        "name": "scene7_medecin_domicile",
        "prompt": """Professional doctor in white coat making a house call to check on an elderly patient at home. 
Warm, caring interaction. Medical equipment, professional but friendly atmosphere. 
Premium healthcare at home service. 4K cinematic quality."""
    },
    {
        "name": "scene8_chef_maison",
        "prompt": """Professional chef cooking a gourmet meal in a beautiful modern home kitchen. 
Family watching with excitement. Flames, fresh ingredients, artistic plating. 
Private chef experience. Premium culinary service. 4K cinematic quality."""
    }
]

print("🎬 Début de la génération des scènes 'Le Monde Après Titelli'")
print(f"   Total: {len(scenes)} scènes à générer")
print("", flush=True)

for i, scene in enumerate(scenes):
    print(f"🎬 [{i+1}/{len(scenes)}] Génération: {scene['name']}...", flush=True)
    start_time = time.time()
    
    try:
        video_gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
        video_bytes = video_gen.text_to_video(
            prompt=scene['prompt'],
            model="sora-2",
            size="1280x720",
            duration=4,
            max_wait_time=600
        )
        
        if video_bytes:
            output_path = f"/app/backend/uploads/titelli_monde_{scene['name']}.mp4"
            video_gen.save_video(video_bytes, output_path)
            elapsed = time.time() - start_time
            print(f"   ✅ Terminé en {elapsed:.1f}s: {output_path}", flush=True)
        else:
            print(f"   ❌ Échec: {scene['name']}", flush=True)
    except Exception as e:
        print(f"   ❌ Erreur: {e}", flush=True)
    
    print("", flush=True)

print("🎬 Génération terminée!", flush=True)
print("", flush=True)
print("=== ASSEMBLAGE FINAL ===", flush=True)

# List all generated files
import subprocess
result = subprocess.run(['ls', '-la', '/app/backend/uploads/'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    if 'titelli_monde' in line:
        print(f"   {line}", flush=True)
