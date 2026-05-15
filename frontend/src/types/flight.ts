export interface Flight {
  id: string
  flight_number: string
  airline: string
  from_code: string
  from_city: string
  to_code: string
  to_city: string
  departure: string
  arrival: string
  duration_min: number
  stops: number
  cabin_class: string
  base_price: number
  seats_available: number
}
