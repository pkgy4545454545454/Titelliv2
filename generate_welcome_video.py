#!/usr/bin/env python3
"""
Génération vidéo d'accueil Titelli - Couple sur ponton avec vue Lausanne
"""

import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(''))

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

load_dotenv('/app/backend/.env')

def generate_welcome_video():
    """Génère la vidéo d'accueil avec couple vue sur Lausanne"""
    
    prompt = """Cinematic shot of a romantic couple sitting together on a wooden ponton terrace overlooking Lake Geneva (Lac Léman) with the city of Lausanne and Swiss Alps mountains in the background. 
    
    The couple is elegantly dressed, enjoying a moment together, looking at the beautiful view. Warm golden hour lighting, soft sunset colors reflecting on the lake water. 
    
    The camera slowly moves forward towards them. Professional cinematic quality, shallow depth of field, romantic atmosphere. Swiss lakeside setting, luxury lifestyle aesthetic.
    
    4K quality, smooth motion, natural colors."""
    
    output_path = '/app/backend/uploads/video_accueil_couple_lausanne.mp4'
    
    print("🎬 Génération de la vidéo d'accueil avec couple...")
    print(f"📍 Vue sur Lausanne depuis le ponton")
    
    video_gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
    
    video_bytes = video_gen.text_to_video(
        prompt=prompt,
        model="sora-2",
        size="1792x1024",  # Format cinématique widescreen
        duration=8,  # 8 secondes pour une belle intro
        max_wait_time=900
    )
    
    if video_bytes:
        video_gen.save_video(video_bytes, output_path)
        print(f"✅ Vidéo générée avec succès: {output_path}")
        return output_path
    else:
        print("❌ Échec de la génération vidéo")
        return None


if __name__ == "__main__":
    result = generate_welcome_video()
    if result:
        print(f"\n🔗 Lien: https://titelli-revenue.preview.emergentagent.com/api/uploads/video_accueil_couple_lausanne.mp4")
