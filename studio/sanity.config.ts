import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'
import {MediaDetailsWithDate} from './components/MediaDetailsWithDate'

export default defineConfig({
  name: 'default',
  title: 'personal-site',

  projectId: 'kbtjnt3r',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({
              type: 'gallery',
              title: 'Collections',
              S,
              context,
            }),
          ]),
    }),
    visionTool(),
    media({
      creditLine: {enabled: false},
      components: {
        details: MediaDetailsWithDate,
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
