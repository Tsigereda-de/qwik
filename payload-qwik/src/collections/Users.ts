import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'zitadelId', 'createdAt'],
  },
  auth: true,
  fields: [
    // Email added by default via auth: true
    {
      name: 'name',
      type: 'text',
      required: false,
    },
    {
      name: 'role',
      type: 'select',
      options: ['user', 'admin', 'editor'],
      defaultValue: 'user',
      required: true,
      saveToJWT: true,
      index: true,
    },
    {
      name: 'zitadelId',
      type: 'text',
      unique: true,
      sparse: true,
      index: true,
      admin: {
        description: 'Zitadel user ID for OAuth integration',
      },
    },
    {
      name: 'zitadelProfile',
      type: 'json',
      admin: {
        description: 'Zitadel profile data stored as JSON',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
  ],
  timestamps: true,
}
