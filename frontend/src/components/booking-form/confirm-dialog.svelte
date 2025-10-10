<script lang="ts">
  import * as AlertDialog from '$components/ui/alert-dialog'

  export type ConfirmDialogState = {
    title: string
    description: string
    cancelLabel?: string
    confirmLabel?: string
    onResult: (result: boolean) => void
  }

  type Props = {
    dialog: ConfirmDialogState | null
  }

  let { dialog }: Props = $props()
  let cancelButton = $state<HTMLButtonElement>()

  $inspect(cancelButton)
</script>

{#if dialog}
  <AlertDialog.Root
    open
    onOpenChange={(isOpen) => {
      if (isOpen === false && dialog) {
        dialog.onResult(false)
      }
    }}
  >
    <AlertDialog.Content
      interactOutsideBehavior="close"
      onOpenAutoFocus={(e) => {
        e.preventDefault()
        cancelButton?.focus?.()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Title>{dialog.title}</AlertDialog.Title>
        <AlertDialog.Description>{dialog.description}</AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel
          ref={cancelButton}
          onclick={() => dialog.onResult(false)}
          >{dialog.cancelLabel ?? 'Avbryt'}</AlertDialog.Cancel
        >
        <AlertDialog.Action onclick={() => dialog.onResult(true)}
          >{dialog.confirmLabel ?? 'Fortsätt'}</AlertDialog.Action
        >
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}
