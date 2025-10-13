<script lang="ts" module>
  import { parse } from '$lib/base64'

  let decrypted: Promise<string> | undefined = undefined

  const pl = import.meta.env.PUBLIC_PAYLOAD
  const pwd = import.meta.env.PUBLIC_PASSWORD

  if (!pl || !pwd) throw new Error('EncryptedEmail.svelte: Missing data')

  async function deriveKey(salt: Uint8Array, password: string) {
    const encoder = new TextEncoder()
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey'],
    )
    return await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 2e5, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    )
  }

  async function decrypt(pl: string, password: string) {
    const decoder = new TextDecoder()

    const bytes = parse(pl)
    const salt = bytes.slice(0, 32)
    const iv = bytes.slice(32, 32 + 16)
    const ciphertext = bytes.slice(32 + 16)

    const key = await deriveKey(salt, password)

    const data = new Uint8Array(
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext),
    )
    if (!data) throw 'Malformed data'

    return decoder.decode(data)
  }

  async function getDecryptedEmail(pl: string, password: string) {
    // Only decrypt once and then re-use the result
    return decrypted ? decrypted : decrypt(pl, password)
  }

  let email = $state('')
  let label = $state('Visa mail')

  /**
   * Call a function once and then remove it.
   * This is useful for event handlers that should only run once.
   */
  function once(fn: Function) {
    return function (this: Function, event: Event) {
      if (fn) fn.call(this, event)
      // @ts-expect-error
      fn = null
    }
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'

  type Props = {
    class?: string
  }
  const { class: className = '' }: Props = $props()

  let href = $state('#')

  function showEmail(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (event.isTrusted) {
      href = 'mailto:' + email
      label = email
    }
  }

  onMount(async () => {
    if (!email) {
      email = await getDecryptedEmail(pl, pwd)
    }
  })

  let handler = once(showEmail)
</script>

<svelte:window
  onscroll={handler}
  onpointermove={handler}
  onpointerenter={handler}
/>

<a
  {href}
  onpointerenter={handler}
  onfocusin={handler}
  class="text-center text-green-500 underline-offset-2 hover:underline focus:underline {className}"
>
  <span class="whitespace-nowrap">
    {label}
  </span>
</a>
