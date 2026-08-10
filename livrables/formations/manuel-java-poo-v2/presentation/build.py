# -*- coding: utf-8 -*-
"""Assemble toutes les parties de contenu et genere le fichier .pptx final."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import design as d
from renderers import RENDERERS
import content_a
import content_b
import content_c
import content_d

SLIDES = content_a.ALL + content_b.ALL + content_c.ALL + content_d.ALL

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "Java-POO-Cours-Complet.pptx")


def main():
    prs = d.new_presentation()
    current_module = ""
    page_no = 0
    for entry in SLIDES:
        t = entry["type"]
        if t == "section":
            current_module = f'{entry["module_no"]} — {entry["title"]}'
        renderer = RENDERERS.get(t)
        if renderer is None:
            raise ValueError(f"Type de slide inconnu : {t}")
        slide = renderer(prs, entry)
        page_no += 1
        if t not in ("cover",):
            d.footer(slide, current_module, page_no)
        if entry.get("notes"):
            d.set_notes(slide, entry["notes"])

    prs.save(OUTPUT)
    print(f"OK — {page_no} slides generees -> {OUTPUT}")


if __name__ == "__main__":
    main()
