// Site-wide data, taken from the live staging site (staging.whizzit.co.uk, pulled 18 Sep 2026).
// Raw page content and the WordPress JSON exports live in /_source.
// URL structure mirrors staging exactly — the client asked for slugs to stay unchanged.

export const SITE = {
  name: "WhizzIT",
  company: "Whizz Solutions Ltd",
  url: "https://www.whizzit.co.uk",
  staging: "https://staging.whizzit.co.uk",
  phone: "020 4634 2518",
  phoneHref: "tel:02046342518",
  email: "info@whizzit.co.uk",
  responseLine: "Same working day response",
  // [CLIENT TO SUPPLY] no remote-support portal exists on staging yet.
  remoteSupport: "contact.html",
  offices: [
    { name: "London", label: "Head office", address: "124 City Rd, London, EC1V 2NX", maps: "https://www.google.com/maps/dir/?api=1&destination=124+City+Rd%2C+London+EC1V+2NX" },
    { name: "Stevenage", label: "Hertfordshire", address: "Caxton Point Business Centre, Caxton Way, Stevenage SG1 2XT", maps: "https://www.google.com/maps/dir/?api=1&destination=Caxton+Point+Business+Centre%2C+Caxton+Way%2C+Stevenage+SG1+2XT" },
  ],
  google: {
    rating: "5.0",
    count: 15,
    label: "Rated 5.0 on Google",
    reviewsUrl: "https://www.google.com/maps?cid=17055157413191665489",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/whizzitsupport",
  },
};

// Headline figures published on staging (about / home "Proof, not promises").
// `count`/`suffix` let the figure count up when it scrolls into view; `value` is
// what renders without JavaScript, so the number is never dependent on it.
export const STATS = [
  { value: "100%", count: 100, suffix: "%", label: "Customer satisfaction", note: "Backed by five-star reviews across the board." },
  { value: "35+", count: 35, suffix: "+", label: "Years of experience", note: "Combined across our engineering team." },
  { value: "9 min", count: 9, suffix: " min", label: "Average first response", note: "Measured across every ticket in 2025. Average resolution: 6 hours." },
  { value: "5★", label: "Rated on Google", note: "Read our reviews", href: SITE.google.reviewsUrl },
];

// Renders a figure that counts up once scrolled into view. Progressive: the final
// value is already in the markup, the script only animates towards it.
export const statValue = (s) =>
  s.count === undefined
    ? s.value
    : `<span data-count="${s.count}"${s.suffix ? ` data-suffix="${s.suffix}"` : ""}>${s.value}</span>`;

// Core services. `tone` maps to .tone-* classes in styles.css.
export const SERVICES = [
  {
    key: "support",
    title: "IT Support",
    href: "it-support.html",
    icon: "headset",
    tone: "support",
    short: "Fast, friendly help when things go wrong.",
    desc: "Fast, friendly help when things go wrong, plus managed support, Apple Mac expertise and project delivery.",
    tags: ["Helpdesk", "Managed IT", "Apple Mac"],
    children: [
      { title: "Managed IT Support", href: "it-support/managed-it-support-services.html" },
      { title: "Apple Mac IT Support", href: "it-support/apple-mac-it-support-services.html" },
      { title: "Project Delivery & Professional Services", href: "it-support/project-delivery-professional-services.html" },
    ],
  },
  {
    key: "cloud",
    title: "Managed Cloud Services",
    href: "managed-cloud-services.html",
    icon: "cloud",
    tone: "cloud",
    short: "Microsoft 365, Azure and Google Workspace, managed end to end.",
    desc: "Microsoft 365, Azure and Google Workspace managed end to end: migration, backup, continuity and daily management.",
    tags: ["Microsoft 365", "Azure", "Migration"],
    children: [
      { title: "Managed Cloud Infrastructure", href: "managed-cloud-services/managed-cloud-infrastructure-services.html" },
      { title: "Microsoft 365 Backup", href: "managed-cloud-services/microsoft-365-backup-services.html" },
      { title: "Microsoft Azure", href: "managed-cloud-services/microsoft-azure-services.html" },
      { title: "Google Workspace Backup", href: "managed-cloud-services/google-workspace-backup-services.html" },
      { title: "Cloud Management", href: "managed-cloud-services/cloud-management-services.html" },
      { title: "Cloud Migration", href: "managed-cloud-services/cloud-migration-services.html" },
      { title: "Business Continuity & DR", href: "managed-cloud-services/business-continuity-disaster-recovery-services.html" },
    ],
  },
  {
    key: "cyber",
    title: "Cyber Security",
    href: "cyber-security.html",
    icon: "shield",
    tone: "cyber",
    short: "Protection aligned to Cyber Essentials best practice.",
    desc: "Layered protection from Cyber Essentials to penetration testing, monitoring, training and managed detection & response.",
    tags: ["Cyber Essentials", "MDR", "Email security"],
    children: [
      { title: "Configuration Review", href: "cyber-security/configuration-review-services.html" },
      { title: "Cyber Essentials", href: "cyber-security/cyber-essentials-services.html" },
      { title: "Security Awareness Training", href: "cyber-security/security-awareness-training-services.html" },
      { title: "Dark Web Monitoring", href: "cyber-security/dark-web-monitoring-services.html" },
      { title: "Email Security", href: "cyber-security/email-security-services.html" },
      { title: "Managed Detection & Response", href: "cyber-security/managed-detection-response-services.html" },
      { title: "Managed SIEM & SOC", href: "cyber-security/managed-siem-soc-as-a-service.html" },
      { title: "Network Security", href: "cyber-security/network-security-services.html" },
      { title: "Password Management", href: "cyber-security/password-management-services.html" },
      { title: "Penetration Testing", href: "cyber-security/penetration-testing-services.html" },
    ],
  },
  {
    key: "network",
    title: "Network Management",
    href: "network-management.html",
    icon: "network",
    tone: "network",
    short: "Networks designed, built and monitored by our engineers.",
    desc: "Reliable, resilient networks designed, built and monitored by our engineers. Connectivity included.",
    tags: ["Firewalls", "Business Wi-Fi", "Monitoring"],
    children: [
      { title: "Managed Firewall", href: "network-management/managed-firewall-services.html" },
      { title: "Business Wi-Fi & Wireless", href: "network-management/business-wifi-services.html" },
      { title: "Network Monitoring", href: "network-management/network-monitoring-services.html" },
      { title: "Structured Cabling", href: "network-management/structured-cabling-services.html" },
      { title: "SD-WAN & Connectivity", href: "network-management/sd-wan-connectivity-services.html" },
    ],
  },
  {
    key: "projects",
    title: "IT Project Management",
    href: "it-project-management.html",
    icon: "projects",
    tone: "projects",
    short: "Moves, migrations and upgrades delivered on time.",
    desc: "Office moves, migrations, audits, strategy and governance delivered on time, without disrupting your team.",
    tags: ["IT strategy", "Audits", "Office moves"],
    children: [
      { title: "AI Governance", href: "it-project-management/ai-governance-services.html" },
      { title: "IT Health Check", href: "it-project-management/it-health-check-services.html" },
      { title: "IT Policies & Procedures", href: "it-project-management/it-policies-procedures-services.html" },
      { title: "IT Strategy", href: "it-project-management/it-strategy-services.html" },
      { title: "Technology Audit", href: "it-project-management/technology-audit-services.html" },
    ],
  },
];

// Specialist column in the mega menu: the most-requested sub-services.
export const SPECIALIST = [
  { title: "Managed IT Support", href: "it-support/managed-it-support-services.html", icon: "headset" },
  { title: "Cyber Essentials", href: "cyber-security/cyber-essentials-services.html", icon: "award" },
  { title: "Cloud Migration", href: "managed-cloud-services/cloud-migration-services.html", icon: "cloud" },
  { title: "Microsoft 365 Backup", href: "managed-cloud-services/microsoft-365-backup-services.html", icon: "refresh" },
  { title: "Managed Firewall", href: "network-management/managed-firewall-services.html", icon: "lock" },
  { title: "IT Strategy", href: "it-project-management/it-strategy-services.html", icon: "compass" },
];

// Sectors, with the staging slugs kept exactly as they are.
export const INDUSTRIES = [
  { key: "business-services", title: "Business Services", icon: "briefcase", href: "managed-it-services-for-business-services-organisations.html", desc: "Stable, secure and well-managed IT for professional service providers, consultancies and agencies whose reputation depends on client service." },
  { key: "construction", title: "Construction", icon: "hardHat", href: "it-support-construction.html", desc: "Phone-first IT support for construction companies, tackling job-site connectivity, cyber security risks and outdated systems." },
  { key: "healthcare", title: "Healthcare", icon: "heartPulse", href: "it-support-healthcare.html", desc: "Confidentiality-focused IT for healthcare and clinical organisations, from GDPR-aware security to tested backup and recovery." },
  { key: "financial", title: "Financial Services", icon: "landmark", href: "managed-it-services-for-financial-services-business.html", desc: "Secure, resilient IT for advisers, accountants, wealth managers and lending firms working in a regulated industry." },
  { key: "legal", title: "Legal", icon: "scale", href: "managed-it-services-for-legal-firms.html", desc: "Confidentiality-first managed IT for law firms, protecting case files and client information while keeping fee earners productive." },
  { key: "education", title: "Education", icon: "graduation", href: "managed-it-services-for-education-organisations.html", desc: "Dependable classroom technology and safeguarding-aware IT for schools, academies, colleges and education providers." },
  { key: "manufacturing", title: "Manufacturing", icon: "layers", href: "managed-it-services-for-manufacturing-businesses.html", desc: "Resilient IT for production environments, from ERP platforms and connected machinery to secure multi-site connectivity." },
  { key: "insurance", title: "Insurance", icon: "fileCheck", href: "managed-it-services-for-insurance-services-businesses.html", desc: "Reliable systems for brokers, insurers and claims teams that depend on fast access to policy platforms and customer records." },
];

// Location pages (14 on staging, plus the /locations/ index).
export const LOCATIONS = [
  { title: "London", href: "locations/it-support-london.html" },
  { title: "Hertfordshire", href: "locations/it-support-hertfordshire.html" },
  { title: "Stevenage", href: "locations/it-support-stevenage.html" },
  { title: "Birmingham", href: "locations/it-support-birmingham.html" },
  { title: "Bradford", href: "locations/it-support-bradford.html" },
  { title: "Cardiff", href: "locations/it-support-cardiff.html" },
  { title: "Coventry", href: "locations/it-support-coventry.html" },
  { title: "Edinburgh", href: "locations/it-support-edinburgh.html" },
  { title: "Leeds", href: "locations/it-support-leeds.html" },
  { title: "Leicester", href: "locations/it-support-leicester.html" },
  { title: "Manchester", href: "locations/it-support-manchester.html" },
  { title: "Newcastle", href: "locations/it-support-newcastle.html" },
  { title: "South Wales", href: "locations/it-support-south-wales.html" },
  { title: "Wales", href: "locations/it-support-wales.html" },
];

// Vendor accreditations and partner status, with the logo files pulled from staging.
export const PARTNERS = [
  { title: "Microsoft Cloud Solution Provider", file: "microsoft-csp.png" },
  { title: "Cyber Essentials certified", file: "cyber-essentials.png" },
  { title: "Fortinet Authorized Partner", file: "fortinet.png" },
  { title: "Dell Technologies Authorized Partner", file: "dell-technologies.png" },
  { title: "NinjaOne partner", file: "ninjaone.svg" },
  { title: "Pax8 partner", file: "pax8.png" },
  { title: "Acronis partner", file: "acronis.png" },
];

// Client logos shown on staging (permission already granted for these).
export const CLIENTS = [
  { title: "MBKB Group", file: "MBKB.png" },
  { title: "Canbury Insights", file: "Canbury.png" },
  { title: "Ixia Clinical", file: "Ixia.png" },
  { title: "BF International", file: "BFI.png" },
  { title: "Clariti AI", file: "ClaritiAI.png" },
  { title: "Borough Broth", file: "borough-broth.png" },
  { title: "Pareto Shipbrokers", file: "pareto.png" },
  { title: "Caronne Care", file: "caronne-care.png" },
  { title: "The Charity Learning Consortium", file: "charity-learning.png" },
  { title: "The Portland Hotel Group", file: "portland.png" },
];

// Verified Google reviews, as published on /our-customers/.
export const TESTIMONIALS = [
  { quote: "Great IT support company. The WhizzIT team are professional, responsive and easy to work with. Any issues are dealt with quickly and they are never slow to pick up the phone.", name: "Tommy Sabine", role: "Director, Codeshield", sectors: ["business-services", "financial", "insurance"] },
  { quote: "Working with Billy and the WhizzIT team has been a revelation. Amazing support in set up, outstanding customer service and a pleasure at every interaction. Great to have our IT support in such safe hands.", client: "mbkb-group", name: "Mark Bremner", role: "CEO, MBKB Group", sectors: ["education", "business-services"] },
  { quote: "They provide IT services for my 24 bed hotel, restaurant and newly refurbished sports bar and grill. Very responsive, knowledgeable and very reasonably priced. Special mention to Billy who never fails to pick up the phone.", client: "the-portland-hotel-group", name: "John Pringle", role: "CEO, The Portland Hotel Group", sectors: ["retail", "business-services"] },
  { quote: "Great managed IT service provider. Thank you WhizzIT for a smooth migration from Google to Microsoft 365. We really appreciate how professional Billy is, and he is always on hand to help us over the phone.", client: "ixia-clinical", name: "Amy Welch", role: "Director, Ixia Clinical", sectors: ["healthcare"] },
  { quote: "WhizzIT are always on hand to support my construction company. Being able to simply pick up the phone and receive great IT support is an essential part of running my business.", client: "gh-building-and-landscaping", name: "Gary Hufford", role: "Owner, GH Building & Landscaping", sectors: ["construction", "manufacturing"] },
  { quote: "Amazing IT services. I am so happy I chose WhizzIT to help me with my new business set up. Very efficient and professional with great communication throughout.", name: "Daisy Pringle", role: "Founder, DP Music" },
  { quote: "Excellent service. Great insight and highly supportive. Thank you Billy.", name: "Ben Wilmot", role: "Director, Canbury Insights", sectors: ["financial", "legal", "insurance"] },
  { quote: "Have been using this company for a few months and I couldn’t be happier. Very professional and reliable.", name: "Boris Carozzi", role: "Procurement Manager, BF International" },
  { quote: "Billy provides a superb service; responsive, attentive and very knowledgeable about IT.", name: "Matthew Temple", role: "Director", sectors: ["legal", "business-services"] },
  { quote: "Billy gave me a wonderful service. I would recommend him highly.", name: "Lady Julia Carter", role: "Member, House of Lords" },
  { quote: "Very helpful, friendly and efficient. Would recommend.", name: "Kim Saban", role: "Google review" },
];

// The team, as published on /about/. [CLIENT TO SUPPLY] headshots.
export const TEAM = [
  { name: "Billy Carey", role: "CEO", initials: "BC", linkedin: "https://www.linkedin.com/in/billycarey/", bio: "Billy founded WhizzIT after spending over ten years in the MSP industry. He has a background in IT support and cyber security, and as demand for both kept growing he decided to bring them together under one roof. Billy has always cared about getting customer service right and building strong relationships with clients, and that is what WhizzIT is built around." },
  { name: "Harry Gleed", role: "Senior Support Engineer", initials: "HG", linkedin: "https://www.linkedin.com/in/harry-gleed-23a0ba1ba/", bio: "Harry is a senior support engineer with deep knowledge of both Microsoft and Google systems. He has a real talent for customer service and tends to build long lasting relationships with the clients he works with, who know they can count on him to sort things out properly." },
  { name: "Connor McGovern", role: "1st Line Support Engineer", initials: "CM", linkedin: "https://www.linkedin.com/in/connor-mcgovern-2911483b3/", bio: "Connor is a 1st Line Support Engineer and often the first point of contact when clients need a hand. He focuses on desktop support and cloud system administration, and is a talented engineer who is picking up new skills quickly. Connor has become an integral part of the WhizzIT team." },
];

// The two credentials WhizzIT publishes on every page.
export const CREDENTIALS = [
  {
    title: "Cyber Essentials certified",
    file: "cyber-essentials.png",
    text: "Independently assessed against the UK government-backed scheme, so our security fundamentals are verified rather than simply claimed. We help clients certify too.",
    cta: { label: "How Cyber Essentials helps you", href: "cyber-security/cyber-essentials-services.html" },
  },
  {
    title: "Microsoft Cloud Solution Provider",
    file: "microsoft-csp.png",
    text: "A direct partnership with Microsoft. We license, deploy and support Microsoft 365 and Azure for you, with escalation straight to Microsoft when it is needed.",
    cta: { label: "Our Microsoft cloud services", href: "managed-cloud-services.html" },
  },
];

// Case studies published under /our-customers/.
export const CASE_STUDIES = [
  { slug: "the-portland-hotel-group", title: "The Portland Hotel Group", excerpt: "Phone-first IT support across a hotel, restaurant and sports bar: hospitality IT that never clocks off.", sector: "Hospitality", image: "photos/whizzit-van-outside-office-1024.webp" },
  { slug: "ixia-clinical", title: "Ixia Clinical", excerpt: "A smooth migration from Google Workspace to Microsoft 365, with ongoing support a phone call away.", sector: "Healthcare", image: "photos/service-desk-engineer-1024.webp" },
  { slug: "gh-building-and-landscaping", title: "GH Building & Landscaping", excerpt: "Reliable, phone-first support for a construction business that needs answers on site, not ticket numbers.", sector: "Construction", image: "photos/network-engineer-patching-rack-1024.webp" },
  { slug: "mbkb-group", title: "MBKB Group", excerpt: "IT set-up and ongoing support for a fast-growing training provider, from first device to full managed service.", sector: "Education", image: "photos/whizzit-team-collaborating-1024.webp" },
];

// Photography pulled from staging. Each name has 480/768/1024/1280 WebP + AVIF variants.
export const PHOTOS = {
  team: { name: "whizzit-team-collaborating", alt: "WhizzIT team members in branded tops reviewing IT support work together at a desk", widths: [480, 768, 1024, 1280] },
  serviceDesk: { name: "service-desk-engineer", alt: "WhizzIT service desk engineer helping a client from the office", widths: [480, 768, 1024] },
  headset: { name: "it-support-engineer-headset", alt: "IT support engineer wearing a headset taking a customer call", widths: [480, 768, 1024, 1280] },
  network: { name: "network-engineer-patching-rack", alt: "Network engineer patching a cabinet in a server rack", widths: [480, 768, 1024, 1280] },
  office: { name: "whizzit-office-desks", alt: "The WhizzIT office with engineers working at their desks", widths: [480, 768, 1024, 1280] },
  van: { name: "whizzit-van-outside-office", alt: "Branded WhizzIT van parked outside the office", widths: [480, 768, 1024, 1280] },
};

// Royalty-free photography (Unsplash / Pexels licences, credits in
// assets/images/stock/CREDITS.md). Each entry has 480/768/1024/1280 WebP at 3:2.
export const STOCK = {
  supportDesk: { slug: "support-desk", alt: "Service desk team taking support calls with headsets" },
  serverRoom: { slug: "server-room", alt: "Network patch panel with structured cabling" },
  cloudRacks: { slug: "cloud-racks", alt: "Server racks in a data centre" },
  cyber: { slug: "cyber", alt: "Abstract visualisation of network traffic and data flow" },
  team: { slug: "team", alt: "Team working together around a table with laptops" },
  office: { slug: "office", alt: "Bright modern open-plan office" },
  engineer: { slug: "engineer", alt: "Engineer working on computer hardware" },
  construction: { slug: "construction", alt: "Site workers reviewing plans on a tablet in hi-vis" },
  healthcare: { slug: "healthcare", alt: "Clinician working at a computer in a consulting room" },
  clinicDesk: { slug: "clinic-desk", alt: "Keyboard and stethoscope on a clinical desk" },
  legal: { slug: "legal", alt: "Legal team reviewing documents in a meeting" },
  lawBooks: { slug: "law-books", alt: "Law reference books on a shelf" },
  finance: { slug: "finance", alt: "Finance professional reviewing charts and figures" },
  insurance: { slug: "insurance", alt: "Desk with notebook, calculator and paperwork" },
  education: { slug: "education", alt: "School computer suite with students working" },
  manufacturing: { slug: "manufacturing", alt: "Operator working at machinery on a factory floor" },
  retail: { slug: "retail", alt: "Card payment terminal at a retail counter" },
  hotel: { slug: "hotel", alt: "Hotel reception desk" },
  london: { slug: "london", alt: "Aerial view of the London skyline at dusk" },
  meeting: { slug: "meeting", alt: "Business meeting around a table" },
};

// Which photograph represents each sector and each blog topic.
export const SECTOR_PHOTO = {
  "business-services": "meeting",
  construction: "construction",
  healthcare: "healthcare",
  financial: "finance",
  legal: "legal",
  education: "education",
  manufacturing: "manufacturing",
  insurance: "insurance",
};

export const CATEGORY_PHOTO = {
  support: "supportDesk",
  "managed-it": "team",
  security: "cyber",
  cloud: "cloudRacks",
  network: "serverRoom",
  strategy: "office",
  careers: "education",
};

// Header navigation. Groups become mega-menu columns and mobile accordion groups.
export const NAV = [
  {
    label: "IT Services",
    id: "services",
    match: ["it-services.html", "it-support.html", "managed-cloud-services.html", "cyber-security.html", "network-management.html", "it-project-management.html", "it-support/", "managed-cloud-services/", "cyber-security/", "network-management/", "it-project-management/"],
    type: "services",
  },
  {
    label: "Industries",
    id: "industries",
    match: ["industries.html", "it-support-construction.html", "it-support-healthcare.html", "managed-it-services-for-"],
    type: "industries",
  },
  {
    label: "Customers",
    id: "customers",
    match: ["our-customers.html", "our-customers/"],
    type: "compact",
    groups: [
      {
        title: "Proof",
        links: [
          { title: "Our customers", href: "our-customers.html", icon: "users" },
          { title: "Success stories", href: "our-customers.html#stories", icon: "book" },
          { title: "Google reviews", href: "our-customers.html#reviews", icon: "star" },
        ],
      },
    ],
    feature: {
      title: "Comparing IT providers?",
      text: "Read what our clients say, then talk to us about your business.",
      cta: "Read the reviews",
      href: "our-customers.html#reviews",
    },
  },
  {
    label: "Resources",
    id: "resources",
    match: ["blog.html", "blog/"],
    type: "compact",
    groups: [
      {
        title: "Insights",
        links: [
          { title: "Blog", href: "blog.html", icon: "book" },
          { title: "Cyber security articles", href: "blog.html?category=security", icon: "shield" },
          { title: "Cloud & Microsoft 365", href: "blog.html?category=cloud", icon: "cloud" },
        ],
      },
      {
        title: "Support",
        links: [
          { title: "Book a consultation", href: "contact.html", icon: "calendar" },
          { title: `Call ${SITE.phone}`, href: SITE.phoneHref, icon: "phone" },
        ],
      },
    ],
    feature: {
      title: "Need help today?",
      text: "We answer the phone, no call queues, and respond the same working day.",
      cta: "Talk to the team",
      href: "contact.html",
    },
  },
  {
    // Was "Company". Renamed so the About page is reachable by name from the bar,
    // and given the Locations group that used to sit in the utility strip.
    label: "About",
    id: "company",
    match: ["about.html", "locations.html", "locations/", "privacy-policy.html", "cookie-policy.html"],
    type: "compact",
    groups: [
      {
        title: "WhizzIT",
        links: [
          { title: "About us", href: "about.html", icon: "building" },
          { title: "Meet the team", href: "about.html#team", icon: "users" },
        ],
      },
      {
        title: "Locations",
        links: [
          { title: "All locations", href: "locations.html", icon: "mapPin" },
          { title: "IT support in London", href: "locations/it-support-london.html", icon: "mapPin" },
          { title: "IT support in Hertfordshire", href: "locations/it-support-hertfordshire.html", icon: "mapPin" },
        ],
      },
    ],
    feature: {
      title: "Talk to an IT expert",
      text: "One conversation is usually enough to tell you whether we are the right fit.",
      cta: "Book a consultation",
      href: "contact.html",
    },
  },
  {
    label: "Contact",
    id: "contact",
    href: "contact.html",
    match: ["contact.html", "thank-you-london.html"],
    type: "link",
  },
];

// Blog: the 27 articles published on staging, parsed straight from the WordPress export.
export { POSTS as BLOG } from "./content.mjs";

export const BLOG_CATEGORIES = [
  { key: "all", label: "All articles" },
  { key: "support", label: "IT Support" },
  { key: "managed-it", label: "Managed IT" },
  { key: "security", label: "Cyber Security" },
  { key: "cloud", label: "Cloud" },
  { key: "network", label: "Network" },
  { key: "strategy", label: "IT Strategy" },
  { key: "careers", label: "Careers" },
];
