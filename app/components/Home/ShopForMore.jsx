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
  gap: 10px;
  margin-top: clamp(16px, 2.5vw, 24px);
}

.sfm__nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(47, 87, 35, 0.3);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2F5723;
  transition: opacity 0.2s ease;
}

.sfm__nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.sfm__nav-label {
  font-size: 13px;
  color: rgba(23, 23, 23, 0.6);
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