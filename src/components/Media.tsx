import { useState } from 'react'
import type { Article } from '../lib/types'

export function Media({ article }: { article: Article }) {
  const [failed, setFailed] = useState(false)
  if (!article.image || failed) {
    return (
      <div className="media media-fallback" data-category={article.category} data-testid="image-fallback" aria-hidden="true">
        <span>{article.source.charAt(0)}</span>
      </div>
    )
  }
  return (
    <div className="media">
      <img src={article.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    </div>
  )
}
