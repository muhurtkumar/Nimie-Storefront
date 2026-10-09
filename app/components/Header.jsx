import {useEffect, useState} from 'react';
import {ShoppingBag, User} from 'lucide-react';
import {NavLink, useLocation} from 'react-router';

import LOGO_SRC from '~/assets/logo.png';

import {Cart} from '~/components/Cart';

const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Keep in sync with GAP_Y / GAP_X in Hero.jsx
const GAP_Y = '16px'; // top
const GAP_X = '0px'; // left and right

const HEADER_RADIUS = 14;

const HEADER_MARGIN = 'clamp(8px, 2vw, 16px)';

// Mobile menu look & motion
const PANEL_GAP = 'clamp(8px, 2vw, 16px)'; // space left on all four edges
const PANEL_RADIUS = 16;
const DURATION = 600; // ms
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const NAV_PAD_X = 'clamp(32px, 3vw, 52px)';
const HOME_NAV_PAD_X = 'clamp(16px, 2.5vw, 32px)';
const NAV_PAD_Y = 'clamp(10px, 2vw, 20px)';

// Adjust the routes to match your store
const LEFT_LINKS = [
  {label: 'Shop', to: '/collections/all'},
  {label: 'Our Story', to: '/our-story'},
];

const RIGHT_LINKS = [
  {label: 'Wishlist', to: '/wishlist'},
  {label: 'Cart', to: '/cart'},
  {label: 'Contact', to: '/contact'},
];

// Mobile menu: main links
const MOBILE_PRIMARY_LINKS = [
  {label: 'Home', to: '/'},
  {label: 'Shop', to: '/collections/all'},
  {label: 'Our Story', to: '/our-story'},
  {label: 'Wishlist', to: '/wishlist'},
  {label: 'Contact Us', to: '/contact'},
];

// Mobile menu: support + policy links from the footer
const MOBILE_SECONDARY_LINKS = [
  {label: 'My Account', to: '/account'},
  {label: 'Delivery & Returns', to: '/delivery-returns'},
  {label: 'Track your order', to: '/track-order'},
  {label: 'FAQs', to: '#faqs'},
  {label: 'Terms & Conditions', to: '/policies/terms-of-service'},
  {label: 'Privacy Policy', to: '/policies/privacy-policy'},
];

// Inline styles on purpose: global `a { color }` rules in app.css would
// otherwise turn these links black and beat Tailwind utility classes.
const linkStyle = ({isActive}) => ({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
});

/**
 * @param {HeaderProps}
 */
export function Header({header, cart, isLoggedIn, wishlistCount = 0}) {
  const {shop} = header;
  const {pathname} = useLocation();
  const cartCount = cart?.totalQuantity ?? 0;

  const isHome = pathname === '/contact' || pathname === '/';

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const closeCart = () => setCartOpen(false);

  const openCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen(false);
    setCartOpen(true);
  };

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

  // Home: switch from transparent to solid green once the page scrolls,
  // so the white text stays readable over page content.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Home: transparent at the top, fixed over the hero card (same offset as
  // the Hero's outer padding), turns solid green after scrolling. White text.
  // Other pages: sticky, solid green, white text.
  const wrapperStyle = isHome
    ? {
        position: 'fixed',
        top: GAP_Y,
        zIndex: 30,
        background: scrolled ? '#345225' : 'transparent',
        transition: 'background 300ms ease',
        color: '#fff',
        borderRadius: HEADER_RADIUS,
      }
    : {
        position: 'sticky',
        top: HEADER_MARGIN,
        zIndex: 30,
        marginTop: HEADER_MARGIN,
        marginLeft: HEADER_MARGIN,
        marginRight: HEADER_MARGIN,
        background: '#345225',
        color: '#fff',
        borderRadius: HEADER_RADIUS,
        border: 'none',
      };

  return (
    <>
      <header
        className={isHome ? 'left-0 right-0 md:left-4 md:right-4' : undefined}
        style={wrapperStyle}
      >
        {/* Mobile / tablet menu (sits under the nav row so the icon stays on top) */}
        <MobileMenu
          open={menuOpen}
          onClose={closeMenu}
          wishlistCount={wishlistCount}
        />

        <div
          className="grid grid-cols-[1fr_auto] items-center md:grid-cols-[1fr_auto_1fr]"
          style={{
            position: 'relative',
            zIndex: 2,
            padding: `${NAV_PAD_Y} ${
              isHome ? HOME_NAV_PAD_X : NAV_PAD_X
            }`,
            fontSize: 'clamp(12px, 1.3vw, 14px)',
            fontFamily: FONT,
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
          }}
        >
          {/* Left: links on desktop only */}
          <div className="hidden items-center md:flex">
            <ul
              className="hidden items-center gap-5 md:flex lg:gap-8"
              style={{listStyle: 'none', margin: 0, padding: 0}}
            >
              {LEFT_LINKS.map((link) => (
                <li key={link.label} style={{margin: 0}}>
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
            className="justify-start md:justify-center"
            style={{
              display: 'flex',
              alignItems: 'center',
              lineHeight: 0,
            }}
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
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {RIGHT_LINKS.map((link) => (
              <li key={link.label} style={{margin: 0}}>
                {link.label === 'Cart' ? (
                  <button
                    type="button"
                    onClick={openCart}
                    className="cursor-pointer transition-opacity hover:opacity-70"
                    style={{
                      color: 'inherit',
                      background: 'none',
                      border: 0,
                      padding: 0,
                      font: 'inherit',
                      textTransform: 'inherit',
                      letterSpacing: 'inherit',
                    }}
                  >
                    Cart ({cartCount})
                  </button>
                ) : (
                  <HeaderLink
                    label={
                      link.label === 'Contact' && isLoggedIn
                        ? 'Account'
                        : link.label === 'Wishlist'
                          ? `Wishlist (${wishlistCount})`
                          : link.label
                    }
                    to={
                      link.label === 'Contact' && isLoggedIn
                        ? '/account'
                        : link.to
                    }
                  />
                )}
              </li>
            ))}
          </ul>

          {/* Pill: user (if logged in) | menu | cart. Small and medium screens only */}
          <div
            className="flex items-center divide-x divide-black/10 md:hidden"
            style={{
              justifySelf: 'end',
              background: '#fff',
              color: '#000',
              borderRadius: 12,
              overflow: 'visible',
            }}
          >
            {isLoggedIn ? (
              <NavLink
                to="/account"
                prefetch="intent"
                aria-label="Account"
                onClick={closeMenu}
                style={{
                  display: 'block',
                  padding: 8,
                  color: 'inherit',
                  lineHeight: 0,
                }}
              >
                <User size={24} strokeWidth={2} />
              </NavLink>
            ) : null}

            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                background: 'none',
                border: 0,
                padding: 8,
                color: 'inherit',
                lineHeight: 0,
                cursor: 'pointer',
              }}
            >
              <MenuIcon open={menuOpen} />
            </button>

            <button
              type="button"
              aria-label="Open cart"
              onClick={openCart}
              style={{
                position: 'relative',
                background: 'none',
                border: 0,
                padding: 8,
                color: 'inherit',
                lineHeight: 0,
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={24} strokeWidth={2} />

              {cartCount > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ff5c63',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1,
                    zIndex: 10,
                  }}
                >
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <Cart open={cartOpen} onClose={closeCart} />
    </>
  );
}

/**
 * Full-screen menu that reveals from top to bottom, with space left on
 * all four edges. Always mounted so the open/close can animate.
 * Contains every page that appears in the footer.
 */
function MobileMenu({open, onClose, wishlistCount = 0}) {
  const itemMotion = (i) => ({
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 450ms ${EASE}, transform 450ms ${EASE}`,
    transitionDelay: open ? `${250 + i * 60}ms` : '0ms',
  });

  // Adds the wishlist count to the Wishlist label
  const labelFor = (link) =>
    link.label === 'Wishlist'
      ? `Wishlist (${wishlistCount})`
      : link.label;

  // "#faqs" style links: close the menu first (which unlocks body scroll),
  // then scroll. Falls back to the home page anchor if not on that page.
  const handleHashClick = (e, hash) => {
    e.preventDefault();
    onClose();
    setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({behavior: 'smooth'});
      else window.location.href = `/${hash}`;
    }, DURATION / 2);
  };

  const renderLink = (link, i, small) => {
    const baseStyle = {
      color: '#000',
      fontSize: small
        ? 'clamp(13px, 3.6vw, 15px)' // secondary
        : 'clamp(16px, 5vw, 22px)', // primary: larger
      fontWeight: 400,
      lineHeight: 1.1,
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      ...itemMotion(i),
    };

    if (link.to.startsWith('#')) {
      return (
        <a
          key={link.label}
          href={link.to}
          tabIndex={open ? 0 : -1}
          onClick={(e) => handleHashClick(e, link.to)}
          style={{...baseStyle, textDecoration: 'none'}}
        >
          {labelFor(link)}
        </a>
      );
    }

    return (
      <NavLink
        key={link.label}
        to={link.to}
        end
        prefetch="intent"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        style={({isActive}) => ({
          ...baseStyle,
          textDecoration: isActive ? 'underline' : 'none',
          textUnderlineOffset: 6,
        })}
      >
        {labelFor(link)}
      </NavLink>
    );
  };

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
            padding: `calc(${NAV_PAD_Y} * 2 + 24px + ${GAP_Y} + 28px) calc(${NAV_PAD_X} - ${PANEL_GAP}) 32px`,
          }}
        >
          {MOBILE_PRIMARY_LINKS.map((link, i) => renderLink(link, i, false))}

          <div
            aria-hidden="true"
            style={{
              height: 1,
              background: 'rgba(0,0,0,0.12)',
              margin: '4px 0',
              ...itemMotion(MOBILE_PRIMARY_LINKS.length),
            }}
          />

          {MOBILE_SECONDARY_LINKS.map((link, i) =>
            renderLink(link, MOBILE_PRIMARY_LINKS.length + 1 + i, true),
          )}
        </nav>
      </div>
    </>
  );
}

/** Three lines that morph into a cross */
function MenuIcon({open}) {
  const base = {
    transition: `transform ${DURATION}ms ${EASE}, opacity ${
      DURATION / 2
    }ms ${EASE}`,
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
 * @property {number} [wishlistCount]
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */