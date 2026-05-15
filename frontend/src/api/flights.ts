import client from './client'
import type { Flight } from '../types/flight'

export interface SearchParams {
  from_code: string
  to_code: string
  departure_date: string
  passengers: number
  cabin_class?: string
}

export async function searchFlights(params: SearchParams): Promise<Flight[]> {
  const { data } = await client.get('/flights', { params })
  return data
}
