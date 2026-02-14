from reportlab.lib.pagesizes import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color, black, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Business card dimensions (standard: 85mm x 55mm)
CARD_WIDTH = 85 * mm
CARD_HEIGHT = 55 * mm

# Colors
BLACK_BG = Color(0.05, 0.05, 0.05)  # Near black
GOLD_TEXT = Color(0.75, 0.72, 0.55)  # Gold/champagne color for NOM
LIGHT_TEXT = Color(0.6, 0.6, 0.6)  # Light gray for other text
WHITE = Color(1, 1, 1)

def draw_geometric_pattern(c, width, height):
    """Draw subtle geometric pattern on black background"""
    c.setFillColor(BLACK_BG)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Draw subtle geometric pattern (darker lines on black)
    pattern_color = Color(0.12, 0.12, 0.12)
    c.setStrokeColor(pattern_color)
    c.setLineWidth(0.3)
    
    # Create interlocking geometric pattern
    spacing = 4 * mm
    for x in range(0, int(width / spacing) + 2):
        for y in range(0, int(height / spacing) + 2):
            px = x * spacing
            py = y * spacing
            # Draw small geometric shapes
            c.rect(px, py, spacing * 0.6, spacing * 0.6, fill=0, stroke=1)
            c.rect(px + spacing * 0.2, py + spacing * 0.2, spacing * 0.4, spacing * 0.4, fill=0, stroke=1)

def draw_logo_placeholder(c, x, y, size):
    """Draw white logo placeholder square"""
    c.setFillColor(WHITE)
    c.roundRect(x, y, size, size, 2, fill=1, stroke=0)
    
    # Draw simple image icon inside
    c.setFillColor(Color(0.7, 0.7, 0.7))
    icon_margin = size * 0.25
    icon_size = size * 0.5
    
    # Mountain/image icon shape
    c.setStrokeColor(Color(0.5, 0.5, 0.5))
    c.setLineWidth(1)
    
    # Rectangle outline
    c.rect(x + icon_margin, y + icon_margin, icon_size, icon_size, fill=0, stroke=1)
    
    # Small circle (sun)
    c.circle(x + icon_margin + icon_size * 0.3, y + icon_margin + icon_size * 0.7, icon_size * 0.12, fill=1, stroke=0)
    
    # Mountain shape
    path = c.beginPath()
    path.moveTo(x + icon_margin, y + icon_margin + icon_size * 0.2)
    path.lineTo(x + icon_margin + icon_size * 0.4, y + icon_margin + icon_size * 0.6)
    path.lineTo(x + icon_margin + icon_size * 0.6, y + icon_margin + icon_size * 0.35)
    path.lineTo(x + icon_margin + icon_size, y + icon_margin + icon_size * 0.2)
    c.drawPath(path, fill=0, stroke=1)

def create_business_card(output_path):
    """Create the business card PDF"""
    c = canvas.Canvas(output_path, pagesize=(CARD_WIDTH, CARD_HEIGHT))
    
    # Draw background with pattern
    draw_geometric_pattern(c, CARD_WIDTH, CARD_HEIGHT)
    
    # Draw logo placeholder (top right)
    logo_size = 10 * mm
    logo_x = CARD_WIDTH - logo_size - 5 * mm
    logo_y = CARD_HEIGHT - logo_size - 5 * mm
    draw_logo_placeholder(c, logo_x, logo_y, logo_size)
    
    # Text positioning
    left_margin = 8 * mm
    
    # NOM - Main name (gold, larger, spaced letters)
    c.setFillColor(GOLD_TEXT)
    c.setFont("Helvetica", 14)
    nom_y = CARD_HEIGHT - 25 * mm
    # Draw with letter spacing
    nom_text = "N O M"
    c.drawString(left_margin, nom_y, nom_text)
    
    # TITRE PROFESSIONNEL (light gray, smaller, spaced)
    c.setFillColor(LIGHT_TEXT)
    c.setFont("Helvetica-Light", 8)
    titre_y = nom_y - 5 * mm
    c.drawString(left_margin, titre_y, "T I T R E   P R O F E S S I O N N E L")
    
    # email / autre (right side, upper)
    c.setFont("Helvetica", 6)
    email_x = CARD_WIDTH - 30 * mm
    email_y = titre_y - 2 * mm
    c.drawString(email_x, email_y, "email / autre")
    
    # @reseauxsociaux (right side, below email)
    social_y = email_y - 4 * mm
    c.drawString(email_x, social_y, "@reseauxsociaux")
    
    # téléphone / autre (bottom left)
    bottom_y = 12 * mm
    c.drawString(left_margin, bottom_y, "téléphone / autre")
    
    # site web / autre (below phone)
    c.drawString(left_margin, bottom_y - 4 * mm, "site web / autre")
    
    c.save()
    print(f"Business card created: {output_path}")
    return output_path

if __name__ == "__main__":
    output_dir = "/app/backend/uploads"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "carte_visite_noire.pdf")
    create_business_card(output_path)
