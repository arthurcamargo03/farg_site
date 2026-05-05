# FARG Co. — CONTEXT

Documento vivo do site. Atualizar a cada sessão.

---

## Stack atual (pós-sessão 2026-05-05)

- **Build:** Vite 8.0.10
- **Anim:** GSAP 3.12 (sem ScrollTrigger nem SplitType)
- **3D / WebGL:** Three.js — `src/webgl/typo-hero.js` (dynamic import, chunk separado)
- **Smooth scroll:** REMOVIDO (scroll nativo)
- **Routing:** REMOVIDO (multi-page tradicional)
- **Fontes:** Space Grotesk (display) + JetBrains Mono (técnico) — Google Fonts

`package.json`: `vite` (devDep) + `gsap` + `three` (deps).
Bundle main: **54 KB** gzip. Three.js chunk separado: **603 KB** (só carrega em desktop ≥768px).

### Paleta (atualizada — cores da marca)
- `--bg`            `#0A0A0F`
- `--bg-elevated`   `#0F0F1A`
- `--bg-deep`       `#060609`
- `--text`          `#F4F4F8`
- `--text-muted`    `#8B8B9A`
- `--accent`        `#378ADD` (azul marca — era magenta `#FF2D6F`)
- `--accent-soft`   `#185FA5` (azul profundo)

---

## Hero atual

**Canvas WebGL** (`src/webgl/typo-hero.js`) com "FARG" em TextGeometry (helvetiker_bold, size=1.28, depth=0.34).

Shader: dark glass + fresnel rim azul (`#378ADD`) suave + fio brilhante na aresta. Transparente no centro, luminoso nas bordas.

Animações:
- **Entrada:** GSAP timeline, delay 1.15s (após loader) — desliza da direita + fade reveal (`expo.out`, 1.1–1.3s)
- **Idle:** oscilação sinusoidal `sin(t * 0.14) * 0.42` — ±24°, sempre volta de frente
- **Mouse:** offset relativo à posição de repouso (não cumulativo)
- **Scroll dolly:** camera.z de 7.5 → 10.5 conforme scroll desce
- **Hover glow:** `uHover` uniform GSAP tween ao entrar/sair da hero
- **Reduced motion:** frame estático, sem loop
- **Mobile < 768px:** canvas oculto, Three.js não carrega

Posição do grupo: `x=0.8, y=0.5` (direita-centro, levemente acima do centro vertical).

Background: dot-grid CSS azul sutil (`38px`, `rgba(55,138,221,0.09) 1px`) + gradientes radiais na `.section--hero`.

CSS orb e PNG Photoroom **removidos** (eram legado do Codex).

---

## Layout hero (pós-refatoração assimétrica)

`.section--hero .hero__layout` sai da caixa centrada (`min(1280px, 92vw) + margin:auto`) e usa:
```css
width: 100%;
max-width: 100%;
margin: 0;
padding-left: clamp(2rem, 6vw, 9rem);
```
Copy âncora à esquerda, direita livre para o 3D respirar.

Stats migradas para **dentro** da `.hero__copy` — flex row horizontal abaixo dos CTAs. Não mais coluna separada do grid.

---

## Estrutura de arquivos

```
index.html                  página principal
sites.html                  portfolio por segmento
styles.css                  ~3500 linhas
src/main.js                 boot dos módulos + dynamic import typo-hero
src/lib/motion.js           helpers reduced-motion / pointer
src/modules/scroll.js       sticky header, progress bar, nav active link
src/modules/magnetic.js     efeito magnético leve nos botões
src/modules/hero.js         entrada da hero (copy)
src/modules/reveals.js      title reveals + fade-ups + section parallax
src/modules/showcase.js     interações da página sites.html
src/modules/ui.js           loader, hamburger, contadores, marquee, year
src/webgl/typo-hero.js      Three.js "FARG" 3D — dynamic import
assets/                     Farg simbolo.png, FargLogo.png
                            (FARG (1)-Photoroom.png ainda existe mas não é usado no hero)
```

---

## Histórico de sessões

### Sessão N-2 (rebuild Awwwards-tier, obsoleto)
Hero Three.js com esfera + nodes orbitais + UnrealBloomPass, Barba SPA, Lenis smooth scroll, cursor mix-blend-mode. **Tudo desfeito pelo Codex.**

### Sessão N-1 (Claude — limpeza CSS)
Build validado. CSS purgado 4378 → 3648 linhas. Removidos blocos órfãos.

### Sessão N (Codex — 2026-05-05)
Remoção radical: WebGL/Three.js, cursor, Barba, Lenis, SplitType. Hero virou CSS puro com orb/PNG. Bundle 122KB.

### Sessão N+1 (Claude — 2026-05-05) ← atual
**Rebuilds e decisões desta sessão:**

1. **Three.js reintroduzido** via dynamic import — chunk separado, não bloqueia main bundle
2. **Hero 3D "FARG"** — TextGeometry helvetiker_bold, shader dark glass + fresnel azul, oscilação sinusoidal, entrada GSAP
3. **Paleta migrada de magenta → azul da marca** (`#378ADD` / `#185FA5`) — análise da logo FargLogo.png
4. **Background `#0A0A0F`** — exato pedido do cliente
5. **CSS orb e PNG Photoroom removidos** do hero
6. **Layout hero assimétrico** — full-width com padding esquerdo, copy âncora esquerda
7. **Stats horizontais** dentro da copy (não mais grid separado)
8. **Bundle split** — main 54KB, Three.js 603KB separado
9. **Mobile** — Three.js desligado < 768px, padding-top corrigido (era 12-15rem, legado do orb)
10. **Team avatars** redesenhados — dark glass monogram, arco azul girando, sem foto

---

## O que falta

### Crítico (P0)
- [ ] **Fotos reais do time** — avatares são letras estilizadas. Quando disponíveis: substituir por `<img>` com `loading="lazy"`
- [ ] **Sobrenomes dos sócios** — só primeiros nomes no HTML
- [ ] **Links LinkedIn** por membro do time
- [ ] **Cases reais** — placeholders ainda. Substituir por nomes reais + métricas verificadas + screenshots

### Alto (P1)
- [ ] **Lighthouse** — rodar auditoria (Performance, Acessibilidade, SEO). Alvo ≥90 cada
- [ ] **Mobile real** — testar em iPhone (touch targets, marquee em 360px, hamburger)
- [ ] **Stack das cards do time** — muito técnica para público PME. Reformular em linguagem de resultado

### Médio (P2)
- [ ] **sites.html** — verificar se cores/paleta azul foram aplicadas também nessa página
- [ ] **OG image** — sem imagem Open Graph definida (só texto)
- [ ] **Favicon** — verificar se existe e está correto

---

## Arquivos críticos

| Arquivo | O que faz |
|---------|-----------|
| `index.html` | Página principal |
| `styles.css` | Design system v2 + componentes |
| `src/main.js` | Boot + dynamic import typo-hero |
| `src/webgl/typo-hero.js` | Three.js "FARG" hero 3D |
| `src/lib/motion.js` | `prefersReducedMotion()`, `finePointer` |
| `assets/FargLogo.png` | Logo completa (referência de cor/identidade) |
| `assets/Farg simbolo.png` | Símbolo isolado (L + ponto) |
| `.claude/SKILL_marketing.md` | Hierarquia de conversão, copy, psicologia |
| `.claude/SKILL_uxui.md` | Filosofia anim, easings, performance |

---

## Como rodar

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 8000
# http://127.0.0.1:8000/
npm run build      # bundle dist/
npm run preview    # http://localhost:4173
```

**Pasta correta:** `/Users/arthurcamargo/Documents/farg_site`.
Existe cópia antiga em `/Users/arthurcamargo/.codex/worktrees/fc6d/farg_site` — **ignorar**.

---

## Critérios Awwwards SOTD (autoavaliação)

| Critério | Status |
|----------|--------|
| **Design** — tipografia, paleta, hierarquia | ✅ Space Grotesk + JetBrains Mono, paleta azul da marca |
| **Usabilidade** | ✅ Scroll nativo, layout assimétrico, animações com intenção |
| **Criatividade** | 🟡 "FARG" 3D dark glass é original; cases ainda placeholders |
| **Conteúdo** — copy, art direction | 🟡 Copy sólida, cases e fotos do time pendentes |
| **Mobile** | 🟡 3D desligado corretamente; falta teste em device real |
| **Performance** | 🟡 Main 54KB excelente; Three.js 603KB só em desktop |
| **Acessibilidade** | 🟡 Base sólida (skip-link, aria, lang); falta auditoria Lighthouse |
