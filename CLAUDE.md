# CLAUDE.md — Guia do repositório para o Claude Code

Apresentação HTML/CSS/JS da **AULIVE #57 — Proteção contra incêndios em veículos
elétricos**, hospedada por um app **Streamlit** e preparada para o Streamlit
Community Cloud.

## Como rodar / testar

```bash
python -m compileall .            # checagem de sintaxe
python -m unittest discover tests # testes
streamlit run app.py             # roda a apresentação
```

## Arquitetura (importante)

- **`app.py`** lê os 4 arquivos de `presentation/`, injeta `slides.json` no JS
  como a constante global `AULIVE_DATA`, e monta o deck com
  **`st.components.v2.component`** (`isolate_styles=True` → Shadow DOM). Há um
  **fallback documentado** para `st.components.v1.html` se a API v2 faltar.
- **`presentation/index.html`** é um documento completo (abre sozinho no
  navegador) com marcadores `<!-- AULIVE_DECK_START/END -->`. O `app.py` extrai
  só o markup do deck entre eles para passar ao componente.
- **`presentation/script.js`** é um **ES module**: `export default (component)`
  chama `bootDeck(component.parentElement)` (o ShadowRoot). O mesmo `bootDeck`
  roda em página autônoma (auto-boot) e no fallback v1 (`bootDeck(document)`).
  Tudo consulta o DOM via `root`, **nunca** `document.getElementById`.
- **`presentation/slides.json`** é a fonte de verdade de títulos, tempos e
  **notas do apresentador**. Editar conteúdo textual/notas → aqui.
- **Palco fixo 1920×1080** escalado por JS (`fitStage`). Não fazer reflow por
  dispositivo; manter 16:9.
- **Imagens**: servidas via `app/static/...` (`enableStaticServing = true`).

## Convenções

- Cores no `:root` do `styles.css`. Vermelho só para perigo/incêndio; azul
  elétrico (`--c-cyan`) para energia; laranja (`--c-orange`) = identidade AULIVE.
- Fragmentos: elementos com `class="fragment"` + `data-frag="N"` (grupos por N).
- Fontes de sistema (sem Google Fonts / sem CDN).

## Cuidados de conteúdo (não violar)

- Não afirmar que VEs pegam fogo mais que combustão; sem sensacionalismo.
- Não tratar instrução estadual como exigência nacional.
- Não dizer que um sistema isolado elimina o risco.
- Ver a seção "Aviso técnico" do README.

## Gotchas

- `st.set_page_config` precisa ser a 1ª chamada Streamlit (está em `main()`).
- `main()` só roda sob `streamlit run` (guarda por `_running_in_streamlit()`),
  para que `import app` nos testes não dispare o Streamlit.
- Community Cloud: usar `requirements.txt` (Streamlit >= 1.58 para ter a v2).
