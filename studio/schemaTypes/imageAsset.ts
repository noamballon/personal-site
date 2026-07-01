import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'sanity.imageAsset',
  type: 'document',
  fields: [
    defineField({
      name: 'altText',
      title: 'Alt text',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
    }),
  ],
})
