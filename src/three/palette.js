import * as THREE from 'three';

/** 3D palette — mirrors the CSS tokens in styles/tokens.css ("Sleek and Futuristic"). */
export const TEAL = '#116466'; // brand teal — bodies, rims
export const TEAL_HI = '#3fb8b0'; // lifted teal — emissive glows, lights
export const TEAL_LIGHT = '#8fd6cf';
export const PEACH = '#ffcb9a';
export const TAN = '#d9b08c';
export const PLATINUM = '#d1e8e2';
export const BASE = '#0e1a1a';
export const SURFACE = '#2c3531';

let gradTex = null;
/** Horizontal teal → peach gradient texture (shared, created once). */
export function gradientTexture() {
  if (gradTex) return gradTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 4;
  const g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 256, 0);
  lg.addColorStop(0, TEAL_HI);
  lg.addColorStop(1, PEACH);
  g.fillStyle = lg;
  g.fillRect(0, 0, 256, 4);
  gradTex = new THREE.CanvasTexture(c);
  gradTex.colorSpace = THREE.SRGBColorSpace;
  return gradTex;
}

/** Unlit material painted with the teal → peach gradient along U. */
export const gradientMaterial = () => new THREE.MeshBasicMaterial({ map: gradientTexture(), toneMapped: false });

/** Adds a teal → peach vertex-colour ramp along a TubeGeometry's length. */
export function paintTubeGradient(geo, tubularSegments, radialSegments) {
  const a = new THREE.Color(TEAL_HI);
  const b = new THREE.Color(PEACH);
  const c = new THREE.Color();
  const colors = new Float32Array(geo.attributes.position.count * 3);
  for (let i = 0; i <= tubularSegments; i++) {
    c.copy(a).lerp(b, i / tubularSegments);
    for (let j = 0; j <= radialSegments; j++) c.toArray(colors, (i * (radialSegments + 1) + j) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}
