import type { Article } from '../lib/types'
import { ArticleCard } from './ArticleCard'
import { HeroCard } from './HeroCard'

export function Feed({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="state">No stories here yet. Try another category or country.</p>
  }
  const [first, ...rest] = articles
  return (
    <main className="feed">
      <HeroCard article={first} />
      {rest.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </main>
  )
}
