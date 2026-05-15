import uuid
from datetime import datetime, timezone, date, time

from sqlalchemy import String, Integer, Numeric, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    flight_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("flights.id"), nullable=False
    )
    booking_reference: Mapped[str] = mapped_column(
        String(10), unique=True, nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", index=True
    )
    passengers: Mapped[int] = mapped_column(Integer, default=1)
    selected_date: Mapped[date] = mapped_column(Date, nullable=False)
    selected_time: Mapped[time] = mapped_column(Time, nullable=False)
    baggage_type: Mapped[str] = mapped_column(String(20), default="carryon")
    extra_bags: Mapped[int] = mapped_column(Integer, default=0)
    flight_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    baggage_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Booking {self.booking_reference}>"
