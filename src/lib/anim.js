import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

export const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const SCRAMBLE_CHARS = '01<>/_-=+*[]{}#';

export { gsap, ScrollTrigger, SplitText };
