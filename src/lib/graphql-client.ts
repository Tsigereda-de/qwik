import { env } from './env';

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

/**
 * GraphQL client for querying Payload CMS
 */
export const graphqlClient = {
  /**
   * Execute a GraphQL query
   */
  async query<T = unknown>(
    request: GraphQLRequest,
    token?: string
  ): Promise<GraphQLResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(env.graphqlEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as GraphQLResponse<T>;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
  },
};

/**
 * Query products with variants
 */
export const getProducts = async (token?: string) => {
  const query = `
    query GetProducts {
      Products {
        docs {
          id
          title
          description
          basePrice
          image {
            url
            alt
          }
          variants {
            sku
            name
            color
            size
            price
            stock
            isAvailable
          }
          category
          featured
          createdAt
          updatedAt
        }
        totalDocs
        totalPages
        hasNextPage
        hasPrevPage
      }
    }
  `;

  const response = await graphqlClient.query<{
    Products: {
      docs: Product[];
      totalDocs: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>(
    { query },
    token
  );

  if (response.errors) {
    throw new Error(`GraphQL Error: ${response.errors[0]?.message}`);
  }

  return response.data?.Products || { docs: [], totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };
};

/**
 * Query a single product by ID
 */
export const getProductById = async (id: string, token?: string) => {
  const query = `
    query GetProduct($id: String!) {
      Products(where: { id: { equals: $id } }) {
        docs {
          id
          title
          description
          basePrice
          image {
            url
            alt
          }
          variants {
            sku
            name
            color
            size
            price
            stock
            isAvailable
          }
          category
          tags {
            tag
          }
          featured
          createdAt
          updatedAt
        }
      }
    }
  `;

  const response = await graphqlClient.query<{
    Products: {
      docs: Product[];
    };
  }>(
    { query, variables: { id } },
    token
  );

  if (response.errors) {
    throw new Error(`GraphQL Error: ${response.errors[0]?.message}`);
  }

  return response.data?.Products.docs[0];
};

/**
 * Query featured products
 */
export const getFeaturedProducts = async (limit: number = 6, token?: string) => {
  const query = `
    query GetFeaturedProducts {
      Products(where: { featured: { equals: true } }, limit: ${limit}) {
        docs {
          id
          title
          description
          basePrice
          image {
            url
            alt
          }
          variants {
            sku
            name
            price
            stock
          }
        }
      }
    }
  `;

  const response = await graphqlClient.query<{
    Products: {
      docs: Product[];
    };
  }>(
    { query },
    token
  );

  if (response.errors) {
    throw new Error(`GraphQL Error: ${response.errors[0]?.message}`);
  }

  return response.data?.Products.docs || [];
};

/**
 * Product type definition
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  image?: {
    url: string;
    alt?: string;
  };
  variants: ProductVariant[];
  category?: string;
  tags?: Array<{ tag: string }>;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  sku: string;
  name: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}
