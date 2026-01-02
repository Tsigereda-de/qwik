import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: false,
    },
    {
      name: 'zitadelId',
      type: 'text',
      unique: true,
      index: true,
      required: false,
    },
    {
      name: 'zitadelProfile',
      type: 'json',
      required: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
