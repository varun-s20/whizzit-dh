# How ransomware targets UK business backups | WhizzIT – staging.whizzit.co.uk

**Meta description:** 

- [CTA] Home -> /
- [CTA] About -> /about/
- Services
- [CTA] IT Support
- [CTA] IT Support overview -> /it-support/
- [CTA] Managed IT Support -> /it-support/managed-it-support-services/
- [CTA] Apple Mac IT Support -> /it-support/apple-mac-it-support-services/
- [CTA] Managed Cloud Services
- [CTA] Managed Cloud Services overview -> /managed-cloud-services/
- [CTA] Managed Cloud Infrastructure -> /managed-cloud-services/managed-cloud-infrastructure-services/
- [CTA] Microsoft 365 Backup -> /managed-cloud-services/microsoft-365-backup-services/
- [CTA] Microsoft Azure -> /managed-cloud-services/microsoft-azure-services/
- [CTA] Google Workspace Backup -> /managed-cloud-services/google-workspace-backup-services/
- [CTA] Cloud Management -> /managed-cloud-services/cloud-management-services/
- [CTA] Cloud Migration -> /managed-cloud-services/cloud-migration-services/
- [CTA] Business Continuity & DR -> /managed-cloud-services/business-continuity-disaster-recovery-services/
- [CTA] Cyber Security
- [CTA] Cyber Security overview -> /cyber-security/
- [CTA] Configuration Review -> /cyber-security/configuration-review-services/
- [CTA] Cyber Essentials -> /cyber-security/cyber-essentials-services/
- [CTA] Security Awareness Training -> /cyber-security/security-awareness-training-services/
- [CTA] Dark Web Monitoring -> /cyber-security/dark-web-monitoring-services/
- [CTA] Email Security -> /cyber-security/email-security-services/
- [CTA] Managed Detection & Response -> /cyber-security/managed-detection-response-services/
- [CTA] Managed SIEM & SOC -> /cyber-security/managed-siem-soc-as-a-service/
- [CTA] Network Security -> /cyber-security/network-security-services/
- [CTA] Password Management -> /cyber-security/password-management-services/
- [CTA] Penetration Testing -> /cyber-security/penetration-testing-services/
- [CTA] Network Management
- [CTA] Network Management overview -> /network-management/
- [CTA] Managed Firewall -> /network-management/managed-firewall-services/
- [CTA] Business Wi-Fi & Wireless -> /network-management/business-wifi-services/
- [CTA] Network Monitoring -> /network-management/network-monitoring-services/
- [CTA] Structured Cabling -> /network-management/structured-cabling-services/
- [CTA] SD-WAN & Connectivity -> /network-management/sd-wan-connectivity-services/
- [CTA] IT Project Management
- [CTA] IT Project Management overview -> /it-project-management/
- [CTA] AI Governance -> /it-project-management/ai-governance-services/
- [CTA] IT Health Check -> /it-project-management/it-health-check-services/
- [CTA] IT Policies & Procedures -> /it-project-management/it-policies-procedures-services/
- [CTA] IT Strategy -> /it-project-management/it-strategy-services/
- [CTA] Project Delivery & Professional Services -> /it-support/project-delivery-professional-services/
- [CTA] Technology Audit -> /it-project-management/technology-audit-services/
- [CTA] Industries -> /industries/
- [CTA] Customers -> /our-customers/
- [CTA] Blog -> /blog/
- [CTA] Book a consultation -> /contact/
- [CTA] Call 020 4634 2518 -> tel:02046342518
- [CTA] Home -> /
- /
- [CTA] Blog -> /blog/
- /Ransomware & backups
- [CTA] Billy Carey -> /about/
- Cyber Security21 May 20267 min read

## How ransomware targets business backups

Modern
- [CTA] ransomware -> https://www.ncsc.gov.uk/ransomware/home
- doesn’t just encrypt your live data, it hunts down your backups first. Here’s how attackers do it, and the controls that keep your recovery intact.

### Request a callback

We respond the same working day.
- Name *Please enter your name.Email *Please enter a valid email.How can we help?Please complete the reCAPTCHA to continue.
- [CTA] Request a callback
- [CTA] Got it, thank you.
Your callback request is with the team. We'll respond the same working day.
Need it sorted sooner?
- [CTA] Call 020 4634 2518 -> tel:02046342518
- [CTA] Book a slot instead -> /contact/
Backups are your safety net. If your business can restore its data quickly, there is no reason to pay a ransom, and attackers know it. That is exactly why modern ransomware campaigns no longer stop at your live systems. Before they encrypt anything, they go looking for your backups.
In the early days of ransomware, a good backup was often enough. You wiped the affected machines, restored from a clean copy and carried on. Attackers have adapted. Today they deliberately target your recovery capability, because a business that cannot recover is a business far more likely to pay. Understanding how they do it, and how to make your backups genuinely resilient, is now a core part of any sensible security strategy.

### Why attackers go after your backups first

Ransomware is a business, and the product being sold back to you is your own data. The whole model depends on you having no realistic alternative to paying. Reliable, isolated backups break that model completely: if you can restore in hours, a ransom demand becomes an inconvenience rather than a crisis.
So attackers have learned to neutralise recovery before they trigger encryption. They often spend time inside a network, sometimes days or weeks, quietly locating backup servers, cloud backup consoles and replication jobs. By the time the ransom note appears, the backups they found have frequently already been deleted, encrypted or corrupted. Treating backups as a set-and-forget insurance policy is no longer safe.

### How attackers reach your backups

Most attacks follow a recognisable pattern. It usually begins with credential theft, a phished password, a reused login or an exposed remote-access account, which gives the attacker a foothold. From there they work towards administrative access, because admin rights over your backup platform are the keys to the kingdom.
Once they have that access, the tactics are straightforward. They delete backup files and snapshots outright. They encrypt the backup storage alongside everything else. And where deletion is harder, they simply disable recovery from the inside: shortening retention policies so older copies quietly age out, interrupting replication so off-site copies never complete, or switching off backup jobs so nothing new is protected. All of this can happen in the background while your day-to-day systems appear completely normal.

### Where backups are most vulnerable

A handful of common weaknesses turn a backup system into an easy target:
- Weak access controls. If backup consoles rely on single passwords, shared logins or no multi-factor authentication, one stolen credential is enough to reach them.
- Shared infrastructure. When production and backup systems sit on the same network, use the same credentials or share the same management tools, compromising one often means compromising both.
- Inadequate isolation. Backups that are always online and always writable can be encrypted or deleted as easily as any other file. Without genuine separation, they are not really a safety net at all.
- [CTA] Straight answers

### Prefer to talk it through?

We answer the phone ourselves. No call queues and no ticket numbers just to ask a question.
- [CTA] Call us
- [CTA] 020 4634 2518 -> tel:02046342518

### On-premise, cloud and hybrid backups

Where your backups live changes the risks you need to manage.
- On-premise backups are quick to restore from and fully under your control, but they are vulnerable if your network is compromised. An attacker who reaches your servers can often reach the backup appliance sitting alongside them.
- Cloud backups move your copies off-site and away from local attacks, but they are only as safe as their configuration. Weak credentials, over-permissive access and missing MFA on the cloud console can hand an attacker the same delete button you use.
- Hybrid backups combine both and can offer real resilience, but they also introduce complexity, and any weakness in either environment can be inherited by the whole setup. More moving parts means more to configure correctly and more to monitor.

### How to protect your backups

The good news is that resilient backups are entirely achievable with a handful of well-established controls:
- Keep an air-gapped copy. Maintain at least one backup that is physically or logically isolated from your live network, so it cannot be reached or altered even if everything else is compromised.
- Use immutable storage. Immutable, or write-once, backups cannot be changed or deleted for a set period, even by someone with administrative rights. This is one of the single most effective defences against backup tampering.
- Lock down access with MFA. Protect every backup console and admin account with multi-factor authentication and the principle of least privilege, so a stolen password alone is never enough.
- Separate backup credentials and infrastructure. Do not reuse production logins for your backup platform, and keep backup systems off the everyday network path wherever you can.
- Test your recovery regularly. A backup you have never restored from is only a hope. Run real recovery tests so you know your copies work and how long a restore actually takes.
A simple rule of thumb many businesses still rely on is 3-2-1: keep three copies of your data, on two different types of storage, with at least one held off-site. Layering air-gapping and immutability on top of that turns a basic backup routine into recovery you can genuinely trust.

### Test your recovery, not just your backups

This point deserves stressing on its own, because it is the one most often overlooked. Backups that complete successfully every night can still fail when you actually need them, because of a configuration error, a missing dependency or a corrupted file that nobody noticed. The only way to know your recovery works is to practise it.
For your most critical systems, aim to test a full restore every few months, and document how long it takes. That figure, your realistic recovery time, is what turns a backup policy into a genuine business-continuity plan.

### The bottom line

Ransomware has evolved from a data problem into a recovery problem. Attackers win when they can take away your ability to bounce back, so the businesses that stay in control are the ones whose backups are isolated, immutable, tightly access-controlled and regularly tested.
If you are not certain your backups would survive a determined attack, or that you could actually restore from them under pressure, that is exactly the gap worth closing now, before it is tested for you. We are always happy to review your current setup and help you build recovery you can rely on.
Recovering from ransomware depends on backups you have actually tested, which is the core of our
- [CTA] business continuity and disaster recovery service -> /managed-cloud-services/business-continuity-disaster-recovery-services/
- .
- [CTA] BC
Billy Carey— CEO, WhizzIT
Billy founded WhizzIT after spending over ten years in the MSP industry. He has a background in IT support and cyber security, and as demand for both kept growing he decided to bring them together under one roof. Billy has always cared about getting customer service right and building strong relationships with clients, and that is what WhizzIT is built around.
- [CTA] More about WhizzIT -> /about/
- Good to know

### Frequently asked questions

- [CTA] Are cloud backups automatically safe from ransomware?
- [CTA] Not automatically. Cloud backups move your data off-site, which helps, but they are only as secure as their configuration. Without strong credentials, multi-factor authentication and sensible access limits, an attacker who compromises the cloud console can delete cloud backups just as easily as local ones.
- [CTA] Are small businesses really at risk from ransomware?
- Yes. Small and medium-sized businesses are frequently targeted precisely because their defences and backups are often weaker than those of large enterprises. Attackers look for the easiest route to a payout, not the biggest name.
- [CTA] How often should we test our backups?
- [CTA] For critical systems, test a full recovery every few months at minimum, and again after any significant change to your infrastructure. Testing confirms both that your backups work and how long a real restore would take.
- [CTA] What does an ‘immutable’ backup mean?
- An immutable backup is written in a way that cannot be altered or deleted for a defined period, even by an administrator. That makes it extremely resistant to ransomware, which relies on being able to encrypt or remove your recovery copies.
- [CTA] What is an air-gapped backup?
- [CTA] An air-gapped backup is kept physically or logically separate from your live network, so it cannot be reached by an attacker who has compromised your main systems. It is one of the most reliable ways to guarantee you always have a clean copy to restore from.Ready when you areWant this looked at on your own setup?
We will review what you are running now and tell you what genuinely needs attention first.
- [CTA] 020 4634 2518 -> tel:02046342518
- ★★★★★
Great IT support company. The WhizzIT team are professional, responsive and easy to work with. Any issues are dealt with quickly and they are never slow to pick up the phone.
Tommy Sabine, Director, Codeshield ·
- [CTA] see all 15 reviews -> https://maps.google.com/?cid=17055157413191665489
- [CTA] Send us a message
We respond the same working day.
- Name *Please enter your name.Work email *Please enter a valid email.How can we help? *Please let us know how we can help.Please complete the reCAPTCHA to continue.
- [CTA] Send message
- [CTA] Got it, thank you.
Your message is with the team. We’ll respond the same working day.
Need it sorted sooner?
- [CTA] Call 020 4634 2518 -> tel:02046342518
- [CTA] Book a slot instead -> /contact/
- Sorry, something went wrong. Please call 020 4634 2518 or email info@whizzit.co.uk.Keep reading

### Related articles

- [CTA] Cloud Security -> /blog/cloud-data-protection/

#### Why protecting cloud data is important

- [CTA] Read article
- [CTA] Cloud Backup -> /blog/google-workspace-backup-uk-smes/

#### Google Workspace backup for UK SMEs

- Read article
- [CTA] Cyber Security -> /blog/cyber-resiliency-strategy-enterprise-risk-management/

#### Cyber resiliency strategy & enterprise risk management

- [CTA] Read article -> /contact/
- [CTA] Technology partners -> /blog/

### Brands we partner with

We hold partner status with the vendors behind the tools we deploy, so your licensing, support and escalation come direct from the source rather than through a reseller chain.
- [CTA] Related service -> /cyber-security/

### Managed cyber security services

Certified protection, monitoring and response for your whole environment.
- See managed cyber security services
- [CTA] Ready when you areWould your backups survive a ransomware attack? -> /our-customers/
Book a free consultation and we’ll review your backup and recovery setup, then help you close any gaps.
- [CTA] Book a consultation -> /contact/
- [CTA] Back to the blog -> /blog/
- [CTA] Book a slot -> /contact/
- Send us a message
Tell us what you need. We respond the same working day.
- [CTA] Name *Please enter your name.Work email *Please enter a valid email.How can we help? *Please let us know how we can help.Please complete the reCAPTCHA to continue. -> /industries/
- [CTA] Send message
- Got it, thank you.
Your message is with the team. We’ll respond the same working day.
Need it sorted sooner?
- [CTA] Call 020 4634 2518 -> tel:02046342518
- [CTA] Book a slot instead -> /contact/

## Images

- `/images/whizzit-logo.svg` — alt: WhizzIT
- `/images/partners/fortinet.png` — alt: Fortinet Authorized Partner
- `/images/partners/pax8.png` — alt: Pax8 partner
- `/images/partners/dell-technologies.png` — alt: Dell Technologies Authorized Partner
- `/images/partners/acronis.png` — alt: Acronis Cloud Backup Provider Partner
- `/images/partners/ninjaone.svg` — alt: NinjaOne partner
- `/images/whizzit-logo.svg` — alt: WhizzIT
