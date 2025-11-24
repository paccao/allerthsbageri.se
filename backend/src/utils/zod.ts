import parsePhoneNumberFromString from 'libphonenumber-js'
import { z } from 'zod'

export const zPhone = z.string().transform<string>((arg, ctx) => {
  const phone = parsePhoneNumberFromString(arg.trim(), {
    // Use this default country when the phone number omits country code
    defaultCountry: 'SE',

    // Set to false to require that the whole string is exactly a phone number
    // Otherwise, it will search for a phone number anywhere within the string
    extract: false,
  })

  if (phone?.isValid()) {
    return phone.number
  }

  ctx.addIssue({
    code: 'custom',
    message: 'Invalid phone number',
  })
  return z.NEVER
})
