"""
Testes mínimos de qualidade da apresentação AULIVE #57.

Cobrem:
  • importar app.py sem erro de sintaxe/execução;
  • existência dos arquivos obrigatórios;
  • exatamente 12 slides (no index.html e no slides.json);
  • todos os slides possuem título;
  • os arquivos HTML, CSS e JS não estão vazios;
  • a soma dos tempos estimados fica próxima de 40 minutos.

Execução:
    python -m unittest discover tests
"""

import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRES = ROOT / "presentation"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

REQUIRED = [
    ROOT / "app.py",
    ROOT / "requirements.txt",
    ROOT / "README.md",
    ROOT / ".streamlit" / "config.toml",
    PRES / "index.html",
    PRES / "styles.css",
    PRES / "script.js",
    PRES / "slides.json",
]

EXPECTED_SLIDES = 12
TARGET_MINUTES = 40


class TestFilesExist(unittest.TestCase):
    def test_required_files_exist(self):
        for path in REQUIRED:
            with self.subTest(file=str(path)):
                self.assertTrue(path.exists(), f"Arquivo obrigatório ausente: {path}")


class TestAppImports(unittest.TestCase):
    def test_import_app(self):
        """Importar app.py não deve lançar erro nem disparar o Streamlit."""
        import app  # noqa: F401
        self.assertTrue(hasattr(app, "main"))
        self.assertTrue(hasattr(app, "load_assets"))

    def test_load_assets(self):
        import app
        assets = app.load_assets()
        for key in ("deck_html", "css", "js", "slides_json"):
            self.assertIn(key, assets)
            self.assertTrue(assets[key].strip(), f"asset vazio: {key}")


class TestSlideCount(unittest.TestCase):
    def test_html_has_expected_slides(self):
        html = (PRES / "index.html").read_text(encoding="utf-8")
        # "slide" pode vir com classes extras (ex.: "slide cover-slide")
        sections = re.findall(r'<section[^>]*class="slide[ "]', html)
        self.assertEqual(len(sections), EXPECTED_SLIDES,
                         f"Esperados {EXPECTED_SLIDES} slides no index.html, achei {len(sections)}")

    def test_html_slide_ids_sequential(self):
        html = (PRES / "index.html").read_text(encoding="utf-8")
        ids = re.findall(r'id="slide-(\d{2})"', html)
        self.assertEqual(len(ids), EXPECTED_SLIDES)
        self.assertEqual(ids, [f"{i:02d}" for i in range(1, EXPECTED_SLIDES + 1)])

    def test_json_has_expected_slides(self):
        data = json.loads((PRES / "slides.json").read_text(encoding="utf-8"))
        self.assertEqual(len(data["slides"]), EXPECTED_SLIDES)


class TestSlideTitles(unittest.TestCase):
    def test_every_slide_has_title(self):
        data = json.loads((PRES / "slides.json").read_text(encoding="utf-8"))
        for slide in data["slides"]:
            with self.subTest(slide=slide.get("id")):
                self.assertTrue(str(slide.get("title", "")).strip(),
                                f"Slide sem título: {slide.get('id')}")

    def test_every_slide_has_heading_in_html(self):
        html = (PRES / "index.html").read_text(encoding="utf-8")
        # Cada <section class="slide"> deve conter um <h1> ou <h2>.
        blocks = re.split(r'<section[^>]*class="slide[ "]', html)[1:]
        self.assertEqual(len(blocks), EXPECTED_SLIDES)
        for i, block in enumerate(blocks, start=1):
            with self.subTest(slide=i):
                self.assertRegex(block, r"<h[12][ >]", f"Slide {i} sem título (h1/h2)")


class TestFilesNotEmpty(unittest.TestCase):
    def test_core_files_not_empty(self):
        for name, minimum in [("index.html", 2000), ("styles.css", 2000), ("script.js", 2000)]:
            with self.subTest(file=name):
                text = (PRES / name).read_text(encoding="utf-8")
                self.assertGreater(len(text.strip()), minimum, f"{name} parece vazio/curto")


class TestTiming(unittest.TestCase):
    def test_times_sum_close_to_40(self):
        data = json.loads((PRES / "slides.json").read_text(encoding="utf-8"))
        total = sum(int(s.get("minutes", 0)) for s in data["slides"])
        self.assertAlmostEqual(total, TARGET_MINUTES, delta=3,
                               msg=f"Soma dos tempos = {total} min (meta {TARGET_MINUTES})")

    def test_html_data_min_matches_json(self):
        html = (PRES / "index.html").read_text(encoding="utf-8")
        mins = [int(x) for x in re.findall(r'data-min="(\d+)"', html)]
        data = json.loads((PRES / "slides.json").read_text(encoding="utf-8"))
        json_mins = [int(s.get("minutes", 0)) for s in data["slides"]]
        self.assertEqual(mins, json_mins, "data-min do HTML difere dos minutos do slides.json")


if __name__ == "__main__":
    unittest.main(verbosity=2)
