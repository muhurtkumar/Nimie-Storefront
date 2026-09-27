import {useEffect} from 'react';
import {NavLink} from 'react-router';

const FONT = "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const DURATION = 600;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

export function Cart({open, onClose}) {
  
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[100] bg-black/35 transition-opacity duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Cart drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!open}
        className={`fixed right-0 top-0 bottom-0 z-[101] flex w-[min(480px,92vw)] max-w-full flex-col bg-white text-black font-['Swiss_721','Swiss','Helvetica_Neue',Helvetica,Arial,sans-serif] shadow-[-8px_0_30px_rgba(0,0,0,0.12)] transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] max-sm:w-full ${
          open
            ? 'visible translate-x-0'
            : 'invisible translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-5 pt-[20px]">
        <h2
            className="m-0 font-light leading-none tracking-[-0.02em]"
            style={{fontSize: '30px'}}
        >
            My Cart
        </h2>

        <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="relative top-[-6px] flex h-10 w-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
        >
            <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            >
            <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
            </svg>
        </button>
        </div>

        {/* Empty cart */}
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <h3 className="m-0 text-[21px] font-normal leading-[1.2]">
            Your Bag is Empty
          </h3>

          <p className="mt-[14px] text-[12px] font-normal leading-[1.4]">
            You haven't added anything to your bag yet.
          </p>
        </div>

        {/* Login button */}
        <div className="shrink-0 px-[18px] py-3">
          <NavLink
            to="/account"
            onClick={onClose}
            style={{
                color: '#fff',
            }}
            className="flex min-h-10 w-full items-center justify-center rounded-[6px] bg-[#345225] text-[12px] font-normal uppercase tracking-[0.02em] text-white no-underline"
          >
            LOGIN
          </NavLink>
        </div>
      </div>
    </>
  );
}