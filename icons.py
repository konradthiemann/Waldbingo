"""
icons.py – Strichicon-Zeichenfunktionen für den Waldbingo-Generator.

Jede Funktion zeichnet ein minimalistisches Icon mit reportlab-Canvas-Primitiven.
Signatur: draw_<name>(c, cx, cy, size)
  c    – reportlab Canvas
  cx   – X-Mittelpunkt der Icon-Fläche
  cy   – Y-Mittelpunkt der Icon-Fläche
  size – verfügbare Kantenlänge (Quadrat) für das Icon
"""

import math
from reportlab.lib.colors import HexColor

# ---------------------------------------------------------------------------
# Farben (waldtypisch, kindgerecht)
# ---------------------------------------------------------------------------
C_GREEN = HexColor("#3a7d44")
C_DARK_GREEN = HexColor("#2d5a27")
C_BROWN = HexColor("#6b4226")
C_DARK_BROWN = HexColor("#4a2e14")
C_GREY = HexColor("#555555")
C_LIGHT_GREY = HexColor("#888888")
C_RED = HexColor("#c0392b")
C_ORANGE = HexColor("#d35400")
C_YELLOW = HexColor("#f1c40f")
C_BLACK = HexColor("#222222")
C_BLUE = HexColor("#2980b9")
C_PURPLE = HexColor("#7d3c98")
C_PINK = HexColor("#e84393")


def _setup(c, color=C_BLACK, width=0.8):
    """Standardmäßige Stricheinstellungen."""
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.setLineCap(1)  # round cap
    c.setLineJoin(1)  # round join


def _fill(c, color):
    c.setFillColor(color)


# ================================================================
# 1. Spinnennetz
# ================================================================
def draw_spinnennetz(c, cx, cy, size):
    s = size * 0.42
    _setup(c, C_GREY, 0.6)
    # Radiallinien
    for i in range(8):
        angle = math.radians(i * 45)
        c.line(cx, cy, cx + s * math.cos(angle), cy + s * math.sin(angle))
    # Konzentrische Ringe (als Polygone)
    for r in [0.3, 0.6, 0.9]:
        pts = []
        for i in range(8):
            angle = math.radians(i * 45)
            pts.append((cx + s * r * math.cos(angle), cy + s * r * math.sin(angle)))
        p = c.beginPath()
        p.moveTo(*pts[0])
        for pt in pts[1:]:
            p.lineTo(*pt)
        p.close()
        c.drawPath(p, stroke=1, fill=0)


# ================================================================
# 2. Ameise
# ================================================================
def draw_ameise(c, cx, cy, size):
    s = size * 0.12
    _setup(c, C_DARK_BROWN, 0.7)
    _fill(c, C_DARK_BROWN)
    # 3 Körperteile (Kopf, Thorax, Abdomen)
    c.circle(cx - 2.2 * s, cy, s * 0.7, stroke=1, fill=1)
    c.circle(cx, cy, s * 0.9, stroke=1, fill=1)
    c.circle(cx + 2.5 * s, cy, s * 1.1, stroke=1, fill=1)
    # 6 Beine
    _setup(c, C_DARK_BROWN, 0.6)
    for sign in [-1, 1]:
        for offset in [-0.5 * s, 0.3 * s, 1.1 * s]:
            bx = cx + offset
            c.line(bx, cy, bx + sign * 1.2 * s, cy - 1.8 * s)
    # Fühler
    c.line(cx - 2.6 * s, cy + 0.5 * s, cx - 3.5 * s, cy + 2 * s)
    c.line(cx - 2.0 * s, cy + 0.5 * s, cx - 1.5 * s, cy + 2 * s)


# ================================================================
# 3. Farn
# ================================================================
def draw_farn(c, cx, cy, size):
    s = size * 0.4
    _setup(c, C_GREEN, 0.8)
    # Hauptstiel
    base_y = cy - s
    top_y = cy + s
    c.line(cx, base_y, cx, top_y)
    # Fiedern (symmetrisch)
    n = 7
    for i in range(n):
        t = (i + 1) / (n + 1)
        y = base_y + t * (top_y - base_y)
        length = s * 0.5 * (1 - t * 0.6)
        angle = 55
        rad = math.radians(angle)
        dx = length * math.cos(rad)
        dy = length * math.sin(rad)
        c.line(cx, y, cx + dx, y + dy)
        c.line(cx, y, cx - dx, y + dy)


# ================================================================
# 4. Schnecke
# ================================================================
def draw_schnecke(c, cx, cy, size):
    s = size * 0.35
    _setup(c, C_BROWN, 0.8)
    # Spirale (Schneckenhaus)
    p = c.beginPath()
    turns = 2.5
    steps = 60
    started = False
    for i in range(steps + 1):
        angle = turns * 2 * math.pi * i / steps
        r = s * 0.1 + s * 0.35 * (i / steps)
        px = cx + 0.15 * s + r * math.cos(angle)
        py = cy + 0.1 * s + r * math.sin(angle)
        if not started:
            p.moveTo(px, py)
            started = True
        else:
            p.lineTo(px, py)
    c.drawPath(p, stroke=1, fill=0)
    # Körper
    body_x = cx - s * 0.6
    p2 = c.beginPath()
    p2.moveTo(cx - 0.1 * s, cy - 0.2 * s)
    p2.curveTo(cx - 0.4 * s, cy - 0.5 * s, cx - 0.8 * s, cy - 0.5 * s, body_x, cy - 0.2 * s)
    c.drawPath(p2, stroke=1, fill=0)
    # Fühler
    c.line(body_x, cy - 0.1 * s, body_x - 0.2 * s, cy + 0.3 * s)
    c.line(body_x + 0.15 * s, cy - 0.05 * s, body_x + 0.05 * s, cy + 0.3 * s)
    # Augen (kleine Punkte an Fühlerenden)
    _fill(c, C_BROWN)
    c.circle(body_x - 0.2 * s, cy + 0.3 * s, 0.06 * s, stroke=0, fill=1)
    c.circle(body_x + 0.05 * s, cy + 0.3 * s, 0.06 * s, stroke=0, fill=1)


# ================================================================
# 5. Blatt
# ================================================================
def draw_blatt(c, cx, cy, size):
    s = size * 0.4
    _setup(c, C_GREEN, 0.8)
    # Blattumriss per Bézier
    p = c.beginPath()
    p.moveTo(cx, cy - s)
    p.curveTo(cx + s * 0.8, cy - s * 0.3, cx + s * 0.8, cy + s * 0.5, cx, cy + s)
    p.curveTo(cx - s * 0.8, cy + s * 0.5, cx - s * 0.8, cy - s * 0.3, cx, cy - s)
    _fill(c, HexColor("#a8e6a3"))
    c.drawPath(p, stroke=1, fill=1)
    # Mittelrippe
    _setup(c, C_DARK_GREEN, 0.6)
    c.line(cx, cy - s * 0.85, cx, cy + s * 0.85)
    # Seitenadern
    for i in range(1, 5):
        t = i / 5
        y = cy - s * 0.85 + t * s * 1.7
        w = s * 0.25 * (1 - abs(t - 0.5) * 1.2)
        c.line(cx, y, cx + w, y + s * 0.1)
        c.line(cx, y, cx - w, y + s * 0.1)


# ================================================================
# 6. Blume
# ================================================================
def draw_blume(c, cx, cy, size):
    s = size * 0.38
    # Stiel (leicht geschwungen)
    _setup(c, C_GREEN, 0.9)
    p_stiel = c.beginPath()
    p_stiel.moveTo(cx, cy - s * 0.95)
    p_stiel.curveTo(cx - s * 0.05, cy - s * 0.5, cx + s * 0.05, cy - s * 0.2, cx, cy + s * 0.05)
    c.drawPath(p_stiel, stroke=1, fill=0)
    # Kleine Blätter am Stiel
    _setup(c, C_GREEN, 0.6)
    _fill(c, HexColor("#66bb6a"))
    for (leaf_y, leaf_sign) in [(-0.4, 1), (-0.6, -1)]:
        lp = c.beginPath()
        lx = cx + leaf_sign * s * 0.02
        ly = cy + s * leaf_y
        lp.moveTo(lx, ly)
        lp.curveTo(lx + leaf_sign * s * 0.2, ly + s * 0.1,
                   lx + leaf_sign * s * 0.22, ly - s * 0.05,
                   lx + leaf_sign * s * 0.08, ly - s * 0.12)
        lp.curveTo(lx + leaf_sign * s * 0.12, ly - s * 0.02,
                   lx + leaf_sign * s * 0.05, ly + s * 0.05, lx, ly)
        c.drawPath(lp, stroke=1, fill=1)
    # Blütenblätter (spitz-ovale Form statt Kreise)
    _setup(c, C_PINK, 0.6)
    bloom_cy = cy + s * 0.35
    for i in range(6):
        angle = math.radians(i * 60 - 90)
        # Äußere Blütenblätter
        _fill(c, HexColor("#f8c8dc"))
        pa = c.beginPath()
        pa.moveTo(cx, bloom_cy)
        tip_x = cx + s * 0.4 * math.cos(angle)
        tip_y = bloom_cy + s * 0.4 * math.sin(angle)
        perp_angle = angle + math.pi / 2
        ctrl_spread = s * 0.14
        pa.curveTo(cx + ctrl_spread * math.cos(perp_angle) + s * 0.15 * math.cos(angle),
                   bloom_cy + ctrl_spread * math.sin(perp_angle) + s * 0.15 * math.sin(angle),
                   tip_x + ctrl_spread * 0.3 * math.cos(perp_angle),
                   tip_y + ctrl_spread * 0.3 * math.sin(perp_angle),
                   tip_x, tip_y)
        pa.curveTo(tip_x - ctrl_spread * 0.3 * math.cos(perp_angle),
                   tip_y - ctrl_spread * 0.3 * math.sin(perp_angle),
                   cx - ctrl_spread * math.cos(perp_angle) + s * 0.15 * math.cos(angle),
                   bloom_cy - ctrl_spread * math.sin(perp_angle) + s * 0.15 * math.sin(angle),
                   cx, bloom_cy)
        c.drawPath(pa, stroke=1, fill=1)
        # Ader auf jedem Blütenblatt
        _setup(c, HexColor("#e07aad"), 0.35)
        c.line(cx + s * 0.05 * math.cos(angle), bloom_cy + s * 0.05 * math.sin(angle),
               cx + s * 0.3 * math.cos(angle), bloom_cy + s * 0.3 * math.sin(angle))
        _setup(c, C_PINK, 0.6)
    # Innerer Ring (Kelchblätter-Andeutung)
    _setup(c, HexColor("#e07aad"), 0.4)
    c.circle(cx, bloom_cy, s * 0.18, stroke=1, fill=0)
    # Mitte mit Textur
    _setup(c, HexColor("#d4a017"), 0.5)
    _fill(c, C_YELLOW)
    c.circle(cx, bloom_cy, s * 0.13, stroke=1, fill=1)
    # Punkte in der Mitte (Staubgefäße)
    _fill(c, HexColor("#b8860b"))
    for i in range(5):
        a = math.radians(i * 72)
        c.circle(cx + s * 0.06 * math.cos(a), bloom_cy + s * 0.06 * math.sin(a),
                 s * 0.02, stroke=0, fill=1)


# ================================================================
# 7. Steine
# ================================================================
def draw_steine(c, cx, cy, size):
    s = size * 0.35
    _setup(c, C_GREY, 0.8)
    _fill(c, C_LIGHT_GREY)
    # Mehrere überlappende Ovale
    stones = [
        (cx - s * 0.35, cy - s * 0.2, s * 0.4, s * 0.3),
        (cx + s * 0.3, cy - s * 0.15, s * 0.35, s * 0.28),
        (cx, cy + s * 0.2, s * 0.5, s * 0.35),
        (cx - s * 0.15, cy + s * 0.05, s * 0.3, s * 0.22),
    ]
    for (sx, sy, sw, sh) in stones:
        c.saveState()
        c.setStrokeColor(C_GREY)
        c.setFillColor(HexColor("#cccccc"))
        c.ellipse(sx - sw / 2, sy - sh / 2, sx + sw / 2, sy + sh / 2, stroke=1, fill=1)
        c.restoreState()


# ================================================================
# 8. Baumstumpf
# ================================================================
def draw_baumstumpf(c, cx, cy, size):
    s = size * 0.35
    _setup(c, C_BROWN, 0.8)
    _fill(c, HexColor("#c89e6e"))
    # Stumpf (Trapez)
    p = c.beginPath()
    p.moveTo(cx - s * 0.55, cy - s * 0.6)
    p.lineTo(cx + s * 0.55, cy - s * 0.6)
    p.lineTo(cx + s * 0.45, cy + s * 0.3)
    p.lineTo(cx - s * 0.45, cy + s * 0.3)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    # Obere Fläche (Oval)
    c.setFillColor(HexColor("#e8c88a"))
    c.ellipse(cx - s * 0.5, cy + s * 0.15, cx + s * 0.5, cy + s * 0.55, stroke=1, fill=1)
    # Jahresringe
    _setup(c, C_BROWN, 0.4)
    for r in [0.12, 0.25, 0.37]:
        c.ellipse(cx - s * r, cy + s * 0.35 - s * r * 0.45,
                  cx + s * r, cy + s * 0.35 + s * r * 0.45, stroke=1, fill=0)


# ================================================================
# 9. Baumrinde
# ================================================================
def draw_baumrinde(c, cx, cy, size):
    s = size * 0.38
    # Rindenstück mit abgerundetem Umriss
    _setup(c, C_BROWN, 0.9)
    _fill(c, HexColor("#7a5a30"))
    rp = c.beginPath()
    rp.moveTo(cx - s * 0.45, cy - s * 0.75)
    rp.curveTo(cx - s * 0.48, cy - s * 0.2, cx - s * 0.5, cy + s * 0.3, cx - s * 0.42, cy + s * 0.75)
    rp.lineTo(cx + s * 0.42, cy + s * 0.75)
    rp.curveTo(cx + s * 0.5, cy + s * 0.3, cx + s * 0.48, cy - s * 0.2, cx + s * 0.45, cy - s * 0.75)
    rp.close()
    c.drawPath(rp, stroke=1, fill=1)
    # Tiefe Furchen (geschwungene Hauptrisse)
    _setup(c, C_DARK_BROWN, 0.7)
    for (sx, ex, ctrl) in [(-0.2, -0.28, 0.08), (0.12, 0.08, -0.06), (-0.05, 0.05, 0.1)]:
        fp = c.beginPath()
        fp.moveTo(cx + s * sx, cy - s * 0.7)
        fp.curveTo(cx + s * (sx + ctrl), cy - s * 0.25,
                   cx + s * (ex - ctrl * 0.5), cy + s * 0.25,
                   cx + s * ex, cy + s * 0.7)
        c.drawPath(fp, stroke=1, fill=0)
    # Querverbindungen zwischen Furchen
    _setup(c, HexColor("#5a3a18"), 0.5)
    cross_lines = [
        (cx - s * 0.38, cy - s * 0.45, cx - s * 0.15, cy - s * 0.4),
        (cx - s * 0.22, cy - s * 0.1, cx + s * 0.08, cy - s * 0.15),
        (cx + s * 0.1, cy + s * 0.05, cx + s * 0.38, cy + s * 0.1),
        (cx - s * 0.3, cy + s * 0.25, cx - s * 0.05, cy + s * 0.2),
        (cx + s * 0.05, cy + s * 0.4, cx + s * 0.35, cy + s * 0.38),
        (cx - s * 0.35, cy + s * 0.55, cx - s * 0.1, cy + s * 0.5),
        (cx - s * 0.18, cy - s * 0.55, cx + s * 0.1, cy - s * 0.5),
    ]
    for (x1, y1, x2, y2) in cross_lines:
        c.line(x1, y1, x2, y2)
    # Feine Rindentextur (kurze Striche)
    _setup(c, HexColor("#6b4a28"), 0.3)
    import random as _rb
    state = _rb.getstate()
    _rb.seed(99)
    for _ in range(20):
        tx = cx + _rb.uniform(-s * 0.35, s * 0.35)
        ty = cy + _rb.uniform(-s * 0.65, s * 0.65)
        tl = s * _rb.uniform(0.03, 0.08)
        ta = _rb.uniform(-0.5, 0.5)
        c.line(tx, ty, tx + tl * math.cos(ta), ty + tl * math.sin(ta))
    _rb.setstate(state)
    # Leichter Highlight-Streifen (Lichteffekt)
    _setup(c, HexColor("#9a7a50"), 0.4)
    hp = c.beginPath()
    hp.moveTo(cx + s * 0.25, cy - s * 0.65)
    hp.curveTo(cx + s * 0.3, cy - s * 0.2, cx + s * 0.28, cy + s * 0.3, cx + s * 0.22, cy + s * 0.65)
    c.drawPath(hp, stroke=1, fill=0)


# ================================================================
# 10. Eichel
# ================================================================
def draw_eichel(c, cx, cy, size):
    s = size * 0.35
    # Hütchen
    _setup(c, C_BROWN, 0.7)
    _fill(c, HexColor("#a67c52"))
    cap_y = cy + s * 0.15
    c.ellipse(cx - s * 0.4, cap_y, cx + s * 0.4, cap_y + s * 0.4, stroke=1, fill=1)
    # Stielchen
    c.line(cx, cap_y + s * 0.4, cx, cap_y + s * 0.6)
    # Frucht
    _fill(c, HexColor("#c89e6e"))
    p = c.beginPath()
    p.moveTo(cx - s * 0.35, cap_y + s * 0.05)
    p.curveTo(cx - s * 0.45, cap_y - s * 0.7, cx + s * 0.45, cap_y - s * 0.7, cx + s * 0.35, cap_y + s * 0.05)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    # Kreuzschraffur auf Hütchen
    _setup(c, C_DARK_BROWN, 0.35)
    for dx in [-0.2, 0, 0.2]:
        c.line(cx + s * dx, cap_y + s * 0.05, cx + s * dx, cap_y + s * 0.35)


# ================================================================
# 11. Tannenzapfen
# ================================================================
def draw_tannenzapfen(c, cx, cy, size):
    s = size * 0.38
    _setup(c, C_BROWN, 0.7)
    _fill(c, HexColor("#a67c52"))
    # Ovalform
    c.ellipse(cx - s * 0.35, cy - s * 0.7, cx + s * 0.35, cy + s * 0.7, stroke=1, fill=1)
    # Schuppenbögen
    _setup(c, C_DARK_BROWN, 0.5)
    for row in range(6):
        y = cy - s * 0.5 + row * s * 0.2
        offset = (row % 2) * s * 0.18
        for col in range(-1, 2):
            sx = cx + col * s * 0.28 + offset
            p = c.beginPath()
            p.moveTo(sx - s * 0.12, y)
            p.curveTo(sx - s * 0.05, y + s * 0.15, sx + s * 0.05, y + s * 0.15, sx + s * 0.12, y)
            c.drawPath(p, stroke=1, fill=0)


# ================================================================
# 12. Kastanie
# ================================================================
def draw_kastanie(c, cx, cy, size):
    s = size * 0.35
    # Frucht (braune Kugel)
    _setup(c, C_DARK_BROWN, 0.8)
    _fill(c, HexColor("#6b3a2a"))
    c.circle(cx, cy - s * 0.1, s * 0.45, stroke=1, fill=1)
    # Heller Fleck
    _fill(c, HexColor("#c89e6e"))
    c.circle(cx, cy - s * 0.25, s * 0.18, stroke=0, fill=1)
    # Hülle (Schale mit Stacheln oben)
    _setup(c, C_GREEN, 0.7)
    p = c.beginPath()
    p.moveTo(cx - s * 0.55, cy + s * 0.1)
    p.curveTo(cx - s * 0.6, cy + s * 0.6, cx + s * 0.6, cy + s * 0.6, cx + s * 0.55, cy + s * 0.1)
    c.drawPath(p, stroke=1, fill=0)
    # Stacheln
    _setup(c, C_GREEN, 0.5)
    for i in range(7):
        t = (i + 1) / 8
        x = cx - s * 0.5 + t * s
        c.line(x, cy + s * 0.35, x + s * 0.05, cy + s * 0.55)
        c.line(x, cy + s * 0.35, x - s * 0.05, cy + s * 0.55)


# ================================================================
# 13. Tierpfotenabdrücke
# ================================================================
def draw_tierpfotenabdruecke(c, cx, cy, size):
    s = size * 0.35
    _setup(c, C_DARK_BROWN, 0.6)
    _fill(c, C_DARK_BROWN)
    # Großes Ballen-Oval
    c.ellipse(cx - s * 0.35, cy - s * 0.4, cx + s * 0.35, cy + s * 0.05, stroke=1, fill=1)
    # 4 Zehen
    positions = [
        (cx - s * 0.35, cy + s * 0.3),
        (cx - s * 0.12, cy + s * 0.45),
        (cx + s * 0.12, cy + s * 0.45),
        (cx + s * 0.35, cy + s * 0.3),
    ]
    for (px, py) in positions:
        c.circle(px, py, s * 0.14, stroke=1, fill=1)


# ================================================================
# 14. Feder
# ================================================================
def draw_feder(c, cx, cy, size):
    s = size * 0.44
    # Kiel (elegant geschwungene Linie)
    _setup(c, HexColor("#4a4a4a"), 0.9)
    # Kiel-Punkte berechnen (Bézier)
    kiel_pts = []
    steps_k = 30
    # Start unten, Ende oben
    x0, y0 = cx + s * 0.2, cy - s * 0.9
    x3, y3 = cx - s * 0.1, cy + s * 0.9
    cx1, cy1 = cx + s * 0.15, cy - s * 0.3
    cx2, cy2 = cx - s * 0.15, cy + s * 0.3
    for i in range(steps_k + 1):
        t = i / steps_k
        mt = 1 - t
        bx = mt**3 * x0 + 3 * mt**2 * t * cx1 + 3 * mt * t**2 * cx2 + t**3 * x3
        by = mt**3 * y0 + 3 * mt**2 * t * cy1 + 3 * mt * t**2 * cy2 + t**3 * y3
        kiel_pts.append((bx, by))
    # Zeichne den Kiel
    pk = c.beginPath()
    pk.moveTo(x0, y0)
    pk.curveTo(cx1, cy1, cx2, cy2, x3, y3)
    c.drawPath(pk, stroke=1, fill=0)
    # Spitze des Kiels (verdickt)
    _setup(c, HexColor("#3a3a3a"), 0.5)
    c.line(x0, y0, x0 + s * 0.03, y0 - s * 0.06)
    # Fahne – gefüllte Form auf jeder Seite
    # Linke Fahne (breitere Seite)
    _setup(c, C_GREY, 0.5)
    _fill(c, HexColor("#d5d5d5"))
    lp = c.beginPath()
    lp.moveTo(*kiel_pts[2])
    for i in range(2, steps_k - 2):
        t = i / steps_k
        kx, ky = kiel_pts[i]
        w = s * 0.35 * math.sin(t * math.pi) * (0.7 + 0.3 * t)
        # Tangent approximation
        if i < steps_k:
            dx = kiel_pts[i + 1][0] - kiel_pts[i][0]
            dy = kiel_pts[i + 1][1] - kiel_pts[i][1]
        else:
            dx = kiel_pts[i][0] - kiel_pts[i - 1][0]
            dy = kiel_pts[i][1] - kiel_pts[i - 1][1]
        length = math.sqrt(dx**2 + dy**2) or 1
        nx, ny = -dy / length, dx / length
        lp.lineTo(kx + nx * w, ky + ny * w)
    c.drawPath(lp, stroke=1, fill=1)
    # Rechte Fahne (schmalere Seite)
    _fill(c, HexColor("#e0e0e0"))
    rp = c.beginPath()
    rp.moveTo(*kiel_pts[2])
    for i in range(2, steps_k - 2):
        t = i / steps_k
        kx, ky = kiel_pts[i]
        w = s * 0.22 * math.sin(t * math.pi) * (0.6 + 0.4 * t)
        if i < steps_k:
            dx = kiel_pts[i + 1][0] - kiel_pts[i][0]
            dy = kiel_pts[i + 1][1] - kiel_pts[i][1]
        else:
            dx = kiel_pts[i][0] - kiel_pts[i - 1][0]
            dy = kiel_pts[i][1] - kiel_pts[i - 1][1]
        length = math.sqrt(dx**2 + dy**2) or 1
        nx, ny = -dy / length, dx / length
        rp.lineTo(kx - nx * w, ky - ny * w)
    c.drawPath(rp, stroke=1, fill=1)
    # Feine Federstrahlen (Barbs)
    _setup(c, HexColor("#aaaaaa"), 0.25)
    for i in range(3, steps_k - 3, 2):
        t = i / steps_k
        kx, ky = kiel_pts[i]
        if i < steps_k:
            dx = kiel_pts[i + 1][0] - kiel_pts[i][0]
            dy = kiel_pts[i + 1][1] - kiel_pts[i][1]
        else:
            dx, dy = 0, 1
        length = math.sqrt(dx**2 + dy**2) or 1
        nx, ny = -dy / length, dx / length
        w_l = s * 0.32 * math.sin(t * math.pi) * (0.7 + 0.3 * t)
        w_r = s * 0.2 * math.sin(t * math.pi) * (0.6 + 0.4 * t)
        # Diagonale Striche (leicht nach oben geneigt)
        c.line(kx, ky, kx + nx * w_l + dx * 0.3, ky + ny * w_l + dy * 0.3)
        c.line(kx, ky, kx - nx * w_r + dx * 0.3, ky - ny * w_r + dy * 0.3)


# ================================================================
# 15. Eichhörnchen
# ================================================================
def draw_eichhoernchen(c, cx, cy, size):
    s = size * 0.38
    _setup(c, C_BROWN, 0.8)
    _fill(c, HexColor("#c0793a"))
    # Körper
    c.ellipse(cx - s * 0.25, cy - s * 0.5, cx + s * 0.25, cy + s * 0.15, stroke=1, fill=1)
    # Kopf
    c.circle(cx - s * 0.05, cy + s * 0.35, s * 0.22, stroke=1, fill=1)
    # Ohr
    _setup(c, C_BROWN, 0.6)
    p = c.beginPath()
    p.moveTo(cx - s * 0.15, cy + s * 0.5)
    p.lineTo(cx - s * 0.1, cy + s * 0.7)
    p.lineTo(cx + s * 0.0, cy + s * 0.5)
    c.drawPath(p, stroke=1, fill=0)
    # Auge
    _fill(c, C_BLACK)
    c.circle(cx + s * 0.02, cy + s * 0.38, s * 0.04, stroke=0, fill=1)
    # Buschiger Schwanz
    _setup(c, HexColor("#c0793a"), 0.8)
    _fill(c, HexColor("#d4944a"))
    p2 = c.beginPath()
    p2.moveTo(cx + s * 0.15, cy - s * 0.3)
    p2.curveTo(cx + s * 0.7, cy - s * 0.6, cx + s * 0.75, cy + s * 0.4, cx + s * 0.2, cy + s * 0.6)
    p2.curveTo(cx + s * 0.5, cy + s * 0.1, cx + s * 0.4, cy - s * 0.25, cx + s * 0.15, cy - s * 0.3)
    c.drawPath(p2, stroke=1, fill=1)


# ================================================================
# 16. Käfer
# ================================================================
def draw_kaefer(c, cx, cy, size):
    s = size * 0.35
    _setup(c, C_BLACK, 0.8)
    _fill(c, C_RED)
    # Körper (Oval)
    c.ellipse(cx - s * 0.35, cy - s * 0.55, cx + s * 0.35, cy + s * 0.25, stroke=1, fill=1)
    # Mittellinie
    c.line(cx, cy - s * 0.55, cx, cy + s * 0.25)
    # Punkte
    _fill(c, C_BLACK)
    for (dx, dy) in [(-0.15, -0.3), (0.15, -0.3), (-0.18, -0.05), (0.18, -0.05)]:
        c.circle(cx + s * dx, cy + s * dy, s * 0.06, stroke=0, fill=1)
    # Kopf
    c.circle(cx, cy + s * 0.4, s * 0.18, stroke=1, fill=1)
    # Fühler
    _setup(c, C_BLACK, 0.5)
    c.line(cx - s * 0.08, cy + s * 0.55, cx - s * 0.25, cy + s * 0.75)
    c.line(cx + s * 0.08, cy + s * 0.55, cx + s * 0.25, cy + s * 0.75)
    # Beine
    _setup(c, C_BLACK, 0.5)
    for sign in [-1, 1]:
        for dy in [-0.4, -0.15, 0.1]:
            c.line(cx + sign * s * 0.35, cy + s * dy,
                   cx + sign * s * 0.55, cy + s * dy - s * 0.15)


# ================================================================
# 17. Vogel
# ================================================================
def draw_vogel(c, cx, cy, size):
    s = size * 0.38
    _setup(c, C_BLUE, 0.8)
    _fill(c, HexColor("#85c1e9"))
    # Körper
    c.circle(cx, cy, s * 0.3, stroke=1, fill=1)
    # Flügel
    p = c.beginPath()
    p.moveTo(cx + s * 0.1, cy + s * 0.05)
    p.curveTo(cx + s * 0.6, cy + s * 0.4, cx + s * 0.7, cy - s * 0.1, cx + s * 0.2, cy - s * 0.1)
    c.drawPath(p, stroke=1, fill=0)
    # Schwanz
    p2 = c.beginPath()
    p2.moveTo(cx + s * 0.25, cy + s * 0.05)
    p2.lineTo(cx + s * 0.55, cy + s * 0.15)
    p2.lineTo(cx + s * 0.5, cy - s * 0.05)
    c.drawPath(p2, stroke=1, fill=0)
    # Schnabel
    _setup(c, C_ORANGE, 0.7)
    _fill(c, C_ORANGE)
    p3 = c.beginPath()
    p3.moveTo(cx - s * 0.28, cy + s * 0.05)
    p3.lineTo(cx - s * 0.5, cy)
    p3.lineTo(cx - s * 0.28, cy - s * 0.05)
    p3.close()
    c.drawPath(p3, stroke=1, fill=1)
    # Auge
    _fill(c, C_BLACK)
    c.circle(cx - s * 0.12, cy + s * 0.08, s * 0.04, stroke=0, fill=1)


# ================================================================
# 18. Tannenzweig
# ================================================================
def draw_tannenzweig(c, cx, cy, size):
    s = size * 0.44
    # Zweig (dicker, leicht geschwungen)
    _setup(c, HexColor("#5a3a1a"), 1.2)
    zp = c.beginPath()
    zp.moveTo(cx - s * 0.7, cy - s * 0.25)
    zp.curveTo(cx - s * 0.25, cy - s * 0.15, cx + s * 0.25, cy + s * 0.2, cx + s * 0.7, cy + s * 0.35)
    c.drawPath(zp, stroke=1, fill=0)
    # Zweig-Punkte berechnen für Nadelpositionierung
    zw_pts = []
    zsteps = 20
    zx0, zy0 = cx - s * 0.7, cy - s * 0.25
    zx3, zy3 = cx + s * 0.7, cy + s * 0.35
    zcx1, zcy1 = cx - s * 0.25, cy - s * 0.15
    zcx2, zcy2 = cx + s * 0.25, cy + s * 0.2
    for i in range(zsteps + 1):
        t = i / zsteps
        mt = 1 - t
        bx = mt**3 * zx0 + 3 * mt**2 * t * zcx1 + 3 * mt * t**2 * zcx2 + t**3 * zx3
        by = mt**3 * zy0 + 3 * mt**2 * t * zcy1 + 3 * mt * t**2 * zcy2 + t**3 * zy3
        zw_pts.append((bx, by))
    # Dichte Nadeln entlang des Zweigs
    _setup(c, C_GREEN, 0.4)
    for i in range(1, zsteps - 1):
        bx, by = zw_pts[i]
        # Tangentenrichtung
        dx = zw_pts[min(i + 1, zsteps)][0] - zw_pts[max(i - 1, 0)][0]
        dy = zw_pts[min(i + 1, zsteps)][1] - zw_pts[max(i - 1, 0)][1]
        length = math.sqrt(dx**2 + dy**2) or 1
        # Normale
        nx, ny = -dy / length, dx / length
        # Nadellänge variiert
        nl = s * (0.18 + 0.08 * math.sin(i * 1.7))
        # 3 Nadeln pro Seite (gefächert)
        for angle_off in [-0.3, 0, 0.25]:
            # Obere Nadeln
            nad_dx = (nx * math.cos(angle_off) - ny * math.sin(angle_off)) * nl
            nad_dy = (nx * math.sin(angle_off) + ny * math.cos(angle_off)) * nl
            c.line(bx, by, bx + nad_dx, by + nad_dy)
            # Untere Nadeln
            c.line(bx, by, bx - nad_dx, by - nad_dy)
    # Nadeln an der Spitze (Büschel)
    _setup(c, C_DARK_GREEN, 0.45)
    tip_x, tip_y = zw_pts[-1]
    for a in range(0, 360, 30):
        rad = math.radians(a)
        tnl = s * 0.15
        c.line(tip_x, tip_y, tip_x + tnl * math.cos(rad), tip_y + tnl * math.sin(rad))
    # Kleine Knospenansätze
    _setup(c, HexColor("#5a3a1a"), 0.4)
    for i in [4, 10, 16]:
        bx, by = zw_pts[i]
        c.circle(bx, by, s * 0.02, stroke=1, fill=1)


# ================================================================
# 19. Pilz
# ================================================================
def draw_pilz(c, cx, cy, size):
    s = size * 0.38
    _setup(c, C_BROWN, 0.8)
    # Stiel
    _fill(c, HexColor("#f5e6cc"))
    c.rect(cx - s * 0.15, cy - s * 0.6, s * 0.3, s * 0.55, stroke=1, fill=1)
    # Hut
    _fill(c, C_RED)
    p = c.beginPath()
    p.moveTo(cx - s * 0.5, cy - s * 0.05)
    p.curveTo(cx - s * 0.5, cy + s * 0.7, cx + s * 0.5, cy + s * 0.7, cx + s * 0.5, cy - s * 0.05)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    # Weiße Punkte auf dem Hut
    _fill(c, HexColor("#ffffff"))
    _setup(c, HexColor("#ffffff"), 0.3)
    for (dx, dy) in [(0, 0.3), (-0.22, 0.12), (0.22, 0.12), (-0.1, 0.42), (0.1, 0.42)]:
        c.circle(cx + s * dx, cy + s * dy, s * 0.06, stroke=0, fill=1)


# ================================================================
# 20. Moos
# ================================================================
def draw_moos(c, cx, cy, size):
    s = size * 0.40
    import random as _r
    state = _r.getstate()
    _r.seed(42)  # deterministisch

    # Moospolster-Hügel (gefüllte Bodenfläche)
    _setup(c, C_DARK_GREEN, 0.6)
    _fill(c, HexColor("#4a8c3f"))
    bp = c.beginPath()
    bp.moveTo(cx - s * 0.75, cy - s * 0.45)
    bp.curveTo(cx - s * 0.5, cy - s * 0.25, cx - s * 0.15, cy - s * 0.35, cx, cy - s * 0.28)
    bp.curveTo(cx + s * 0.15, cy - s * 0.35, cx + s * 0.5, cy - s * 0.2, cx + s * 0.75, cy - s * 0.45)
    bp.lineTo(cx + s * 0.75, cy - s * 0.55)
    bp.lineTo(cx - s * 0.75, cy - s * 0.55)
    bp.close()
    c.drawPath(bp, stroke=1, fill=1)

    # Sternmoos-Rosetten (kleine sternförmige Moospflanzen)
    _setup(c, C_GREEN, 0.35)
    for _ in range(8):
        rx = cx + _r.uniform(-s * 0.55, s * 0.55)
        ry = cy - s * 0.42 + _r.uniform(-s * 0.05, s * 0.05)
        rr = s * _r.uniform(0.04, 0.07)
        for a in range(0, 360, 45):
            rad = math.radians(a + _r.uniform(-10, 10))
            _setup(c, HexColor("#3a7d44"), 0.3)
            c.line(rx, ry, rx + rr * math.cos(rad), ry + rr * math.sin(rad))

    # Sporophyten (Stielchen mit Kapseln – typisch für Moos)
    for _ in range(22):
        bx = cx + _r.uniform(-s * 0.6, s * 0.6)
        by_base = cy - s * 0.38 + _r.uniform(-s * 0.05, s * 0.05)
        height = _r.uniform(s * 0.25, s * 0.75)
        by_top = by_base + height
        # Leicht geschwungener Stiel
        sway = _r.uniform(-s * 0.06, s * 0.06)
        _setup(c, HexColor("#5a9a4a"), 0.35)
        sp = c.beginPath()
        sp.moveTo(bx, by_base)
        sp.curveTo(bx + sway * 0.5, by_base + height * 0.4,
                   bx + sway, by_base + height * 0.7,
                   bx + sway * 0.8, by_top)
        c.drawPath(sp, stroke=1, fill=0)
        # Kapsel (oval, verschiedene Grüntöne)
        shade = _r.choice(["#3a7d44", "#4a8c3f", "#5ca650", "#6bbd5a"])
        _fill(c, HexColor(shade))
        _setup(c, C_DARK_GREEN, 0.3)
        cap_w = s * _r.uniform(0.025, 0.04)
        cap_h = s * _r.uniform(0.035, 0.055)
        c.ellipse(bx + sway * 0.8 - cap_w, by_top - cap_h * 0.3,
                  bx + sway * 0.8 + cap_w, by_top + cap_h * 0.7,
                  stroke=1, fill=1)

    # Feuchtigkeitstropfen (1–2 kleine Glanzpunkte)
    _fill(c, HexColor("#b3e0b0"))
    for _ in range(3):
        dx = cx + _r.uniform(-s * 0.4, s * 0.4)
        dy = cy - s * 0.3 + _r.uniform(s * 0.1, s * 0.5)
        c.circle(dx, dy, s * 0.015, stroke=0, fill=1)

    _r.setstate(state)


# ================================================================
# 21. Brennnessel
# ================================================================
def draw_brennnessel(c, cx, cy, size):
    s = size * 0.42
    # Stiel (leicht kantig, mit feinen Härchen)
    _setup(c, C_GREEN, 0.9)
    # Leicht geschwungener Stiel
    stiel_p = c.beginPath()
    stiel_p.moveTo(cx, cy - s * 0.85)
    stiel_p.curveTo(cx + s * 0.02, cy - s * 0.4, cx - s * 0.02, cy + s * 0.2, cx, cy + s * 0.85)
    c.drawPath(stiel_p, stroke=1, fill=0)
    # Brennhaare am Stiel
    _setup(c, HexColor("#7ab556"), 0.25)
    for i in range(12):
        t = (i + 1) / 13
        hy = cy - s * 0.85 + t * s * 1.7
        hx = cx + s * 0.02 * math.sin(t * 5)
        for hsign in [-1, 1]:
            c.line(hx, hy, hx + hsign * s * 0.04, hy + s * 0.03)
    # Gezackte Blätter (paarweise, mit Füllung und Blattadern)
    leaves = [(-0.45, 0.6, -15), (-0.1, 1.0, -5), (0.25, 0.85, 5), (0.55, 0.55, 10)]
    for (leaf_dy, scale, rot_deg) in leaves:
        for sign in [-1, 1]:
            c.saveState()
            bx = cx
            by = cy + s * leaf_dy
            # Blattstiel
            _setup(c, C_GREEN, 0.5)
            stl_len = s * 0.08 * scale
            c.line(bx, by, bx + sign * stl_len, by + s * 0.02)
            # Blattumriss (gezackt, gefüllt)
            _setup(c, C_GREEN, 0.6)
            _fill(c, HexColor("#6abf59"))
            leaf_w = s * 0.32 * scale
            leaf_h = s * 0.18 * scale
            lp = c.beginPath()
            base_x = bx + sign * stl_len
            base_y = by + s * 0.02
            tip_x = base_x + sign * leaf_w
            # Gezackte Oberkante
            zacks = 5
            lp.moveTo(base_x, base_y)
            for z in range(zacks):
                zt = (z + 0.5) / zacks
                zx = base_x + sign * leaf_w * zt
                # Zacke nach außen
                lp.lineTo(zx, base_y + leaf_h * (0.6 + 0.4 * math.sin(zt * math.pi)))
                # Einbuchtung
                if z < zacks - 1:
                    zx2 = base_x + sign * leaf_w * (z + 1) / zacks
                    lp.lineTo(zx2, base_y + leaf_h * 0.4 * math.sin((z + 1) / zacks * math.pi))
            lp.lineTo(tip_x, base_y)
            # Gezackte Unterkante (gespiegelt)
            for z in range(zacks - 1, -1, -1):
                zt = (z + 0.5) / zacks
                zx = base_x + sign * leaf_w * zt
                lp.lineTo(zx, base_y - leaf_h * (0.6 + 0.4 * math.sin(zt * math.pi)))
                if z > 0:
                    zx2 = base_x + sign * leaf_w * z / zacks
                    lp.lineTo(zx2, base_y - leaf_h * 0.4 * math.sin(z / zacks * math.pi))
            lp.close()
            c.drawPath(lp, stroke=1, fill=1)
            # Mittelader
            _setup(c, C_DARK_GREEN, 0.4)
            c.line(base_x, base_y, tip_x, base_y)
            # Seitenadern
            _setup(c, C_DARK_GREEN, 0.25)
            for av in range(1, 4):
                at = av / 4
                ax = base_x + sign * leaf_w * at
                vl = leaf_h * 0.35 * math.sin(at * math.pi)
                c.line(ax, base_y, ax + sign * s * 0.02, base_y + vl * 0.7)
                c.line(ax, base_y, ax + sign * s * 0.02, base_y - vl * 0.7)
            c.restoreState()
    # Kleine Brennhaare auf den Blättern (feine Striche)
    _setup(c, HexColor("#a0d890"), 0.2)
    import random as _rbn
    state = _rbn.getstate()
    _rbn.seed(77)
    for _ in range(15):
        hx = cx + _rbn.uniform(-s * 0.35, s * 0.35)
        hy = cy + _rbn.uniform(-s * 0.4, s * 0.55)
        c.line(hx, hy, hx + _rbn.uniform(-s * 0.03, s * 0.03), hy + s * 0.04)
    _rbn.setstate(state)


# ================================================================
# 22. Bank
# ================================================================
def draw_bank(c, cx, cy, size):
    s = size * 0.38
    _setup(c, C_BROWN, 0.9)
    # Sitzfläche
    _fill(c, HexColor("#c89e6e"))
    c.rect(cx - s * 0.6, cy + s * 0.0, s * 1.2, s * 0.15, stroke=1, fill=1)
    # Rückenlehne
    c.rect(cx - s * 0.6, cy + s * 0.35, s * 1.2, s * 0.12, stroke=1, fill=1)
    # Beine
    _setup(c, C_DARK_BROWN, 0.8)
    c.line(cx - s * 0.5, cy + s * 0.0, cx - s * 0.5, cy - s * 0.45)
    c.line(cx + s * 0.5, cy + s * 0.0, cx + s * 0.5, cy - s * 0.45)
    # Lehnenstützen
    c.line(cx - s * 0.5, cy + s * 0.0, cx - s * 0.5, cy + s * 0.47)
    c.line(cx + s * 0.5, cy + s * 0.0, cx + s * 0.5, cy + s * 0.47)
    # Querstrebe
    c.line(cx - s * 0.5, cy - s * 0.25, cx + s * 0.5, cy - s * 0.25)


# ================================================================
# 23. Aussichtsturm
# ================================================================
def draw_aussichtsturm(c, cx, cy, size):
    s = size * 0.42
    _setup(c, C_BROWN, 0.8)
    # Turm (Trapez)
    p = c.beginPath()
    p.moveTo(cx - s * 0.45, cy - s * 0.7)
    p.lineTo(cx + s * 0.45, cy - s * 0.7)
    p.lineTo(cx + s * 0.3, cy + s * 0.5)
    p.lineTo(cx - s * 0.3, cy + s * 0.5)
    p.close()
    _fill(c, HexColor("#e8d5b0"))
    c.drawPath(p, stroke=1, fill=1)
    # Plattform oben
    _fill(c, C_BROWN)
    c.rect(cx - s * 0.5, cy + s * 0.5, s, s * 0.1, stroke=1, fill=1)
    # Geländer
    _setup(c, C_DARK_BROWN, 0.6)
    c.line(cx - s * 0.5, cy + s * 0.6, cx - s * 0.5, cy + s * 0.8)
    c.line(cx + s * 0.5, cy + s * 0.6, cx + s * 0.5, cy + s * 0.8)
    c.line(cx - s * 0.5, cy + s * 0.8, cx + s * 0.5, cy + s * 0.8)
    # Kreuzstreben
    _setup(c, C_BROWN, 0.5)
    c.line(cx - s * 0.35, cy - s * 0.5, cx + s * 0.25, cy + s * 0.1)
    c.line(cx + s * 0.35, cy - s * 0.5, cx - s * 0.25, cy + s * 0.1)
    # Tür
    c.rect(cx - s * 0.1, cy - s * 0.7, s * 0.2, s * 0.25, stroke=1, fill=0)


# ================================================================
# 24. Klee
# ================================================================
def draw_klee(c, cx, cy, size):
    s = size * 0.35
    _setup(c, C_GREEN, 0.7)
    _fill(c, HexColor("#66bb6a"))
    # 3 Herzblätter
    for i in range(3):
        angle = math.radians(i * 120 + 90)
        hx = cx + s * 0.22 * math.cos(angle)
        hy = cy + s * 0.15 + s * 0.22 * math.sin(angle)
        # Herz aus zwei Bögen
        p = c.beginPath()
        p.moveTo(hx, hy - s * 0.18)
        p.curveTo(hx - s * 0.2, hy - s * 0.05, hx - s * 0.2, hy + s * 0.15, hx, hy + s * 0.22)
        p.curveTo(hx + s * 0.2, hy + s * 0.15, hx + s * 0.2, hy - s * 0.05, hx, hy - s * 0.18)
        c.drawPath(p, stroke=1, fill=1)
    # Stiel
    _setup(c, C_DARK_GREEN, 0.7)
    c.line(cx, cy - s * 0.05, cx, cy - s * 0.7)


# ================================================================
# 25. Biene
# ================================================================
def draw_biene(c, cx, cy, size):
    s = size * 0.35
    _setup(c, C_BLACK, 0.7)
    # Körper
    _fill(c, C_YELLOW)
    c.ellipse(cx - s * 0.4, cy - s * 0.25, cx + s * 0.4, cy + s * 0.25, stroke=1, fill=1)
    # Streifen
    _setup(c, C_BLACK, 0.6)
    for dx in [-0.12, 0.08, 0.28]:
        c.line(cx + s * dx, cy - s * 0.24, cx + s * dx, cy + s * 0.24)
    # Flügel
    _setup(c, C_BLUE, 0.5)
    _fill(c, HexColor("#d4e6f1"))
    c.ellipse(cx - s * 0.25, cy + s * 0.2, cx + s * 0.05, cy + s * 0.6, stroke=1, fill=1)
    c.ellipse(cx + s * 0.05, cy + s * 0.2, cx + s * 0.35, cy + s * 0.55, stroke=1, fill=1)
    # Kopf
    _setup(c, C_BLACK, 0.7)
    _fill(c, C_BLACK)
    c.circle(cx - s * 0.45, cy, s * 0.12, stroke=1, fill=1)
    # Stachel
    c.line(cx + s * 0.4, cy, cx + s * 0.55, cy)
    # Fühler
    c.line(cx - s * 0.5, cy + s * 0.1, cx - s * 0.65, cy + s * 0.3)
    c.line(cx - s * 0.5, cy + s * 0.05, cx - s * 0.6, cy + s * 0.25)


# ==================================================================
# Registry: Begriff → Zeichenfunktion
# ==================================================================
ICON_FUNCTIONS = {
    "Spinnennetz": draw_spinnennetz,
    "Ameise": draw_ameise,
    "Farn": draw_farn,
    "Schnecke": draw_schnecke,
    "Blatt": draw_blatt,
    "Blume": draw_blume,
    "Steine": draw_steine,
    "Baumstumpf": draw_baumstumpf,
    "Baumrinde": draw_baumrinde,
    "Eichel": draw_eichel,
    "Tannenzapfen": draw_tannenzapfen,
    "Kastanie": draw_kastanie,
    "Tierpfotenabdrücke": draw_tierpfotenabdruecke,
    "Feder": draw_feder,
    "Eichhörnchen": draw_eichhoernchen,
    "Käfer": draw_kaefer,
    "Vogel": draw_vogel,
    "Tannenzweig": draw_tannenzweig,
    "Pilz": draw_pilz,
    "Moos": draw_moos,
    "Brennnessel": draw_brennnessel,
    "Bank": draw_bank,
    "Aussichtsturm": draw_aussichtsturm,
    "Klee": draw_klee,
    "Biene": draw_biene,
}
