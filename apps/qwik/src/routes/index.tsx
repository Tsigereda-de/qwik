import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import Header from "~/components/header/header";
import styles from "./index.module.css";

export default component$(() => {
  return (
    <>
      <Header />
      <div class={styles.hero}>
        <div class={styles.snowflakes}>
          <div class={styles.snowflake}>❄</div>
          <div class={styles.snowflake}>❄</div>
          <div class={styles.snowflake}>❄</div>
          <div class={styles.snowflake}>❄</div>
          <div class={styles.snowflake}>❄</div>
        </div>
        <div class={styles.heroContent}>
          <div class={styles.christmasEmoji}>🎄 ✨ 🎅</div>
          <h1>Holiday Shopping Magic</h1>
          <p>
            Discover our curated collection of premium gifts, festive decorations, and holiday essentials. Make this season special with exclusive deals and fast delivery!
          </p>
          <div class={styles.ctaButtons}>
            <Link href="/products" class={styles.primaryButton}>
              🛍️ Shop Now
            </Link>
            <Link href="/chat" class={styles.secondaryButton}>
              💬 Get Help
            </Link>
          </div>
        </div>
      </div>

      <section class={styles.featuresSection}>
        <h2>Why Choose Us</h2>
        <div class={styles.featuresList}>
          <div class={styles.featureCard}>
            <div class={styles.featureEmoji}>🚚</div>
            <h3>Fast Holiday Delivery</h3>
            <p>Express shipping available for all orders. Get your gifts in time for the holidays!</p>
          </div>
          <div class={styles.featureCard}>
            <div class={styles.featureEmoji}>💎</div>
            <h3>Premium Selection</h3>
            <p>Hand-picked gifts and holiday items from trusted brands. Quality you can trust.</p>
          </div>
          <div class={styles.featureCard}>
            <div class={styles.featureEmoji}>🔒</div>
            <h3>Safe & Secure</h3>
            <p>Bank-level encryption protects your data. Shop with confidence this season.</p>
          </div>
          <div class={styles.featureCard}>
            <div class={styles.featureEmoji}>⭐</div>
            <h3>24/7 Support</h3>
            <p>Our friendly team is here to help. Real-time chat support during holidays.</p>
          </div>
        </div>
      </section>

      <section class={styles.infoSection}>
        <h2>Our Promise This Holiday Season</h2>
        <div class={styles.techStack}>
          <div class={styles.techItem}>
            <strong>🎁 Exclusive Deals:</strong> Up to 50% off on selected holiday items
          </div>
          <div class={styles.techItem}>
            <strong>📦 Smart Shipping:</strong> Free shipping on orders over $50 this season
          </div>
          <div class={styles.techItem}>
            <strong>💳 Flexible Payment:</strong> Multiple payment options including installments
          </div>
          <div class={styles.techItem}>
            <strong>🎉 Loyalty Rewards:</strong> Earn points on every purchase
          </div>
        </div>
      </section>

      <section class={styles.festiveSection}>
        <div class={styles.festiveContent}>
          <h2>Season's Greetings! 🎄</h2>
          <p>Join thousands of happy customers celebrating the holidays with us. Thank you for making this season special!</p>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Holiday Shop - Premium Gifts & Festive Decorations",
  meta: [
    {
      name: "description",
      content: "Shop premium holiday gifts, festive decorations, and seasonal essentials. Fast delivery, secure checkout, and 24/7 support.",
    },
  ],
};
