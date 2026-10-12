/*
 * The stone's silhouette as the camera sees it, small and blurred: the orbit reads it per pixel to
 * know where its letters cross the stone. Only layer 1 (the stone) is drawn, in flat white. One texel
 * is about 4 CSS px whatever the pixel ratio, so the softness looks the same everywhere.
 */
import * as THREE from "three";

export function createStoneMask(gl: THREE.WebGLRenderer) {
  const options = { depthBuffer: false, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  const targets = [new THREE.WebGLRenderTarget(1, 1, options), new THREE.WebGLRenderTarget(1, 1, options)];
  const silhouette = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const blur = new THREE.ShaderMaterial({
    uniforms: { uSrc: { value: null }, uStep: { value: new THREE.Vector2() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uSrc;
      uniform vec2 uStep;
      varying vec2 vUv;
      void main() {
        // 9-tap Gaussian from 5 bilinear fetches
        float m = texture2D(uSrc, vUv).r * 0.2270270270;
        m += (texture2D(uSrc, vUv + uStep * 1.3846153846).r + texture2D(uSrc, vUv - uStep * 1.3846153846).r) * 0.3162162162;
        m += (texture2D(uSrc, vUv + uStep * 3.2307692308).r + texture2D(uSrc, vUv - uStep * 3.2307692308).r) * 0.0702702703;
        gl_FragColor = vec4(m, m, m, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blur);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const spread = 1.4; // × the kernel; two rounds → letters change over ~30 CSS px

  return {
    texture: targets[0].texture,
    setSize(cssWidth: number, cssHeight: number) {
      const w = Math.max(1, Math.ceil(cssWidth / 4));
      const h = Math.max(1, Math.ceil(cssHeight / 4));
      for (const target of targets) target.setSize(w, h);
    },
    render(scene: THREE.Scene, camera: THREE.Camera) {
      const layers = camera.layers.mask;
      camera.layers.set(1);
      scene.overrideMaterial = silhouette;
      gl.setRenderTarget(targets[0]);
      gl.render(scene, camera);
      scene.overrideMaterial = null;
      camera.layers.mask = layers;
      const [a, b] = targets;
      for (let i = 0; i < 2; i++) {
        blur.uniforms.uSrc.value = a.texture;
        blur.uniforms.uStep.value.set(spread / a.width, 0);
        gl.setRenderTarget(b);
        gl.render(quadScene, camera);
        blur.uniforms.uSrc.value = b.texture;
        blur.uniforms.uStep.value.set(0, spread / a.height);
        gl.setRenderTarget(a);
        gl.render(quadScene, camera);
      }
      gl.setRenderTarget(null);
    },
    dispose() {
      for (const target of targets) target.dispose();
      silhouette.dispose();
      blur.dispose();
      quad.geometry.dispose();
    },
  };
}
