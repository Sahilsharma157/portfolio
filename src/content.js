// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE. Everything on the site is pulled from here.
//  Anything wrapped in <em>…</em> is set in the italic serif.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: { first: 'Sahil', last: 'Sharma' },
  initials: 'SS',
  role: 'AI/ML & Full-stack Developer',
  location: 'Chennai, India',
  timezone: 'Asia/Kolkata',
  email: 'kksahilsharmaaa@gmail.com',
  available: true,
  status: 'Open to opportunities',

  tagline: 'I build AI that <em>does</em> things, not just talks about them.',

  manifesto:
    'I build AI that acts: agents that move money on a blockchain, CRMs that write their own campaigns, models that spot abnormalities in medical scans. I like the <em>messy middle</em>, where the model meets the API meets the person clicking the button.',

  about: [
    "I'm Sahil, a Computer Science student specialising in AI & Machine Learning at SRM Institute of Science and Technology, Chennai.",
    'Most of my work sits where AI meets real products: preparing data and training models, wiring them into fast APIs, and building interfaces that people actually enjoy using.',
    'Hackathons are where I learn the most. Building a working product in 36 hours and then refining it is how Neptune AI went from a weekend idea to winning the NEAR Innovation Sandbox 2026, a global hackathon. At HackRush 2.0, my team won first place among 270+ teams.',
  ],

  facts: [
    { label: 'Studying', value: 'B.Tech CSE (AI & ML), SRM · 2027' },
    { label: 'Focus', value: 'AI agents, computer vision, full-stack' },
    { label: 'Based in', value: 'Chennai, India' },
    { label: 'Status', value: 'Open to internships & roles' },
  ],

  pillars: [
    {
      title: 'AI & Machine Learning',
      text: 'Computer vision and ML pipelines, from cleaning and merging messy datasets to training CNNs for medical-image abnormality detection.',
    },
    {
      title: 'AI Agents',
      text: 'Agents that turn plain language into real actions. Neptune AI runs blockchain payments and staking through a delegated agent wallet.',
    },
    {
      title: 'Full-stack Products',
      text: 'End-to-end apps with Next.js, TypeScript, FastAPI and Postgres: authentication, REST APIs, real-time dashboards.',
    },
    {
      title: 'Cloud & DevOps',
      text: 'Deploying on AWS and Google Cloud with Docker and CI/CD. Certified on AWS, Google Cloud and Oracle Cloud.',
    },
  ],

  stats: [
    { value: 4, suffix: '', label: 'Hackathon podiums' },
    { value: 270, suffix: '+', label: 'Teams beaten to win HackRush 2.0' },
    { value: 4, suffix: '', label: 'Cloud & SAP certifications' },
  ],

  // colors[0] is the row's hover fill color. Use a light-ish color so the dark text stays readable.
  // link: live site · code: repo · images: screenshots in /public/work/ (shown in the project modal)
  projects: [
    {
      title: 'Neptune AI',
      description: 'Turns plain-English requests into blockchain payments, staking and automated transactions.',
      tags: ['Python', 'FastAPI', 'Next.js', 'AI Agents', 'NEAR'],
      year: '2026',
      link: 'https://neptuneai-agent.vercel.app/',
      code: '',
      colors: ['#ff5b29', '#2a0f08'],
      images: ['/work/neptune-2.jpg', '/work/neptune-1.jpg'],
      overview:
        'An AI agent that turns natural-language requests into real blockchain workflows: payments, staking and automated transactions on NEAR.',
      built: [
        'Chat interface where users swap tokens or instruct their agents in plain English',
        'Agent Suite: a multi-agent fleet on NEAR, with trader, moderator (risk), research and rebalancing agents',
        'Agent Marketplace where users buy ready-made trading agents with USDT, verified on-chain',
        'Natural-language intent handling that maps a request to the right on-chain action',
        'Python FastAPI backend connected to a Next.js frontend and NEAR blockchain services',
        'Delegated agent-wallet model so the agent can run authorized, automated operations',
      ],
    },
    {
      title: 'Vstream',
      description: 'Live event streaming platform with instant search, live indicators, favorites and light/dark themes. Fully client-side, strict TypeScript.',
      tags: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind v4'],
      year: '',
      link: 'https://vstream-lilac.vercel.app/',
      code: '',
      colors: ['#f2c46b', '#241a08'],
      images: ['/work/vstream-1.jpg', '/work/vstream-2.jpg'],
      overview:
        'A production-ready platform for discovering and watching live events across tech, music, gaming, sports and education. Fully client-side, with no backend or API dependencies.',
      built: [
        'Featured home page and a browse catalogue with instant search by title and description',
        'Live indicators, viewer counts and event times shown in the visitor’s timezone',
        'Favorites saved to localStorage, plus native share support',
        'Light and dark themes, a top progress loader and a mobile-first layout',
        '100% custom components in strict TypeScript, with no UI libraries',
      ],
    },
    {
      title: 'XenoPulse',
      description: 'AI-powered marketing CRM with personalized content generation and real-time campaign metrics.',
      tags: ['Next.js', 'TypeScript', 'Supabase', 'Claude AI'],
      year: '',
      link: 'https://xenopulse-blond.vercel.app/',
      code: '',
      colors: ['#c9a3ff', '#160d22'],
      images: ['/work/xenopulse-1.jpg', '/work/xenopulse-2.jpg'],
      overview:
        'An AI-native marketing CRM that watches customer data and suggests who to reach, when and why. Customer data, campaigns and performance tracking live in one place.',
      built: [
        'Customer data import (CSV / Excel), smart segmentation and campaign workflows',
        'AI opportunity feed and personalised content generation powered by Claude',
        'Live analytics for campaign insights and engagement tracking',
      ],
    },
    {
      title: 'RootAccess',
      description: 'Privacy-focused developer community with secure authentication, profiles and REST APIs.',
      tags: ['Auth', 'REST APIs', 'Sessions'],
      year: '',
      link: 'https://rootaccessv2.vercel.app/',
      code: '',
      colors: ['#86d4db', '#0b2226'],
      images: ['/work/rootaccess-1.jpg', '/work/rootaccess-2.jpg'],
      overview:
        'A privacy-focused community where developer students find people with shared interests, join groups, chat in real time and find collaborators.',
      built: [
        'User authentication, profiles and secure content workflows',
        'Interest-based groups, real-time group chat and direct messages',
        'REST APIs, backend services and secure session handling',
      ],
    },
  ],

  marquee: ['AI Agents', 'Machine Learning', 'Full-stack', 'Cloud', 'Blockchain'],

  stack: [
    { title: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'C / C++', 'SQL'] },
    { title: 'AI / ML', items: ['Machine Learning', 'TensorFlow', 'Scikit-learn', 'Pandas & NumPy'] },
    { title: 'Web', items: ['React.js', 'Next.js', 'Node.js', 'FastAPI', 'Tailwind CSS'] },
    { title: 'Databases', items: ['PostgreSQL', 'MySQL', 'Supabase'] },
    { title: 'Cloud & DevOps', items: ['AWS', 'Google Cloud', 'Azure', 'Docker', 'Jenkins · CI/CD'] },
    { title: 'Engineering', items: ['DSA & OOP', 'REST APIs', 'SDLC', 'Git & GitHub', 'Linux · Jira'] },
  ],

  experience: [
    { period: 'Aug — Sep 2025', role: 'AI/ML Intern', company: 'SETV Global', place: 'CNN abnormality detection' },
    { period: '2023 — 2027', role: 'B.Tech CSE (AI & ML)', company: 'SRM Institute of Science and Technology', place: 'Kattankulathur' },
  ],

  awards: [
    { title: 'Winner, Global Hackathon', event: 'NEAR Innovation Sandbox 2026', note: 'Neptune AI · INR 1.5 lakh' },
    { title: '1st Place', event: 'HackRush 2.0', note: 'Won among 270+ teams' },
    { title: '2nd Place', event: 'Pentathon 2.0 / Datathon 2.0', note: '' },
    { title: 'Top 10', event: 'VIT Chennai Hackathon', note: 'Open Innovation · 800+ teams' },
  ],

  certifications: [
    'AWS Certified Cloud Practitioner',
    'Google Cloud — Cloud Engineering Certificate',
    'Oracle Cloud Infrastructure Data Foundations Associate',
    'SAP Certified — ABAP',
  ],

  socials: [
    { label: 'GitHub', url: 'https://github.com/Sahilsharma157' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/k-sahil-sharma-868778290/' },
    // { label: 'Résumé', url: '/resume.pdf' }, // ← put resume.pdf in /public and uncomment
  ],
};
