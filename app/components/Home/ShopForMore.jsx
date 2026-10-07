import {Await} from 'react-router';
import {Suspense, useMemo, useState} from 'react';
import {ProductCard} from './ProductCard.jsx';
const PAGE_SIZE = 3;
const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const css = `
.sfm {
  width: 100%;
  font-family: ${FONT};
  background: #FFF8EA;
  padding: clamp(12px, 2vw, 24px) 0 clamp(24px, 4vw, 48px);
  margin: 0;
}
.sfm *, .sfm *::before, .sfm *::after { box-sizing: border-box; }

.sfm__title {
  margin: 0 0 clamp(28px, 5vw, 48px);
  text-align: center;
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;
  color: #2F5723;
}

.sfm__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(12px, 3vw, 32px);
}

.sfm__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
}

@media (min-width: 768px) {
  .sfm__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

.sfm__nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: clamp(16px, 2.5vw, 24px);
}

.sfm__nav-btn {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  border: none;
  background: #F5F5EC;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2B22C9;
  padding: 0;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.sfm__nav-btn:hover:not(:disabled) {
  background: #ECECDF;
}

.sfm__nav-btn:disabled {
  background: #FBF4E6;
  color: rgba(43, 34, 201, 0.35);
  cursor: default;
}

.sfm__nav-btn svg {
  width: 46px;
  height: 34px;
  display: block;
  stroke-width: 1.6;
}

.sfm__nav-label {
  margin-left: 24px;
  font-size: 12px;
  color: #000;
}
`;

export function ShopForMore({products, title = 'Shop for More'}) {
  return (
    <section className="sfm">
      <style>{css}</style>
      <h2 className="sfm__title">{title}</h2>

      <div className="sfm__inner">
        <Suspense fallback={<div>Loading products...</div>}>
          <Await resolve={products}>
            {(response) => {
              const productList = response?.products?.nodes ?? [];
              if (productList.length === 0) return null;
              return <ShopForMoreGrid productList={productList} />;
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function ShopForMoreGrid({productList}) {
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
      <div className="sfm__grid">
        {pageItems.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={page * PAGE_SIZE + index}
          />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="sfm__nav">
          <button
            type="button"
            className="sfm__nav-btn"
            onClick={goPrev}
            disabled={page === 0}
            aria-label="Previous products"
          >
            ←
          </button>
          <button
            type="button"
            className="sfm__nav-btn"
            onClick={goNext}
            disabled={page === pageCount - 1}
            aria-label="Next products"
          >
            →
          </button>
          <span className="sfm__nav-label">
            {page + 1} / {pageCount}
          </span>
        </div>
      )}
    </>
  );
}