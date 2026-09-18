// Hero visuals — one distinct composition per service family.
// All are decorative (aria-hidden) and paired with text that carries the meaning.
import { icon, logoMark } from "./icons.mjs";

export const shieldRings = `
<div class="shield-rings" aria-hidden="true">
  <svg viewBox="0 0 520 520" fill="none">
    <defs>
      <radialGradient id="sr-core" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#6d5df6" stop-opacity=".55"/><stop offset="1" stop-color="#6d5df6" stop-opacity="0"/></radialGradient>
      <linearGradient id="sr-shield" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#62e2f3"/><stop offset="1" stop-color="#6d5df6"/></linearGradient>
    </defs>
    <circle cx="260" cy="260" r="200" fill="url(#sr-core)" opacity=".5"/>
    <g stroke="#ffffff" stroke-opacity=".14">
      <circle cx="260" cy="260" r="235"/>
      <circle cx="260" cy="260" r="190"/>
      <circle cx="260" cy="260" r="145"/>
      <circle cx="260" cy="260" r="100"/>
    </g>
    <g class="orbit">
      <circle cx="260" cy="260" r="235" stroke="#62e2f3" stroke-opacity=".5" stroke-dasharray="2 10"/>
      <circle cx="495" cy="260" r="5" fill="#62e2f3"/>
      <circle cx="25" cy="260" r="3" fill="#62e2f3" opacity=".6"/>
    </g>
    <g font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#a3b1c6">
      <text x="260" y="38" text-anchor="middle">People</text>
      <text x="260" y="84" text-anchor="middle">Devices</text>
      <text x="260" y="130" text-anchor="middle">Network</text>
      <text x="260" y="176" text-anchor="middle">Data</text>
    </g>
    <path d="M260 206l52 20v36c0 36-52 58-52 58s-52-22-52-58v-36Z" fill="#0a1628" stroke="url(#sr-shield)" stroke-width="2.5"/>
    <path d="m238 262 16 16 30-32" stroke="#62e2f3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <g>
      <circle class="pulse-node pulse-node--live" cx="120" cy="150" r="5" fill="#ff8a7a"/>
      <path d="M120 150 L 175 200" stroke="#ff8a7a" stroke-opacity=".6" stroke-dasharray="3 4"/>
      <circle cx="175" cy="200" r="7" fill="none" stroke="#62e2f3" stroke-width="2"/>
      <circle class="pulse-node pulse-node--live" cx="420" cy="380" r="5" fill="#ff8a7a"/>
      <path d="M420 380 L 360 330" stroke="#ff8a7a" stroke-opacity=".6" stroke-dasharray="3 4"/>
      <circle cx="360" cy="330" r="7" fill="none" stroke="#62e2f3" stroke-width="2"/>
    </g>
    <g transform="translate(330 96)">
      <rect width="150" height="44" rx="10" fill="#12233b" stroke="#ffffff" stroke-opacity=".12"/>
      <circle cx="20" cy="22" r="5" fill="#34d399"/>
      <text x="34" y="20" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#ffffff">Threat contained</text>
      <text x="34" y="33" font-family="Inter, sans-serif" font-size="10" fill="#a3b1c6">Illustrative alert</text>
    </g>
  </svg>
</div>`;

export const cloudStack = `
<svg class="cloud-stack" viewBox="0 0 560 500" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="cs-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6f7fa"/></linearGradient>
    <linearGradient id="cs-accent" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2457f5"/><stop offset="1" stop-color="#0fb5cf"/></linearGradient>
  </defs>
  <!-- layer 3: data & backup -->
  <g transform="translate(0 150)">
    <path d="M280 160 520 250 280 340 40 250Z" fill="#c9ebf2" stroke="#9fd8e4"/>
    <text x="280" y="300" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#0a7f94">Backup &amp; recovery</text>
  </g>
  <!-- layer 2: workloads -->
  <g transform="translate(0 75)">
    <path d="M280 160 520 250 280 340 40 250Z" fill="#e0f4f8" stroke="#b3e1ea"/>
    <g fill="#ffffff" stroke="#cdeef4">
      <path d="M190 236 230 221 270 236 230 251Z"/>
      <path d="M290 236 330 221 370 236 330 251Z"/>
      <path d="M240 266 280 251 320 266 280 281Z"/>
    </g>
    <text x="280" y="318" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#0a7f94">Apps &amp; workloads</text>
  </g>
  <!-- layer 1: identity & access -->
  <g>
    <path d="M280 160 520 250 280 340 40 250Z" fill="url(#cs-top)" stroke="#bfe6ee"/>
    <path d="M280 160 520 250 280 340 40 250Z" stroke="url(#cs-accent)" stroke-width="1.5" opacity=".6"/>
    <text x="280" y="318" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#0a7f94">Identity &amp; security</text>
  </g>
  <!-- connectors -->
  <g stroke="#0fb5cf" stroke-width="1.5">
    <path class="route-line route-line--flow" d="M120 250 V 400"/>
    <path class="route-line route-line--flow" d="M440 250 V 400"/>
    <path class="route-line route-line--flow" d="M280 250 V 60"/>
  </g>
  <!-- cloud -->
  <g transform="translate(200 10)">
    <path d="M40 70h82a26 26 0 0 0 0-52 38 38 0 0 0-72-6A28 28 0 0 0 40 70Z" fill="#ffffff" stroke="#0fb5cf" stroke-width="1.5"/>
    <circle cx="80" cy="46" r="5" fill="#2457f5"/>
  </g>
  <g class="pulse-node pulse-node--live"><circle cx="280" cy="250" r="7" fill="#2457f5"/></g>
  <circle cx="120" cy="250" r="5" fill="#0fb5cf"/>
  <circle cx="440" cy="250" r="5" fill="#0fb5cf"/>
  <!-- status chips -->
  <g font-family="Inter, sans-serif" font-size="11" font-weight="600">
    <g transform="translate(18 120)"><rect width="140" height="36" rx="10" fill="#ffffff" stroke="#dce4ee"/><circle cx="18" cy="18" r="4.5" fill="#14966f"/><text x="30" y="22" fill="#0f1b2d">Migration on track</text></g>
    <g transform="translate(400 150)"><rect width="140" height="36" rx="10" fill="#ffffff" stroke="#dce4ee"/><circle cx="18" cy="18" r="4.5" fill="#2457f5"/><text x="30" y="22" fill="#0f1b2d">MFA enforced</text></g>
  </g>
</svg>`;

export const topology = `
<figure class="topology">
  <svg viewBox="0 0 560 380" fill="none" aria-hidden="true">
    <g stroke="#0d8a78" stroke-width="1.5">
      <path class="route-line route-line--flow" d="M280 70 L 110 190"/>
      <path class="route-line route-line--flow" d="M280 70 L 450 190"/>
      <path class="route-line route-line--flow" d="M280 70 L 280 190"/>
      <path d="M110 190 L 60 310 M110 190 L 160 310" stroke-opacity=".5"/>
      <path d="M450 190 L 400 310 M450 190 L 500 310" stroke-opacity=".5"/>
      <path d="M280 190 L 280 310" stroke-opacity=".5"/>
    </g>
    <g font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">
      <g transform="translate(220 34)"><rect width="120" height="72" rx="14" fill="#0a1628"/><text x="60" y="34" fill="#fff">Cloud &amp; internet</text><text x="60" y="52" fill="#62e2f3" font-weight="500" font-size="11">Dual links</text></g>
      <g transform="translate(50 164)"><rect width="120" height="52" rx="12" fill="#fff" stroke="#cfe8e2"/><text x="60" y="31" fill="#0f1b2d">Head office</text></g>
      <g transform="translate(220 164)"><rect width="120" height="52" rx="12" fill="#fff" stroke="#cfe8e2"/><text x="60" y="31" fill="#0f1b2d">Firewall</text></g>
      <g transform="translate(390 164)"><rect width="120" height="52" rx="12" fill="#fff" stroke="#cfe8e2"/><text x="60" y="31" fill="#0f1b2d">Branch site</text></g>
      <g font-size="11" font-weight="500" fill="#5c6a7d">
        <g transform="translate(30 296)"><rect width="60" height="30" rx="8" fill="#dcf4ef"/><text x="30" y="19" fill="#0d6b5d">Wi-Fi</text></g>
        <g transform="translate(130 296)"><rect width="60" height="30" rx="8" fill="#dcf4ef"/><text x="30" y="19" fill="#0d6b5d">Desks</text></g>
        <g transform="translate(245 296)"><rect width="70" height="30" rx="8" fill="#dcf4ef"/><text x="35" y="19" fill="#0d6b5d">Remote</text></g>
        <g transform="translate(370 296)"><rect width="60" height="30" rx="8" fill="#dcf4ef"/><text x="30" y="19" fill="#0d6b5d">Wi-Fi</text></g>
        <g transform="translate(470 296)"><rect width="60" height="30" rx="8" fill="#dcf4ef"/><text x="30" y="19" fill="#0d6b5d">Tills</text></g>
      </g>
    </g>
    <circle class="pulse-node pulse-node--live" cx="280" cy="70" r="4" fill="#62e2f3"/>
  </svg>
  <figcaption class="topology__legend">
    <span class="tag tag--success"><span class="tag__dot"></span>All sites online</span>
    <span class="tag">Illustrative network map</span>
  </figcaption>
</figure>`;

const bars = [
  ["Discovery", "is-done", 1],
  ["Design", "is-done", 2],
  ["Procurement", "", 3],
  ["Build & test", "", 4],
  ["Go-live", "is-next", 5],
  ["Handover", "is-next", 6],
];

export const planBoard = `
<div class="plan-board" aria-hidden="true">
  <div class="plan-board__head"><strong>Office relocation plan</strong><span class="tag tag--success"><span class="tag__dot"></span>On track</span></div>
  ${bars.map(([label, state, n]) => `<div class="plan-board__row"><span class="plan-board__label">${label}</span><span class="plan-board__track"><span class="plan-board__bar plan-board__bar--${n} ${state}"></span></span></div>`).join("")}
  <div class="plan-board__foot"><span>Weeks 1–8</span><span>Illustrative project plan</span></div>
</div>`;

export const londonMap = `
<figure class="local-map">
  <svg viewBox="0 0 560 380" fill="none" aria-hidden="true">
    <defs>
      <pattern id="lm-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" stroke="#2457f5" stroke-opacity=".06"/></pattern>
    </defs>
    <rect width="560" height="380" fill="#f5f8fe"/>
    <rect width="560" height="380" fill="url(#lm-grid)"/>
    <path d="M-10 250 C 60 240, 90 190, 150 200 S 230 270, 290 240 S 360 160, 420 190 S 500 250, 570 220" stroke="#bcd3ff" stroke-width="22" stroke-linecap="round"/>
    <path d="M-10 250 C 60 240, 90 190, 150 200 S 230 270, 290 240 S 360 160, 420 190 S 500 250, 570 220" stroke="#dce8ff" stroke-width="14" stroke-linecap="round"/>
    <g stroke="#2457f5" stroke-width="1.2" stroke-opacity=".5">
      <path class="route-line" d="M270 140 L 150 110 M270 140 L 400 100 M270 140 L 190 300 M270 140 L 380 300 M270 140 L 470 150"/>
    </g>
    <g font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#33425a">
      <g transform="translate(150 110)"><circle r="6" fill="#fff" stroke="#2457f5" stroke-width="2"/><text x="10" y="-8">West</text></g>
      <g transform="translate(400 100)"><circle r="6" fill="#fff" stroke="#2457f5" stroke-width="2"/><text x="10" y="-8">East</text></g>
      <g transform="translate(190 300)"><circle r="6" fill="#fff" stroke="#2457f5" stroke-width="2"/><text x="10" y="18">South West</text></g>
      <g transform="translate(380 300)"><circle r="6" fill="#fff" stroke="#2457f5" stroke-width="2"/><text x="10" y="18">South East</text></g>
      <g transform="translate(470 150)"><circle r="6" fill="#fff" stroke="#2457f5" stroke-width="2"/><text x="10" y="-8">Docklands</text></g>
    </g>
    <g transform="translate(270 140)">
      <circle r="34" fill="#2457f5" opacity=".08"/>
      <circle class="pulse-node pulse-node--live" r="18" fill="#2457f5" opacity=".18"/>
      <circle r="10" fill="#2457f5"/>
      <g transform="translate(18 -46)"><rect width="118" height="32" rx="9" fill="#0a1628"/><text x="12" y="20" fill="#fff" font-family="Inter, sans-serif" font-size="11" font-weight="600">Central London</text></g>
    </g>
  </svg>
  <figcaption class="local-map__caption"><span>Illustrative service area</span><span class="placeholder-tag">Client to confirm coverage</span></figcaption>
</figure>`;

export const ticketCard = `
<div class="ticket" aria-hidden="true">
  <div class="ticket__head">
    <span class="icon-tile icon-tile--sm">${icon("headset")}</span>
    <div><strong>Outlook won't open</strong><span>Ticket · Illustrative example</span></div>
    <span class="tag tag--success"><span class="tag__dot"></span>Resolved</span>
  </div>
  <ol class="ticket__timeline">
    <li><span class="ticket__dot"></span><div><strong>Reported by phone</strong><span>Sarah, Accounts</span></div></li>
    <li><span class="ticket__dot"></span><div><strong>Engineer assigned</strong><span>Knows your setup</span></div></li>
    <li><span class="ticket__dot"></span><div><strong>Remote session started</strong><span>Fixed a corrupted profile</span></div></li>
    <li><span class="ticket__dot ticket__dot--done"></span><div><strong>Resolved and explained</strong><span>Root cause noted for review</span></div></li>
  </ol>
  <div class="ticket__foot">${logoMark}<span>Handled by the WhizzIT helpdesk</span></div>
</div>`;
