import type { Article, Category } from './types'

export function filterArticles(
  articles: Article[],
  opts: { category?: Category; country?: string },
): Article[] {
  return articles
    .filter((a) => (!opts.category || a.category === opts.category) && (!opts.country || a.country === opts.country))
    .sort((a, b) => b.published.localeCompare(a.published))
}

export function countriesFor(articles: Article[], category?: Category): string[] {
  const set = new Set(articles.filter((a) => !category || a.category === category).map((a) => a.country))
  return [...set].sort()
}
