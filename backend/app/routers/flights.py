from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.sql import func

from app.database import get_db
from app.models.flight import Flight
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.flight import FlightOut

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("", response_model=list[FlightOut])
async def search_flights(
    from_code: str = Query(..., min_length=3, max_length=3),
    to_code: str = Query(..., min_length=3, max_length=3),
    departure_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    passengers: int = Query(1, ge=1),
    cabin_class: str | None = Query(None),
    _current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[FlightOut]:
    filters = [
        Flight.from_code == from_code.upper(),
        Flight.to_code == to_code.upper(),
        func.date(Flight.departure) == date.fromisoformat(departure_date),
        Flight.seats_available >= passengers,
        Flight.active == True,  # noqa: E712
    ]
    if cabin_class:
        filters.append(Flight.cabin_class == cabin_class)

    result = await db.execute(
        select(Flight).where(*filters).order_by(Flight.departure)
    )
    flights = result.scalars().all()

    return [
        FlightOut(
            id=str(f.id),
            flight_number=f.flight_number,
            airline=f.airline,
            from_code=f.from_code,
            from_city=f.from_city,
            to_code=f.to_code,
            to_city=f.to_city,
            departure=f.departure,
            arrival=f.arrival,
            duration_min=f.duration_min,
            stops=f.stops,
            cabin_class=f.cabin_class,
            base_price=float(f.base_price),
            seats_available=f.seats_available,
        )
        for f in flights
    ]
