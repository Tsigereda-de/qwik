import { CollectionConfig } from 'payload/types';

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'status', 'createdAt'],
  },
  access: {
    read: () => true, // Everyone can read products
    create: async ({ req }) => req.user?.role === 'admin',
    update: async ({ req }) => req.user?.role === 'admin',
    delete: async ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Product base price in USD',
      },
    },
    {
      name: 'image',
      type: 'text',
      admin: {
        description: 'Image URL for product',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
      admin: {
        description: 'Alt text for product image',
      },
    },
    {
      name: 'category',
      type: 'text',
      index: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Product variants (colors, sizes, etc.)',
      },
      fields: [
        {
          name: 'sku',
          type: 'text',
          required: true,
          unique: true,
          index: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g., "Red - Size M"',
          },
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            description: 'Variant color',
          },
        },
        {
          name: 'size',
          type: 'text',
          admin: {
            description: 'Variant size',
          },
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Variant-specific price override',
          },
        },
        {
          name: 'stock',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'isAvailable',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Feature this product on homepage',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'published',
      index: true,
    },
  ],
  timestamps: true,
};

export default Products;
