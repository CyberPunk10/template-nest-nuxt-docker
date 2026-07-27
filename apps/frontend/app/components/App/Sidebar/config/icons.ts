export const ICON_MAP: Record<string, string> = {
  home: 'lucide:house',
  help: 'lucide:circle-help',
  out: 'lucide:log-out',
  'no-photo-avatar': 'lucide:user-round',
  close: 'lucide:x',
  'light-theme': 'lucide:sun',
  'light-sand-theme': 'lucide:coffee',
  'light-mist-theme': 'lucide:cloud',
  'light-rose-theme': 'lucide:flower-2',
  'dark-theme': 'lucide:moon',
  'system-theme': 'lucide:monitor',
  'dark-slate-theme': 'lucide:gem',
  'dark-midnight-theme': 'lucide:github',
  'dark-ocean-theme': 'lucide:waves',
  'dark-nuxt-theme': 'lucide:triangle',
  chevron: 'lucide:chevron-right',
  'chevron-back': 'lucide:chevron-left',
  checkmark: 'lucide:check',
}

export function resolveIcon(type: string): string {
  if (ICON_MAP[type]) return ICON_MAP[type]
  if (type.includes(':')) return type
  return `lucide:${type}`
}
