import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { getProductById, type Product } from '~/lib/graphql-client';
import { authService } from '~/lib/auth';
import Header from '~/components/header/header';
import styles from './product-detail.module.css';

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = useSignal<Product | null>(null);
  const selectedVariant = useSignal<number>(0);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);

  const productId = location.params.id;

  useVisibleTask$(async () => {
    try {
      const token = authService.getAccessToken();
      const data = await getProductById(productId, token);

      if (!data) {
        error.value = 'Product not found';
        return;
      }

      product.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load product';
      console.error('Failed to load product:', err);
    } finally {
      loading.value = false;
    }
  });

  if (loading.value) {
    return (
      <>
        <Header />
        <div class={styles.container}>
          <p>Loading product...</p>
        </div>
      </>
    );
  }

  if (error.value || !product.value) {
    return (
      <>
        <Header />
        <div class={styles.container}>
          <div class={styles.error}>
            <h2>Error</h2>
            <p>{error.value || 'Product not found'}</p>
            <button
              class={styles.backButton}
              onClick$={() => navigate('/products')}
            >
              Back to Products
            </button>
          </div>
        </div>
      </>
    );
  }

  const currentVariant = product.value.variants[selectedVariant.value];

  return (
    <>
      <Header />
      <div class={styles.container}>
        <button
          class={styles.backLink}
          onClick$={() => navigate('/products')}
        >
          ← Back to Products
        </button>

        <div class={styles.content}>
          <div class={styles.imageSection}>
            {product.value.image?.url ? (
              <img
                src={product.value.image.url}
                alt={product.value.title}
                class={styles.image}
              />
            ) : (
              <div class={styles.imagePlaceholder}>No Image Available</div>
            )}
          </div>

          <div class={styles.detailsSection}>
            <h1 class={styles.title}>{product.value.title}</h1>

            {product.value.category && (
              <p class={styles.category}>{product.value.category}</p>
            )}

            <div class={styles.description}>
              <h3>Description</h3>
              <p>{product.value.description}</p>
            </div>

            <div class={styles.variantsSection}>
              <h3>Select Variant</h3>
              <div class={styles.variantsList}>
                {product.value.variants.map((variant, index) => (
                  <button
                    key={variant.sku}
                    class={[
                      styles.variantButton,
                      selectedVariant.value === index && styles.variantActive,
                    ]}
                    onClick$={() => {
                      selectedVariant.value = index;
                    }}
                    disabled={!variant.isAvailable}
                  >
                    <div class={styles.variantName}>{variant.name}</div>
                    {variant.color && (
                      <div class={styles.variantColor}>{variant.color}</div>
                    )}
                    {variant.size && (
                      <div class={styles.variantSize}>{variant.size}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {currentVariant && (
              <div class={styles.variantDetails}>
                <div class={styles.priceSection}>
                  <p class={styles.label}>Price</p>
                  <p class={styles.price}>${currentVariant.price.toFixed(2)}</p>
                </div>

                <div class={styles.stockSection}>
                  <p class={styles.label}>Stock</p>
                  <p
                    class={[
                      styles.stock,
                      !currentVariant.isAvailable && styles.outOfStock,
                    ]}
                  >
                    {currentVariant.isAvailable
                      ? `${currentVariant.stock} in stock`
                      : 'Out of stock'}
                  </p>
                </div>

                <button
                  class={styles.addToCartButton}
                  disabled={!currentVariant.isAvailable}
                >
                  {currentVariant.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            )}

            {product.value.tags && product.value.tags.length > 0 && (
              <div class={styles.tags}>
                <h3>Tags</h3>
                <div class={styles.tagsList}>
                  {product.value.tags.map((t) => (
                    <span key={t.tag} class={styles.tag}>
                      {t.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Product Detail - Qwik Store',
  meta: [
    {
      name: 'description',
      content: 'View product details and variants',
    },
  ],
};
