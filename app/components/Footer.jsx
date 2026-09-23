import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import footerBg from '~/assets/layout/footer-bg.png';
import nimiLogo from '~/assets/layout/nimi-logo-white.png';

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/**
 * FOOTER (site-wide — rendered once by PageLayout, on every route)
 * ------
 * One full-bleed background photo. Layered on top of it:
 * 1. Info card — floats near the top of the photo. STORE / SUPPORT are
 *    static links (below). Terms & Conditions is populated live from the
 *    Shopify footer menu (Suspense + Await).
 * 2. Logo mark — centered in the remaining space below the card.
 *
 * Layout notes
 * - The OVERLAY owns the height (min-height); the visual band just wraps it,
 *   and the photo is absolutely positioned behind. This way the logo area
 *   really can grow/shrink with the height (percentage heights on a parent
 *   that only has min-height don't resolve).
 * - Mobile:  2-column card (STORE | SUPPORT), Terms & Conditions full width
 *            underneath, compact logo with breathing room.
 * - 640px+:  3-column card.
 * - 1024px+: card goes near full-width, taller photo, bigger logo + space.
 */
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
  background: #2b2b2b; /* shown while the photo loads */
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
/* 3rd column (Terms & Conditions) drops to its own full-width row on mobile */
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
  .ftr__info > :nth-child(3) { grid-column: auto; }
  .ftr__logo-wrap { padding: 56px 0 32px; }
  .ftr__logo { width: clamp(150px, 22vw, 210px); }
}

/* ---------- desktop / large screens ---------- */
@media (min-width: 1024px) {
  .ftr__overlay {
    /* taller photo: scales with viewport width, capped on ultra-wide */
    min-height: clamp(600px, 40vw, 780px);
    padding: clamp(24px, 2.5vw, 48px);
  }
  .ftr__info {
    /* near full-width card (was capped at 1100px) */
    max-width: 1760px;
    padding: clamp(36px, 3.2vw, 60px) clamp(48px, 5vw, 96px);
    column-gap: clamp(48px, 6vw, 140px);
  }
  .ftr__col-title { font-size: 14px; margin-bottom: 18px; }
  .ftr__col-list { row-gap: 14px; }
  .ftr__link { font-size: 15px; }

  /* generous space above and below the logo so it can breathe */
  .padding: clamp(40px, 4.5vw, 90px) 0 clamp(32px, 3.5vw, 70px);
  .ftr__logo { width: clamp(180px, 15vw, 290px); }
}
`;

// Static columns — Shopify has no menu for these, so they're hardcoded.
// Adjust the hrefs to match your real routes.
const STORE_LINKS = [
  {label: 'Shop', href: '/shop'},
  {label: 'About', href: '/about'},
  {label: 'FAQs', href: '/faqs'},
  {label: 'Contact Us', href: '/contact'},
];
const SUPPORT_LINKS = [
  {label: 'My Account', href: '/account'},
  {label: 'Delivery & Returns', href: '/delivery-returns'},
  {label: 'Track your order', href: '/track-order'},
];

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * Props (unchanged from the skeleton Footer — PageLayout keeps working
 * exactly as it already does, no changes needed there):
 * - footer               Promise<FooterQuery|null>
 * - header               HeaderQuery
 * - publicStoreDomain    string
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <footer className="ftr">
      <style>{css}</style>

      <div className="ftr__visual">
        <img className="ftr__bg" src={footerBg} alt="" aria-hidden="true" />

        <div className="ftr__overlay">
          <div className="ftr__info">
            <FooterColumn title="STORE" links={STORE_LINKS} />
            <FooterColumn title="SUPPORT" links={SUPPORT_LINKS} />

            {/* Live Shopify policy menu, same data-fetching as before */}
            <Suspense
              fallback={
                <FooterMenuColumn
                  menu={FALLBACK_FOOTER_MENU}
                  primaryDomainUrl={header?.shop?.primaryDomain?.url}
                  publicStoreDomain={publicStoreDomain}
                />
              }
            >
              <Await resolve={footerPromise}>
                {(footer) => (
                  <FooterMenuColumn
                    menu={footer?.menu || FALLBACK_FOOTER_MENU}
                    primaryDomainUrl={header?.shop?.primaryDomain?.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                )}
              </Await>
            </Suspense>
          </div>

          <div className="ftr__logo-wrap">
            <img className="ftr__logo" src={nimiLogo} alt="Nimi" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Static column: title + plain <a> links */
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

/** Dynamic column: title + Shopify menu items (internal NavLink / external <a>) */
function FooterMenuColumn({menu, primaryDomainUrl, publicStoreDomain}) {
  const items = (menu || FALLBACK_FOOTER_MENU).items;
  return (
    <div>
      <p className="ftr__col-title">Terms & Conditions</p>
      <ul className="ftr__col-list">
        {items.map((item) => {
          if (!item.url) return null;
          // if the url is internal, strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            (publicStoreDomain && item.url.includes(publicStoreDomain)) ||
            (primaryDomainUrl && item.url.includes(primaryDomainUrl))
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');

          return (
            <li key={item.id}>
              {isExternal ? (
                <a
                  className="ftr__link"
                  href={url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.title}
                </a>
              ) : (
                <NavLink
                  end
                  to={url}
                  prefetch="intent"
                  className={({isActive}) =>
                    'ftr__link' + (isActive ? ' ftr__link--active' : '')
                  }
                >
                  {item.title}
                </NavLink>
              )}
            </li>
          );
        })}
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