// Minimal stand-in for the parts of pmndrs/postprocessing the skill's effects use (Pass, Effect, enums).
// Effects become full-screen ShaderMaterials run by our own composer (src/main.js).
import * as THREE from "three";
export const BlendFunction = { NORMAL: 23, ADD: 2 };
export const EffectAttribute = { NONE: 0, DEPTH: 1, CONVOLUTION: 2 };
export class Pass {
    constructor(name = "Pass") {
        this.needsSwap = true;
        this.renderToScreen = false;
        this.needsDepthTexture = false;
        this.enabled = true;
        this.name = name;
    }
    setSize(_w, _h) { }
    setDepthTexture(_t) { }
    render(_r, _i, _o) { }
    dispose() { }
}
const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
export class Effect {
    constructor(name, frag, o = {}) {
        this.material = null;
        this.name = name;
        this.fragmentShader = frag;
        this.uniforms = o.uniforms ?? new Map();
        this.defines = o.defines ?? new Map();
        this.attributes = o.attributes ?? 0;
    }
    /** build the full-screen material (once); toScreen appends the linear -> sRGB output encode */
    mat(toScreen = false) {
        if (this.material && this.material._scr === toScreen)
            return this.material;
        const withDepth = /mainImage\s*\([^)]*float\s+depth/.test(this.fragmentShader);
        const u = {
            inputBuffer: { value: null }, depthBuffer: { value: null }, resolution: { value: new THREE.Vector2(1, 1) }, texelSize: { value: new THREE.Vector2(1, 1) },
            cameraNear: { value: 0.2 }, cameraFar: { value: 1500 },
        };
        for (const [k, v] of this.uniforms)
            u[k] = v;
        const defs = {};
        for (const [k, v] of this.defines)
            defs[k] = v;
        const head = `#include <common>\n#include <packing>\nuniform sampler2D inputBuffer; uniform sampler2D depthBuffer; uniform vec2 resolution; uniform vec2 texelSize; uniform float cameraNear; uniform float cameraFar;
varying vec2 vUv;
float readDepth(vec2 uv) { return texture2D(depthBuffer, uv).r; }
float getViewZ(float d) { return perspectiveDepthToViewZ(d, cameraNear, cameraFar); }
`;
        const enc = toScreen ? "o.rgb = mix(o.rgb * 12.92, 1.055 * pow(max(o.rgb, 0.0), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), o.rgb));" : "";
        const main = `void main() { vec4 c = texture2D(inputBuffer, vUv); vec4 o; ${withDepth ? "mainImage(c, vUv, readDepth(vUv), o);" : "mainImage(c, vUv, o);"} ${enc} gl_FragColor = vec4(o.rgb, 1.0); }`;
        this.material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: head + this.fragmentShader + "\n" + main, uniforms: u, defines: defs, depthTest: false, depthWrite: false });
        this.material._scr = toScreen;
        return this.material;
    }
    dispose() { this.material?.dispose(); }
}
