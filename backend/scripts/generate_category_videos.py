#!/usr/bin/env python3
"""
Script to generate cinematic category videos using Sora 2
Categories: Personnel de maison, Soins esthétiques, Coiffeurs, Cours de sport, 
            Activités, Professionnels de santé, Agent immobilier, Sécurité
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

# Output directory
OUTPUT_DIR = '/app/backend/uploads/category_videos'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Category video prompts - cinematic, professional, atmospheric, NO PEOPLE
CATEGORY_PROMPTS = {
    'personnel_maison': {
        'filename': 'personnel_maison.mp4',
        'prompt': 'Cinematic slow motion shot of a pristine luxury home interior, sunlight streaming through windows onto polished hardwood floors, elegant furniture, fresh flowers in a vase, dust particles floating in golden light, empty peaceful atmosphere, high-end real estate video style, no people, 4K quality'
    },
    'soins_esthetiques': {
        'filename': 'soins_esthetiques.mp4',
        'prompt': 'Elegant spa interior with soft ambient lighting, white marble surfaces, beauty products artfully arranged, rose petals floating in a bowl of water, steam rising gently, candles flickering, serene empty luxury spa atmosphere, cinematic beauty commercial style, no people, 4K quality'
    },
    'coiffeurs': {
        'filename': 'coiffeurs.mp4',
        'prompt': 'Modern high-end hair salon interior, dramatic lighting on styling tools, scissors and combs arranged artistically, mirrors reflecting soft neon lights, hairdryers and professional equipment, sleek minimalist design, empty salon atmosphere, cinematic commercial style, no people, 4K quality'
    },
    'cours_sport': {
        'filename': 'cours_sport.mp4',
        'prompt': 'Dynamic empty fitness studio with dramatic lighting, yoga mats arranged in rows, dumbbells and kettlebells on racks, morning sunlight through large windows, energy and movement suggested by floating dust particles, modern gym atmosphere, cinematic sports commercial style, no people, 4K quality'
    },
    'activites': {
        'filename': 'activites.mp4',
        'prompt': 'Vibrant entertainment venue interior, colorful lights reflecting on surfaces, game equipment and activity props, bowling lanes or arcade machines glowing, festive empty atmosphere with anticipation, cinematic commercial style, no people, 4K quality'
    },
    'professionnels_sante': {
        'filename': 'professionnels_sante.mp4',
        'prompt': 'Clean modern medical clinic interior, pristine white surfaces, medical equipment with soft blue LED indicators, stethoscope on desk, calming empty healthcare environment, professional and trustworthy atmosphere, cinematic medical commercial style, no people, 4K quality'
    },
    'agent_immobilier': {
        'filename': 'agent_immobilier.mp4',
        'prompt': 'Stunning luxury property showcase, drone-style shot moving through an empty elegant living room, floor-to-ceiling windows with city skyline view, modern architecture, golden hour lighting, high-end real estate video style, cinematic property tour, no people, 4K quality'
    },
    'securite': {
        'filename': 'securite.mp4',
        'prompt': 'Professional security control room, multiple monitors displaying camera feeds, blue LED lighting, high-tech surveillance equipment, sleek modern security operations center, protective and professional atmosphere, cinematic corporate style, no people, 4K quality'
    }
}

def generate_video(category_key, prompt_data):
    """Generate a single category video"""
    print(f"\n{'='*60}")
    print(f"Generating video for: {category_key}")
    print(f"{'='*60}")
    
    output_path = os.path.join(OUTPUT_DIR, prompt_data['filename'])
    
    # Skip if video already exists
    if os.path.exists(output_path):
        print(f"✅ Video already exists: {output_path}")
        return output_path
    
    try:
        # Create new instance for each video
        video_gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
        
        print(f"Prompt: {prompt_data['prompt'][:100]}...")
        print("Generating video (this may take 2-5 minutes)...")
        
        video_bytes = video_gen.text_to_video(
            prompt=prompt_data['prompt'],
            model="sora-2",
            size="1280x720",
            duration=4,  # 4 seconds for quick loading
            max_wait_time=600
        )
        
        if video_bytes:
            video_gen.save_video(video_bytes, output_path)
            print(f"✅ Video saved to: {output_path}")
            return output_path
        else:
            print(f"❌ Failed to generate video for {category_key}")
            return None
            
    except Exception as e:
        print(f"❌ Error generating video for {category_key}: {str(e)}")
        return None

def main():
    print("="*60)
    print("CATEGORY VIDEO GENERATION - SORA 2")
    print("="*60)
    
    # Check for specific category argument
    if len(sys.argv) > 1:
        category = sys.argv[1]
        if category in CATEGORY_PROMPTS:
            generate_video(category, CATEGORY_PROMPTS[category])
        else:
            print(f"Unknown category: {category}")
            print(f"Available categories: {list(CATEGORY_PROMPTS.keys())}")
    else:
        # Generate all videos
        results = {}
        for category_key, prompt_data in CATEGORY_PROMPTS.items():
            result = generate_video(category_key, prompt_data)
            results[category_key] = result
        
        # Summary
        print("\n" + "="*60)
        print("GENERATION SUMMARY")
        print("="*60)
        for category, path in results.items():
            status = "✅" if path else "❌"
            print(f"{status} {category}: {path or 'FAILED'}")

if __name__ == "__main__":
    main()
