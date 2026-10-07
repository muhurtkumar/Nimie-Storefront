import {Await} from 'react-router';
import {Suspense} from 'react';

import {ProductCard} from './ProductCard';
const FONT = "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function ProductShowcase({
  products,
  wishlist = [],
}) {
  return (
    <section className="px-4 py-8">
      <h2
        className="md:hidden"
        style={{
          margin: '20px 0px 24px',
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 'clamp(28px, 8vw, 36px)',
          fontWeight: 300,
          lineHeight: 1.1,
          color: '#345225',
        }}
      >
        Our Collection
      </h2>

      <Suspense fallback={<div>Loading products...</div>}>
        <Await resolve={products}>
          {(response) => {
            const productList = response?.products?.nodes ?? [];

            if (productList.length === 0) {
              return null;
            }

            return (
              <div className="grid grid-cols-1 gap-y-6 md:grid-cols-6 md:gap-x-4 md:gap-y-6">
                {productList.map((product, index) => (
                  <div
                    key={product.id}
                    className={
                      index < 3
                        ? 'md:col-span-2'
                        : 'md:col-span-3'
                    }
                  >
                    <ProductCard
                      product={product}
                      index={index}
                      wishlist={wishlist}
                    />
                  </div>
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}