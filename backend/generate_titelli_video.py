import os
import sys
import time

# Set environment variable directly
os.environ['EMERGENT_LLM_KEY'] = 'sk-emergent-f7b660f6d3b5fA5846'

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

scenes = [
    {
        "name": "scene3_chauffeur",
        "prompt": """Elegant chauffeur in uniform opening the door of a luxury black Mercedes for a well-dressed professional. 
Beautiful Swiss city street with Alps in background. Morning commute in style. 
Premium transportation service advertisement. 4K cinematic quality."""
    },
    {
        "name": "scene4_formation",
        "prompt": """Young professional attending an online course on a tablet in a modern bright coworking space. 
Engaged learning, taking notes, looking inspired. Lifelong learning concept. 
Premium education and training services. 4K cinematic quality."""
    },
    {
        "name": "scene5_artisan",
        "prompt": """Artisan craftsman carefully packaging beautiful handmade products in elegant boxes for delivery. 
Small business owner preparing orders. Warm workshop atmosphere with natural light.
Local artisan delivery service. 4K cinematic quality."""
    },
    {
        "name": "scene6_livraison_panier",
        "prompt": """Happy mother at home door receiving a beautiful gourmet food basket delivery from a friendly delivery person. 
She pays contactless with her phone, smiling. Warm family home atmosphere.
Premium grocery delivery service. 4K cinematic quality."""
    },
    {
        "name": "scene7_soiree_copines",
        "prompt": """Group of elegant women friends enjoying a home spa night with professional beauticians giving manicures and facials. 
Candles, champagne glasses, relaxed atmosphere. Luxurious living room at night.
Premium home wellness party. 4K cinematic quality."""
    },
    {
        "name": "scene8_shopping_minuit",
        "prompt": """Young stylish people shopping online on glowing tablets and phones at midnight in cozy modern apartment. 
Delivery drone arriving at the window with packages. 24/7 convenience lifestyle.
E-commerce midnight shopping. 4K cinematic quality."""
    },
    {
        "name": "scene9_theatre_maison",
        "prompt": """Small private theater performance in an elegant living room. Professional actors performing for a family.
Dramatic lighting, captivated audience on luxury sofas. Intimate cultural experience.
Premium home entertainment service. 4K cinematic quality."""
    },
    {
        "name": "scene10_medecin",
        "prompt": """Professional doctor in white coat making a house call, examining elderly patient with care.
Modern medical equipment, warm caring interaction. Family members watching gratefully.
Premium home healthcare service. 4K cinematic quality."""
    },
    {
        "name": "scene11_chef",
        "prompt": """Professional chef in white uniform cooking gourmet meal in modern home kitchen.
Family watching with excitement as flames rise. Fresh ingredients, artistic plating.
Private chef home cooking experience. 4K cinematic quality."""
    },
    {
        "name": "scene12_personnes_agees",
        "prompt": """Kind caregiver helping elegant elderly person walk in beautiful garden.
Wheelchair nearby, gentle support, peaceful outdoor setting with flowers.
Premium elderly care and companionship service. 4K cinematic quality."""
    },
    {
        "name": "scene13_travaux",
        "prompt": """Professional handyman in clean uniform fixing details in beautiful modern home.
Homeowner watching satisfied. Quality tools, attention to detail, premium service.
Home improvement specialist service. 4K cinematic quality."""
    },
    {
        "name": "scene14_finale",
        "prompt": """Happy diverse people enjoying life in beautiful Swiss city. Morning joggers, coffee shops, families.
Everyone well-dressed, relaxed, smiling. Golden hour sunlight. Life made easier.
Utopian lifestyle, premium services everywhere. 4K cinematic quality."""
    }
]

print("🎬 GÉNÉRATION VIDÉO 'LE MONDE APRÈS TITELLI'")
print(f"   Total: {len(scenes)} nouvelles scènes à générer")
print("   (Les scènes 1-2 sont déjà générées)")
print("", flush=True)

generated_count = 0
failed_count = 0

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
            generated_count += 1
        else:
            print(f"   ❌ Échec: {scene['name']}", flush=True)
            failed_count += 1
    except Exception as e:
        print(f"   ❌ Erreur: {e}", flush=True)
        failed_count += 1
    
    print("", flush=True)

print("", flush=True)
print("═" * 60, flush=True)
print(f"🎬 GÉNÉRATION TERMINÉE: {generated_count} réussies, {failed_count} échecs", flush=True)
print("═" * 60, flush=True)
