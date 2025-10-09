<script lang="ts">
  import * as AlertDialog from '$components/ui/alert-dialog'

  type Props = {
    title: string
    description: string
  }

  type OnResult = (result: boolean) => void
  let { title, description }: Props = $props()

  let open = $state(false)
  let callback = $state<OnResult | null>(null)

  export function show(onResult: OnResult) {
    open = true
    callback = onResult
  }

  function hide(result: boolean) {
    open = false
    callback!(result)
    callback = null
  }
</script>

<AlertDialog.Root
  bind:open
  onOpenChange={(isOpen) => {
    if (isOpen === false) {
      callback!(false)
      callback = null
    }
  }}
>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel autofocus onclick={() => hide(false)}
        >Avbryt</AlertDialog.Cancel
      >
      <AlertDialog.Action onclick={() => hide(true)}
        >Fortsätt</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
