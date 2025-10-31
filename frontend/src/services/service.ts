import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types/api';
import { deleteCookie, getCookie } from '@/lib/cookie';

export const getToken = () => {
  try {
    return getCookie("XSRF-TOKEN") || ''
  } catch (e) {
    return ''
  }
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'Authorization': `Bearer ${getToken()}`
  },
  withCredentials: true,
  withXSRFToken: true,
  timeout: 10000,
});

client.defaults.xsrfCookieName = "XSRF-TOKEN"
client.defaults.xsrfHeaderName = "X-XSRF-TOKEN"

//
let csrfToken: Promise<void> | null = null
const fetchCsrf = () => {
  if (!csrfToken) csrfToken = client.get("/sanctum/csrf-cookie").then(() => undefined).finally(() => (csrfToken = null))
  return csrfToken
}

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const url = (config.url ?? "").replace(client.defaults.baseURL ?? "", "")
    const isCsrfCall = url.startsWith("/sanctum/csrf-cookie")
    if (!isCsrfCall && !getCookie("XSRF-TOKEN")) {
      await fetchCsrf()
    }
    return config
})

client.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (err.response?.status === 419 && !original?._retry) {
      original._retry = true
      await fetchCsrf()
      return client(original)
    }
    return Promise.reject(err)
  }
)

function getErrorMessage(err: AxiosError): string {
  const data = err.response?.data as any
  if (typeof data === "string") return data
  if (data?.message) return data.message
  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0]
    const first = data.errors[firstKey]
    return Array.isArray(first) ? first[0] : String(first)
  }
  return err.response?.statusText || err.message
}

export const errorValidation = (e : unknown) => {
  try {
    if (axios.isAxiosError<ApiError>(e)) {
      if (e.status == 401) { deleteCookie('XSRF-TOKEN') }
      if (e.status == 405) { deleteCookie('XSRF-TOKEN') }
      return { error: getErrorMessage(e) }
    }
    return { error: "There is problem with server connection" };
  } catch (error) {
    return { error: "There is problem with server connection" };
  }
}

