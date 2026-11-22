export type Category =
  | 'world'
  | 'politics'
  | 'sport'
  | 'science'
  | 'tech'
  | 'business'
  | 'health'

export interface Article {
  id: string
  title: string
  link: string
  image?: string
  snippet: string
  source: string
  country: string
  category: Category
  published: string // ISO
}
