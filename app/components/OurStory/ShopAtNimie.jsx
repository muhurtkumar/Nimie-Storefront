// app/components/OurStory/ShopAtNimie.jsx
import {Await} from 'react-router';
import {Suspense, useMemo, useState} from 'react';
import {ProductCard} from '~/components/Home/ProductCard.jsx'; // <- adjust if ProductCard lives elsewhere

const PAGE_SIZE = 3;
const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
.san {
  width: 100%;
  font-family: ${FONT};
  background: #FFF8EA;
  padding: clamp(12px, 2vw, 24px) 0 clamp(24px, 4vw, 48px);
  margin: 0;
}
.san *, .san *::before, .san *::after { box-sizing: border-box; }

.san__title {
  margin: 0 0 clamp(28px, 5vw, 48px);
  text-align: center;
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;
  color: #2F5723;
}

.san__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(12px, 3vw, 32px);
}

.san__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
}

@media (min-width: 768px) {
  .san__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

.san__nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: clamp(16px, 2.5vw, 24px);
}

.san__nav-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 1px solid rgba(47, 87, 35, 0.3);
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2F5723;
  padding: 0;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.san__nav-btn:hover:not(:disabled) {
  background: #FFFFFF;
  border-color: #2F5723;
}

.san__nav-btn:disabled {
  background: transparent;
  border-color: rgba(47, 87, 35, 0.12);
  color: rgba(47, 87, 35, 0.3);
  cursor: default;
}

.san__nav-btn svg {
  width: 30px;
  height: 14px;
  display: block;
}

.san__nav-label {
  margin-left: 12px;
  font-size: 18px;
  color: #555;
  letter-spacing: 0.02em;
}

.san__empty {
  text-align: center;
  color: #2F5723;
  font-size: 14px;
}
`;

function ArrowLeft() {
  return (
    <svg viewBox="0 0 30 14" fill="none" aria-hidden="true">
      <path
        d="M29 7H1M1 7L7 1M1 7L7 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 30 14" fill="none" aria-hidden="true">
      <path
        d="M1 7H29M29 7L23 1M29 7L23 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShopAtNimie({
  products,
  wishlist = [],
  title = 'Shop at Nimie',
}) {
  return (
    <section className="san">
      <style>{css}</style>
      <h2 className="san__title">{title}</h2>

      <div className="san__inner">
        <Suspense fallback={<div>Loading products...</div>}>
          <Await resolve={products}>
            {(response) => {
              const productList = response?.products?.nodes ?? [];

              if (productList.length === 0) {
                return <p className="san__empty">No products found.</p>;
              }

              return (
                <ShopAtNimieGrid
                  productList={productList}
                  wishlist={wishlist}
                />
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function ShopAtNimieGrid({productList, wishlist}) {
  const [page, setPage] = useState(0);

  const pageCount = Math.ceil(productList.length / PAGE_SIZE);

  const pageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return productList.slice(start, start + PAGE_SIZE);
  }, [productList, page]);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1));

  return (
    <>
      <div className="san__grid">
        {pageItems.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={page * PAGE_SIZE + index}
            wishlist={wishlist}
          />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="san__nav">
          <button
            type="button"
            className="san__nav-btn"
            onClick={goPrev}
            disabled={page === 0}
            aria-label="Previous products"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            className="san__nav-btn"
            onClick={goNext}
            disabled={page === pageCount - 1}
            aria-label="Next products"
          >
            <ArrowRight />
          </button>
          <span className="san__nav-label">
            {page + 1} / {pageCount}
          </span>
        </div>
      )}
    </>
  );
}