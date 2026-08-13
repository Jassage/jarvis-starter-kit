"""
Corrige, apres coup, les couleurs et tailles directes que pandoc ne transmet
pas depuis le .docx (limitation confirmee : seuls gras/italique/souligne/
surlignage/styles nommes survivent, pas les couleurs/tailles appliquees
directement a un run ou les trames de fond de cellule).

Le vrai fichier .docx source reste inchange et parfaitement correct ; ce
script ne corrige que l'apercu HTML/PNG genere pour la lecture rapide.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
HTML_DIR = os.path.join(HERE, "solutions_html")


def patch(filename, replacements):
    path = os.path.join(HTML_DIR, filename)
    html = open(path, encoding="utf-8").read()
    for old, new in replacements:
        if old not in html:
            print(f"  [ATTENTION] motif non trouve dans {filename} : {old[:60]}...")
        html = html.replace(old, new, 1)
    open(path, "w", encoding="utf-8").write(html)
    print(f"{filename} : patche")


# --- Exercice 1 : couleurs du titre et du sous-titre ---
patch("exercice1_solution.html", [
    ("<strong>Les Amis du Quartier</strong>",
     '<strong style="color:#1B4F72; font-size:1.5em;">Les Amis du Quartier</strong>'),
    ("<strong>Notre mission</strong>",
     '<strong style="color:#27AE60; font-size:1.15em;">Notre mission</strong>'),
])

# --- Exercice 3 : taquets de tabulation (pandoc reduit les \t a un espace,
#     ce qui ecrase completement la mise en page attendue) ---
def tab_row(left, right, justify="space-between"):
    return (f'<p style="display:flex; justify-content:{justify}; '
            f'margin:4px 0;"><span>{left}</span><span>{right}</span></p>')

patch("exercice3_solution.html", [
    ("<p>Nom : Jean Baptiste Téléphone : 3712-3456</p>",
     tab_row("Nom : Jean Baptiste", "Téléphone : 3712-3456")),
    ("<p>Cahier 25</p>", tab_row("Cahier", "25", justify="space-between")),
    ("<p>Stylo 5,50</p>", tab_row("Stylo", "5,50", justify="space-between")),
    ("<p>Classeur 120</p>", tab_row("Classeur", "120", justify="space-between")),
    ("<p>Ramette de papier 310,75</p>", tab_row("Ramette de papier", "310,75", justify="space-between")),
])

# --- Exercice 4 : page de garde + en-tete colores ---
patch("exercice4_solution.html", [
    ("<strong>Rapport trimestriel</strong>",
     '<strong style="color:#1B4F72; font-size:2em;">Rapport trimestriel</strong>'),
])

# --- Exercice 5 : trames de fond du tableau ---
patch("exercice5_solution.html", [
    ('<th colspan="2" style="text-align: center;"><strong>Dépenses T1\n2026</strong></th>',
     '<th colspan="2" style="text-align: center; background:#1B4F72; color:#FFFFFF;"><strong>Dépenses T1\n2026</strong></th>'),
    ("<td><strong>Catégorie</strong></td>\n<td><strong>Montant (HTG)</strong></td>",
     '<td style="background:#D6E4F0;"><strong>Catégorie</strong></td>\n<td style="background:#D6E4F0;"><strong>Montant (HTG)</strong></td>'),
    ("<td><strong>Total</strong></td>\n<td><strong>1 460</strong></td>",
     '<td style="background:#F4D03F;"><strong>Total</strong></td>\n<td style="background:#F4D03F;"><strong>1 460</strong></td>'),
])

# --- Exercice 9 : titre colore, mise en 2 colonnes (pandoc ignore w:cols),
#     et lettrine approximee par un "N" agrandi flottant ---
patch("exercice9_solution.html", [
    ("<strong>Bulletin associatif — Édition de printemps</strong>",
     '<strong style="color:#1B4F72; font-size:1.4em;">Bulletin associatif — Édition de printemps</strong>'),
    ("<p><strong>N</strong>otre association",
     '<div style="column-count:2; column-gap:30px; text-align:justify;">\n'
     '<p><strong style="font-size:2.6em; color:#1B4F72; float:left; '
     'line-height:0.82; margin-right:5px; font-family:Georgia,serif;">N</strong>otre association'),
    ("<p><em>(Note pédagogique",
     '</div>\n<p><em>(Note pédagogique'),
])

print("\nPost-traitement termine.")
