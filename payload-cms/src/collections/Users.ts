import { CollectionConfig } from 'payload/types';

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Zitadel OIDC integration is configured at the app level
    useAPIKey: true,
    depth: 0,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      // Allow reading own user or if admin
      if (req.user?.role === 'admin') {
        return true;
      }
      return {
        id: { equals: req.user?.id },
      };
    },
    create: async ({ req }) => {
      // Only admins can create users (or during registration)
      return req.user?.role === 'admin' || !req.user;
    },
    update: async ({ req }) => {
      // Users can update themselves, admins can update anyone
      if (req.user?.role === 'admin') {
        return true;
      }
      return {
        id: { equals: req.user?.id },
      };
    },
    delete: async ({ req }) => {
      // Only admins can delete users
      return req.user?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
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
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      index: true,
    },
    {
      name: 'avatar',
      type: 'text',
      admin: {
        description: 'URL to user avatar image',
      },
    },
    {
      name: 'zitadelId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
        description: 'Zitadel user ID for OIDC integration',
      },
    },
    {
      name: 'zitadelProfile',
      type: 'json',
      admin: {
        hidden: true,
        description: 'Cached Zitadel user profile data',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
  ],
  timestamps: true,
};

export default Users;
