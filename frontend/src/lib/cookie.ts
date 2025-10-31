export function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

export function deleteCookie(name: string, opts?: { path?: string; domain?: string }) {
  const path = opts?.path ?? "/";
  const domain = opts?.domain ? `; domain=${opts.domain}` : "";
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain}`;
}
