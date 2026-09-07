export const eventConfig = {
  eventName: 'DIGITAL NIS FORUM',
  tagline: 'DIGITAL UNITES',
  startDate: '2026-09-12T09:00:00+05:00',
  mainForumDate: '2026-09-19T09:00:00+05:00',
  endDate: '2026-09-19T18:00:00+05:00',
  dateLabel: '19.09.2026',
  aptaLabel: '12–18 SEPTEMBER 2026',
  location: 'Nazarbayev Intellectual School · Venue TBA',
  registrationEnabled: true,
  certificateThreshold: 400,
  socials: [],
  contacts: [],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};
export const tracks = [
  'ALL',
  'DIGITAL APTA',
  'MAIN STAGE',
  'STARTUPS',
  'HACKATHON',
  'EDUCATION',
  'GAMING',
  '3D',
  'WORKSHOPS',
];
export type EventRecord = {
  id: string;
  title: string;
  description: string;
  day: number;
  time: string;
  track: string;
  location: string;
  capacity: number | null;
  registration_required: boolean;
  coins: number;
  speaker?: string;
  available?: number | null;
};
export const events: EventRecord[] = [
  {
    id: '00000000-0000-4000-8000-000000000012',
    title: 'Opening of Digital Apta',
    description: 'The first connection. Meet the community and start a week of building.',
    day: 12,
    time: 'TBA',
    track: 'DIGITAL APTA',
    location: 'Venue TBA',
    capacity: null,
    registration_required: false,
    coins: 20,
  },
  {
    id: '00000000-0000-4000-8000-000000000013',
    title: 'Startup acceleration',
    description:
      '12–18 September: mentoring, business models, pitch decks and preparation for Startup Battle.',
    day: 12,
    time: 'TBA',
    track: 'STARTUPS',
    location: 'Venue TBA',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000015',
    title: 'Vibe Coding',
    description:
      'AI-assisted coding, rapid prototyping and turning an idea into an MVP. A one-hour workshop for hackathon teams.',
    day: 15,
    time: 'TBA',
    track: 'HACKATHON',
    location: 'Digital Lab',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000025',
    title: 'Startup Commercialization',
    description:
      'Customer problems, value proposition, B2B / B2C / B2G, monetization and your first customers. Approximately one hour.',
    day: 15,
    time: 'TBA',
    track: 'STARTUPS',
    location: 'Venue TBA',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000016',
    title: 'Pitch Deck & Pitching',
    description:
      'Problem, solution, market, product, business model, traction, competition, team and ask. Practice storytelling, timing and jury questions.',
    day: 16,
    time: 'TBA',
    track: 'WORKSHOPS',
    location: 'Main Stage',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000017',
    title: '3D Modeling & 3D Printing',
    description:
      'A practical workshop for NIS teachers: modeling, slicing and live printing. Create a simple model and explore classroom applications.',
    day: 17,
    time: 'TBA',
    track: '3D',
    location: '3D Lab',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000027',
    title: 'Finalists Reveal',
    description: 'Meet the selected teams and participants of all four competitions.',
    day: 17,
    time: 'TBA',
    track: 'DIGITAL APTA',
    location: 'Online',
    capacity: null,
    registration_required: false,
    coins: 0,
  },
  {
    id: '00000000-0000-4000-8000-000000000018',
    title: 'Mock Pitching',
    description:
      'One day before the forum. Rehearse your pitch, answer questions and refine your presentation with expert feedback.',
    day: 18,
    time: 'TBA',
    track: 'STARTUPS',
    location: 'Main Stage',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  ...[1, 2, 3].map((n) => ({
    id: `00000000-0000-4000-8000-00000000003${n}`,
    title: `Session 0${n} · Secret Speaker`,
    description: 'Topic to be revealed.',
    day: 19,
    time: 'TBA',
    track: 'MAIN STAGE',
    location: 'Main Stage',
    capacity: null,
    registration_required: true,
    coins: 30,
  })),
  {
    id: '00000000-0000-4000-8000-000000000019',
    title: 'Panel Discussion',
    description:
      'Three minds. One conversation. Your questions. Meet three independent panelists and join the Q&A.',
    day: 19,
    time: 'TBA',
    track: 'MAIN STAGE',
    location: 'Main Stage',
    capacity: null,
    registration_required: true,
    coins: 40,
  },
  {
    id: '00000000-0000-4000-8000-000000000029',
    title: 'Startup Battle · The Final',
    description: 'Eight startups. One stage. Discover ideas ready for their next chapter.',
    day: 19,
    time: 'TBA',
    track: 'STARTUPS',
    location: 'Main Stage',
    capacity: null,
    registration_required: true,
    coins: 30,
  },
  {
    id: '00000000-0000-4000-8000-000000000039',
    title: 'FIFA League · The Final',
    description:
      'The final rounds and championship match. Tournament rules and timing to be announced.',
    day: 19,
    time: 'TBA',
    track: 'GAMING',
    location: 'Guest Area',
    capacity: null,
    registration_required: true,
    coins: 80,
  },
];
export const competitions = [
  {
    slug: 'startup-battle',
    title: 'STARTUP BATTLE',
    tag: 'PITCH. PROVE. INSPIRE.',
    description: '8 startups. One stage. Bring your idea into the spotlight.',
    slots: 8,
    icon: '↗',
  },
  {
    slug: 'hackathon',
    title: 'NIS EDUTECH HACKATHON',
    tag: 'BUILD THE FUTURE OF EDUCATION.',
    description: 'Real challenges. Bold solutions. Build something that changes how we learn.',
    slots: 0,
    icon: '⌘',
  },
  {
    slug: 'jas-startuper',
    title: 'JAS STARTUPER',
    tag: 'BIG IDEAS START YOUNG.',
    description: 'A first stage for the next generation of founders and creators.',
    slots: 0,
    icon: '✳',
  },
  {
    slug: 'fifa',
    title: 'FIFA LEAGUE',
    tag: 'YOUR GAME. YOUR MOMENT.',
    description: 'Bring your skill. Find your team. Play for the final.',
    slots: 0,
    icon: '⊕',
  },
];
export const zones = [
  {
    name: 'Main Stage',
    description: 'Big ideas, speaker sessions and the panel discussion.',
    icon: '01',
  },
  {
    name: 'Startup Battle',
    description: 'Meet the eight startup finalists and their ideas.',
    icon: '02',
  },
  { name: 'Hackathon Zone', description: 'Where teams build the future of education.', icon: '03' },
  { name: '3D Lab', description: 'From a digital model to something you can hold.', icon: '04' },
  {
    name: 'Digital Lab',
    description: 'Explore technology through live demonstrations.',
    icon: '05',
  },
  {
    name: 'Registration',
    description: 'Scan your Digital Pass and collect your wristband.',
    icon: '06',
  },
  {
    name: 'Networking & Relax',
    description: 'Make a connection. Start a conversation. Recharge.',
    icon: '07',
  },
  {
    name: 'Guest Area',
    description: 'A dedicated space for guests, participants and partners.',
    icon: '08',
  },
];
export const faq = [
  [
    'Is the forum free?',
    'Yes. Participation is free. An approved application or a valid invitation code is required to receive your Digital Pass.',
  ],
  [
    'Do I need to print my pass?',
    'No. Open your Digital Pass on your phone and show the QR code at registration.',
  ],
  [
    'How do I get a Digital Pass?',
    'Apply to the forum and wait for approval, or activate an invitation code from the organizers.',
  ],
  [
    'What is Digital Coin?',
    'Non-transferable participation points earned through forum activities. They cannot be bought, sold or exchanged for money.',
  ],
  [
    'Can I get a certificate?',
    'Yes. Attend activities and reach the Digital Coin target shown in your dashboard.',
  ],
  [
    'Who can participate?',
    'Students, teachers, founders, developers, invited guests and the technology community, subject to the event registration rules.',
  ],
];
