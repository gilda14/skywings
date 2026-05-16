from datetime import date, time

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    flight_id: str
    passengers: int = Field(default=1, ge=1)
    baggage_type: str = "carryon"
    baggage_price: float = 0
    payment_method: str = "card"


class BookingOut(BaseModel):
    id: str
    booking_reference: str
    status: str
    flight_number: str
    airline: str
    from_code: str
    from_city: str
    to_code: str
    to_city: str
    departure: str
    arrival: str
    cabin_class: str
    passengers: int
    baggage_type: str
    flight_price: float
    baggage_price: float
    total_price: float
    created_at: str
