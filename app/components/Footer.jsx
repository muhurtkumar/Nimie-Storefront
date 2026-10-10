import footerBg from '~/assets/layout/footer-bg.mp4';
import nimiLogo from '~/assets/layout/nimi-logo-white.png';

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
.ftr {
  width: 100%;
  font-family: ${FONT};
}
.ftr *, .ftr *::before, .ftr *::after { box-sizing: border-box; }

/* ---------- visual band: ONE background image behind everything ---------- */
.ftr__visual {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #2b2b2b;
}
.ftr__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 55% center;
  display: block;
}

/* dark scrim so the white logo stands out */
.ftr__visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.45) 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}

/* everything below sits ON TOP of the image and defines the band's height */
.ftr__overlay {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 560px;
  padding: 16px;
}

/* ---------- info card: floats near the top of the photo ---------- */
.ftr__info {
  width: 100%;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  padding: 24px 20px 28px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
  row-gap: 28px;
}

.ftr__info > :nth-child(3) {
  grid-column: 1 / -1;
}

.ftr__col-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #111;
}

.ftr__col-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}

.ftr__link {
  font-size: 14px;
  line-height: 1.3;
  color: #444;
  text-decoration: none;
}

.ftr__link:hover {
  color: #A83B96;
  text-decoration: underline;
}

.ftr__link--active {
  color: #A83B96;
  font-weight: 700;
}

/* ---------- logo: centered in the remaining space below the card ---------- */
.ftr__logo-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0 24px;
}

.ftr__logo {
  width: clamp(120px, 34vw, 170px);
  height: auto;
  display: block;
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.45));
}

/* ---------- tablet: 3 columns ---------- */
@media (min-width: 600px) {
  .ftr__overlay {
    min-height: 620px;
    padding: 24px;
  }

  .ftr__info {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: clamp(24px, 4vw, 64px);
    row-gap: 0;
    padding: 32px clamp(28px, 4vw, 56px);
  }

  .ftr__info > :nth-child(3) {
    grid-column: auto;
  }

  .ftr__logo-wrap {
    padding: 56px 0 32px;
  }

  .ftr__logo {
    width: clamp(150px, 22vw, 210px);
  }
}

/* ---------- desktop / large screens ---------- */
@media (min-width: 1024px) {
  .ftr__overlay {
    min-height: clamp(600px, 40vw, 780px);
    padding: clamp(24px, 2.5vw, 48px);
  }

  .ftr__info {
    max-width: 1760px;
    padding: clamp(36px, 3.2vw, 60px) clamp(48px, 5vw, 96px);
    column-gap: clamp(48px, 6vw, 140px);
  }

  .ftr__col-title {
    font-size: 14px;
    margin-bottom: 18px;
  }

  .ftr__col-list {
    row-gap: 14px;
  }

  .ftr__link {
    font-size: 15px;
  }

  .ftr__logo-wrap {
    padding: clamp(40px, 4.5vw, 90px) 0 clamp(32px, 3.5vw, 70px);
  }

  .ftr__logo {
    width: clamp(180px, 15vw, 290px);
  }
}
`;

const STORE_LINKS = [
  {label: 'Shop', href: '/collections/all'},
  {label: 'Our Story', href: '/our-story'},
  {label: 'FAQs', href: '/faqs'},
  {label: 'Contact Us', href: '/contact'},
];

const SUPPORT_LINKS = [
  {label: 'My Account', href: '/account'},
  {label: 'Shipping & Delivery', href: '/policies/shipping-policy'},
  {label: 'Return & Exchange', href: '/policies/refund-policy'},
  {label: 'Track your order', href: '/account/orders'},
];

const POLICY_LINKS = [
  {
    label: 'Privacy Policy',
    href: '/policies/privacy-policy',
  },
  {
    label: 'Terms & Conditions',
    href: '/policies/terms-of-service',
  },
];

export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <footer className="ftr">
      <style>{css}</style>

      <div className="ftr__visual">
        <video
          className="ftr__bg"
          src={footerBg}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />

        <div className="ftr__overlay">
          <div className="ftr__info">
            <FooterColumn title="STORE" links={STORE_LINKS} />

            <FooterColumn title="SUPPORT" links={SUPPORT_LINKS} />

            <FooterColumn title="POLICY" links={POLICY_LINKS} />
          </div>

          <div className="ftr__logo-wrap">
            <img className="ftr__logo" src={nimiLogo} alt="Nimi" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({title, links}) {
  return (
    <div>
      <p className="ftr__col-title">{title}</p>

      <ul className="ftr__col-list">
        {links.map((link) => (
          <li key={link.label}>
            <a className="ftr__link" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */