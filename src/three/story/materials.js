import * as THREE from 'three';
import { PEACH, TAN, TEAL_HI } from '../palette';

/** Story palette: smooth, soft materials (clean shapes) in the site's teal / peach theme. */
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.05, ...extra });
const glow = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity });

export const M = {
  ground: std('#1f403d', { roughness: 0.95 }),
  groundSide: std('#14302d', { roughness: 0.95 }),
  wood: std('#5d7069'),
  woodDark: std('#34443f'),
  chair: std('#2c3b37'),
  cup: std('#e9e6dc'),
  metal: std('#3a4743', { metalness: 0.5, roughness: 0.35 }),
  slab: std('#203533'),
  node: std('#22312e', { roughness: 0.45 }),
  chip: std('#33433f'),
  rack: std('#1c2826', { metalness: 0.4, roughness: 0.4 }),
  rackPanel: std('#131d1c'),
  board: std('#d6dfdb', { roughness: 0.4 }),
  boardFace: std('#eef3f1', { roughness: 0.3 }),
  boardLine: glow('#9fb3ad'),
  screenFrame: std('#16211f', { roughness: 0.35 }),
  tealSolid: std(TEAL_HI, { roughness: 0.5 }),
  peachSolid: std(PEACH, { roughness: 0.5 }),
  tan: std(TAN, { roughness: 0.5 }),
  glow: glow(TEAL_HI),
  glowDim: glow(TEAL_HI, 0.45),
  peachGlow: glow(PEACH),
};
