import { timeAgo } from '../lib/time'
import type { Article } from '../lib/types'
import { Media } from './Media'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <a className="card" href={article.link} target="_blank" rel="noopener noreferrer">
      <div className="card-text">
        <p className="meta">
          <span className="kicker" data-category={article.category}>{article.category}</span>
          <span>{article.source} · {article.country} · {timeAgo(article.published)}</span>
        </p>
        <h3>{article.title}</h3>
        {article.snippet && <p className="snippet">{article.snippet}</p>}
      </div>
      <Media article={article} />
    </a>
  )
}
