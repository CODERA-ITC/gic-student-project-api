export interface PaginatedResponse<T> {
  page: number
  limit: number
  total: number
  lastPage?: number // optional, in case API doesn't always provide it
  data: T[]
}
