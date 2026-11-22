export function CountryPicker({
  countries,
  value,
  onChange,
}: {
  countries: string[]
  value?: string
  onChange: (c?: string) => void
}) {
  return (
    <label className="country">
      <span aria-hidden="true">🌍</span>
      <select aria-label="Country" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </label>
  )
}
