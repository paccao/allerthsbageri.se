import { ZonedDateTime, parseZonedDateTime } from '@internationalized/date'

export const transport = {
  ZonedDateTime: {
    encode: (value: ZonedDateTime) =>
      value instanceof ZonedDateTime && value.toString(),
    decode: (value: string) => parseZonedDateTime(value),
  },
}
