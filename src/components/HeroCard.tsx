import { timeAgo } from '../lib/time'
import type { Article } from '../lib/types'
import { Media } from './Media'

export function HeroCard({ article }: { article: Article }) {
  return (
    <a className="hero" href={article.link} target="_blank" rel="noopener noreferrer">
      <Media article={article} />
      <div className="hero-text">
        <p className="meta">
          <span className="kicker" data-category={article.category}>{article.category}</span>
          <span>{article.source} · {article.country} · {timeAgo(article.published)}</span>
        </p>
        <h2>{article.title}</h2>
      </div>
    </a>
  )
}
