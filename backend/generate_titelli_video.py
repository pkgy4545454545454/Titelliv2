import asyncio
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

def generateVideo(prompt, output_path, model="sora-2", size="1280x720", duration=8):
    """Generate video with Sora 2"""
    video_gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
    
    print(f"🎬 Génération vidéo en cours...")
    print(f"   Prompt: {prompt[:100]}...")
    print(f"   Durée: {duration}s | Taille: {size}")
    
    video_bytes = video_gen.text_to_video(
        prompt=prompt,
        model=model,
        size=size,
        duration=duration,
        max_wait_time=600
    )
    
    if video_bytes:
        video_gen.save_video(video_bytes, output_path)
        return output_path
    return None


def main():
    # Prompt marketing pour Titelli - Marketplace Premium
    prompt = """
    Cinematic luxury marketing video for "Titelli" premium marketplace.
    
    Scene: Elegant black background with subtle gold particle effects floating in space.
    
    Sequence 1: Smooth camera movement through abstract golden light rays on deep black.
    
    Sequence 2: Luxury products appearing with gentle glow - jewelry, fashion items, beauty products - 
    floating and rotating elegantly with soft reflections.
    
    Sequence 3: Abstract visualization of connection - golden lines connecting dots representing 
    businesses and clients, forming a sophisticated network pattern.
    
    Sequence 4: The scene converges into a minimalist white "T" letter inside a thin white circle 
    (the Titelli logo) on black background, with golden particles swirling around it.
    
    Style: Ultra premium, sophisticated, cinematic lighting, smooth slow-motion movements, 
    black and gold color palette with subtle purple accents. High-end luxury brand aesthetic.
    """
    
    output_path = '/app/backend/uploads/titelli_marketing_video.mp4'
    
    # S'assurer que le dossier existe
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    result = generateVideo(prompt, output_path, model="sora-2", size="1280x720", duration=8)
    
    if result:
        print(f'✅ Vidéo sauvegardée: {result}')
        print(f'📁 Taille: {os.path.getsize(result) / 1024 / 1024:.2f} MB')
    else:
        print('❌ Échec de la génération vidéo')


if __name__ == "__main__":
    main()
