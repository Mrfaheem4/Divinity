// src/renderer/src/handlers/handleNavigation.ts

export function goBack(): void {
  window.api.goBack()
}

export function goForward(): void {
  window.api.goForward()
}

export function reload(): void {
  window.api.reload()
}

export function goHome(): void {
  window.api.goHome()
}

export async function canGoBack(): Promise<boolean> {
  return window.api.canGoBack()
}

export async function canGoForward(): Promise<boolean> {
  return window.api.canGoForward()
}
