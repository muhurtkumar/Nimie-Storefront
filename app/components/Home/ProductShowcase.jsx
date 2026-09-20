import {Await} from 'react-router';
import {Suspense} from 'react';

import {ProductCard} from './ProductCard';

export function ProductShowcase({products}) {
  return (
    <section className="px-4 py-8">
      <Suspense fallback={<div>Loading products...</div>}>
        <Await resolve={products}>
          {(response) => {
            const productList = response?.products?.nodes ?? [];

            if (productList.length === 0) {
              return null;
            }

            return (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
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