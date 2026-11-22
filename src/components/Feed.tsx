import type { Article } from '../lib/types'
import { ArticleCard } from './ArticleCard'
import { HeroCard } from './HeroCard'

export function Feed({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="state">No stories here yet. Try another category or country.</p>
  }
  // lead with the newest story that has a photo; fall back to the newest story
  const heroAt = Math.max(0, articles.findIndex((a) => a.image))
  const hero = articles[heroAt]
  const rest = articles.filter((_, i) => i !== heroAt)
  return (
    <main className="feed">
      <HeroCard article={hero} />
      {rest.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </main>
  )
}
