import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
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

  useVisibleTask$(async () => {
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
            <h3>⚠️ Configuration Error</h3>
            <p>{error.value}</p>
            <div class={styles.setupGuide}>
              <h4>To fix this:</h4>
              <ol>
                <li>Set up the Payload CMS backend (see SETUP_GUIDE.md)</li>
                <li>Configure the <code>VITE_GRAPHQL_ENDPOINT</code> environment variable</li>
                <li>Restart the development server</li>
              </ol>
              <p><strong>For development:</strong> Run <code>cd payload-qwik && npm run dev</code> in another terminal</p>
              <p><strong>Endpoint should be:</strong> <code>http://localhost:3001/graphql</code> (development) or your production URL</p>
            </div>
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
