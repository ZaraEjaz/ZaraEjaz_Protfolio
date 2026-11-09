/** Small line illustrations for story chapters on mobile / reduced motion (96×56, stroke = currentColor). */
export const STORY_ART = {
  meeting: (
    <>
      <rect x="24" y="40" width="48" height="4" rx="2" />
      <circle cx="18" cy="30" r="6" />
      <circle cx="78" cy="30" r="6" />
      <path className="sa-float" d="M38 8h20a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-8l-5 5v-5h-7a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5Z" />
    </>
  ),
  requirements: (
    <>
      <rect className="sa-in" x="6" y="20" width="22" height="14" rx="3" />
      <rect className="sa-in sa-d1" x="37" y="20" width="22" height="14" rx="3" />
      <rect className="sa-in sa-d2" x="68" y="20" width="22" height="14" rx="3" />
      <path className="sa-draw" d="M28 27h9m22 0h9" />
    </>
  ),
  planning: (
    <>
      <path d="M8 48h80" />
      <rect className="sa-in" x="10" y="12" width="30" height="8" rx="3" />
      <rect className="sa-in sa-d1" x="30" y="24" width="34" height="8" rx="3" />
      <rect className="sa-in sa-d2" x="56" y="36" width="28" height="8" rx="3" />
    </>
  ),
  team: (
    <>
      <rect x="20" y="6" width="56" height="30" rx="3" />
      <path d="M38.5 10v22M57.5 10v22" />
      <rect className="sa-in" x="24" y="12" width="11" height="5" rx="1.5" />
      <rect className="sa-in sa-d1" x="42" y="12" width="11" height="5" rx="1.5" />
      <rect className="sa-in sa-d2" x="61" y="12" width="11" height="5" rx="1.5" />
      <circle cx="30" cy="48" r="5" />
      <circle cx="48" cy="48" r="5" />
      <circle cx="66" cy="48" r="5" />
    </>
  ),
  agile: (
    <>
      <circle cx="48" cy="28" r="19" strokeDasharray="4 5" />
      <circle className="sa-orbit" cx="48" cy="9" r="3.5" />
      <path d="M44 28l3 3 6-6" />
    </>
  ),
  servers: (
    <>
      <rect x="14" y="10" width="20" height="38" rx="3" />
      <rect x="38" y="6" width="20" height="42" rx="3" />
      <rect x="62" y="10" width="20" height="38" rx="3" />
      <path d="M19 20h10M43 18h10M67 20h10" />
      <path className="sa-in sa-d2" d="M42 34l4 4 8-9" />
    </>
  ),
  deploy: (
    <>
      <rect x="6" y="24" width="24" height="16" rx="2" />
      <rect x="66" y="12" width="24" height="36" rx="3" />
      <path d="M32 32h30" strokeDasharray="3 5" />
      <circle className="sa-travel" cx="34" cy="32" r="3" />
      <circle cx="72" cy="18" r="2" />
    </>
  ),
  // Bahria
  'b-start': (
    <>
      <path d="M26 24 48 12l22 12" />
      <rect x="28" y="24" width="40" height="24" rx="2" />
      <rect className="sa-in" x="44" y="34" width="8" height="14" rx="1" />
      <path className="sa-in sa-d1" d="M33 30h6m18 0h6" />
    </>
  ),
  'b-overlap': (
    <>
      <path d="M10 10v40" />
      <rect className="sa-in" x="14" y="12" width="74" height="7" rx="3" />
      <rect className="sa-in sa-d1" x="40" y="24" width="28" height="7" rx="3" />
      <rect className="sa-in sa-d1" x="64" y="34" width="6" height="7" rx="3" />
      <rect className="sa-in sa-d2" x="76" y="44" width="12" height="7" rx="3" />
    </>
  ),
  'b-degree': (
    <>
      <path className="sa-float" d="M26 20 48 10l22 10-22 10-22-10Zm8 4v9c6 5 22 5 28 0v-9" />
      <path d="M70 20v12" />
      <rect x="30" y="44" width="36" height="6" rx="3" />
    </>
  ),
  // Quantaflix
  'q-apps': (
    <>
      <rect x="8" y="8" width="56" height="38" rx="3" />
      <rect className="sa-in" x="13" y="14" width="46" height="5" rx="1.5" />
      <rect className="sa-in sa-d1" x="13" y="23" width="22" height="16" rx="1.5" />
      <rect x="72" y="14" width="16" height="32" rx="3" />
      <rect className="sa-in sa-d2" x="75" y="19" width="10" height="10" rx="1.5" />
    </>
  ),
  'q-data': (
    <>
      <rect x="6" y="18" width="22" height="16" rx="2" />
      <rect x="38" y="20" width="20" height="12" rx="3" />
      <ellipse cx="78" cy="16" rx="11" ry="4" />
      <path d="M67 16v22c0 5 22 5 22 0V16" />
      <path d="M28 26h10m20 0h9" strokeDasharray="3 4" />
      <circle className="sa-travel" cx="30" cy="26" r="2.5" />
    </>
  ),
  'q-saas': (
    <>
      <rect x="32" y="16" width="32" height="22" rx="3" />
      <rect className="sa-in" x="36" y="21" width="24" height="4" rx="1.5" />
      <rect className="sa-in sa-d1" x="36" y="29" width="10" height="5" rx="1.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="84" cy="12" r="5" />
      <circle cx="84" cy="46" r="5" />
      <path d="M17 14l15 6m32 0 15-6m-15 16 15 13" strokeDasharray="3 4" />
    </>
  ),
  'q-mentor': (
    <>
      <rect x="24" y="6" width="48" height="30" rx="3" />
      <path className="sa-in" d="M30 14h20M34 20h24" />
      <path className="sa-in sa-d1" d="M34 26h16" />
      <path className="sa-in sa-d2" d="M58 26l3 3 6-6" />
      <circle cx="18" cy="46" r="5" />
      <circle cx="48" cy="48" r="5" />
      <circle cx="78" cy="46" r="5" />
    </>
  ),
  // Abidi
  'a-design': (
    <>
      <rect x="8" y="6" width="80" height="44" rx="3" />
      <rect className="sa-in" x="14" y="12" width="40" height="30" rx="2" />
      <rect className="sa-in sa-d1" x="62" y="12" width="16" height="30" rx="2" />
      <path className="sa-float" d="M54 36l8 3-3 2 3 4-2 1-3-4-2 3Z" />
    </>
  ),
  'a-build': (
    <>
      <rect x="6" y="16" width="22" height="20" rx="2" />
      <rect x="44" y="10" width="34" height="24" rx="3" />
      <rect x="82" y="16" width="10" height="20" rx="2" />
      <path d="M28 26h14" strokeDasharray="3 4" />
      <circle className="sa-travel" cx="30" cy="26" r="2.5" />
      <rect className="sa-in sa-d2" x="48" y="15" width="26" height="4" rx="1.5" />
    </>
  ),
  'a-state': (
    <>
      <rect className="sa-float" x="38" y="18" width="20" height="20" rx="4" />
      <rect x="8" y="6" width="16" height="10" rx="2" />
      <rect x="8" y="40" width="16" height="10" rx="2" />
      <rect x="74" y="16" width="14" height="24" rx="2" />
      <path d="M24 12l14 10M24 44l14-8M58 28h16" strokeDasharray="3 4" />
    </>
  ),
  'a-agile': (
    <>
      <circle cx="40" cy="30" r="12" />
      <circle cx="22" cy="30" r="4" />
      <circle cx="58" cy="30" r="4" />
      <circle cx="40" cy="12" r="4" />
      <rect className="sa-in" x="72" y="40" width="16" height="8" rx="2" />
      <rect className="sa-in sa-d1" x="72" y="30" width="16" height="8" rx="2" />
      <rect className="sa-in sa-d2" x="72" y="20" width="16" height="8" rx="2" />
    </>
  ),
};
