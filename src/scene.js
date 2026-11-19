import * as THREE from 'three';
import { particleVertex, particleFragment, dustVertex, dustFragment } from './shaders.js';

const gauss = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

function randomOnSphere(r) {
  const u = Math.random() * 2 - 1;
  const th = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(th) * r, u * r, s * Math.sin(th) * r];
}

function buildShapes(count) {
  const s0 = new Float32Array(count * 3);
  const s2 = new Float32Array(count * 3);
  const s3 = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 4);
  const side = Math.ceil(Math.sqrt(count));

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // 0 — planet: 78% sphere shell, 22% thin equatorial ring
    if (Math.random() < 0.78) {
      const [x, y, z] = randomOnSphere(1.45 + gauss() * 0.02);
      s0.set([x, y, z], i3);
    } else {
      const a = Math.random() * Math.PI * 2;
      const r = 2.05 + Math.pow(Math.random(), 1.6) * 0.75;
      s0.set([Math.cos(a) * r, gauss() * 0.012, Math.sin(a) * r], i3);
    }

    // 2 — terrain grid
    {
      const gx = (i % side) / side;
      const gz = Math.floor(i / side) / side;
      s2.set([(gx - 0.5) * 12, -0.4, -6.5 + gz * 10], i3);
    }

    // 3 — portal ring + halo + sparse core
    {
      const a = Math.random() * Math.PI * 2;
      const roll = Math.random();
      let r, z;
      if (roll < 0.68) { r = 2.3 + gauss() * 0.05; z = gauss() * 0.04; }
      else if (roll < 0.86) { r = 2.3 + Math.pow(Math.random(), 2.2) * 1.4; z = gauss() * 0.1; }
      else { r = 0.25 + Math.pow(Math.random(), 0.7) * 1.9; z = gauss() * 0.06; }
      s3.set([Math.cos(a) * r, Math.sin(a) * r, z], i3);
    }

    rnd.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  return { s0, s2, s3, rnd };
}

export function createScene(canvas, { reduce = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const pr = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(pr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const small = window.innerWidth < 768;
  const COUNT = small ? 10000 : 22000;
  const { s0, s2, s3, rnd } = buildShapes(COUNT);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(s0, 3));
  geo.setAttribute('aS2', new THREE.BufferAttribute(s2, 3));
  geo.setAttribute('aS3', new THREE.BufferAttribute(s3, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4));

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uIntro: { value: reduce ? 1 : 0 },
    uSize: { value: small ? 36 : 33 },
    uPixelRatio: { value: pr },
    uAspect: { value: window.innerWidth / window.innerHeight },
    uMouse: { value: new THREE.Vector2(9, 9) },
    uMouseStrength: { value: 0 },
    uAlpha: { value: 1 },
    uColA: { value: new THREE.Color('#ece6da') },
    uColB: { value: new THREE.Color('#ff5b29') },
    uColC: { value: new THREE.Color('#86d4db') },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  // Background dust for depth
  const DUST = small ? 300 : 700;
  const dpos = new Float32Array(DUST * 3);
  const drnd = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dpos.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -Math.random() * 16 + 2], i * 3);
    drnd[i] = Math.random();
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dgeo.setAttribute('aRand', new THREE.BufferAttribute(drnd, 1));
  const dust = new THREE.Points(
    dgeo,
    new THREE.ShaderMaterial({
      uniforms: { uTime: uniforms.uTime, uPixelRatio: uniforms.uPixelRatio },
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  dust.frustumCulled = false;
  scene.add(dust);

  // Scroll-driven state (tweened by GSAP from main.js)
  const state = { morph: 0, x: 0, y: 0, scale: 1, rotY: 0, alpha: 1, intro: uniforms.uIntro.value };

  // Pointer
  const mouse = { x: 0, y: 0, sx: 0, sy: 0, ndcX: 9, ndcY: 9, energy: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (mouse.ndcX > 5) { mouse.ndcX = mouse.x; mouse.ndcY = mouse.y; }
    mouse.energy = 1;
  });
  document.documentElement.addEventListener('pointerleave', () => { mouse.energy = 0; });

  let xFactor = 1;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
    // On narrow screens the object stays centered
    xFactor = w < 768 ? 0 : Math.min(1, (w / h) / 1.6);
  }
  resize();
  window.addEventListener('resize', resize);

  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function update(time, dt) {
    if (!visible) return;
    const lerp = 1 - Math.pow(0.001, dt);
    mouse.sx += (mouse.x - mouse.sx) * lerp * 0.6;
    mouse.sy += (mouse.y - mouse.sy) * lerp * 0.6;
    mouse.ndcX += (mouse.x - mouse.ndcX) * lerp;
    mouse.ndcY += (mouse.y - mouse.ndcY) * lerp;
    mouse.energy *= Math.pow(0.35, dt);

    uniforms.uTime.value = time;
    uniforms.uMorph.value = state.morph;
    uniforms.uIntro.value = state.intro;
    uniforms.uAlpha.value = state.alpha;
    uniforms.uMouse.value.set(mouse.ndcX, mouse.ndcY);
    const target = reduce ? 0 : 0.35 + mouse.energy * 0.65;
    uniforms.uMouseStrength.value += (target - uniforms.uMouseStrength.value) * lerp * 0.5;

    // On phones the planet sits a little higher so it does not cover the name
    const raise = xFactor === 0 ? 0.85 * Math.max(0, 1 - state.morph) : 0;
    group.position.set(state.x * xFactor, state.y + raise, 0);
    group.scale.setScalar(state.scale * (xFactor === 0 ? 0.62 : 1));
    group.rotation.y = state.rotY + mouse.sx * 0.22;
    group.rotation.x = -mouse.sy * 0.14;

    dust.position.x = -mouse.sx * 0.4;
    dust.position.y = -mouse.sy * 0.25;

    camera.position.x = Math.sin(time * 0.11) * 0.12;
    camera.position.y = Math.cos(time * 0.09) * 0.08;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  return { state, update };
}
