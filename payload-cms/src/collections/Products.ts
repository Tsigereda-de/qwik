import { CollectionConfig } from 'payload/types';

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'description', 'variantsCount', 'createdAt'],
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
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'variants',
      type: 'array',
      required: true,
      minRows: 1,
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
        },
        {
          name: 'color',
          type: 'text',
        },
        {
          name: 'size',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
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
      name: 'category',
      type: 'text',
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
  ],
  hooks: {
    afterRead: [
      async ({ doc }) => {
        // Add computed field for variants count
        if (doc && doc.variants) {
          doc.variantsCount = doc.variants.length;
        }
        return doc;
      },
    ],
  },
};

export default Products;
