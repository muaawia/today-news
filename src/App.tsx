import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { CategoryChips } from './components/CategoryChips'
import { CountryPicker } from './components/CountryPicker'
import { Feed } from './components/Feed'
import { countriesFor, filterArticles } from './lib/filter'
import { timeAgo } from './lib/time'
import type { Article, Category } from './lib/types'

const STALE_MS = 15 * 60_000

interface FeedData {
  generatedAt: string
  articles: Article[]
}

function App() {
  const [data, setData] = useState<FeedData>()
  const [failed, setFailed] = useState(false)
  const [category, setCategory] = useState<Category>()
  const [country, setCountry] = useState<string>()

  const load = useCallback(() => {
    // no-cache: revalidate with the server so GitHub Pages' 10-minute HTTP cache can't pin an old feed
    fetch(`${import.meta.env.BASE_URL}feeds.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setData)
      .catch(() => setFailed(true))
  }, [])

  useEffect(() => load(), [load])

  // An installed iOS app is resumed, not reloaded: refresh when it comes back and the feed is stale.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && data && Date.now() - Date.parse(data.generatedAt) > STALE_MS) load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [data, load])

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
