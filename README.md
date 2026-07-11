# 🔥 AULIVE #57 — Proteção contra incêndios em veículos elétricos

Apresentação online **dinâmica, responsiva e altamente visual** para a aula ao
vivo **AULIVE #57**, com foco em **medidas mitigatórias para a proteção das
edificações**.

> **Não basta instalar o carregador. É preciso preparar a edificação.**

- **Evento:** AULIVE #57
- **Tema:** Proteção contra incêndios em veículos elétricos
- **Subtítulo:** Medidas mitigatórias com foco na proteção das edificações
- **Apresentadores:** Prof. Luiz Araujo · Prof. Felipe Lima
- **Data:** 13 de julho · **Ao vivo no YouTube**
- **Base:** e-book _"Proteção contra incêndios em veículos elétricos:
  Estratégias e Práticas Mitigadoras — 3ª edição"_
- **Formato:** 12 slides · ~40 minutos · 16:9

A apresentação é **HTML real** (texto selecionável, animações CSS, diagramas
SVG inline e navegação em JavaScript puro), servida por um app **Streamlit** e
pronta para o **Streamlit Community Cloud**. Sem PowerPoint, sem PDF, sem
imagens dos slides, sem React, sem Node, sem processo de build.

---

## 📸 Captura de tela

> _Espaço reservado para uma captura de tela da apresentação._
> Para gerar: rode `streamlit run app.py`, entre em tela cheia (`F`) e capture
> o slide de capa. Salve em `static/images/screenshot.png` e referencie aqui:
>
> `![Capa da apresentação](static/images/screenshot.png)`

---

## 🗂️ Estrutura do projeto

```
aulive-protecao-incendio-veiculos-eletricos/
├── app.py                  # Host Streamlit (componente v2 + fallback v1)
├── requirements.txt        # streamlit>=1.58,<2
├── README.md               # este arquivo
├── LICENSE                 # MIT
├── .gitignore
├── CLAUDE.md               # guia para o Claude Code
│
├── .streamlit/
│   └── config.toml         # tema escuro + enableStaticServing
│
├── presentation/
│   ├── index.html          # 12 slides em HTML + SVG (documento completo)
│   ├── styles.css          # design system, palco 16:9, animações
│   ├── script.js           # navegação, fragmentos, overview, notas, timer…
│   └── slides.json         # títulos, tempos e NOTAS do apresentador
│
├── static/                 # servido em app/static/ (enableStaticServing)
│   ├── logos/
│   │   ├── aulive.png       # (placeholder) marca AULIVE
│   │   ├── adpat.png        # logo ADPAT | FEIPAT (extraído do material)
│   │   └── ebook-cover.png  # capa do e-book
│   ├── speakers/
│   │   ├── luiz-araujo.png  # foto do Prof. Luiz Araujo
│   │   └── felipe-lima.png  # foto do Prof. Felipe Lima
│   └── images/
│       └── README.md
│
└── tests/
    └── test_app.py         # testes mínimos de qualidade
```

---

## ✅ Requisitos

- **Python 3.12** (funciona em 3.9+)
- **Streamlit ≥ 1.58** (para `st.components.v2.component`)
- Um navegador moderno (Chrome, Edge, Firefox, Safari)

Sem dependências pesadas, sem banco de dados, sem API externa, sem CDN
obrigatório. As fontes são de sistema (Inter/Segoe UI/Arial).

---

## 💻 Instalação

### Windows (PowerShell)

```powershell
# 1. Entre na pasta do projeto
cd aulive-protecao-incendio-veiculos-eletricos

# 2. (Opcional, recomendado) crie um ambiente virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Instale as dependências
pip install -r requirements.txt
```

### Linux / macOS

```bash
cd aulive-protecao-incendio-veiculos-eletricos
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## ▶️ Execução local

```bash
streamlit run app.py
```

O Streamlit abre em `http://localhost:8501`. Se o navegador não abrir
automaticamente, acesse esse endereço manualmente. Pressione **`F`** para tela
cheia.

> Dica de desenvolvimento: você também pode abrir `presentation/index.html`
> **diretamente no navegador** (arrastando para uma aba) para iterar no design
> sem subir o Streamlit — ele detecta o modo autônomo e inicializa sozinho.
> Nesse modo, as imagens em `app/static/...` só aparecem quando servidas pelo
> Streamlit.

---

## ⌨️ Atalhos da apresentação

| Ação | Tecla / gesto |
| --- | --- |
| Próximo slide / próximo fragmento | `→` · `Espaço` · `PageDown` · `Enter` · deslizar ← |
| Slide anterior | `←` · `PageUp` · deslizar → |
| Primeiro / último slide | `Home` · `End` |
| Tela cheia | `F` (ou botão) |
| Visão geral (miniaturas dos 12 slides) | `O` |
| Notas do apresentador | `N` |
| Mostrar/ocultar cronômetro | `T` |
| Iniciar / pausar cronômetro | `Shift + T` (ou botão ▶/⏸) |
| Zerar cronômetro | botão ↺ |
| Ajuda (lista de atalhos) | `?` |
| Fechar painéis | `Esc` |

Outros recursos: barra de progresso inferior com **slide atual / 12** e
**tempo estimado acumulado**; **URL com hash** (`#slide-01`… — abre direto e
mantém o slide ao atualizar a página); **auto-ocultar** de cursor e controles
após alguns segundos parados; suporte a **`prefers-reduced-motion`**.

---

## 🛠️ Personalização

### Substituir logos e imagens

As imagens ficam em `static/` e são referenciadas como `app/static/<caminho>`.
Basta **substituir os arquivos mantendo o mesmo nome**:

| Arquivo | Onde aparece | Situação atual |
| --- | --- | --- |
| `static/images/cover-garage.jpg` | **hero da capa** (tela cheia) | ✔ imagem fotorreal do evento |
| `static/logos/adpat-selo.png` | **selo de membro** (capa, canto sup. dir.) | ✔ selo ADPAT nº 1336 |
| `static/speakers/luiz-araujo.png` | capa | ✔ foto real (do material do evento) |
| `static/speakers/felipe-lima.png` | capa | ✔ foto real (do material do evento) |
| `static/logos/ebook-cover.png` | referência do e-book | ✔ capa real (2ª ed.) — troque pela 3ª edição |
| `static/logos/adpat.png` | crédito ADPAT/FEIPAT | ✔ extraído do material |
| `static/logos/aulive.png` | marca AULIVE | ⚠ **placeholder** — troque pela arte oficial |

> Formato recomendado: PNG com fundo transparente. As fotos dos palestrantes são
> exibidas em círculo (recorte quadrado funciona bem).

### Editar os slides (conteúdo visual)

- O conteúdo visual de cada slide está em **`presentation/index.html`**, dentro
  de `<section class="slide" id="slide-0N">`.
- Cada diagrama é **SVG inline** — edite formas, rótulos e cores diretamente.
- **Revelação progressiva:** marque elementos com `class="fragment"` e
  `data-frag="N"`. Elementos com o mesmo `N` aparecem juntos, na ordem de `N`.

### Alterar textos / notas / tempos

- Títulos, **tempos** (`minutes`) e **notas do apresentador** ficam em
  **`presentation/slides.json`** (fonte de verdade das notas). Mantenha o
  `data-min` do slide no HTML igual ao `minutes` do JSON (há teste para isso).
- Os textos exibidos na tela ficam no `index.html`.

### Alterar cores

Edite as variáveis em `:root` no topo de **`presentation/styles.css`**:

```css
--c-bg: #070B12;      /* fundo quase preto        */
--c-orange: #F97316;  /* identidade AULIVE         */
--c-cyan: #22D3EE;    /* energia / sistemas elétr. */
--c-red: #EF4444;     /* perigo / incêndio         */
--c-yellow: #FACC15;  /* atenção                   */
```

> Convenção: **vermelho** só para perigo/falha/incêndio; **azul elétrico** para
> energia/carregamento/tecnologia; **laranja** como identidade principal.

---

## 🚀 Publicação

### GitHub

```bash
git init
git branch -M main
git add .
git commit -m "feat: cria apresentação AULIVE sobre proteção contra incêndios em veículos elétricos"

# Com o GitHub CLI autenticado:
gh repo create aulive-protecao-incendio-veiculos-eletricos --public --source=. --remote=origin --push

# Ou manualmente, após criar o repositório vazio no GitHub:
git remote add origin https://github.com/<seu-usuario>/aulive-protecao-incendio-veiculos-eletricos.git
git push -u origin main
```

### Streamlit Community Cloud

1. Garanta o repositório publicado no GitHub (passo anterior).
2. Acesse **https://share.streamlit.io** e faça login com o GitHub.
3. Clique em **New app** (ou **Deploy an app**).
4. Preencha:
   - **Repository:** `<seu-usuario>/aulive-protecao-incendio-veiculos-eletricos`
   - **Branch:** `main`
   - **Main file path:** `app.py`
5. Clique em **Deploy**. O Streamlit instala o `requirements.txt` e publica.
6. Compartilhe a URL gerada (algo como
   `https://<seu-app>.streamlit.app`).

> O `enableStaticServing = true` já está no `.streamlit/config.toml`, então as
> imagens em `app/static/...` funcionam no Cloud sem configuração extra.

---

## 🧪 Testes e qualidade

```bash
python -m compileall .
python -m unittest discover tests
```

Os testes verificam: importação de `app.py` sem erro; existência dos arquivos
obrigatórios; **exatamente 12 slides** (no HTML e no JSON); títulos presentes;
arquivos HTML/CSS/JS não vazios; e a soma dos tempos próxima de 40 minutos.

Checklist manual sugerido antes da transmissão:
- [ ] 1920×1080 e 1366×768 sem cortes/overflow
- [ ] celular (retrato e paisagem) mantendo 16:9
- [ ] navegação por teclado, mouse e toque
- [ ] tela cheia, visão geral, notas, cronômetro, fragmentos
- [ ] hash da URL (`#slide-07` abre no slide 7)
- [ ] contraste legível em projetor

---

## 🩺 Solução de problemas

| Sintoma | Causa provável / solução |
| --- | --- |
| “Não foi possível carregar a apresentação” | Rode a partir da **raiz** do projeto (`streamlit run app.py`). Confirme os 4 arquivos em `presentation/`. |
| Aparece o cabeçalho/menu do Streamlit | Limpe o cache do navegador; o CSS de ocultação é injetado no carregamento. |
| Imagens não aparecem | Confira `enableStaticServing = true` e os caminhos `app/static/...`. No modo autônomo (abrir o HTML direto) as imagens estáticas não são servidas. |
| Aviso “Componente v2 indisponível” | A versão do Streamlit não tem a API v2; o app usa o **fallback v1** automaticamente. Atualize com `pip install -U streamlit`. |
| Tela cheia não funciona no fallback | O `iframe` do fallback v1 pode bloquear a API de tela cheia. Prefira o componente v2 (Streamlit ≥ 1.58). |
| Animações “pesadas” | O deck respeita `prefers-reduced-motion` do sistema operacional. |

---

## ⚠️ Aviso técnico

Esta apresentação tem **finalidade educacional**. Ela **não substitui** projeto,
norma vigente ou responsabilidade técnica.

Projetos reais devem considerar, caso a caso:

- as **normas vigentes** aplicáveis (ex.: ABNT NBR 17019, ABNT NBR 5410,
  IEC 60364-7-722) e suas atualizações;
- as **instruções técnicas do Corpo de Bombeiros** do estado/município;
- as **exigências da concessionária** de energia;
- as **características específicas da edificação**;
- a **responsabilidade de profissionais habilitados** (ART/RRT).

Os requisitos **variam** conforme estado, município, edificação e data do
projeto. Uma instrução estadual **não** deve ser tratada como exigência
nacional. Recomendações gerais **não** constituem obrigação legal sem a devida
fonte. Nenhum sistema isolado elimina completamente o risco — a segurança é
obtida por **proteção em camadas**, **projeto multidisciplinar**, **prevenção**,
**inspeção** e **manutenção**. As **condições de cobertura de seguro** devem ser
verificadas diretamente na apólice e com a seguradora.

Esta apresentação **não** afirma que veículos elétricos necessariamente pegam
fogo com mais frequência que veículos a combustão; o objetivo é a **análise de
risco** e as **medidas mitigatórias** para a proteção das edificações.

---

## 👥 Créditos

- **Conteúdo e apresentação:** Prof. Luiz Araujo · Prof. Felipe Lima
- **Base:** e-book _"Proteção contra incêndios em veículos elétricos:
  Estratégias e Práticas Mitigadoras — 3ª edição"_
- **Realização:** AULIVE #57 · ADPAT | FEIPAT
- **Dados de mercado:** ABVE Data (publicação de 6 de julho de 2026)

---

## 📄 Licença

Código sob licença **MIT** (veja `LICENSE`). O conteúdo técnico, as fotografias
dos apresentadores e as marcas (AULIVE, ADPAT, FEIPAT) pertencem aos seus
respectivos titulares.
