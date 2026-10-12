/*
 * Smoke cursor: a small GPU fluid solver (stable-fluids, after Pavel Dobryakov's
 * WebGL Fluid Simulation, the technique behind React Bits' SplashCursor).
 * Config keys mirror SplashCursor's props so they can be tuned the same way.
 *
 * Pipeline per frame: curl → vorticity → divergence → pressure (Jacobi) →
 * gradient subtract → advect velocity → advect dye → draw dye.
 * The loop only runs while the cursor is moving and the smoke is still visible.
 */

const DEFAULTS = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 720,
  DENSITY_DISSIPATION: 10,
  VELOCITY_DISSIPATION: 3.5,
  PRESSURE: 0.25,
  PRESSURE_ITERATIONS: 20,
  CURL: 16,
  SPLAT_RADIUS: 0.05,
  SPLAT_FORCE: 2500,
  COLOR_UPDATE_SPEED: 3,
  COLOR: '#7f7b84',
  INTENSITY: 0.42,       // dye added per splat, × COLOR (high dissipation → each splat must carry more)
  IDLE_MS: 1400,         // stop the loop this long after the last movement
};

const VERT = /* glsl */ `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAG = {
  clear: `
    precision mediump float;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
  `,
  splat: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
    }
  `,
  advection: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
    }
  `,
  divergence: `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x;
      if (vR.x > 1.0) R = -C.x;
      if (vT.y > 1.0) T = -C.y;
      if (vB.y < 0.0) B = -C.y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }
  `,
  curl: `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }
  `,
  vorticity: `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
      gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
    }
  `,
  pressure: `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
    }
  `,
  gradientSubtract: `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,
  display: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }
  `,
};

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * @param {HTMLCanvasElement} canvas  absolutely positioned over the area to cover
 * @param {HTMLElement} area          pointer coordinates are taken relative to it
 * @param {object} options            DEFAULTS overrides; `quiet`: an element where the pointer stirs nothing
 * @returns {{ dispose(): void } | null}  null when WebGL2 float targets are missing
 */
export function createSplashCursor(canvas, area, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const quiet = options.quiet || null;
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;

  /* ---------- programs ---------- */
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERT);
  const makeProgram = (fragSource) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragSource));
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i).name;
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    return { program, uniforms, bind: () => gl.useProgram(program) };
  };
  const P = Object.fromEntries(Object.entries(FRAG).map(([k, src]) => [k, makeProgram(src)]));

  /* ---------- full-screen quad ---------- */
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const blit = (target) => {
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  /* ---------- render targets ---------- */
  const createFBO = (w, h, internalFormat, format) => {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach(unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return unit;
      },
      dispose() {
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(fbo);
      },
    };
  };
  const createDoubleFBO = (w, h, internalFormat, format) => {
    let a = createFBO(w, h, internalFormat, format);
    let b = createFBO(w, h, internalFormat, format);
    return {
      width: w,
      height: h,
      texelX: 1 / w,
      texelY: 1 / h,
      get read() { return a; },
      get write() { return b; },
      swap() { [a, b] = [b, a]; },
      dispose() { a.dispose(); b.dispose(); },
    };
  };

  const resolution = (base) => {
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    const min = Math.round(base);
    const max = Math.round(base * (aspect < 1 ? 1 / aspect : aspect));
    return aspect >= 1 ? [max, min] : [min, max];
  };

  let dye;
  let velocity;
  let divergence;
  let curl;
  let pressure;
  const initTargets = () => {
    for (const t of [dye, velocity, divergence, curl, pressure]) t?.dispose();
    const [sw, sh] = resolution(config.SIM_RESOLUTION);
    const [dw, dh] = resolution(config.DYE_RESOLUTION);
    dye = createDoubleFBO(dw, dh, gl.RGBA16F, gl.RGBA);
    velocity = createDoubleFBO(sw, sh, gl.RG16F, gl.RG);
    divergence = createFBO(sw, sh, gl.R16F, gl.RED);
    curl = createFBO(sw, sh, gl.R16F, gl.RED);
    pressure = createDoubleFBO(sw, sh, gl.R16F, gl.RED);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // soft smoke: no need for full retina
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === canvas.width && h === canvas.height && dye) return;
    canvas.width = w;
    canvas.height = h;
    initTargets();
  };

  /* ---------- simulation ---------- */
  const aspect = () => canvas.width / canvas.height;
  const correctRadius = (r) => (aspect() > 1 ? r * aspect() : r);

  const splat = (x, y, dx, dy, rgb) => {
    P.splat.bind();
    gl.uniform1i(P.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(P.splat.uniforms.aspectRatio, aspect());
    gl.uniform2f(P.splat.uniforms.point, x, y);
    gl.uniform3f(P.splat.uniforms.color, dx, dy, 0);
    gl.uniform1f(P.splat.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(P.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(P.splat.uniforms.color, rgb[0], rgb[1], rgb[2]);
    blit(dye.write);
    dye.swap();
  };

  const step = (dt) => {
    gl.disable(gl.BLEND);
    const tx = velocity.texelX;
    const ty = velocity.texelY;

    P.curl.bind();
    gl.uniform2f(P.curl.uniforms.texelSize, tx, ty);
    gl.uniform1i(P.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    P.vorticity.bind();
    gl.uniform2f(P.vorticity.uniforms.texelSize, tx, ty);
    gl.uniform1i(P.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.vorticity.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(P.vorticity.uniforms.curl, config.CURL);
    gl.uniform1f(P.vorticity.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    P.divergence.bind();
    gl.uniform2f(P.divergence.uniforms.texelSize, tx, ty);
    gl.uniform1i(P.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    P.clear.bind();
    gl.uniform1i(P.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(P.clear.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    P.pressure.bind();
    gl.uniform2f(P.pressure.uniforms.texelSize, tx, ty);
    gl.uniform1i(P.pressure.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(P.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    P.gradientSubtract.bind();
    gl.uniform2f(P.gradientSubtract.uniforms.texelSize, tx, ty);
    gl.uniform1i(P.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(P.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    P.advection.bind();
    gl.uniform2f(P.advection.uniforms.texelSize, tx, ty);
    gl.uniform1f(P.advection.uniforms.dt, dt);
    gl.uniform1i(P.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.advection.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(P.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(P.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.advection.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(P.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  };

  const draw = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    P.display.bind();
    gl.uniform1i(P.display.uniforms.uTexture, dye.read.attach(0));
    blit(null);
  };

  /* ---------- colour: the given tone, gently breathing in brightness ---------- */
  const base = hexToRgb(config.COLOR);
  let tint = base.map((c) => c * config.INTENSITY);
  let colorTimer = 0;
  const updateColor = (dt) => {
    colorTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorTimer < 1) return;
    colorTimer = 0;
    const k = config.INTENSITY * (0.8 + Math.random() * 0.4);
    tint = base.map((c) => c * k);
  };

  /* ---------- pointer ---------- */
  const pointer = { x: 0, y: 0, prevX: 0, prevY: 0, dx: 0, dy: 0, moved: false, inside: false };
  let lastActive = 0;
  let raf = 0;
  let last = 0;

  const toTexcoords = (e) => {
    const r = area.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, r];
  };

  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const [x, y] = toTexcoords(e);
    const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1 && !quiet?.contains(e.target);
    if (!inside) {
      pointer.inside = false;
      return;
    }
    if (!pointer.inside) {
      // entering: no jump from a stale position
      pointer.x = pointer.prevX = x;
      pointer.y = pointer.prevY = y;
      pointer.inside = true;
      return;
    }
    pointer.prevX = pointer.x;
    pointer.prevY = pointer.y;
    pointer.x = x;
    pointer.y = y;
    const a = aspect();
    pointer.dx = (x - pointer.prevX) * (a < 1 ? a : 1);
    pointer.dy = (y - pointer.prevY) / (a > 1 ? a : 1);
    pointer.moved = Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0;
    wake();
  };

  // A click lets out a soft puff instead of a bright burst.
  const onDown = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const [x, y] = toTexcoords(e);
    if (x < 0 || x > 1 || y < 0 || y > 1 || quiet?.contains(e.target)) return;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      splat(x, y, Math.cos(angle) * 260, Math.sin(angle) * 260, tint.map((c) => c * 2.2));
    }
    wake();
  };

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 1 / 60);
    last = now;
    resize();
    updateColor(dt);
    if (pointer.moved) {
      pointer.moved = false;
      splat(pointer.x, pointer.y, pointer.dx * config.SPLAT_FORCE, pointer.dy * config.SPLAT_FORCE, tint);
    }
    step(dt);
    draw();
    // Smoke is gone shortly after the cursor stops: then the loop sleeps.
    if (now - lastActive > config.IDLE_MS) {
      raf = 0;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  function wake() {
    lastActive = performance.now();
    if (raf || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      for (const t of [dye, velocity, divergence, curl, pressure]) t?.dispose();
      for (const p of Object.values(P)) gl.deleteProgram(p.program);
    },
  };
}
