// Precompiled once, not on every call
const SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//
const SAFE_SCHEMES = new Set(['http', 'https', 'ftp', 'ftps', 'mailto', 'file'])

const WHITESPACE_RE = /\s/
const LOCALHOST_RE = /^localhost(:\d+)?(\/.*)?$/i
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(:\d+)?(\/.*)?$/
const IPV6_RE = /^\[([a-fA-F0-9:]+)\](:\d+)?(\/.*)?$/
const DOMAIN_RE = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?([/?].*)?$/

function isValidIPv4(input: string): boolean {
  const m = input.match(IPV4_RE)
  if (!m) return false
  return [m[1], m[2], m[3], m[4]].every((octet) => Number(octet) <= 255)
}

export function handleSearch(raw: string): string {
  const input = raw.trim()
  if (!input) {
    return buildSearchUrl('')
  }

  // 1. Already has a scheme — only trust it if the scheme is one we
  //    actually want to navigate to. Otherwise treat the raw text as a
  //    search query so `javascript:...`, `data:...`, `vbscript:...` etc.
  //    can't be smuggled through as "already a URL".
  const schemeMatch = input.match(SCHEME_RE)
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase()
    return SAFE_SCHEMES.has(scheme) ? input : buildSearchUrl(input)
  }

  // 2. Contains a space — definitely a search query, not a URL
  if (WHITESPACE_RE.test(input)) {
    return buildSearchUrl(input)
  }

  // 3. localhost, with or without a port and/or path
  if (LOCALHOST_RE.test(input)) {
    return `http://${input}`
  }

  // 4. IPv6 in brackets, e.g. [::1]:8080/path
  if (IPV6_RE.test(input)) {
    return `http://${input}`
  }

  // 5. IPv4, with or without a port and/or path — validate octet range
  if (isValidIPv4(input)) {
    return `http://${input}`
  }

  // 6. Looks like a domain: something.something, optionally with port, path, or query string
  if (DOMAIN_RE.test(input)) {
    return `https://${input}`
  }

  // 7. Everything else — treat as a search query
  return buildSearchUrl(input)
}

function buildSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}
