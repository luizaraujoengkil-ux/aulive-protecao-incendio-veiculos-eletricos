# static/images

Pasta reservada para imagens de apoio dos slides (diagramas em bitmap, fotos de
apoio, capturas etc.). No momento, os elementos visuais da apresentação são
majoritariamente **SVG inline** e **CSS**, portanto esta pasta pode ficar vazia.

## Como usar

1. Coloque aqui o arquivo, por exemplo `garagem-foto.jpg`.
2. Referencie no HTML dos slides usando o servimento estático do Streamlit:

   ```html
   <img src="app/static/images/garagem-foto.jpg" alt="Descrição acessível">
   ```

   > O prefixo `app/static/` é resolvido pelo Streamlit quando
   > `enableStaticServing = true` (já configurado em `.streamlit/config.toml`).

## Recomendações

- Prefira imagens leves (JPG/WebP otimizados) para não pesar a transmissão.
- Sempre inclua `alt` descritivo (acessibilidade).
- Evite imagens com texto embutido; prefira texto real em HTML (selecionável).
