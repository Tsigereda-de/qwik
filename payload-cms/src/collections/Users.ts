import { CollectionConfig } from 'payload/types';

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Zitadel OIDC integration will be configured here
    // This allows users authenticated via Zitadel to access Payload
    useAPIKey: true,
    depth: 0,
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => {
      // Allow admins to read all users, users can read themselves
      if (req.user?.role === 'admin') {
        return true;
      }
      return {
        id: { equals: req.user?.id },
      };
    },
    create: async ({ req }) => {
      // Only admins can create users
      return req.user?.role === 'admin';
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
    },
    {
      name: 'zitadelId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'zitadelProfile',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};

export default Users;
