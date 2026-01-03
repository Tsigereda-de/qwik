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
        <div class={styles.heroContent}>
          <h1>Welcome to Qwik Store</h1>
          <p>
            A modern e-commerce platform built with Qwik, Payload CMS, and real-time chat powered by Matrix.
          </p>
          <div class={styles.ctaButtons}>
            <Link href="/products" class={styles.primaryButton}>
              Browse Products
            </Link>
            <Link href="/chat" class={styles.secondaryButton}>
              Join Chat
            </Link>
          </div>
        </div>
      </div>

      <section class={styles.featuresSection}>
        <h2>Features</h2>
        <div class={styles.featuresList}>
          <div class={styles.featureCard}>
            <h3>Progressive Web App</h3>
            <p>Install as an app and use offline with PWA capabilities.</p>
          </div>
          <div class={styles.featureCard}>
            <h3>Product Variants</h3>
            <p>Browse products with multiple variants (colors, sizes, etc.).</p>
          </div>
          <div class={styles.featureCard}>
            <h3>Secure Authentication</h3>
            <p>OAuth2/OIDC authentication through Zitadel.</p>
          </div>
          <div class={styles.featureCard}>
            <h3>Real-time Chat</h3>
            <p>Connect with other users in the community chat using Matrix.</p>
          </div>
        </div>
      </section>

      <section class={styles.infoSection}>
        <h2>Technology Stack</h2>
        <div class={styles.techStack}>
          <div class={styles.techItem}>
            <strong>Frontend:</strong> Qwik with PWA support
          </div>
          <div class={styles.techItem}>
            <strong>Backend:</strong> Payload CMS with GraphQL API
          </div>
          <div class={styles.techItem}>
            <strong>Authentication:</strong> Zitadel OAuth2/OIDC
          </div>
          <div class={styles.techItem}>
            <strong>Chat:</strong> Matrix with matrix-js-sdk
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Qwik Store - Modern E-commerce Platform",
  meta: [
    {
      name: "description",
      content: "A modern e-commerce website built with Qwik, Payload CMS, and Zitadel authentication with real-time Matrix chat.",
    },
  ],
};
