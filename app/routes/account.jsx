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
    <div className="account-page mt-3 bg-[#f7f4ef] text-[#111111] md:h-[calc(100vh-175px)] md:overflow-hidden">
      <div className="mx-auto flex w-full flex-col md:h-full md:flex-row md:items-stretch md:gap-6">
        <AccountSidebar customer={customer} />

        {/* Main content: only this section scrolls on desktop */}
        <main className="min-w-0 w-full md:h-full md:flex-1 md:overflow-y-auto">
          <div className="flex min-h-0 w-full flex-col px-[clamp(8px,2vw,16px)] py-4 md:px-0 md:py-4">
            <Outlet context={{customer}} />
          </div>
        </main>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */