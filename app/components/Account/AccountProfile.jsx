import {useEffect, useState} from 'react';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Profile'}];
};

export default function AccountProfile() {
  const account = useOutletContext();
  const navigation = useNavigation();

  /** @type {ActionReturnData} */
  const action = useActionData();

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!action?.success) {
      setShowSuccess(false);
      return;
    }

    setShowSuccess(true);

    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [action]);

  const customer = {
    ...(account?.customer || {}),
    ...(action?.customer || {}),
  };

  const firstName = customer?.firstName || '';
  const lastName = customer?.lastName || '';

  const email = customer?.emailAddress?.emailAddress || '—';
  const phone = customer?.phoneNumber?.phoneNumber || '—';

  const isSubmitting = navigation.state === 'submitting' && navigation.formMethod?.toLowerCase() === 'put';

  return (
    <div className="account-profile flex h-full w-full flex-col">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-4">
        <h1 className="mt-0 font-serif text-[38px] leading-none tracking-[-0.02em] text-[#111111] sm:text-[42px]">
          My Account
        </h1>

        <p
          className="text-[15px] text-[#66615b] sm:text-[16px]"
          style={{marginTop: '8px'}}
        >
          Manage your profile, orders, addresses and more.
        </p>
      </div>

      {/* =========================
          PROFILE CARD
      ========================== */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-[20px] border border-[#e7e2dc] bg-white">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5 sm:px-7 sm:pb-4 sm:pt-6">
          <div>
            <h2
              className="font-serif text-[22px] leading-tight text-[#111111] sm:text-[24px]"
              style={{marginBottom: '3px'}}
            >
              Profile Information
            </h2>

            <p
              className="text-[13px] text-[#706b65] sm:text-[14px]"
              style={{marginTop: '0px'}}
            >
              Keep your personal information up to date.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <Form
          id="profile-form"
          method="PUT"
          className="w-full px-6 pb-6 sm:px-7 sm:pb-7"
          style={{maxWidth: 'none'}}
        >
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* =========================
                FORM FIELDS
            ========================== */}
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-[12px] font-medium text-[#111111]"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First Name"
                    aria-label="First Name"
                    defaultValue={firstName}
                    minLength={2}
                    className="h-[38px] w-full rounded-[7px] border border-[#ddd8d2] bg-white px-3 text-[13px] text-[#111111] outline-none transition-colors placeholder:text-[#aaa49e] focus:border-[#111111]"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-[12px] font-medium text-[#111111]"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last Name"
                    aria-label="Last Name"
                    defaultValue={lastName}
                    minLength={2}
                    className="h-[38px] w-full rounded-[7px] border border-[#ddd8d2] bg-white px-3 text-[13px] text-[#111111] outline-none transition-colors placeholder:text-[#aaa49e] focus:border-[#111111]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[12px] font-medium text-[#111111]"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    readOnly
                    aria-label="Email Address"
                    className="h-[38px] w-full cursor-default rounded-[7px] border border-[#e5e1dc] bg-[#f7f5f2] px-3 text-[13px] text-[#99938c] outline-none"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-[12px] font-medium text-[#111111]"
                  >
                    Mobile Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    readOnly
                    aria-label="Mobile Number"
                    className="h-[38px] w-full cursor-default rounded-[7px] border border-[#ddd8d2] bg-white px-3 text-[13px] text-[#55504a] outline-none"
                  />
                </div>
              </div>

              {/* Medium + Large Screen Save Button */}
              <button
                type="submit"
                form="profile-form"
                disabled={isSubmitting}
                className={`mt-6 hidden rounded-[8px] px-5 py-2.5 text-[12px] cursor-pointer font-medium text-white transition-colors min-[635px]:block ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-[#555555]'
                    : 'bg-[#111111] hover:opacity-85'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>

              {/* Mobile Save Button */}
              <button
                type="submit"
                form="profile-form"
                disabled={isSubmitting}
                className={`mt-5 w-full rounded-[8px] px-5 py-2.5 text-[12px] cursor-pointer font-medium text-white transition-colors min-[635px]:hidden ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-[#555555]'
                    : 'bg-[#111111]'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>

              {/* Status */}
              {action?.error ? (
                <p
                  className="text-[13px] text-[#a33a3a]"
                  style={{marginTop: '7px'}}
                >
                  {action.error}
                </p>
              ) : null}

              {showSuccess && action?.success ? (
                <p
                  className="text-[13px] text-[#3d6540]"
                  style={{marginTop: '7px'}}
                >
                  {action.success}
                </p>
              ) : null}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   success: string | null;
 *   customer: CustomerFragment | null;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
/** @typedef {import('./+types/account.profile').Route} Route */
/** @typedef {ReturnType<typeof useActionData<typeof import('../../routes/account.profile').action>>} ActionReturnData */