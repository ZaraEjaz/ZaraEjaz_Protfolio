import { Agile, Deploy, Meeting, Planning, Requirements, Servers, Team } from './trpl';
import { Campus, Degree, Overlap } from './bahria';
import { Apps, Data, Mentor, Saas } from './quantaflix';
import { Build, Design, State, Team as AbidiTeam } from './abidi';

/** Chapter components + camera framing (focus height, zoom), in the same order as content.js. */
export const STORIES = {
  bahria: {
    chapters: [Campus, Overlap, Degree],
    framing: [
      { y: 1.3, zoom: 0.95 },
      { y: 0.5, zoom: 1.0, elev: 1.55 },
      { y: 1.1, zoom: 1.05 },
    ],
  },
  quantaflix: {
    chapters: [Apps, Data, Saas, Mentor],
    framing: [
      { y: 1.25, zoom: 0.95 },
      { y: 1.0, zoom: 0.98 },
      { y: 1.2, zoom: 0.92 },
      { y: 1.3, zoom: 0.95 },
    ],
  },
  abidi: {
    chapters: [Design, Build, State, AbidiTeam],
    framing: [
      { y: 1.35, zoom: 0.95 },
      { y: 1.2, zoom: 0.95 },
      { y: 1.1, zoom: 0.95 },
      { y: 1.1, zoom: 0.98 },
    ],
  },
  trpl: {
    chapters: [Meeting, Requirements, Planning, Team, Agile, Servers, Deploy],
    framing: [
      { y: 1.8, zoom: 0.96 },
      { y: 0.55, zoom: 1.0, elev: 1.55 }, // flat diagrams: look down more so they read
      { y: 0.5, zoom: 1.0, elev: 1.55 },
      { y: 1.2, zoom: 0.95 },
      { y: 1.15, zoom: 0.9 },
      { y: 1.2, zoom: 0.95 },
      { y: 1.5, zoom: 0.92 },
    ],
  },
};
