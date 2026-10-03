import {Form, NavLink} from 'react-router';
import {
  UserRound,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export function AccountSidebar({customer}) {
  const firstName = customer?.firstName || '';
  const lastName = customer?.lastName || '';

  const customerName =
    `${firstName} ${lastName}`.trim() || 'Customer';

  const customerInitial = (
    firstName?.charAt(0) ||
    lastName?.charAt(0) ||
    'M'
  ).toUpperCase();

  const customerEmail =
    customer?.emailAddress?.emailAddress || '—';

  return (
    <>
      {/* =========================
          SIDEBAR
      ========================== */}
      <div className="sticky top-4 hidden min-h-[calc(100vh-2rem)] w-[220px] shrink-0 rounded-[20px] border border-[#ebe7e1] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:my-4 md:flex md:flex-col lg:w-[300px]">
        {/* Customer Information */}
        <div className="px-8 pb-8 pt-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#eeeae5] font-serif text-[28px] text-[#55504a]">
              {customerInitial}
            </div>

            {/* Name + Email */}
            <div className="min-w-0">
              <p className="truncate text-[16px] font-medium text-[#111111]">
                Hello, {firstName || 'Customer'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <AccountMenu />

        {/* Logout */}
        <div className="mt-auto px-8 pb-10 cursor-pointer">
          <Logout />
        </div>
      </div>

      {/* =========================
          MOBILE SIDEBAR / TOP NAV
      ========================== */}
      <div className="block mt-4 rounded-[14px] bg-white md:hidden" style={{marginLeft: 'clamp(8px, 2vw, 16px)', marginRight: 'clamp(8px, 2vw, 16px)'}}>
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eeeae5] font-serif text-[21px] text-[#55504a]">
              {customerInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">
                Hello, {firstName || 'Customer'}
              </p>
            </div>
          </div>

          <Form method="POST" action="/account/logout">
            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] text-[#55504a] transition-opacity hover:opacity-60"
            >
              <LogOut size={17} strokeWidth={1.6} />
              <span className="cursor-pointer">Log Out</span>
            </button>
          </Form>
        </div>

        <div className="px-5 pb-4">
          <AccountMenu mobile />
        </div>
      </div>
    </>
  );
}

function AccountMenu({mobile = false}) {
  const navigationItems = [
    {
      to: '/account/profile',
      label: 'Profile',
      icon: UserRound,
    },
    {
      to: '/account/orders',
      label: 'My Orders',
      icon: Package,
    },
    {
      to: '/account/addresses',
      label: 'Addresses',
      icon: MapPin,
    },
    {
      to: '/account/wishlist',
      label: 'Wishlist',
      icon: Heart,
    },
  ];

  if (mobile) {
    return (
      <nav role="navigation" aria-label="Account navigation" className="flex w-full flex-nowrap items-center justify-between gap-1 max-[547px]:gap-0">
        {navigationItems.map(({to, label, icon: Icon}) => (
          <NavLink
            key={to}
            to={to}
            className={({isActive}) =>
              `flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] whitespace-nowrap transition-all max-[547px]:gap-0 max-[547px]:px-3 max-[547px]:py-2 max-[547px]:text-[11px] ${
                isActive
                  ? 'bg-[#ebe7e2] text-[#111111]'
                  : 'text-[#55504a] hover:bg-[#f0ede9]'
              }`
            }
          >
            <Icon
              size={16}
              strokeWidth={1.6}
              className="max-[547px]:hidden"
            />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav role="navigation" aria-label="Account navigation" className="px-5">
      <div className="space-y-1">
        {navigationItems.map(({to, label, icon: Icon}) => (
          <NavLink
            key={to}
            to={to}
            className={({isActive}) =>
              `group flex w-full items-center gap-4 rounded-[8px] px-4 py-3 text-[15px] transition-all ${
                isActive
                  ? 'bg-[#eeeae5] text-[#111111]'
                  : 'text-[#2d2a27] hover:bg-[#f1eeea]'
              }`
            }
          >
            {({isActive}) => (
              <>
                <Icon
                  size={21}
                  strokeWidth={1.5}
                  className={
                    isActive
                      ? 'text-[#111111]'
                      : 'text-[#2d2a27]'
                  }
                />

                <span className="flex-1">{label}</span>

                <ChevronRight
                  size={16}
                  strokeWidth={1.5}
                  className={`transition-opacity ${
                    isActive
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-40'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout">
      <button
        type="submit"
        className="group flex w-full items-center gap-4 rounded-[8px] px-4 py-3 text-left text-[15px] text-[#2d2a27] transition-colors hover:bg-[#f1eeea]"
      >
        <LogOut
          size={21}
          strokeWidth={1.5}
          className="text-[#2d2a27] cursor-pointer"
        />

        <span className="flex-1 cursor-pointer">Log Out</span>

        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="opacity-0 transition-opacity group-hover:opacity-40"
        />
      </button>
    </Form>
  );
}