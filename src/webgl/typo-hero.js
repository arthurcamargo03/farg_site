import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import gsap from 'gsap';
import { prefersReducedMotion, finePointer } from '../lib/motion.js';

/* ─── Shader ─── */
const vert = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal  = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const frag = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform float uTime;
  uniform float uReveal;
  uniform float uHover;
  uniform vec3  uRim;

  void main() {
    vec3  n  = normalize(vNormal);
    vec3  v  = normalize(vViewDir);
    float fr = 1.0 - max(dot(n, v), 0.0);

    float rim      = pow(fr, 2.4);
    float sharpRim = pow(fr, 9.0) * 2.2;

    float pulse  = sin(uTime * 0.9) * 0.03;
    float hBoost = uHover * 0.14;

    vec3 body = vec3(0.04, 0.03, 0.07);
    body += (1.0 - fr) * uRim * 0.04;

    vec3 col  = mix(body, uRim, clamp(rim * 0.78 + pulse + hBoost, 0.0, 1.0));
    col      += sharpRim * mix(uRim, vec3(0.82, 0.94, 1.0), 0.5);

    float alpha = (rim * 0.82 + sharpRim + 0.07) * uReveal;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

/* ─── Main ─── */
export function initTypoHero(canvas) {
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 7.5;

  /* ── geometry ── */
  const loader = new FontLoader();
  const font   = loader.parse(fontData);

  const geo = new TextGeometry('FARG', {
    font,
    size:           1.28,
    depth:          0.34,
    curveSegments:  14,
    bevelEnabled:   true,
    bevelThickness: 0.08,
    bevelSize:      0.04,
    bevelOffset:    0,
    bevelSegments:  8,
  });

  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(
    -(bb.max.x + bb.min.x) / 2,
    -(bb.max.y + bb.min.y) / 2,
    0
  );

  const uniforms = {
    uTime:   { value: 0 },
    uReveal: { value: 0 },
    uHover:  { value: 0 },
    uRim:    { value: new THREE.Color(0x378add) },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader:   vert,
    fragmentShader: frag,
    transparent:    true,
    side:           THREE.FrontSide,
    uniforms,
  });

  const mesh = new THREE.Mesh(geo, mat);
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  /* entrance start state — offset right, rotated */
  group.position.set(2.2, 0.5, 0);
  group.rotation.y = 0.4;

  /* ── resize ── */
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  /* ── scroll dolly ── */
  let zTarget = 7.5;
  const onScroll = () => {
    const progress = Math.min(window.scrollY / 450, 1);
    zTarget = 7.5 + progress * 3;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── mouse ── */
  const mouse = { tx: 0, ty: 0, cx: 0, cy: 0 };
  const onMove = finePointer
    ? (e) => {
        mouse.tx = (e.clientX / innerWidth  - 0.5) *  0.55;
        mouse.ty = (e.clientY / innerHeight - 0.5) *  0.30;
      }
    : null;
  if (onMove) window.addEventListener('pointermove', onMove);

  /* ── hover glow ── */
  const hero = canvas.parentElement;
  const onEnter = () => gsap.to(uniforms.uHover, { value: 1, duration: 0.4, ease: 'power2.out' });
  const onLeave = () => gsap.to(uniforms.uHover, { value: 0, duration: 0.7, ease: 'power2.out' });
  hero.addEventListener('pointerenter', onEnter);
  hero.addEventListener('pointerleave', onLeave);

  /* ── loop ── */
  let rafId = null;
  let active = false;

  const tick = (ts = 0) => {
    const t = ts * 0.001;
    uniforms.uTime.value = t;

    /* scroll dolly lerp */
    camera.position.z += (zTarget - camera.position.z) * 0.06;

    /* slow oscillation — generous amplitude, always returns face-forward */
    const idleY = Math.sin(t * 0.14) * 0.42;
    const idleX = Math.sin(t * 0.09) * 0.06;

    if (onMove) {
      mouse.cx += (mouse.tx - mouse.cx) * 0.04;
      mouse.cy += (mouse.ty - mouse.cy) * 0.04;
      group.rotation.y = idleY + mouse.cx * 0.45;
      group.rotation.x = idleX - mouse.cy * 0.3;
    } else {
      group.rotation.y = idleY;
      group.rotation.x = idleX;
    }

    renderer.render(scene, camera);
    if (active) rafId = requestAnimationFrame(tick);
  };

  const start = () => { if (!active) { active = true; requestAnimationFrame(tick); } };
  const stop  = () => { active = false; cancelAnimationFrame(rafId); };

  /* ── entrance animation ── */
  const reduced = prefersReducedMotion();

  if (reduced) {
    uniforms.uReveal.value = 1;
    group.position.set(0.8, 0.5, 0);
    group.rotation.y = 0;
    tick(0);
  } else {
    const io = new IntersectionObserver(([e]) => {
      e.isIntersecting ? start() : stop();
    }, { threshold: 0.05 });
    io.observe(hero);

    /* delay entrance until page loader fades (≈1.1s) */
    gsap.timeline({ delay: 1.15 })
      .to(uniforms.uReveal, { value: 1, duration: 1.1, ease: 'expo.out' }, 0)
      .to(group.position,   { x: 0.8, y: 0.5, duration: 1.0, ease: 'expo.out' }, 0)
      .to(group.rotation,   { y: 0,    duration: 1.3, ease: 'expo.out' }, 0);
  }

  /* ── cleanup ── */
  return () => {
    stop();
    ro.disconnect();
    window.removeEventListener('scroll', onScroll);
    if (onMove) window.removeEventListener('pointermove', onMove);
    hero.removeEventListener('pointerenter', onEnter);
    hero.removeEventListener('pointerleave', onLeave);
    geo.dispose();
    mat.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
