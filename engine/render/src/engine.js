// Frame engine (shared by the browser page and the Remotion composition) of "The Ghost Army": vanilla three.js port of the cartoon-3d-short composer.
// Chain (as in the skill's Bridge.tsx): scene -> InkPass (world lines) -> lens blur pre + main -> Neutral tone map
// -> grade (+ flash / fade) -> canvas. Pixel-sized parameters are specified at 1080 px on the short side.
import * as THREE from "three";
import { InkPass, noInkFallback, NOINK } from "../lib/ink.js";
import { LensBlur } from "../lib/lensblur.js";
import { GradeEffect, GRADES } from "../lib/grade.js";
import { Effect } from "../lib/postprocessing.js";
import { World } from "./world.js";
import { setWords, frameState, TOTAL, FPS, SHOTS } from "./story.js";

export async function createEngine(canvas, W, H, words, q = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = q.shadow !== "0";
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // we encode ourselves in the last pass

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.2, 2500);
  camera.layers.enable(NOINK);

  const mkRT = (depth) => {
    const o = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, depthBuffer: !!depth };
    if (depth) o.depthTexture = new THREE.DepthTexture(W, H, THREE.UnsignedIntType);
    return new THREE.WebGLRenderTarget(W, H, o);
  };
  const rtA = mkRT(true), rtB = mkRT(false);
  const mkHalf = () => new THREE.WebGLRenderTarget(W >> 1, H >> 1, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, depthBuffer: false });
  const rtH1 = mkHalf(), rtH2 = mkHalf();

  const ink = new InkPass(scene, camera);
  ink.setSize(W, H);
  ink.setDepthTexture(rtA.depthTexture);
  const lens = new LensBlur({ maxCoC: 24, nearScale: 1.2 });
  // tone map + grade + flash/fade in ONE pass (the grade's own uniforms are shared, so grade.set() still works)
  const grade = new GradeEffect(GRADES.day, 1);
  const FINAL = `#include <tonemapping_pars_fragment>
  ${grade.fragmentShader.replace("void mainImage(", "void gradeImage(")}
  uniform float flash; uniform float fade; uniform float exposure;
  void mainImage(const in vec4 c, const in vec2 uv, out vec4 o) {
    vec4 t = vec4(NeutralToneMapping(max(c.rgb, 0.0)), 1.0); vec4 g; gradeImage(t, uv, g);
    vec3 x = g.rgb * exposure; x = mix(x, vec3(1.0), flash); o = vec4(x * (1.0 - fade), 1.0); }`;
  const finalFx = new Effect("Final", FINAL, { uniforms: new Map([...grade.uniforms, ["flash", new THREE.Uniform(0)], ["fade", new THREE.Uniform(0)], ["exposure", new THREE.Uniform(1)]]) });
  // half-resolution lens result composited over the sharp frame by each pixel's own circle of confusion
  const COMP = `uniform sampler2D tBlur; uniform float focus; uniform float cInf; uniform float nearScale; uniform float maxCoC;
  void mainImage(const in vec4 c, const in vec2 uv, const in float depth, out vec4 o) {
    float s = min(resolution.x, resolution.y) / 1080.0, d = -getViewZ(depth);
    float k = cInf * s * (1.0 - focus / max(d, 1e-3)); if (k < 0.0) k *= nearScale; k = clamp(abs(k), 0.0, maxCoC * s);
    vec4 b = texture2D(tBlur, uv);
    o = vec4(mix(c.rgb, b.rgb, smoothstep(0.6, 2.2, k)), 1.0); }`;
  const compFx = new Effect("LensComp", COMP, { uniforms: new Map([["tBlur", new THREE.Uniform(null)], ["focus", lens.pre.uniforms.get("focus")], ["cInf", lens.pre.uniforms.get("cInf")], ["nearScale", new THREE.Uniform(1.2)], ["maxCoC", new THREE.Uniform(24)]]) });
  const fsScene = new THREE.Scene(), fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false; fsScene.add(quad);
  const runFx = (fx, input, output, toScreen = false) => {
    const m = fx.mat(toScreen), u = m.uniforms;
    u.inputBuffer.value = input.texture; u.depthBuffer.value = rtA.depthTexture;
    u.resolution.value.set(W, H); u.texelSize.value.set(1 / W, 1 / H);
    u.cameraNear.value = camera.near; u.cameraFar.value = camera.far;
    quad.material = m;
    renderer.setRenderTarget(output);
    renderer.render(fsScene, fsCam);
  };

  let world = null;
  const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();
  const post = { ink: q.ink !== "0", lens: q.lens !== "0", grade: q.grade !== "0" };

  const PROF = q.prof === "1", gl = renderer.getContext(), px = new Uint8Array(4);
  const pf = new Float32Array(4);
  let PT = {}, _pt = 0;
    const mark = (k) => { if (!PROF) return; if (renderer.getRenderTarget()) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pf); else gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const n = performance.now(); PT[k] = Math.round(n - _pt); _pt = n; };
  function renderFrame(f) {
    PT = {}; _pt = performance.now();
    const st = frameState(f); st.H = H;
    world.update(st, camera, scene);
    noInkFallback(world.root);
    mark("js");
    // lens: focus distance along the view axis to the shot's focus point
    camera.getWorldDirection(fwd);
    fpt.set(...st.focus);
    lens.focus = Math.max(0.3, fpt.sub(camera.position).dot(fwd));
    lens.cInf = st.cInf;
    const gk = st.grade || st.light; if (grade._light !== gk) { grade.set(GRADES[gk]); grade._light = gk; }
    grade.amount = post.grade ? 1 : 0;
    finalFx.uniforms.get("flash").value = st.flash;
    finalFx.uniforms.get("fade").value = st.fade;
    // 1) scene
    renderer.setRenderTarget(rtA);
    renderer.setClearColor(0x000000, 1);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    mark("scene");
    // 2) ink (writes back into rtA, keeps its depth)
    if (post.ink) ink.render(renderer, rtA);
    mark("ink");
    // 3) lens blur at half resolution (pre: A -> H1, main: H1 -> H2), composited by CoC (A + H2 -> B)
    let cur = rtA;
    if (post.lens && st.cInf >= 0.25) {
      runFx(lens.pre, rtA, rtH1); runFx(lens.main, rtH1, rtH2);
      compFx.uniforms.get("tBlur").value = rtH2.texture;
      runFx(compFx, rtA, rtB); cur = rtB;
    }
    mark("lens");
    // 4) tone map + grade + flash / fade + sRGB encode -> canvas
    runFx(finalFx, cur, null, true);
    mark("post");
    return st.shot;
  }


  setWords(words);
  world = new World();
  scene.add(world.root);
  await world.ready;
  const ray = new THREE.Raycaster();
  const probe = (f) => { renderFrame(f); ray.setFromCamera(new THREE.Vector2(0, 0), camera); ray.layers.enableAll(); const hits = ray.intersectObjects(scene.children, true).slice(0, 4);
    return hits.map((h) => ({ d: +h.distance.toFixed(2), type: h.object.type, pos: h.object.position.toArray().map((v) => +v.toFixed(1)), pt: h.point.toArray().map((v) => +v.toFixed(1)), mat: (h.object.material && (h.object.material.name || (h.object.material.color && h.object.material.color.getHexString()))) || '', vis: h.object.visible })); };
  return { renderFrame, probe, TOTAL, FPS, SHOTLIST: SHOTS.map((s) => [s.id, Math.round(s.a * FPS), Math.round(s.b * FPS)]), timing: () => PT };
}
