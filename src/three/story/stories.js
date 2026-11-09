import { Agile, Deploy, Meeting, Planning, Requirements, Servers, Team } from './trpl';

/** Chapter components + camera framing (focus height, zoom), in the same order as content.js. */
export const STORIES = {
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
