import {data} from 'react-router';

import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';

import AccountProfile from '~/components/Account/AccountProfile';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Profile'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer = {};
    const validInputKeys = ['firstName', 'lastName'];

    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key)) {
        continue;
      }

      if (typeof value === 'string') {
        customer[key] = value.trim();
      }
    }

    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!mutationData?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      success: 'Profile updated successfully.',
      customer: mutationData.customerUpdate.customer,
    };
  } catch (error) {
    return data(
      {
        error: error.message,
        success: null,
        customer: null,
      },
      {
        status: 400,
      },
    );
  }
}

export default AccountProfile;

/** @typedef {import('./+types/account.profile').Route} Route */