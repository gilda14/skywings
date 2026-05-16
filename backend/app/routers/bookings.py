import uuid
import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.flight import Flight
from app.models.booking import Booking
from app.models.payment import Payment
from app.dependencies import get_current_user
from app.schemas.booking import BookingCreate, BookingOut

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _generate_reference(length: int = 6) -> str:
    chars = string.ascii_uppercase + string.digits
    return "SKW" + "".join(random.choices(chars, k=length))


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookingOut:
    result = await db.execute(select(Flight).where(Flight.id == body.flight_id))
    flight = result.scalar_one_or_none()
    if flight is None or not flight.active:
        raise HTTPException(status_code=404, detail="Flight not found")

    if flight.seats_available < body.passengers:
        raise HTTPException(status_code=400, detail="Not enough seats available")

    flight_price = float(flight.base_price) * body.passengers
    total_price = flight_price + body.baggage_price

    booking = Booking(
        user_id=current_user.id,
        flight_id=flight.id,
        booking_reference=_generate_reference(),
        status="confirmed",
        passengers=body.passengers,
        selected_date=flight.departure.date(),
        selected_time=flight.departure.time(),
        baggage_type=body.baggage_type,
        flight_price=flight_price,
        baggage_price=body.baggage_price,
        total_price=total_price,
    )
    db.add(booking)
    await db.flush()

    payment = Payment(
        booking_id=booking.id,
        user_id=current_user.id,
        method=body.payment_method,
        amount=total_price,
        currency="USD",
        status="completed",
        transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
    )
    db.add(payment)

    flight.seats_available -= body.passengers

    await db.commit()
    await db.refresh(booking)

    return BookingOut(
        id=str(booking.id),
        booking_reference=booking.booking_reference,
        status=booking.status,
        flight_number=flight.flight_number,
        airline=flight.airline,
        from_code=flight.from_code,
        from_city=flight.from_city,
        to_code=flight.to_code,
        to_city=flight.to_city,
        departure=flight.departure.isoformat(),
        arrival=flight.arrival.isoformat(),
        cabin_class=flight.cabin_class,
        passengers=booking.passengers,
        baggage_type=booking.baggage_type,
        flight_price=float(booking.flight_price),
        baggage_price=float(booking.baggage_price),
        total_price=float(booking.total_price),
        created_at=booking.created_at.isoformat(),
    )
