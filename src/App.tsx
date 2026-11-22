import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { CategoryChips } from './components/CategoryChips'
import { CountryPicker } from './components/CountryPicker'
import { Feed } from './components/Feed'
import { countriesFor, filterArticles } from './lib/filter'
import { timeAgo } from './lib/time'
import type { Article, Category } from './lib/types'

interface FeedData {
  generatedAt: string
  articles: Article[]
}

function App() {
  const [data, setData] = useState<FeedData>()
  const [failed, setFailed] = useState(false)
  const [category, setCategory] = useState<Category>()
  const [country, setCountry] = useState<string>()

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}feeds.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setData)
      .catch(() => setFailed(true))
  }, [])

  const countries = useMemo(() => countriesFor(data?.articles ?? [], category), [data, category])
  const visible = useMemo(() => filterArticles(data?.articles ?? [], { category, country }), [data, category, country])

  const pickCategory = (c?: Category) => {
    setCategory(c)
    if (country && !countriesFor(data?.articles ?? [], c).includes(country)) setCountry(undefined)
  }

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="app">
      <header>
        <p className="date">{today}</p>
        <h1>Today</h1>
        {data && <p className="updated">Updated {timeAgo(data.generatedAt)} ago</p>}
      </header>
      <nav className="filters">
        <CategoryChips value={category} onChange={pickCategory} />
        <CountryPicker countries={countries} value={country} onChange={setCountry} />
      </nav>
      {data ? (
        <Feed articles={visible} />
      ) : failed ? (
        <p className="state">Connect to the internet to load stories.</p>
      ) : (
        <p className="state">Loading…</p>
      )}
    </div>
  )
}

export default App
