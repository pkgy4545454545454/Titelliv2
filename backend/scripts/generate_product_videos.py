import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.abspath('/app/backend'))

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

# Load environment variables
load_dotenv('/app/backend/.env')

# Product category video prompts - cinematic, no people, looping backgrounds
PRODUCT_CATEGORY_PROMPTS = {
    'courses_alimentaires': 'Cinematic slow motion of fresh organic fruits and vegetables on a wooden market table, golden hour lighting, vibrant colors, no people, seamless loop, 4K quality',
    'vetements_mode': 'Elegant fashion boutique interior with luxury clothing on racks, soft ambient lighting, fabric textures, camera slowly panning, no people, seamless loop',
    'enfant': 'Colorful children toys and educational materials arranged beautifully, soft pastel colors, gentle camera movement, no people, seamless loop, warm lighting',
    'soins': 'Spa and wellness products arrangement, white towels, natural skincare bottles, bamboo elements, zen atmosphere, soft lighting, no people, seamless loop',
    'maquillage_beaute': 'Luxury makeup and beauty products displayed elegantly, lipsticks, eyeshadow palettes, brushes, glamorous lighting, no people, seamless loop',
    'sport': 'Professional sports equipment in a modern gym setting, dumbbells, fitness gear, dynamic lighting, no people, camera slowly moving, seamless loop',
    'loisirs': 'Board games, books, and leisure items arranged artistically, cozy atmosphere, warm lighting, no people, gentle camera movement, seamless loop',
    'voyages': 'Travel essentials - luggage, passport, camera, map - arranged on a wooden surface, adventure mood, golden lighting, no people, seamless loop',
    'electronique': 'Modern electronics and gadgets displayed on a sleek surface, smartphones, headphones, tablets, blue ambient lighting, no people, seamless loop',
    'bureautique': 'Elegant office supplies and stationery arrangement, notebooks, pens, modern desk accessories, clean minimalist style, no people, seamless loop',
    'electromenager': 'Modern kitchen appliances in a contemporary kitchen, stainless steel, clean lines, soft ambient lighting, no people, seamless loop',
    'ameublement': 'Luxury interior design showcase, elegant furniture, home decor items, warm ambient lighting, no people, camera slowly panning, seamless loop',
    'artisanal': 'Handcrafted artisan products, ceramics, textiles, wooden items, workshop atmosphere, natural lighting, no people, seamless loop',
    'bricolage': 'Professional tools and gardening equipment arranged neatly, workshop setting, organized, warm lighting, no people, seamless loop',
    'immobilier': 'Luxury real estate exterior, beautiful modern house with garden, golden hour, architectural details, no people, aerial slow movement, seamless loop',
    'automobiles': 'Luxury car showroom, sleek vehicle details, chrome reflections, premium atmosphere, no people, camera slowly circling, seamless loop',
    'securite_produits': 'Security equipment display, cameras, locks, safety devices, professional setting, blue ambient lighting, no people, seamless loop',
    'animaux': 'Pet supplies and accessories arrangement, colorful toys, food bowls, beds, warm cozy atmosphere, no people, seamless loop',
    'professionnel': 'Professional business equipment and tools, briefcases, devices, office setting, sophisticated atmosphere, no people, seamless loop',
    'metaux_precieux': 'Gold bars and precious metals display, luxury vault atmosphere, dramatic lighting, gleaming surfaces, no people, seamless loop',
    'joaillerie': 'Exquisite jewelry pieces, diamonds, gold necklaces, elegant display, dramatic spotlight lighting, no people, camera slowly rotating, seamless loop',
    'montres': 'Luxury watches collection display, intricate watch faces, leather straps, premium showcase, dramatic lighting, no people, seamless loop',
}

def generate_video(prompt, output_path, model="sora-2", size="1280x720", duration=4):
    """Generate video with Sora 2"""
    try:
        video_gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
        
        print(f"  Generating video... (this may take 2-5 minutes)")
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
    except Exception as e:
        print(f"  Error: {e}")
        return None

def main():
    # Output directory
    output_dir = '/app/frontend/public/videos'
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate videos for each category
    total = len(PRODUCT_CATEGORY_PROMPTS)
    success_count = 0
    
    print(f"\n{'='*60}")
    print(f"Generating {total} product category videos with Sora 2")
    print(f"{'='*60}\n")
    
    for i, (category_key, prompt) in enumerate(PRODUCT_CATEGORY_PROMPTS.items(), 1):
        output_path = f"{output_dir}/{category_key}.mp4"
        
        # Skip if video already exists
        if os.path.exists(output_path):
            print(f"[{i}/{total}] {category_key}: Already exists, skipping")
            success_count += 1
            continue
        
        print(f"\n[{i}/{total}] Generating: {category_key}")
        print(f"  Prompt: {prompt[:80]}...")
        
        result = generate_video(prompt, output_path)
        
        if result:
            print(f"  ✅ Saved to: {result}")
            success_count += 1
        else:
            print(f"  ❌ Failed to generate")
    
    print(f"\n{'='*60}")
    print(f"Complete! {success_count}/{total} videos generated successfully")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
