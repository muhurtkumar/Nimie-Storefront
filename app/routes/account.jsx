import {
  data as remixData,
  Outlet,
  useLoaderData,
} from 'react-router';

import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {AccountSidebar} from '~/components/Account/AccountSidebar';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;

  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  return (
    <div className="account-page min-h-screen bg-[#f7f4ef] text-[#111111]">
      <div className="mx-auto flex w-full flex-col md:flex-row md:gap-6">
        <AccountSidebar customer={customer} />

        {/* =========================
            MAIN CONTENT
        ========================== */}
        <main className="min-w-0 w-full md:flex-1">
          <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12">
            <Outlet context={{customer}} />
          </div>
        </main>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */