// Ashima / Stefan Gustavson 3D simplex noise (MIT)
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const helpers = /* glsl */ `
vec2 rot2(vec2 v, float a){ float c = cos(a), s = sin(a); return vec2(c*v.x - s*v.y, s*v.x + c*v.y); }
`;

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uIntro;
uniform float uSize;
uniform float uPixelRatio;
uniform float uAspect;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform vec3  uColA;
uniform vec3  uColB;
uniform vec3  uColC;

attribute vec3 aS2;
attribute vec3 aS3;
attribute vec4 aRand;

varying vec3 vColor;
varying float vAlpha;

${noise}
${helpers}

void main(){
  float t = uTime;

  // Shape 0 — planet: sphere + equatorial ring, slowly turning on a tilted axis
  vec3 p0 = position;
  p0.xz = rot2(p0.xz, t * 0.12);
  p0.xy = rot2(p0.xy, 0.38);
  p0.yz = rot2(p0.yz, 0.22);

  // Shape 2 — rolling data terrain, tilted toward the camera
  vec3 p2 = aS2;
  p2.y += sin(p2.x * 0.8 + t * 0.7) * 0.16 + cos(p2.z * 1.1 - t * 0.5) * 0.16
        + snoise(vec3(p2.xz * 0.35, t * 0.12)) * 0.45;
  float ca = cos(0.48), sa = sin(0.48);
  p2 = vec3(p2.x, p2.y * ca - p2.z * sa, p2.y * sa + p2.z * ca);
  vec3 p1 = p2; // About uses the terrain too

  // Shape 3 — swirling portal; inner particles orbit faster
  vec3 p3 = aS3;
  float r3 = max(length(p3.xy), 0.2);
  p3.xy = rot2(p3.xy, t * 0.32 / r3);

  // Morph with per-particle stagger so shapes dissolve rather than slide
  float m = clamp(uMorph, 0.0, 3.0);
  float seg = min(floor(m), 2.0);
  float f = m - seg;
  float k = clamp((f - aRand.x * 0.4) / 0.6, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec3 a = seg < 0.5 ? p0 : (seg < 1.5 ? p1 : p2);
  vec3 b = seg < 0.5 ? p1 : (seg < 1.5 ? p2 : p3);
  vec3 pos = mix(a, b, k);
  float transit = sin(k * 3.14159265);

  // Living noise; much stronger while in transit between shapes
  vec3 q = pos * 0.55 + vec3(0.0, t * 0.09, 0.0);
  float n1 = snoise(q);
  float n2 = snoise(q + 13.1);
  vec3 disp = vec3(n1, n2, n1 * 0.6 - n2 * 0.6);
  pos += disp * (0.05 + transit * 0.9);

  // Intro: particles rush in from deep space
  float it = clamp((uIntro - aRand.x * 0.35) / 0.65, 0.0, 1.0);
  it = 1.0 - pow(1.0 - it, 3.0);
  vec3 scatter = normalize(aRand.yzw - 0.5 + 0.0001) * (9.0 + aRand.x * 14.0);
  pos = mix(scatter, pos, it);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // Pointer repulsion in screen space
  vec2 ndc = gl_Position.xy / gl_Position.w;
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float force = smoothstep(0.32, 0.0, dist) * uMouseStrength;
  vec2 dir = d / max(dist, 0.0001);
  dir.x /= uAspect;
  gl_Position.xy += dir * force * 0.09 * gl_Position.w;

  float size = uSize * (0.35 + aRand.y * 1.15) * (1.0 + transit * 0.6);
  gl_PointSize = min(size * uPixelRatio / -mv.z, 14.0 * uPixelRatio);

  vec3 col = mix(uColA, uColB, smoothstep(0.45, 1.0, aRand.z));
  col = mix(col, uColC, step(0.95, aRand.w));
  col += force * vec3(1.0, 0.45, 0.2) * 0.9;
  vColor = col;
  vAlpha = (0.3 + 0.7 * aRand.y) * smoothstep(20.0, 4.0, -mv.z) * (0.4 + 0.6 * it);
}
`;

export const particleFragment = /* glsl */ `
uniform float uAlpha;
varying vec3 vColor;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a * vAlpha * uAlpha);
}
`;

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aRand;
varying float vAlpha;
void main(){
  vec3 p = position;
  p.y = mod(p.y + uTime * (0.04 + aRand * 0.08) + 10.0, 20.0) - 10.0;
  p.x += sin(uTime * 0.2 + aRand * 20.0) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (6.0 + aRand * 14.0) * uPixelRatio / -mv.z;
  vAlpha = (0.15 + aRand * 0.35) * (0.6 + 0.4 * sin(uTime * (0.5 + aRand) + aRand * 40.0));
}
`;

export const dustFragment = /* glsl */ `
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(0.93, 0.9, 0.85), a * a * vAlpha);
}
`;
