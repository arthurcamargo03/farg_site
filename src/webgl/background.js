import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
import { prefersReducedMotion, finePointer } from '../lib/motion.js';

const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uReduce;

vec3 COLOR_DEEP   = vec3(0.035, 0.035, 0.224);
vec3 COLOR_MID    = vec3(0.094, 0.369, 0.647);
vec3 COLOR_GLOW   = vec3(0.216, 0.541, 0.867);
vec3 COLOR_HIGH   = vec3(0.521, 0.717, 0.921);
vec3 COLOR_BLACK  = vec3(0.0);

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  float t = uTime * 0.07 * (1.0 - uReduce);

  /* flow field */
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 + t)));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 1.1));
  float f = fbm(p + 4.0 * r);

  /* mouse perturbation */
  vec2 mouseUv = uMouse / uResolution;
  vec2 mp = mouseUv * 2.0 - 1.0;
  mp.x *= uResolution.x / uResolution.y;
  float md = length(p - mp);
  float mouseInf = smoothstep(0.85, 0.0, md) * uMouseActive * 0.4;
  f += mouseInf;

  /* color blend */
  vec3 col = COLOR_BLACK;
  col = mix(col, COLOR_DEEP, smoothstep(-0.4, 0.4, f));
  col = mix(col, COLOR_MID, smoothstep(-0.1, 0.55, f));
  col = mix(col, COLOR_GLOW, smoothstep(0.25, 0.8, f) * 0.55);
  col += COLOR_HIGH * pow(smoothstep(0.5, 0.85, f), 3.0) * 0.45;

  /* center radial bias toward dark for content readability */
  float vignette = smoothstep(1.4, 0.4, length(p * vec2(0.85, 1.05)));
  col *= mix(0.55, 1.0, vignette);

  /* subtle grain */
  float grain = (fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.025;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
`;

export const initBackgroundShader = () => {
  const canvas = document.querySelector('[data-bg-canvas]');
  if (!canvas) return;

  let renderer, program, mesh, animationId;
  const reduce = prefersReducedMotion();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  try {
    renderer = new Renderer({
      canvas,
      dpr,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
  } catch (err) {
    console.warn('WebGL not available, removing canvas', err);
    canvas.remove();
    return;
  }

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const geometry = new Triangle(gl);
  const mouse = new Vec2(window.innerWidth / 2, window.innerHeight / 2);
  let mouseActive = 0;

  program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Vec2(window.innerWidth, window.innerHeight) },
      uMouse: { value: mouse },
      uMouseActive: { value: mouseActive },
      uReduce: { value: reduce ? 1 : 0 },
    },
  });

  mesh = new Mesh(gl, { geometry, program });

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    program.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  };
  resize();
  window.addEventListener('resize', resize);

  if (finePointer && !reduce) {
    window.addEventListener('pointermove', (e) => {
      mouse.set(e.clientX, window.innerHeight - e.clientY);
      mouseActive = 1;
      program.uniforms.uMouseActive.value = 1;
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      mouseActive = 0;
      program.uniforms.uMouseActive.value = 0;
    });
  }

  let last = performance.now();
  const start = last;
  const render = () => {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    program.uniforms.uTime.value = (now - start) / 1000;
    /* ease mouseActive toward target */
    program.uniforms.uMouseActive.value += (mouseActive - program.uniforms.uMouseActive.value) * Math.min(1, dt * 6);
    renderer.render({ scene: mesh });
    if (!reduce) animationId = requestAnimationFrame(render);
  };
  render();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else if (!reduce) {
      last = performance.now();
      animationId = requestAnimationFrame(render);
    }
  });
};
