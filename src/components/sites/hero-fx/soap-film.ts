/**
 * The soap bubble's film in GLSL (TitleFx): value noise and its fbm (the film's swirls), the film's colour by
 * interference, the dark room with a window and a strip of light it reflects (by the reflected ray: y up, z towards
 * the viewer), and the film lit and toned to the page. Plain GLSL, valid in GLSL ES 1 and 3.
 */
export const SOAP_FILM = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
// a soap film's colour by interference: reflected light at three wavelengths for a film d nm thick, seen at cos i
vec3 film(float d, float cosi) {
  float sint = sqrt(max(0.0, 1.0 - cosi * cosi)) / 1.33;
  float cost = sqrt(1.0 - sint * sint);
  vec3 phase = 4.0 * 3.14159 * 1.33 * d * cost / vec3(650.0, 532.0, 450.0);
  return max(0.5 - 0.5 * cos(phase), 0.0); // (never a hair below 0: pow() of it would be NaN, a stray dot)
}
// the room it reflects: dark, a window up left with its bars, a strip of light on the right, a dim floor
float room(vec3 r) {
  float l = 0.02 + 0.03 * smoothstep(-0.2, 0.8, r.y);
  vec2 w = (r.xy - vec2(-0.4, 0.38)) / vec2(0.44, 0.36);
  float win = (1.0 - smoothstep(0.45, 1.0, max(abs(w.x), abs(w.y)))) * smoothstep(-0.1, 0.2, r.z);
  float bars = 1.0 - 0.75 * (1.0 - smoothstep(0.02, 0.05, abs(w.x + 0.05))) - 0.75 * (1.0 - smoothstep(0.02, 0.05, abs(w.y + 0.1)));
  l += 4.5 * win * max(bars, 0.0);
  l += 2.2 * exp(-pow((r.x - 0.8) / 0.07, 2.0)) * smoothstep(-0.7, 0.1, r.y) * (1.0 - smoothstep(0.35, 0.85, r.y));
  l += 0.08 * smoothstep(-0.25, -0.85, r.y);
  return l;
}
// the film lit: its colours by the room it reflects (Fresnel: little straight on, much at the rim), a glow of them at
// the rim, faint swirls over the whole film, the light's own spark up left. Toned to the page: the film's bands in
// black and white (their brightness kept), only the orders a film shows green in the accent. n: the normal (z towards
// the viewer); swirl: the film's fbm there. Returns premultiplied colour and alpha: what it reflects is what it hides
vec4 soapFilm(vec3 n, float swirl, vec3 accent) {
  float cosi = clamp(n.z, 0.0, 1.0);
  float thick = 300.0 + 260.0 * swirl + 110.0 * (0.5 - 0.5 * n.y);
  vec3 tint = pow(film(thick, cosi), vec3(1.3)) * 2.0;
  float lum = dot(tint, vec3(0.3, 0.59, 0.11));
  float green = smoothstep(0.08, 0.4, tint.g - max(tint.r, tint.b));
  tint = mix(vec3(lum), accent * lum * 1.5, green * 0.8);
  float fres = 0.04 + 0.96 * pow(1.0 - cosi, 2.2);
  vec3 ray = vec3(2.0 * n.z * n.xy, 2.0 * n.z * n.z - 1.0);
  vec3 col = tint * (room(ray) + 0.12) * fres;
  col += tint * pow(1.0 - cosi, 2.6) * 0.42;
  col += tint * 0.035 * smoothstep(0.35, 0.75, swirl);
  vec3 light = normalize(vec3(-0.45, 0.55, 0.7));
  col += vec3(pow(max(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0), 140.0) * 0.8);
  col = min(col, vec3(1.0));
  return vec4(col, max(max(col.r, max(col.g, col.b)), fres * 0.2));
}
`;
