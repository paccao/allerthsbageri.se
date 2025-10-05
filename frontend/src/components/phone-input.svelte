<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import intlTelInput, { type Iti } from 'intl-tel-input'
  import 'intl-tel-input/build/css/intlTelInput.css'
  import sv from 'intl-tel-input/i18n/sv'
  import type { HTMLInputAttributes } from 'svelte/elements'

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

  interface Props extends HTMLInputAttributes {
    value: string
  }

  let element: HTMLInputElement
  let iti: Iti = $state()!

  let { value = $bindable(), ...restProps }: Props = $props()

  onMount(() => {
    iti = intlTelInput(element, {
      i18n: sv,
      initialCountry: 'se',
      nationalMode: true,
      countryOrder: ['se', 'no', 'dk', 'fi', 'de', ...EUROPEAN_COUNTRIES],
      loadUtils: () => import('intl-tel-input/utils'),
    })
  })

  onDestroy(() => {
    iti.destroy()
  })
</script>

<input
  type="tel"
  bind:this={element}
  class="h-10"
  {...restProps}
  oninput={() => (value = iti.getNumber(intlTelInput.utils?.numberFormat.E164))}
  {value}
/>

<style>
  :global(.iti__search-input) {
    height: 40px;
  }
</style>
