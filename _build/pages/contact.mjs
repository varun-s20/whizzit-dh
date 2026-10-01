// Contact. Signature: the enquiry form sits beside the two real offices, with the
// direct routes (phone, email) above the fold.
import { page, btn, icon, breadcrumbs, reviewAvatar, field, formMode, captchaRow, officeMapCard, WP_EXPORT, SITE, TESTIMONIALS, CREDENTIALS } from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";

const m = parsePage(pageByPath("/contact/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "Contact" }];

const main = `
<section class="hero hero--sky hero--contact" aria-labelledby="contact-title">
  <div class="container contact-hero">
    <div>
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">Contact</p>
      <h1 class="hero-sky__title" id="contact-title">${m.title}</h1>
      <p class="hero-sky__lead">${m.lead}</p>
      <ul class="contact-routes" role="list">
        <li>
          <a href="${SITE.phoneHref}" data-track="contact-phone">
            <span class="contact-routes__icon">${icon("phone")}</span>
            <span><strong>${SITE.phone}</strong>We answer the phone, no call queues</span>
            ${icon("arrow")}
          </a>
        </li>
        <li>
          <a href="mailto:${SITE.email}" data-track="contact-email">
            <span class="contact-routes__icon">${icon("mail")}</span>
            <span><strong>${SITE.email}</strong>${SITE.responseLine}</span>
            ${icon("arrow")}
          </a>
        </li>
      </ul>
    </div>

    <div class="form-card" id="enquiry">
      <h2 class="h4" id="form-title">Send us a message</h2>
      <p class="muted mt-3">Tell us what you need. ${SITE.responseLine}, and your details stay with us.</p>

      <form class="form mt-6" action="/api/submit.php" method="post" data-validate${formMode()} data-success="contact-success" aria-labelledby="form-title">
        <input type="hidden" name="form_name" value="contact">
        <input class="visually-hidden" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="form-alert form-alert--error" data-error-summary tabindex="-1" role="alert" hidden>
          <p><strong>There is a problem</strong></p>
          <ul></ul>
        </div>
        <div class="form__row">
          ${field({ id: "name", label: "Name", autocomplete: "name", msg: "Enter your name", dataName: "name" })}
          ${field({ id: "company", label: "Company", autocomplete: "organization", required: false })}
        </div>
        <div class="form__row">
          ${field({ id: "email", label: "Email", type: "email", autocomplete: "email", msg: "Enter your email address" })}
          ${field({ id: "phone", label: "Phone", type: "tel", autocomplete: "tel", required: false, attrs: ' pattern="[0-9 +\\(\\)\\-]{7,20}"' })}
        </div>
        <div class="field">
          <label class="field__label" for="message">How can we help?</label>
          <textarea class="field__input" id="message" name="message" rows="5" required minlength="10" data-msg-required="Tell us briefly what you need help with" aria-describedby="message-error"></textarea>
          <p class="field__error" id="message-error"></p>
        </div>
        ${captchaRow("dark")}
        <div class="form__actions">
          <button class="btn btn--primary btn--lg" type="submit" data-track="contact-form-submit"><span>Send message</span>${icon("arrow", "btn__arrow")}</button>
          <p class="small muted">By submitting, you agree to our <a href="@/privacy-policy.html">privacy policy</a>.</p>
        </div>
      </form>

      <div class="form-success" id="contact-success" tabindex="-1" hidden>
        <span class="form-success__icon">${icon("checkCircle")}</span>
        <h3>Got it, thank you.</h3>
        <p>Your message is with the team. We'll respond the same working day. Need it sorted sooner?</p>
        ${btn(`Call ${SITE.phone}`, SITE.phoneHref, { iconName: "phone", arrow: false, track: "contact-success-phone" })}
      </div>
      ${WP_EXPORT ? "" : `<p class="form-note">${icon("alert")}Demo form. [Connect to the WhizzIT endpoint and reCAPTCHA keys before launch.]</p>`}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="offices-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Talk to the team</p>
        <h2 class="grad-head" id="offices-title">One friendly team, two offices</h2>
        <p>Most issues are resolved remotely. When something needs hands on hardware, we are nearby.</p>
      </div>
      ${btn("See all locations", "locations.html", { variant: "secondary", arrow: false, track: "contact-locations" })}
    </div>
    ${/* Each office sits on its own Google map, pinned where the office is. The
         map is scenery: the address is in the card, "Get directions" opens Google
         Maps, and the frame takes no focus or pointer so it never traps a scroll. */""}
    <div class="office-grid">
      ${SITE.offices.map((o) => officeMapCard(o)).join("")}
    </div>
  </div>
</section>

<section class="section section--mist" aria-labelledby="contact-trust-title">
  <div class="container contact-trust">
    <div>
      <p class="eyebrow">Before you call</p>
      <h2 class="grad-head" id="contact-trust-title">What happens next</h2>
      <ol class="next-steps" role="list">
        <li><strong>You get a person</strong>Someone who knows the systems picks up, not a queue.</li>
        <li><strong>We ask what is actually happening</strong>Five minutes of questions saves an hour of guessing.</li>
        <li><strong>You get an honest answer</strong>Including when the answer is that you do not need us.</li>
      </ol>
      <ul class="cred-inline" role="list">
        ${CREDENTIALS.map((c) => `<li><img src="@/assets/images/partners/${c.file}" alt="${c.title}" decoding="async"><span>${c.title}</span></li>`).join("")}
      </ul>
    </div>
    <figure class="quote-feature">
      <span class="quote-feature__mark" aria-hidden="true">${icon("quote")}</span>
      <blockquote><p>“${TESTIMONIALS[2].quote}”</p></blockquote>
      <figcaption>
        ${reviewAvatar(TESTIMONIALS[2], { badge: true })}
        <span><strong>${TESTIMONIALS[2].name}</strong>${TESTIMONIALS[2].role}</span>
        <a href="${SITE.google.reviewsUrl}" rel="noopener">See all ${SITE.google.count} reviews${icon("arrow")}</a>
      </figcaption>
    </figure>
  </div>
</section>
`;

page({
  file: "contact.html",
  title: "Contact WhizzIT | Talk to Our IT Support Team",
  description: `Contact WhizzIT: call ${SITE.phone}, email ${SITE.email} or send a message. Offices in London and Stevenage, same working day response.`,
  bodyClass: "page--contact page--sky",
  crumbs,
  main,
});
