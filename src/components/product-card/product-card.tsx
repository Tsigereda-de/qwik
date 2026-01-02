import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import type { Product } from '~/lib/graphql-client';
import styles from './product-card.module.css';

interface ProductCardProps {
  product: Product;
}

export default component$<ProductCardProps>(({ product }) => {
  return (
    <Link href={`/products/${product.id}`} class={styles.card}>
      <div class={styles.imageWrapper}>
        {product.image?.url ? (
          <img
            src={product.image.url}
            alt={product.image.alt || product.title}
            class={styles.image}
          />
        ) : (
          <div class={styles.imagePlaceholder}>No Image</div>
        )}
      </div>

      <div class={styles.content}>
        <h3 class={styles.title}>{product.title}</h3>

        {product.category && (
          <p class={styles.category}>{product.category}</p>
        )}

        <p class={styles.price}>${product.basePrice.toFixed(2)}</p>

        {product.variants && product.variants.length > 0 && (
          <p class={styles.variants}>
            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  );
});
