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
};
