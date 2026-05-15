from datetime import datetime
from pydantic import BaseModel


class FlightOut(BaseModel):
    id: str
    flight_number: str
    airline: str
    from_code: str
    from_city: str
    to_code: str
    to_city: str
    departure: datetime
    arrival: datetime
    duration_min: int
    stops: int
    cabin_class: str
    base_price: float
    seats_available: int


class FlightSearchParams(BaseModel):
    from_code: str
    to_code: str
    date: str
    passengers: int = 1
    cabin_class: str | None = None
