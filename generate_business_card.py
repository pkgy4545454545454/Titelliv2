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

def draw_black_background(c, width, height):
    """Draw solid black background"""
    c.setFillColor(black)
    c.rect(0, 0, width, height, fill=1, stroke=0)

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
    
    # Draw solid black background
    draw_black_background(c, CARD_WIDTH, CARD_HEIGHT)
    
    # Text positioning (matching original layout)
    left_margin = 8 * mm
    
    # NOM - Main name (gold, larger, spaced letters) - positioned left, middle-ish
    c.setFillColor(GOLD_TEXT)
    c.setFont("Helvetica", 14)
    nom_y = CARD_HEIGHT - 28 * mm
    nom_text = "N O M"
    c.drawString(left_margin, nom_y, nom_text)
    
    # TITRE PROFESSIONNEL (light gray, smaller, spaced) - right next to NOM
    c.setFillColor(LIGHT_TEXT)
    c.setFont("Helvetica", 7)
    titre_y = nom_y - 5 * mm
    c.drawString(left_margin, titre_y, "T I T R E   P R O F E S S I O N N E L")
    
    # email / autre (right side, aligned with title area)
    c.setFont("Helvetica", 6)
    email_x = CARD_WIDTH - 25 * mm
    email_y = nom_y
    c.drawString(email_x, email_y, "email / autre")
    
    # @reseauxsociaux (right side, below email)
    social_y = email_y - 4 * mm
    c.drawString(email_x, social_y, "@reseauxsociaux")
    
    # téléphone / autre (bottom left)
    bottom_y = 10 * mm
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
