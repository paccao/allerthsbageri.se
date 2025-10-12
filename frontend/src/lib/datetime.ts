export const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export const shortDate = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
})

export const timeFormat = new Intl.DateTimeFormat('sv-SE', {
  hour: '2-digit',
  minute: '2-digit',
})

export const weekdayShort = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'short',
})

export const weekdayAndDate = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
