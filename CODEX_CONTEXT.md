# Contexto Codex - FARG Site

Atualizado em: 2026-05-05

## Pasta correta

O site que está rodando no navegador é este:

```bash
/Users/arthurcamargo/Documents/farg_site
```

Existe outra cópia antiga em:

```bash
/Users/arthurcamargo/.codex/worktrees/fc6d/farg_site
```

Essa segunda pasta era o site azul/antigo aberto na porta 8001. Ela não é a versão que deve ser usada agora.

## Como rodar

Dentro da pasta correta:

```bash
cd /Users/arthurcamargo/Documents/farg_site
npm run dev -- --host 127.0.0.1 --port 8000
```

Depois abra:

```bash
http://127.0.0.1:8000/
```

Para validar build de produção:

```bash
npm run build
```

## Estrutura atual

Arquivos principais:

- `index.html`: página principal da FARG Co.
- `sites.html`: página de portfólio por segmento.
- `styles.css`: estilos globais do site.
- `src/main.js`: ponto de entrada do JavaScript.
- `src/modules/scroll.js`: header sticky, progresso de rolagem e link ativo.
- `src/modules/magnetic.js`: efeito magnético leve nos botões.
- `src/modules/hero.js`: entrada animada da hero.
- `src/modules/reveals.js`: animações de entrada das seções.
- `src/modules/showcase.js`: interações da página `sites.html`.
- `src/modules/ui.js`: loader, menu mobile, contadores, marquee e ano no rodapé.
- `src/lib/motion.js`: helpers para motion/pointer/reduced-motion.

## Dependências atuais

O projeto agora usa só:

- `vite` como ferramenta de desenvolvimento/build.
- `gsap` para animações.

Dependências antigas removidas:

- `three`
- `ogl`
- `lenis`
- `split-type`
- `@barba/core`

## Limpeza feita

Foram removidos do fluxo atual:

- WebGL/Three da hero, que estava pesado e deixando a página travada.
- Cursor customizado antigo.
- Transições Barba antigas.
- Lenis/smooth scroll antigo.
- SplitType para quebrar textos em caracteres.
- Atributos antigos `data-barba`, `data-cursor` e `data-cursor-hover` do HTML.
- CSS morto do cursor, tooltip WebGL, canvas WebGL e curtain Barba.
- Pasta `src/webgl`, que ficou vazia depois da remoção dos arquivos antigos.

## Hero atual

A hero não usa mais canvas/WebGL. O visual da logo/energia é feito em CSS com:

- `.hero-scene`
- `.hero-scene::before`
- `.hero-scene::after`

A imagem usada é:

```bash
assets/FARG (1)-Photoroom.png
```

Essa escolha deixou o site mais leve e estável.

## Estado de validação

O comando abaixo passou:

```bash
npm run build
```

Resultado relevante:

- `dist/index.html` gerado.
- `dist/sites.html` gerado.
- JS final em torno de 122 kB, bem menor que quando carregava Three/WebGL.

Também foi confirmado que o servidor local respondeu em:

```bash
http://127.0.0.1:8000/
```

com status HTTP 200.

## Observações importantes

O repositório mostra muitas mudanças em `node_modules` porque essa pasta parece estar versionada/rastreada no git. Em projetos Vite, normalmente `node_modules` deveria ficar fora do git via `.gitignore`.

Os arquivos `script.js` e `site_farg` já aparecem como deletados no status do git. Eles não fazem parte do app Vite atual.

Se outro assistente for mexer no projeto, ele deve começar lendo este arquivo e trabalhando apenas na pasta correta:

```bash
/Users/arthurcamargo/Documents/farg_site
```
