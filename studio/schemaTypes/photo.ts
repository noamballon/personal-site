import {orderRankField} from '@sanity/orderable-document-list'

export default {
  name: 'gallery',
  title: 'Collection',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        }
      ]
    },
    orderRankField({type: 'gallery'}),
  ]
}
