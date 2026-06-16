#!/usr/bin/env python3
"""
waldbingo.py – Waldbingo-Generator für Kinder.

Erzeugt ein PDF (DIN A4) mit 4 zufällig angeordneten 5×5-Bingokarten.
Jedes Feld enthält einen Waldbegriff mit passendem Strichicon.

Verwendung:
    python waldbingo.py                    # → waldbingo.pdf
    python waldbingo.py -o mein_bingo.pdf  # → mein_bingo.pdf
"""

import argparse
import copy
import random

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas as pdf_canvas

from icons import ICON_FUNCTIONS

# ──────────────────────────────────────────────────────────────────
# Begriffsliste (25 Stück – exakt passend für 5×5 ohne Freifeld)
# ──────────────────────────────────────────────────────────────────
BEGRIFFE = [
    "Spinnennetz",
    "Ameise",
    "Farn",
    "Schnecke",
    "Blatt",
    "Blume",
    "Steine",
    "Baumstumpf",
    "Baumrinde",
    "Eichel",
    "Tannenzapfen",
    "Kastanie",
    "Tierpfotenabdrücke",
    "Feder",
    "Eichhörnchen",
    "Käfer",
    "Vogel",
    "Tannenzweig",
    "Pilz",
    "Moos",
    "Brennnessel",
    "Bank",
    "Aussichtsturm",
    "Klee",
    "Biene",
]

assert len(BEGRIFFE) == 25, "Es werden exakt 25 Begriffe für ein 5×5-Bingo benötigt."

# ──────────────────────────────────────────────────────────────────
# Layout-Konstanten (alle Maße in Punkten, 1 mm ≈ 2.835 pt)
# ──────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4  # 595.28 × 841.89 pt (≈ 210 × 297 mm)

MARGIN = 12 * mm           # Seitenrand
CARD_GAP_X = 8 * mm        # Abstand zwischen Karten horizontal
CARD_GAP_Y = 8 * mm        # Abstand zwischen Karten vertikal

GRID_ROWS = 5
GRID_COLS = 5

# Verfügbarer Platz pro Karte
CARDS_PER_ROW = 2
CARDS_PER_COL = 2
CARD_W = (PAGE_W - 2 * MARGIN - (CARDS_PER_ROW - 1) * CARD_GAP_X) / CARDS_PER_ROW
CARD_H = (PAGE_H - 2 * MARGIN - (CARDS_PER_COL - 1) * CARD_GAP_Y) / CARDS_PER_COL

TITLE_H = 9 * mm            # Höhe des Titelbereichs pro Karte

CELL_W = CARD_W / GRID_COLS
CELL_H = (CARD_H - TITLE_H) / GRID_ROWS

# Icon- und Textaufteilung innerhalb einer Zelle
ICON_RATIO = 0.62           # Oberer Anteil für das Icon
TEXT_RATIO = 1 - ICON_RATIO  # Unterer Anteil für den Text

# Farben
C_TITLE_BG = HexColor("#2d6a4f")
C_TITLE_FG = white
C_CELL_BG = HexColor("#f8f9f0")
C_CELL_BORDER = HexColor("#6b8f71")
C_HEADER_LINE = HexColor("#2d6a4f")

# ──────────────────────────────────────────────────────────────────
# Hilfsfunktionen
# ──────────────────────────────────────────────────────────────────

def _register_fonts():
    """Versuche eine kindgerechte Schrift zu laden; Fallback auf Helvetica."""
    # Helvetica ist bei reportlab immer verfügbar
    pass


def _font_size_for_text(text: str, max_width: float, base_size: float = 6.5) -> float:
    """Verkleinere die Schrift, damit der Text in max_width passt."""
    size = base_size
    # Grobes Maß: 0.5 × Fontgröße pro Zeichen (Helvetica ist ~proportional)
    while size > 3.5:
        approx_width = len(text) * size * 0.48
        if approx_width <= max_width:
            return size
        size -= 0.3
    return size


def _draw_title(c, x, y, w, h, card_nr: int):
    """Zeichnet den Kartenheader 'Waldbingo'."""
    # Hintergrund
    c.saveState()
    c.setFillColor(C_TITLE_BG)
    c.setStrokeColor(C_TITLE_BG)
    c.roundRect(x, y, w, h, radius=2.5 * mm, stroke=1, fill=1)
    # Text
    c.setFillColor(C_TITLE_FG)
    c.setFont("Helvetica-Bold", 10)
    title = "\U0001F332  Waldbingo  \U0001F332"
    c.drawCentredString(x + w / 2, y + h * 0.28, title)
    c.setFont("Helvetica", 5.5)
    c.drawCentredString(x + w / 2, y + h * 0.02, f"Karte {card_nr}")
    c.restoreState()


def _draw_cell(c, x, y, w, h, begriff: str):
    """Zeichnet eine einzelne Bingozelle (Icon + Text)."""
    # Zellhintergrund
    c.saveState()
    c.setFillColor(C_CELL_BG)
    c.setStrokeColor(C_CELL_BORDER)
    c.setLineWidth(0.5)
    c.rect(x, y, w, h, stroke=1, fill=1)

    # ── Icon ──
    icon_h = h * ICON_RATIO
    icon_area_cy = y + h * TEXT_RATIO + icon_h / 2  # Mitte des Icon-Bereichs
    icon_size = min(w, icon_h) * 0.85
    draw_fn = ICON_FUNCTIONS.get(begriff)
    if draw_fn:
        c.saveState()
        draw_fn(c, x + w / 2, icon_area_cy, icon_size)
        c.restoreState()

    # ── Text ──
    text_area_h = h * TEXT_RATIO
    text_cy = y + text_area_h / 2
    font_size = _font_size_for_text(begriff, w - 2 * mm)
    c.setFillColor(black)
    c.setFont("Helvetica", font_size)
    c.drawCentredString(x + w / 2, text_cy - font_size * 0.3, begriff)

    c.restoreState()


def _draw_card(c, origin_x, origin_y, begriffe: list, card_nr: int):
    """Zeichnet eine komplette 5×5-Bingokarte."""
    # Titel
    _draw_title(c, origin_x, origin_y + CARD_H - TITLE_H, CARD_W, TITLE_H, card_nr)

    # Grid (von oben nach unten, links nach rechts)
    grid_top = origin_y + CARD_H - TITLE_H
    for row in range(GRID_ROWS):
        for col in range(GRID_COLS):
            idx = row * GRID_COLS + col
            cell_x = origin_x + col * CELL_W
            cell_y = grid_top - (row + 1) * CELL_H
            _draw_cell(c, cell_x, cell_y, CELL_W, CELL_H, begriffe[idx])


def _card_positions():
    """Liefert die (x, y)-Ursprünge der 4 Karten im 2×2-Raster."""
    positions = []
    for row in range(CARDS_PER_COL):      # 0 = oben, 1 = unten
        for col in range(CARDS_PER_ROW):   # 0 = links, 1 = rechts
            x = MARGIN + col * (CARD_W + CARD_GAP_X)
            y = PAGE_H - MARGIN - (row + 1) * CARD_H - row * CARD_GAP_Y
            positions.append((x, y))
    return positions


# ──────────────────────────────────────────────────────────────────
# Hauptfunktion
# ──────────────────────────────────────────────────────────────────

def generate_bingo_pdf(output_path: str = "waldbingo.pdf", seed: int | None = None):
    """Erzeugt das Waldbingo-PDF mit 4 Karten auf einer DIN-A4-Seite."""
    if seed is not None:
        random.seed(seed)

    c = pdf_canvas.Canvas(output_path, pagesize=A4)
    c.setTitle("Waldbingo")
    c.setAuthor("Waldbingo-Generator")

    _register_fonts()

    positions = _card_positions()

    for i, (px, py) in enumerate(positions, start=1):
        shuffled = copy.copy(BEGRIFFE)
        random.shuffle(shuffled)
        _draw_card(c, px, py, shuffled, card_nr=i)

    c.save()
    print(f"✅  Waldbingo-PDF erstellt: {output_path}")
    print("    → 4 Karten, je 5×5 = 25 Felder, zufällig angeordnet")


# ──────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Waldbingo-Generator – erstellt ein PDF mit 4 zufälligen Bingokarten."
    )
    parser.add_argument(
        "-o", "--output",
        default="waldbingo.pdf",
        help="Ausgabedatei (Standard: waldbingo.pdf)",
    )
    parser.add_argument(
        "-s", "--seed",
        type=int,
        default=None,
        help="Zufallsseed für reproduzierbare Karten (optional)",
    )
    args = parser.parse_args()
    generate_bingo_pdf(output_path=args.output, seed=args.seed)


if __name__ == "__main__":
    main()
