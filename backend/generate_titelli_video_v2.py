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
    # Prompt marketing pour Titelli avec fin logo style "final"
    prompt = """
    Cinematic luxury marketing video for premium marketplace brand.
    
    Opening: Deep black background with elegant golden particles slowly floating and swirling.
    
    Middle sequence: Smooth transitions showing abstract luxury elements - soft golden light rays, 
    premium textures, elegant reflections. High-end sophisticated aesthetic with black and gold tones.
    
    Climax: Golden particles start converging toward the center of the screen.
    
    Finale: A mesmerizing glass orb appears on pure black background. Inside the orb, a beautiful 
    nebula of swirling colors - vibrant pink, magenta, deep purple, electric blue, and cyan - 
    rotates gracefully in a circular motion. The colors dance and flow like liquid light, 
    creating hypnotic patterns. The swirling colors slowly converge toward the bright center, 
    then elegantly dissolve to reveal a clean, minimalist white "T" letter inside a thin white 
    circle - the final logo mark on black.
    
    Style: Ultra premium, sophisticated, cinematic, smooth slow-motion, black background dominant.
    """
    
    output_path = '/app/backend/uploads/titelli_presentation_v2.mp4'
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    result = generateVideo(prompt, output_path, model="sora-2", size="1280x720", duration=8)
    
    if result:
        print(f'✅ Vidéo sauvegardée: {result}')
        print(f'📁 Taille: {os.path.getsize(result) / 1024 / 1024:.2f} MB')
    else:
        print('❌ Échec de la génération vidéo')


if __name__ == "__main__":
    main()
