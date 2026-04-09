export interface PaginatedLinksModel {
  first: string
  last: string
  prev: string | null
  next: string | null
}

interface PaginatedLinkModel {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedMetaModel {
  current_page: number
  from: number | null
  last_page: number
  links: PaginatedLinkModel[]
  path: string
  per_page: number
  to: number | null
  total: number
}

export interface PaginatedModel<T> {
  data: T[]
  links: PaginatedLinksModel
  meta: PaginatedMetaModel
}
