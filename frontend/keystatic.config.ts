import { config, singleton, fields } from '@keystatic/core'

/** See https://keystatic.com/docs/configuration */
export default config({
  storage: {
    kind: 'local',
  },
  singletons: {
    settings: singleton({
      label: '⚙️ Inställningar',
      path: 'src/content/settings',
      schema: {
        siteName: fields.text({
          label: 'Namn på hemsidan',
          validation: { isRequired: true },
        }),
      },
    }),
  },
})
