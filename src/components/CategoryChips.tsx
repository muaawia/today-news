import type { Category } from '../lib/types'

export const CATEGORIES: Category[] = ['world', 'politics', 'sport', 'science', 'tech', 'business', 'health']

const label = (c: string) => c.charAt(0).toUpperCase() + c.slice(1)

export function CategoryChips({ value, onChange }: { value?: Category; onChange: (c?: Category) => void }) {
  return (
    <div className="chips" role="group" aria-label="Categories">
      <button type="button" aria-pressed={!value} onClick={() => onChange(undefined)}>All</button>
      {CATEGORIES.map((c) => (
        <button key={c} type="button" aria-pressed={value === c} onClick={() => onChange(c)}>
          {label(c)}
        </button>
      ))}
    </div>
  )
}
