import {NavLink, useLocation} from 'react-router';
import {useAside} from '~/components/Aside';
import logo from '~/assets/logo.png';

// Put your logo file in app/assets/ (or public/) and point to it here.
// Option A (bundled):  import logo from '~/assets/logo.png';  then use `logo`
// Option B (public/):  '/logo.png'
const LOGO_SRC = '/logo.png';
const FONT = "'Roboto', sans-serif";
// Keep in sync with GAP in Hero.jsx
const GAP = 'clamp(8px, 1vw, 16px)';

// Adjust the routes to match your store
const LEFT_LINKS = [
  {label: 'Shop', to: '/collections'},
  {label: 'About', to: '/pages/about'},
];
const RIGHT_LINKS = [
  {label: 'Wishlist', to: '/pages/wishlist'},
  {label: 'Contact', to: '/pages/contact'},
];

// Inline styles on purpose: global `a { color }` rules in app.css would
// otherwise turn these links black and beat Tailwind utility classes.
const linkStyle = ({isActive}) => ({
  color: 'inherit',
  textDecoration: isActive ? 'underline' : 'none',
  textUnderlineOffset: 4,
});

/**
 * @param {HeaderProps}
 */
export function Header({header}) {
  const {shop} = header;
  const {pathname} = useLocation();
  const isHome = pathname === '/';

  // Home: transparent, absolutely positioned over the hero card
  // (same offset as the Hero's outer padding), white text.
  // Other pages: normal flow, white background, dark text.
  const wrapperStyle = isHome
    ? {
        position: 'absolute',
        top: GAP,
        left: GAP,
        right: GAP,
        zIndex: 30,
        background: 'transparent',
        color: '#fff',
      }
    : {
        position: 'relative',
        zIndex: 30,
        background: '#fff',
        color: '#000',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
      };

  return (
    <header style={wrapperStyle}>
      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-6 text-xs sm:px-8 sm:py-8 sm:text-sm"
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
        }}
      >
        {/* Left: hamburger on mobile, links on desktop */}
        <div className="flex items-center">
          <HeaderMenuMobileToggle />
          <ul className="hidden items-center gap-8 md:flex" style={{listStyle: 'none', margin: 0, padding: 0}}>
            {LEFT_LINKS.map((link) => (
              <li key={link.label}>
                <HeaderLink {...link} />
              </li>
            ))}
          </ul>
        </div>

        {/* Center: logo */}
        <NavLink
          prefetch="intent"
          to="/"
          end
          aria-label={shop?.name}
          style={{display: 'block', lineHeight: 0}}
        >
          <img
            src={logo}
            alt={shop?.name || 'Home'}
            style={{
              display: 'block',
              height: 'clamp(28px, 3vw, 40px)',
              width: 'auto',
              borderRadius: 0,
              // If your logo is dark and should be white on the hero, uncomment:
              // filter: isHome ? 'brightness(0) invert(1)' : 'none',
            }}
          />
        </NavLink>

        {/* Right: links on desktop */}
        <ul className="hidden items-center justify-end gap-8 md:flex" style={{listStyle: 'none', margin: 0, padding: 0}}>
          {RIGHT_LINKS.map((link) => (
            <li key={link.label}>
              <HeaderLink {...link} />
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/**
 * Used by the mobile aside in PageLayout (viewport="mobile").
 * @param {{
 *   menu?: HeaderProps['header']['menu'];
 *   primaryDomainUrl?: string;
 *   viewport: Viewport;
 *   publicStoreDomain?: string;
 * }}
 */
export function HeaderMenu({viewport}) {
  const {close} = useAside();
  const links = [{label: 'Home', to: '/'}, ...LEFT_LINKS, ...RIGHT_LINKS];

  if (viewport === 'desktop') return null; // desktop links live in <Header />

  return (
    <nav
      role="navigation"
      className="flex flex-col gap-5 p-6"
      style={{color: '#000', fontFamily: FONT}}
    >
      {links.map((link) => (
        <NavLink
          key={link.label}
          to={link.to}
          end
          prefetch="intent"
          onClick={close}
          style={({isActive}) => ({
            color: '#000',
            fontSize: 16,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            textDecoration: isActive ? 'underline' : 'none',
            textUnderlineOffset: 4,
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderLink({label, to}) {
  return (
    <NavLink
      to={to}
      prefetch="intent"
      className="transition-opacity hover:opacity-70"
      style={linkStyle}
    >
      {label}
    </NavLink>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      aria-label="Open menu"
      className="md:hidden"
      style={{
        background: 'none',
        border: 0,
        padding: 0,
        color: 'inherit',
        fontSize: 24,
        lineHeight: 1,
        cursor: 'pointer',
      }}
      onClick={() => open('mobile')}
    >
      ☰
    </button>
  );
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */