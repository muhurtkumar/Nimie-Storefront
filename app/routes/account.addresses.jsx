import {
  data,
  Form,
  useActionData,
  useFetcher,
  useNavigation,
  useOutletContext,
} from 'react-router';

import {useEffect, useRef, useState} from 'react';

import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

import {
  MapPin,
  Home,
  Briefcase,
  Building2,
  Trash2,
  Pencil,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Addresses'}];
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

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;

    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    const isLoggedIn = await customerAccount.isLoggedIn();

    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;

    const address = {};

    const keys = [
      'address1',
      'address2',
      'city',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);

      if (typeof value === 'string') {
        address[key] = value.trim();
      }
    }

    switch (request.method) {
      case 'POST': {
        try {
          const {data: mutationData, errors} =
            await customerAccount.mutate(CREATE_ADDRESS_MUTATION, {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            });

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (mutationData?.customerAddressCreate?.userErrors?.length) {
            throw new Error(
              mutationData.customerAddressCreate.userErrors[0].message,
            );
          }

          if (!mutationData?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress:
              mutationData.customerAddressCreate.customerAddress,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }

          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        try {
          const {data: mutationData, errors} =
            await customerAccount.mutate(UPDATE_ADDRESS_MUTATION, {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            });

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (mutationData?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(
              mutationData.customerAddressUpdate.userErrors[0].message,
            );
          }

          if (!mutationData?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }

          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        try {
          const {data: mutationData, errors} =
            await customerAccount.mutate(DELETE_ADDRESS_MUTATION, {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            });

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (mutationData?.customerAddressDelete?.userErrors?.length) {
            throw new Error(
              mutationData.customerAddressDelete.userErrors[0].message,
            );
          }

          if (!mutationData?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {
            error: null,
            deletedAddress: addressId,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }

          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }

    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext();

  const {defaultAddress, addresses} = customer;

  const [currentAddressPage, setCurrentAddressPage] =
    useState(0);

  const allAddresses = addresses?.nodes || [];

  const addressesPerPage = 2;

  const totalAddressPages = Math.ceil(
    allAddresses.length / addressesPerPage,
  );

  const visibleAddresses = allAddresses.slice(
    currentAddressPage * addressesPerPage,
    currentAddressPage * addressesPerPage +
      addressesPerPage,
  );

  const canGoPrevious = currentAddressPage > 0;

  const canGoNext =
    currentAddressPage < totalAddressPages - 1;

  const goToPreviousAddresses = () => {
    if (canGoPrevious) {
      setCurrentAddressPage((page) => page - 1);
    }
  };

  const goToNextAddresses = () => {
    if (canGoNext) {
      setCurrentAddressPage((page) => page + 1);
    }
  };

  return (
    <div className="account-addresses flex h-full w-full flex-col">
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
          SAVED ADDRESSES
      ========================== */}
      <div className="rounded-[20px] border border-[#e7e2dc] bg-white">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-4 px-6 pb-4 pt-4 sm:px-7 sm:pb-5 sm:pt-5">
          <div>
            <h2
              className="font-serif text-[22px] leading-tight text-[#111111] sm:text-[24px]"
              style={{marginBottom: '3px'}}
            >
              Saved Addresses
            </h2>

            <p
              className="text-[13px] text-[#706b65] sm:text-[14px]"
              style={{marginBottom: '0px'}}
            >
              Manage your saved delivery addresses.
            </p>
          </div>

          {/* =========================
              ADDRESS NAVIGATION
          ========================== */}
          {allAddresses.length > addressesPerPage ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousAddresses}
                disabled={!canGoPrevious}
                aria-label="Previous addresses"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#ddd8d2] bg-white text-[#333333] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft
                  size={17}
                  strokeWidth={1.6}
                />
              </button>

              <button
                type="button"
                onClick={goToNextAddresses}
                disabled={!canGoNext}
                aria-label="Next addresses"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#ddd8d2] bg-white text-[#333333] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight
                  size={17}
                  strokeWidth={1.6}
                />
              </button>
            </div>
          ) : null}
        </div>

        {/* Addresses */}
        <div className="px-6 py-5 sm:px-7">
          {!addresses?.nodes?.length ? (
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#f2efeb]">
                <MapPin
                  size={21}
                  strokeWidth={1.5}
                  className="text-[#55504a]"
                />
              </div>

              <p className="text-[14px] font-medium text-[#222222]">
                No saved addresses
              </p>

              <p className="mt-1 text-[13px] text-[#77716b]">
                Add an address below for a faster checkout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visibleAddresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  defaultAddress={defaultAddress}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================
          SPACING
      ========================== */}
      <div className="h-5 shrink-0" />

      {/* =========================
          ADD NEW ADDRESS
      ========================== */}
      <div className="rounded-[20px] border border-[#e7e2dc] bg-white">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 px-6 pb-0 pt-5 sm:px-7 sm:pb-0 sm:pt-6">
          <div>
            <h2
              className="font-serif text-[22px] leading-tight text-[#111111] sm:text-[24px]"
              style={{marginBottom: '3px'}}
            >
              Add New Address
            </h2>

            <p
              className="text-[13px] text-[#706b65] sm:text-[14px]"
              style={{marginTop: '0px'}}
            >
              Add a new delivery address to your account.
            </p>
          </div>
        </div>

        {/* New Address Form */}
        <div className="w-full px-3 pb-5 pt-3 sm:px-7 sm:pb-6">
          <NewAddressForm />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADDRESS CARD
========================================================= */

function AddressCard({address, defaultAddress}) {
  const addressType = getAddressType(address);

  const AddressIcon =
    addressType === 'Work'
      ? Briefcase
      : addressType === 'Parents Home'
        ? Building2
        : Home;

  const isDefault = defaultAddress?.id === address.id;

  const formattedAddress = [
    address.address1,
    address.address2,
    address.city,
    address.zoneCode,
    address.zip,
    address.territoryCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={`rounded-[12px] border bg-white p-3 transition-colors ${
        isDefault
          ? 'border-[#9b9b65]'
          : 'border-[#e2ddd7]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#f5f2ee]">
          <AddressIcon
            size={17}
            strokeWidth={1.5}
            className="text-[#45413d]"
          />
        </div>

        {/* Address Content */}
        <div className="min-w-0 flex-1">
          {/* Title + Default */}
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-medium leading-none text-[#111111]">
              {addressType}
            </p>

            {isDefault ? (
              <span className="rounded-full bg-[#dcebdc] px-2 py-[3px] text-[9px] font-medium leading-none text-[#3f6244]">
                Default
              </span>
            ) : null}
          </div>

          {/* Name */}
          <p className="mt-1.5 text-[11px] leading-[1.4] text-[#68635e]">
            {[address.firstName, address.lastName]
              .filter(Boolean)
              .join(' ')}
          </p>

          {/* Address */}
          <div className="min-h-[44px]">
            <p className="text-[11px] leading-[1.4] text-[#68635e]">
              {formattedAddress}
            </p>
          </div>

          {/* Actions */}
          <AddressActions
            address={address}
            defaultAddress={defaultAddress}
          />
        </div>

        {/* Default Check */}
        {isDefault ? (
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5d7d5f]">
            <Check
              size={10}
              strokeWidth={2.5}
              className="text-white"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   NEW ADDRESS
========================================================= */

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  const formRef = useRef(null);

  /** @type {ActionReturnData} */
  const action = useActionData();

  useEffect(() => {
    if (action?.createdAddress) {
      formRef.current?.reset();
    }
  }, [action?.createdAddress]);

  return (
    <AddressForm
      addressId="NEW_ADDRESS_ID"
      address={newAddress}
      defaultAddress={null}
      formRef={formRef}
    >
      {({stateForMethod}) => {
        const isCreating =
          stateForMethod('POST') !== 'idle';

        return (
          <div className="flex justify-end">
            <button
              disabled={isCreating}
              formMethod="POST"
              type="submit"
              className={`flex cursor-pointer items-center gap-2 rounded-[8px] px-5 py-2.5 text-[12px] font-medium text-white transition-opacity ${
                isCreating
                  ? 'cursor-not-allowed bg-[#555555]'
                  : 'bg-[#111111] hover:opacity-85'
              }`}
            >
              <Plus size={15} strokeWidth={1.7} />

              {isCreating
                ? 'Adding Address...'
                : 'Add New Address'}
            </button>
          </div>
        );
      }}
    </AddressForm>
  );
}

/* =========================================================
   EXISTING ADDRESS ACTIONS
========================================================= */

function AddressActions({address, defaultAddress}) {
  const fetcher = useFetcher();

  const error = fetcher.data?.error?.[address.id];

  const isDeleting = fetcher.state !== 'idle';

  return (
    <>
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#4f7d5a] transition-opacity hover:opacity-60"
          onClick={() => {
            // Edit functionality can be added here.
          }}
        >
          <Pencil size={12} strokeWidth={1.5} />
          Edit
        </button>

        <fetcher.Form method="DELETE">
          <input
            type="hidden"
            name="addressId"
            value={address.id}
          />

          <button
            type="submit"
            disabled={isDeleting}
            className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#b34a4a] transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={12} strokeWidth={1.5} />

            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </fetcher.Form>
      </div>

      {error ? (
        <p className="mt-2 text-[12px] text-[#a33a3a]">
          {error}
        </p>
      ) : null}
    </>
  );
}

/* =========================================================
   ADDRESS FORM
========================================================= */

/**
 * @param {{
 *   addressId: string;
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   compact?: boolean;
 *   children: (props: {
 *     stateForMethod: (
 *       method: 'PUT' | 'POST' | 'DELETE'
 *     ) => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({
  addressId,
  address,
  defaultAddress,
  compact = false,
  formRef,
  children,
}) {
  const {state, formMethod} = useNavigation();

  /** @type {ActionReturnData} */
  const action = useActionData();

  const error = action?.error?.[addressId];

  const isDefaultAddress =
    defaultAddress?.id === addressId;

  const prefix =
    addressId === 'NEW_ADDRESS_ID'
      ? 'new-address'
      : `address-${addressId}`;

  return (
    <Form
      ref={formRef}
      id={addressId}
      method="post"
      className="w-full"
      style={{maxWidth: 'none'}}
    >
      <fieldset
        className="m-0 w-full p-0"
        style={{padding: 0, margin: 0}}
        disabled={state !== 'idle' && formMethod}
      >
        {/* Address ID */}
        <input
          type="hidden"
          name="addressId"
          value={addressId}
        />

        {/* =========================
            FULL ADDRESS FORM
        ========================== */}
        {!compact ? (
          <>
            {/* =========================
                NAME
            ========================== */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-7">
              <Field
                id={`${prefix}-firstName`}
                name="firstName"
                label="First Name"
                placeholder="First Name"
                defaultValue={address?.firstName ?? ''}
                autoComplete="given-name"
                required
              />

              <Field
                id={`${prefix}-lastName`}
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                defaultValue={address?.lastName ?? ''}
                autoComplete="family-name"
                required
              />
            </div>

            {/* =========================
                ADDRESS
            ========================== */}
            <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-7">
              <Field
                id={`${prefix}-address1`}
                name="address1"
                label="Address Line 1"
                placeholder="Address Line 1"
                defaultValue={address?.address1 ?? ''}
                autoComplete="address-line1"
                required
              />

              <Field
                id={`${prefix}-address2`}
                name="address2"
                label="Address Line 2"
                placeholder="Apartment, suite, landmark, etc. (optional)"
                defaultValue={address?.address2 ?? ''}
                autoComplete="address-line2"
              />
            </div>

            {/* =========================
                CITY / STATE
            ========================== */}
            <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-7">
              <Field
                id={`${prefix}-city`}
                name="city"
                label="City"
                placeholder="City"
                defaultValue={address?.city ?? ''}
                autoComplete="address-level2"
                required
              />

              <Field
                id={`${prefix}-zoneCode`}
                name="zoneCode"
                label="State / Province"
                placeholder="State / Province"
                defaultValue={address?.zoneCode ?? ''}
                autoComplete="address-level1"
                required
              />
            </div>

            {/* =========================
                ZIP / COUNTRY
            ========================== */}
            <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-7">
              <Field
                id={`${prefix}-zip`}
                name="zip"
                label="Postal Code"
                placeholder="Postal Code"
                defaultValue={address?.zip ?? ''}
                autoComplete="postal-code"
                required
              />

              <Field
                id={`${prefix}-territoryCode`}
                name="territoryCode"
                label="Country Code"
                placeholder="IN"
                defaultValue={address?.territoryCode ?? ''}
                autoComplete="country"
                maxLength={2}
                required
              />
            </div>

            {/* =========================
                PHONE
            ========================== */}
            <div className="mt-4 grid w-full grid-cols-1 sm:grid-cols-2 sm:gap-x-7">
              <Field
                id={`${prefix}-phoneNumber`}
                name="phoneNumber"
                label="Mobile Number"
                placeholder="+91 98765 43210"
                defaultValue={address?.phoneNumber ?? ''}
                autoComplete="tel"
                type="tel"
              />
            </div>

            {/* =========================
                DEFAULT ADDRESS + BUTTON
            ========================== */}
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <input
                  id={`${prefix}-defaultAddress`}
                  name="defaultAddress"
                  type="checkbox"
                  defaultChecked={isDefaultAddress}
                  className="h-4 w-4 cursor-pointer accent-[#111111]"
                />

                <label
                  htmlFor={`${prefix}-defaultAddress`}
                  className="cursor-pointer text-[12px] text-[#55504a]"
                >
                  Set as default address
                </label>
              </div>

              {children({
                stateForMethod: (method) =>
                  formMethod === method ? state : 'idle',
              })}
            </div>

            {/* Error */}
            {error ? (
              <p className="mt-3 text-[13px] text-[#a33a3a]">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          /* =========================
              COMPACT FORM
          ========================== */
          <>
            {children({
              stateForMethod: (method) =>
                formMethod === method ? state : 'idle',
            })}

            {error ? (
              <p className="mt-2 text-[12px] text-[#a33a3a]">
                {error}
              </p>
            ) : null}
          </>
        )}
      </fieldset>
    </Form>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  id,
  name,
  label,
  placeholder,
  defaultValue,
  autoComplete,
  required = false,
  type = 'text',
  maxLength,
}) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-medium text-[#111111]"
      >
        {label}
        {required ? ' *' : ''}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="m-0 h-[38px] w-full rounded-[7px] border border-[#ddd8d2] bg-white px-3 text-[13px] text-[#111111] outline-none transition-colors placeholder:text-[#aaa49e] focus:border-[#111111]"
      />
    </div>
  );
}

/* =========================================================
   ADDRESS TYPE
========================================================= */

function getAddressType(address) {
  const company = address?.company?.toLowerCase() || '';

  if (company.includes('work')) {
    return 'Work';
  }

  if (company.includes('parent')) {
    return 'Parents Home';
  }

  return 'Home';
}

/**
 * @typedef {{
 *   error: Record<string, string> | null;
 *   createdAddress?: AddressFragment;
 *   updatedAddress?: AddressFragment;
 *   deletedAddress?: string;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('./+types/account.addresses').Route} Route */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */