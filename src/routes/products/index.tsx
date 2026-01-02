import { component$, useSignal, useEffect$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getProducts, type Product } from '~/lib/graphql-client';
import { authService } from '~/lib/auth';
import Header from '~/components/header/header';
import ProductCard from '~/components/product-card/product-card';
import styles from './products.module.css';

export default component$(() => {
  const products = useSignal<Product[]>([]);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);

  useEffect$(async () => {
    try {
      const token = authService.getAccessToken();
      const data = await getProducts(token);
      products.value = data.docs;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load products';
      console.error('Failed to load products:', err);
    } finally {
      loading.value = false;
    }
  });

  return (
    <>
      <Header />
      <div class={styles.container}>
        <h1>Our Products</h1>

        {loading.value && (
          <div class={styles.loading}>
            <p>Loading products...</p>
          </div>
        )}

        {error.value && (
          <div class={styles.error}>
            <p>Error: {error.value}</p>
          </div>
        )}

        {!loading.value && products.value.length === 0 && !error.value && (
          <div class={styles.empty}>
            <p>No products available at the moment.</p>
          </div>
        )}

        {!loading.value && products.value.length > 0 && (
          <div class={styles.productsGrid}>
            {products.value.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Products - Qwik Store',
  meta: [
    {
      name: 'description',
      content: 'Browse our collection of products with variants',
    },
  ],
};
