// Site copy. Source of truth: public/Zara_Ejaz_CV.pdf.
// Exception: `featured` / `archive` projects are not in the CV — they use Zara's own
// descriptions (featured: her brief; archive: her previous portfolio site).

export const profile = {
  name: 'Zara Ejaz',
  title: 'Full-Stack Web Developer | Frappe/ERPNext Developer',
  role: 'Software Engineer',
  // condensed from CV › About Me
  summary: 'Building high-performance web applications, scalable SaaS platforms, and custom ERPNext/Frappe solutions.',
  email: 'zaraejaz102003@gmail.com',
  linkedin: 'https://www.linkedin.com/in/zara-ejaz-431aa2273',
  cv: '/Zara_Ejaz_CV.pdf',
};

// CV › About Me (split into two paragraphs, wording unchanged)
export const about = [
  'Full-Stack Web Developer and Frappe/ERPNext Developer with experience building high-performance web applications, scalable SaaS platforms, and custom ERPNext/Frappe solutions.',
  'Experienced in translating Figma designs into responsive interfaces, communicating directly with clients, gathering requirements, and delivering tailored features through custom apps.',
];

// CV › Education
export const education = {
  degree: 'Bachelors in Software Engineering',
  school: 'Bahria University Karachi',
  period: 'Sep 2022 – Jun 2026',
};

// CV › Technical Skills and Interests (6 groups, items verbatim)
export const skills = [
  {
    id: 'erp',
    label: 'ERP & Business Apps',
    short: 'erp',
    items: ['Frappe Framework', 'ERPNext', 'Custom App Development', 'Workflow Automation', 'Requirement Analysis', 'Client Communication'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    short: 'frontend',
    items: ['Next.js (App Router)', 'React.js', 'JavaScript (ES6+)', 'Redux', 'Context API', 'Tailwind CSS', 'HTML', 'CSS'],
  },
  { id: 'backend', label: 'Backend', short: 'backend', items: ['Python', 'Django', 'Node.js', 'Express.js', 'RESTful APIs'] },
  { id: 'databases', label: 'Databases', short: 'databases', items: ['PostgreSQL', 'MySQL', 'SQL', 'MongoDB'] },
  { id: 'design', label: 'Design & CMS', short: 'design', items: ['Figma', 'WordPress', 'UI/UX Design Principles'] },
  { id: 'tools', label: 'Tools & Methodologies', short: 'tools', items: ['Git', 'Agile'] },
];

// CV › Experience — newest first; roles, dates and bullets verbatim
export const experience = [
  {
    company: 'TRPL Solutions',
    role: 'Full Stack Engineer / Frappe ERPNext Developer',
    period: 'Feb 2026 – Present',
    year: '2026',
    bullets: [
      'Develop and customize ERPNext/Frappe applications through custom apps that automate and enhance client business workflows.',
      'Communicate directly with clients to gather requirements, clarify business processes, and convert feature requests into functional technical specifications.',
      'Build high-performance frontend components in Next.js, React and reliable backend systems using Python and the Frappe Framework.',
    ],
    tags: ['Frappe', 'ERPNext', 'Python', 'Next.js', 'React'],
  },
  {
    company: 'Abidi Solutions',
    role: 'Frontend Developer',
    period: 'Apr 2025 – Jul 2025',
    year: '2025',
    bullets: [
      'Designed user-centric, interactive web interfaces in Figma, translating complex prototypes into pixel-perfect, responsive applications.',
      'Developed scalable React and Next.js applications with Tailwind CSS, using Redux for efficient state management.',
      'Executed robust API integrations to ensure seamless, real-time data communication between the frontend and backend systems.',
      'Collaborated with cross-functional teams in an Agile environment to deliver multiple successful projects.',
    ],
    tags: ['React', 'Next.js', 'Tailwind CSS', 'Redux', 'Figma'],
  },
  {
    company: 'Quantaflix',
    role: 'Full-Stack Web Developer',
    period: 'Jan 2024 – Jun 2025',
    year: '2024',
    bullets: [
      'Spearheaded full-stack development of dynamic, responsive web applications using React.js, Next.js, Node.js, Express, JavaScript, HTML, and CSS.',
      'Optimized application performance by integrating RESTful APIs and managing scalable MySQL database operations.',
      "Played a pivotal role in building proprietary products, including the company's SaaS platform.",
      'Mentored junior developers, fostering team growth through code reviews and the promotion of development best practices.',
    ],
    tags: ['React.js', 'Next.js', 'Node.js', 'Express', 'MySQL'],
  },
];

// Work — from the original Projects component on `main` (titles, descriptions, screenshots, links).
// Case-study fields are taken only from that original wording, or from the project's own repo where
// marked [repo]. Anything not stated anywhere is left null and simply not shown.
// TriTechTitan Blog removed (its domain no longer resolves).
export const projects = [
  {
    id: 'talha-portfolio',
    title: 'Web Developer Portfolio',
    tagline: 'A custom-built professional portfolio for a Web Developer.',
    description:
      'A custom-built professional portfolio for a Web Developer, showcasing skills, projects, and expertise. Developed using React and Vite, the site features a sleek, modern UI, smooth scrolling, and high-performance optimizations for a seamless user experience.',
    client: 'Talha, a Web Developer',
    role: 'Developer',
    stack: ['React', 'Vite'],
    features: ['Sleek, modern UI', 'Smooth scrolling', 'High-performance optimizations'],
    image: '/Images/screens/talha_portfolio.webp',
    fullImage: '/Images/screens/talha_portfolio-full.webp', // captured from the live site
    screenTex: '/Images/screens/talha_portfolio-tex.webp',
    live: 'https://talha-portfolio-wheat.vercel.app/',
    github: null,
  },
  {
    id: 'research-professionals',
    title: 'The Research Professionals',
    tagline: "A professional portfolio showcasing a client's research services and expertise.",
    description:
      'A professional portfolio website developed for a client to showcase their research services and expertise. The site features a clean, modern design ensuring responsiveness and a seamless user experience for potential clients.',
    client: 'Prof. Dr. Adnan Anwar — The Research Professionals',
    role: 'Developer',
    stack: [], // not stated in the original data
    features: ['Clean, modern design', 'Responsive', 'Seamless experience for potential clients'],
    image: '/Images/screens/research_pros.webp',
    fullImage: '/Images/screens/research_pros-full.webp', // captured from the live site
    screenTex: '/Images/screens/research_pros-tex.webp',
    live: 'https://www.theresearchprofessionals.site/',
    github: null,
  },
  {
    id: 'algorithm-visualizer',
    title: 'Algorithm Visualizer',
    tagline: 'CPU scheduling and page replacement algorithms, demonstrated.',
    description:
      'Project demonstrates CPU scheduling and page replacement algorithms to enhance understanding of process management and memory usage in operating systems.',
    client: null,
    role: null,
    stack: ['HTML', 'JavaScript', 'CSS'], // [repo] GitHub language breakdown
    features: ['CPU scheduling algorithms', 'Page replacement algorithms', 'Process management & memory usage'],
    image: '/Images/screens/AlgorithmVisualizer.webp',
    fullImage: null,
    screenTex: '/Images/screens/AlgorithmVisualizer-tex.webp',
    live: null,
    github: 'https://github.com/ZaraEjaz/Algorithm-Visualizer',
  },
  {
    id: 'my-portfolio',
    title: 'My Portfolio',
    tagline: 'My previous portfolio, developed with React and Vite.',
    description:
      'My portfolio website is developed using React with Vite for a fast and efficient build process, styled with modern CSS frameworks and custom animations to ensure responsiveness, interactivity, and a seamless user experience.',
    client: 'Personal project',
    role: 'Developer',
    stack: ['React', 'Vite', 'Bootstrap', 'AOS', 'Framer Motion'], // [repo] package.json on `main`
    features: ['Fast, efficient build process', 'Custom animations', 'Responsive and interactive'],
    image: '/Images/screens/myportfolio.webp',
    fullImage: '/Images/screens/myportfolio-full.webp', // captured from zaraejaz.netlify.app (CV portfolio link)
    screenTex: '/Images/screens/myportfolio-tex.webp',
    displayUrl: 'zaraejaz.netlify.app', // shown in the mock browser bar only (not linked)
    live: null,
    github: null,
  },
];

// Parked (removed from Work for now, kept so the copy isn't lost). Zara's own descriptions.
export const parkedProjects = [
  {
    id: 'intellexa',
    title: 'Intellexa',
    blurb: 'AI competitor intelligence platform (RAG + reporting).',
    impact: 'Final year project.',
    tags: ['AI', 'RAG', 'Reporting'],
    live: null,
    github: null,
  },
  {
    id: 'smartdesk',
    title: 'SmartDesk',
    blurb: 'AI IT desk assistant (team project).',
    impact:
      'My role: NLP matching and the database layer linking user PCs to the admin PC. Runs only admin-approved scripts for security.',
    tags: ['AI', 'NLP', 'Database'],
    live: null,
    github: 'https://github.com/sunhesun1011/SmartDeskV1',
  },
  {
    id: 'tradextrack',
    title: 'TradexTrack',
    blurb: 'AI assistant for ERPNext/Frappe (indent tracking).',
    impact: 'Goal: an open library any ERPNext system can use. In progress.',
    tags: ['AI', 'Frappe', 'ERPNext'],
    live: null,
    github: null,
  },
  {
    id: 'beyond-filenames',
    title: 'Beyond Filenames',
    blurb: 'Semantic search for personal digital image retrieval.',
    impact: null,
    tags: ['Semantic search', 'Image retrieval'],
    live: null,
    github: 'https://github.com/ayeshashafique018/beyond-filenames',
  },
];

// Career journey (Experience section). Order and facts from the CV.
// `stack` = technologies named in that role's CV bullets (deduplicated names across stops).
export const journey = [
  {
    id: 'bahria',
    kind: 'education',
    place: 'Bahria University Karachi',
    title: 'Bachelors in Software Engineering',
    period: 'Sep 2022 – Jun 2026',
    bullets: [],
    stack: [],
  },
  {
    id: 'quantaflix',
    kind: 'work',
    place: 'Quantaflix',
    title: 'Full-Stack Web Developer',
    period: 'Jan 2024 – Jun 2025',
    bullets: [
      'Spearheaded full-stack development of dynamic, responsive web applications using React.js, Next.js, Node.js, Express, JavaScript, HTML, and CSS.',
      'Optimized application performance by integrating RESTful APIs and managing scalable MySQL database operations.',
      "Played a pivotal role in building proprietary products, including the company's SaaS platform.",
    ],
    stack: ['React', 'Next.js', 'Node.js', 'Express', 'JavaScript', 'HTML', 'CSS', 'REST APIs', 'MySQL'],
  },
  {
    id: 'abidi',
    kind: 'work',
    place: 'Abidi Solutions',
    title: 'Frontend Developer',
    period: 'Apr 2025 – Jul 2025',
    bullets: [
      'Designed user-centric, interactive web interfaces in Figma, translating complex prototypes into pixel-perfect, responsive applications.',
      'Developed scalable React and Next.js applications with Tailwind CSS, using Redux for efficient state management.',
      'Collaborated with cross-functional teams in an Agile environment to deliver multiple successful projects.',
    ],
    stack: ['Figma', 'React', 'Next.js', 'Tailwind CSS', 'Redux', 'Agile'],
  },
  {
    id: 'trpl',
    kind: 'work',
    place: 'TRPL Solutions',
    title: 'Full Stack Engineer / Frappe ERPNext Developer',
    period: 'Feb 2026 – Present',
    bullets: [
      'Develop and customize ERPNext/Frappe applications through custom apps that automate and enhance client business workflows.',
      'Communicate directly with clients to gather requirements, clarify business processes, and convert feature requests into functional technical specifications.',
      'Build high-performance frontend components in Next.js, React and reliable backend systems using Python and the Frappe Framework.',
    ],
    stack: ['ERPNext', 'Frappe', 'Next.js', 'React', 'Python'],
  },
];


// Story chapters behind each journey stop ("View story →"). One idea per chapter.
// Facts: CV only, plus TRPL process details confirmed by Zara. No client names.
// `stack` reuses the stop's CV stack (shown as icons at the end of the story).
export const stories = {
  trpl: {
    chapters: [
      {
        id: 'meeting',
        label: 'Client meeting',
        title: 'It starts with a conversation',
        caption: 'I meet clients directly to understand the problem, how their business runs today, and what they want to achieve.',
      },
      {
        id: 'requirements',
        label: 'Requirements',
        title: 'Notes become a workflow',
        caption: 'I map their process into a clear business workflow and turn feature requests into functional technical specifications.',
      },
      {
        id: 'planning',
        label: 'Planning',
        title: 'Planned end to end',
        caption: 'The workflow becomes a roadmap: the ERPNext modules and custom doctypes to build, laid out on a timeline.',
      },
      {
        id: 'team',
        label: 'Team discussion',
        title: 'Aligned with the team',
        caption: 'I walk the team through the plan, and together we break it into tasks on our board.',
      },
      {
        id: 'agile',
        label: 'Agile sprints',
        title: 'Sprints, with client reviews',
        caption: 'We build the custom Frappe app in sprints. Each one ends with a client review, so the client stays in the loop.',
      },
      {
        id: 'servers',
        label: 'Servers',
        title: 'The right server for the job',
        caption: "I compare server options on CPU, RAM and cost against the client's needs, then purchase the one that fits.",
      },
      {
        id: 'deploy',
        label: 'Deployment',
        title: 'Live in production',
        caption: 'I set up the bench, run the migrations and deploy the app to production.',
      },
    ],
  },
};
