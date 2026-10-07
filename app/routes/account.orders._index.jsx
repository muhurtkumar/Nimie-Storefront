import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {AccountOrders} from '~/components/Account/AccountOrders';

export const meta = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 50,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer};
}

export default function Orders() {
  const {customer} = useLoaderData();
  return <AccountOrders orders={customer.orders?.nodes ?? []} />;
}