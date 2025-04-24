import Medusa from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}
console.log(
  "[build] NEXT_PUBLIC_MEDUSA_BACKEND_URL =",
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)
console.log(
  "[build] NEXT_PUBLIC_SEARCH_ENDPOINT    =",
  process.env.NEXT_PUBLIC_SEARCH_ENDPOINT
)
console.log(
  "[build] MEILISEARCH_API_KEY           =",
  process.env.MEILISEARCH_API_KEY
)

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
