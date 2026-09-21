import {useEffect, useState} from 'react';
import {NavLink, useLocation} from 'react-router';
import LOGO_SRC from '~/assets/logo.png';

const FONT = "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Keep in sync with GAP_Y / GAP_X in Hero.jsx
const GAP_Y = '16px'; // top
const GAP_X = '0px'; // left and right

// Mobile menu look & motion
const PANEL_GAP = 'clamp(8px, 2vw, 16px)'; // space left on all four edges
const PANEL_RADIUS = 16;
const DURATION = 600; // ms
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const NAV_PAD_X = 'clamp(20px, 4vw, 32px)';
const NAV_PAD_Y = 'clamp(16px, 3vw, 32px)';

// Adjust the routes to match your store
const LEFT_LINKS = [
  {label: 'Shop', to: '/collections'},
  {label: 'About', to: '/pages/about'},
];
const RIGHT_LINKS = [
  {label: 'Wishlist', to: '/pages/wishlist'},
  {label: 'Contact', to: '/pages/contact'},
];
const MOBILE_LINKS = [{label: 'Home', to: '/'}, ...LEFT_LINKS, ...RIGHT_LINKS];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close if the screen grows to the desktop nav
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Escape to close + lock page scroll while open
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Home: transparent, absolutely positioned over the hero card
  // (same offset as the Hero's outer padding), white text.
  // Other pages: normal flow, white background, dark text.
  const wrapperStyle = isHome
    ? {
        position: 'absolute',
        top: GAP_Y,
        left: GAP_X,
        right: GAP_X,
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
      {/* Mobile / tablet menu (sits under the nav row so the icon stays on top) */}
      <MobileMenu open={menuOpen} onClose={closeMenu} />

      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center"
        style={{
          position: 'relative',
          zIndex: 2,
          padding: `${NAV_PAD_Y} ${NAV_PAD_X}`,
          fontSize: 'clamp(12px, 1.3vw, 14px)',
          fontFamily: FONT,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
        }}
      >
        {/* Left: hamburger on mobile/tablet, links on desktop */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: 'none',
              border: 0,
              // 44px tap target; negative margin keeps the icon on the inset line
              padding: 10,
              margin: -10,
              color: menuOpen ? '#000' : 'inherit',
              lineHeight: 0,
              cursor: 'pointer',
              transition: `color ${DURATION / 2}ms ${EASE}`,
            }}
          >
            <MenuIcon open={menuOpen} />
          </button>

          <ul
            className="hidden items-center gap-5 md:flex lg:gap-8"
            style={{listStyle: 'none', margin: 0, padding: 0}}
          >
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
          onClick={closeMenu}
          style={{display: 'block', lineHeight: 0}}
        >
          <img
            src={LOGO_SRC}
            alt={shop?.name || 'Home'}
            style={{
              display: 'block',
              height: 'clamp(28px, 3vw, 40px)',
              width: 'auto',
              borderRadius: 0,
              // turns the logo black while the white menu panel is open
              filter: menuOpen ? 'brightness(0)' : 'none',
              transition: `filter ${DURATION / 2}ms ${EASE}`,
              // If your logo is dark and should be white on the hero, use:
              // filter: menuOpen ? 'none' : isHome ? 'brightness(0) invert(1)' : 'none',
            }}
          />
        </NavLink>

        {/* Right: links on desktop */}
        <ul
          className="hidden items-center justify-end gap-5 md:flex lg:gap-8"
          style={{listStyle: 'none', margin: 0, padding: 0}}
        >
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
 * Full-screen menu that reveals from top to bottom, with space left on
 * all four edges. Always mounted so the open/close can animate.
 */
function MobileMenu({open, onClose}) {
  return (
    <>
      {/* Dim backdrop: tap the edge to close */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'rgba(0,0,0,0.35)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity ${DURATION}ms ${EASE}`,
        }}
      />

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        style={{
          position: 'fixed',
          inset: PANEL_GAP,
          zIndex: 1,
          overflowY: 'auto',
          background: '#fff',
          color: '#000',
          fontFamily: FONT,
          // Top-to-bottom reveal (rounded corners animate with it)
          clipPath: open
            ? `inset(0 0 0 0 round ${PANEL_RADIUS}px)`
            : `inset(0 0 100% 0 round ${PANEL_RADIUS}px)`,
          visibility: open ? 'visible' : 'hidden',
          transition: `clip-path ${DURATION}ms ${EASE}, visibility 0s linear ${
            open ? '0ms' : `${DURATION}ms`
          }`,
        }}
      >
        <nav
          role="navigation"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            // clears the nav row (icon + logo) and lines links up with the icon
            padding: `calc(${NAV_PAD_Y} * 2 + 24px + ${GAP_Y} + 8px) calc(${NAV_PAD_X} - ${PANEL_GAP}) 32px`,
          }}
        >
          {MOBILE_LINKS.map((link, i) => (
            <NavLink
              key={link.label}
              to={link.to}
              end
              prefetch="intent"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              style={({isActive}) => ({
                color: '#000',
                fontSize: 'clamp(16px, 4.5vw, 20px)',
                fontWeight: 400,
                lineHeight: 1.1,
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                textDecoration: isActive ? 'underline' : 'none',
                textUnderlineOffset: 6,
                // Links fade up one after another
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(14px)',
                transition: `opacity 450ms ${EASE}, transform 450ms ${EASE}`,
                transitionDelay: open ? `${250 + i * 60}ms` : '0ms',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

/** Three lines that morph into a cross */
function MenuIcon({open}) {
  const base = {
    transition: `transform ${DURATION}ms ${EASE}, opacity ${DURATION / 2}ms ${EASE}`,
  };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          ...base,
          transformOrigin: '12px 6px',
          transform: open ? 'translateY(6px) rotate(45deg)' : 'none',
        }}
      />
      <path
        d="M3 12h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          ...base,
          transformOrigin: '12px 12px',
          transform: open ? 'scaleX(0)' : 'none',
          opacity: open ? 0 : 1,
        }}
      />
      <path
        d="M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          ...base,
          transformOrigin: '12px 18px',
          transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none',
        }}
      />
    </svg>
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

/**
 * Kept only so PageLayout's existing import keeps working.
 * The mobile menu now lives inside <Header />.
 */
export function HeaderMenu() {
  return null;
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