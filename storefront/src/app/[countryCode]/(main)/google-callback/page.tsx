"use client" // include with Next.js 13

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { decodeToken } from "react-jwt"
import { sdk } from "@lib/config"

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()
  const [error, setError] = useState<string | null>(null)
  // for other than Next.js
  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return Object.fromEntries(searchParams.entries())
  }, [])

  const sendCallback = async () => {
    let token = ""

    try {
      token = await sdk.auth.callback(
        "customer",
        "google",
        // pass all query parameters received from the
        // third party provider
        queryParams
      )
    } catch (error) {
      alert("Authentication Failed")

      throw error
    }

    return token
  }

  const createCustomer = async (email: string) => {
    try {
      await sdk.store.customer.create({ email })
    } catch (error) {
      setError("Failed to create customer")
      console.error("Error al crear cliente:", error)
      throw error
    }
  }

  const refreshToken = async () => {
    // refresh the token
    const result = await sdk.auth.refresh()
  }

  const validateCallback = async () => {
    const token = await sendCallback()

    const shouldCreateCustomer =
      (decodeToken(token) as { actor_id: string }).actor_id === ""

    // Decodificar claramente el token JWT recibido
    const decodedToken = decodeToken(token) as Record<string, any>

    console.log("🔥 Token JWT decodificado COMPLETO:", decodedToken)

    if (shouldCreateCustomer) {
      await createCustomer(decodedToken.email)
      await refreshToken()
    }

    // all subsequent requests are authenticated
    const { customer: customerData } = await sdk.store.customer.retrieve()

    setCustomer(customerData)
    setLoading(false)
  }

  useEffect(() => {
    if (!loading) {
      return
    }

    validateCallback()
  }, [loading])

  return (
    <div>
      {loading && <span>Loading...</span>}
      {customer && <span>Created customer {customer.email} with Google.</span>}
    </div>
  )
}
