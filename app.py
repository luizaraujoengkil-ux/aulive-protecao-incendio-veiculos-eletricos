"""
AULIVE #57 — Proteção contra incêndios em veículos elétricos
=============================================================

Host Streamlit da apresentação HTML/CSS/JS.

O que este app faz:
  1. Configura a página (tema escuro, wide, sidebar recolhida).
  2. Carrega presentation/index.html, styles.css, script.js e slides.json.
  3. Injeta os dados dos slides (slides.json) no JavaScript como `AULIVE_DATA`.
  4. Registra e monta o componente com `st.components.v2.component`
     (renderização em Shadow DOM, sem iframe).
  5. Fallback documentado para `st.components.v1.html` caso a API v2 não
     esteja disponível na versão instalada do Streamlit.
  6. Remove o "chrome" padrão do Streamlit (cabeçalho, menu, rodapé, margens),
     deixando a apresentação ocupar praticamente toda a janela.
  7. Trata arquivos ausentes com uma mensagem técnica amigável.

Sem caminhos absolutos: tudo é resolvido com pathlib a partir deste arquivo,
para funcionar localmente e no Streamlit Community Cloud.
"""

from __future__ import annotations

import json
from pathlib import Path

import streamlit as st

# --------------------------------------------------------------------------- #
# Caminhos (relativos a este arquivo — compatível com o Community Cloud)
# --------------------------------------------------------------------------- #
BASE_DIR = Path(__file__).resolve().parent
PRES_DIR = BASE_DIR / "presentation"

INDEX_HTML = PRES_DIR / "index.html"
STYLES_CSS = PRES_DIR / "styles.css"
SCRIPT_JS = PRES_DIR / "script.js"
SLIDES_JSON = PRES_DIR / "slides.json"

REQUIRED_FILES = [INDEX_HTML, STYLES_CSS, SCRIPT_JS, SLIDES_JSON]

# Marcadores que delimitam o markup do deck dentro do index.html completo.
DECK_START = "<!-- AULIVE_DECK_START -->"
DECK_END = "<!-- AULIVE_DECK_END -->"
# Marcador a partir do qual o script.js contém código específico do v2 (ES module).
V2_ENTRY_MARKER = "/* __AULIVE_V2_ENTRY__"


# --------------------------------------------------------------------------- #
# Carregamento de assets
# --------------------------------------------------------------------------- #
def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_deck_markup(index_html: str) -> str:
    """Extrai apenas o markup do deck (entre os marcadores) do index.html.

    Assim o mesmo index.html pode ser aberto isoladamente no navegador e,
    ao mesmo tempo, fornecer o inner HTML esperado pelo componente v2.
    """
    if DECK_START in index_html and DECK_END in index_html:
        return index_html.split(DECK_START, 1)[1].split(DECK_END, 1)[0].strip()
    # Sem marcadores: assume que o arquivo já é o inner HTML.
    return index_html.strip()


def load_assets() -> dict:
    """Lê os quatro arquivos da apresentação. Lança FileNotFoundError se faltar."""
    missing = [p for p in REQUIRED_FILES if not p.exists()]
    if missing:
        raise FileNotFoundError(", ".join(str(p.relative_to(BASE_DIR)) for p in missing))

    index_html = _read_text(INDEX_HTML)
    css = _read_text(STYLES_CSS)
    js = _read_text(SCRIPT_JS)
    slides_data = json.loads(_read_text(SLIDES_JSON))

    return {
        "deck_html": extract_deck_markup(index_html),
        "css": css,
        "js": js,
        "slides_json": json.dumps(slides_data, ensure_ascii=False),
        "meta": slides_data.get("meta", {}),
    }


def build_v2_js(js: str, slides_json: str) -> str:
    """Prepara o JS do componente v2 injetando AULIVE_DATA antes do módulo."""
    return f"const AULIVE_DATA = {slides_json};\n\n{js}"


def build_fallback_html(deck_html: str, css: str, js: str, slides_json: str) -> str:
    """Documento HTML autônomo para o fallback st.components.v1.html (iframe).

    Remove a parte específica do v2 (o `export default`) e chama bootDeck no
    documento do iframe. Fallback com recursos limitados (ex.: tela cheia pode
    ser bloqueada pelo iframe) — o caminho recomendado é o componente v2.
    """
    core_js = js.split(V2_ENTRY_MARKER, 1)[0]
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>{css}</style></head><body>
{deck_html}
<script>
const AULIVE_DATA = {slides_json};
{core_js}
if (!window.__AULIVE_BOOTED__) {{ bootDeck(document); }}
</script>
</body></html>"""


# --------------------------------------------------------------------------- #
# Estilo: esconder o chrome padrão do Streamlit
# --------------------------------------------------------------------------- #
HIDE_CHROME_CSS = """
<style>
  /* Fundo e ausência de rolagem — o deck é um overlay fixo em tela cheia */
  html, body, [data-testid="stAppViewContainer"], .stApp {
      background: #070B12 !important;
      overflow: hidden !important;
  }
  /* Remove cabeçalho, barra de ferramentas, menu, rodapé e decoração */
  header[data-testid="stHeader"],
  [data-testid="stToolbar"],
  [data-testid="stDecoration"],
  [data-testid="stStatusWidget"],
  #MainMenu, footer, .stDeployButton { display: none !important; }
  /* Remove margens/paddings do container principal para o deck ocupar tudo */
  [data-testid="stMainBlockContainer"], .block-container, [data-testid="stMain"] {
      padding: 0 !important;
      margin: 0 !important;
      max-width: 100% !important;
  }
  [data-testid="stAppViewContainer"] > .main,
  [data-testid="stAppViewBlockContainer"] { padding: 0 !important; }
  /* Remove o gap entre blocos que o Streamlit insere */
  [data-testid="stVerticalBlock"] { gap: 0 !important; }
  [data-testid="stElementContainer"], [data-testid="stIFrame"] { margin: 0 !important; }
</style>
"""


# --------------------------------------------------------------------------- #
# Renderização
# --------------------------------------------------------------------------- #
def _has_v2() -> bool:
    return hasattr(st, "components") and hasattr(st.components, "v2") \
        and hasattr(st.components.v2, "component")


def render(assets: dict) -> None:
    """Monta o deck via componente v2; se indisponível, usa o fallback v1."""
    st.markdown(HIDE_CHROME_CSS, unsafe_allow_html=True)

    if _has_v2():
        try:
            deck = st.components.v2.component(
                "aulive_deck",
                html=assets["deck_html"],
                css=assets["css"],
                js=build_v2_js(assets["js"], assets["slides_json"]),
                isolate_styles=True,   # Shadow DOM: isola o CSS do app do CSS do host
            )
            deck(key="aulive_deck")    # comando de montagem do componente
            return
        except Exception as exc:  # noqa: BLE001 — degradar para o fallback documentado
            st.warning(
                "Componente v2 indisponível nesta execução; usando o fallback "
                f"st.components.v1.html. Detalhe técnico: {exc}"
            )

    # ----- Fallback documentado (st.components.v1.html em iframe) -----
    from streamlit.components import v1 as components_v1

    components_v1.html(
        build_fallback_html(
            assets["deck_html"], assets["css"], assets["js"], assets["slides_json"]
        ),
        height=780,
        scrolling=False,
    )


def render_error(exc: Exception) -> None:
    """Mensagem técnica amigável quando algum arquivo obrigatório falta/falha."""
    st.markdown(HIDE_CHROME_CSS, unsafe_allow_html=True)
    st.error("### 🔧 Não foi possível carregar a apresentação")
    st.write(
        "Um ou mais arquivos da apresentação não foram encontrados ou não puderam "
        "ser lidos. Verifique se a pasta **`presentation/`** contém os arquivos:"
    )
    st.markdown(
        "- `index.html`\n- `styles.css`\n- `script.js`\n- `slides.json`\n\n"
        f"**Detalhe técnico:** `{exc}`"
    )
    st.info("Dica: rode o app a partir da raiz do projeto com `streamlit run app.py`.")


# --------------------------------------------------------------------------- #
# Entrada
# --------------------------------------------------------------------------- #
def main() -> None:
    st.set_page_config(
        page_title="AULIVE #57 | Proteção contra incêndios em veículos elétricos",
        page_icon="🔥",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    try:
        assets = load_assets()
    except Exception as exc:  # noqa: BLE001
        render_error(exc)
        return
    render(assets)


def _running_in_streamlit() -> bool:
    """True quando executado por `streamlit run` (há um ScriptRunContext)."""
    try:
        from streamlit.runtime.scriptrunner import get_script_run_ctx
        return get_script_run_ctx() is not None
    except Exception:
        return False


# Executa apenas sob `streamlit run` (ou execução direta), nunca ao importar
# o módulo em testes — assim `import app` não dispara chamadas do Streamlit.
if __name__ == "__main__" or _running_in_streamlit():
    main()
