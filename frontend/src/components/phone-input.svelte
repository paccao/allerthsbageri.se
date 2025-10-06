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
    /** The intitial phone number */
    defaultValue: string
    /** Will be called with the updated number in E164 format (e.g. starting with the +46 country code) */
    onChange: (newNumber: string) => void
    validationError?: string | undefined
  }

  let {
    defaultValue,
    onChange,
    validationError = $bindable(),
    class: className,
    ...restProps
  }: Props = $props()

  let element: HTMLInputElement
  let iti: Iti = $state()!
  let ready = $state(false)

  onMount(() => {
    const isE164Number = defaultValue.startsWith('+')
    element.value = defaultValue

    // Improve UX when the defaultValue is set by only showing the number once it has been formatted
    // This makes the loading UX smoother than if we rapidly show multiple number formats
    if (isE164Number) {
      let proto = Object.getPrototypeOf(element)
      let get = Object.getOwnPropertyDescriptor(proto, 'value')!.get!
      let set = Object.getOwnPropertyDescriptor(proto, 'value')!.set!

      Object.defineProperty(element, 'value', {
        get,
        set(v: string) {
          // Make sure the phone number has been formatted
          if (v !== defaultValue) {
            ready = true
            // Remove this proxy and use the original getter and setter
            Object.defineProperty(element, 'value', {
              get,
              set,
            })
          }

          return set?.apply(this, arguments as any)
        },
        configurable: true,
      })
    }

    iti = intlTelInput(element, {
      i18n: sv,
      ...(isE164Number ? {} : { initialCountry: 'se' }),
      nationalMode: true,
      autoPlaceholder: 'aggressive',
      countryOrder: ['se', 'no', 'dk', 'fi', 'de', ...EUROPEAN_COUNTRIES],
      loadUtils: () => import('intl-tel-input/utils'),
    })

    if (isE164Number) {
      iti.handleAutoCountry()
    } else {
      ready = true
      iti = null!
    }
  })

  // IDEA: Maybe simplify the error messages. Might be enough to just show if it's valid or not.
  // However, could also be helpful with more specific errors since we have them.
  const errorMap = [
    'Felaktigt telfonnummer',
    'Ogiltig landskod',
    'För kort',
    'För långt',
    'Felaktigt telfonnummer',
  ]

  onDestroy(() => {
    try {
      iti.destroy()
      // NOTE: (development only): The iti.destroy() crashes with the Astro + Svelte HMR
      // Possible memory leak, but should be fine since this only affects development.
      // This problem could be related to how Astro Islands work with Svelte during dev.
      // Switching to SvelteKit might help resolve this issue.
    } catch {
      // Manually clean up old elements to prevent visual duplicates of for example flags.
      document
        .querySelectorAll('.iti:not(&:last-of-type)')
        .forEach((wrapper) => wrapper.remove())
    }
  })
</script>

<input
  type="tel"
  bind:this={element}
  class={className}
  style:color={ready ? undefined : 'transparent'}
  {...restProps}
  oninput={ready
    ? () => {
        onChange(iti.getNumber(intlTelInput.utils?.numberFormat.E164))
        validationError = iti.isValidNumber()
          ? undefined
          : errorMap[iti.getValidationError()]
      }
    : null}
  placeholder="070-123 45 67"
/>

<style>
  :global(.iti__search-input) {
    height: 40px;
  }
</style>
