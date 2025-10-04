<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import intlTelInput, { type Iti } from 'intl-tel-input'
  import 'intl-tel-input/build/css/intlTelInput.css'
  import sv from 'intl-tel-input/i18n/sv'

  const EUROPEAN_COUNTRIES: NonNullable<
    Parameters<typeof intlTelInput>[1]
  >['onlyCountries'] = [
    'al',
    'ad',
    'at',
    'by',
    'be',
    'ba',
    'bg',
    'hr',
    'cz',
    'dk',
    'ee',
    'fo',
    'fi',
    'fr',
    'de',
    'gi',
    'gr',
    'va',
    'hu',
    'is',
    'ie',
    'it',
    'lv',
    'li',
    'lt',
    'lu',
    'mk',
    'mt',
    'md',
    'mc',
    'me',
    'nl',
    'no',
    'pl',
    'pt',
    'ro',
    'ru',
    'sm',
    'rs',
    'sk',
    'si',
    'es',
    'se',
    'ch',
    'ua',
    'gb',
  ]

  // TODO: allow passing in the same props as regular tel inputs: class, name, id, required etc. Props should extend the HTML element.
  let element: HTMLInputElement
  let iti: Iti

  onMount(() => {
    iti = intlTelInput(element, {
      i18n: sv,
      initialCountry: 'se',
      nationalMode: true,
      strictMode: true,
      countryOrder: ['se', 'no', 'dk', 'fi', 'de', ...EUROPEAN_COUNTRIES],
      loadUtils: () => import('intl-tel-input/utils'),
    })
  })

  onDestroy(() => {
    iti.destroy()
  })
</script>

<input type="tel" bind:this={element} class="h-10 leading-8 text-lg" />

<style>
  :global(.iti__search-input) {
    height: 40px;
  }
</style>
