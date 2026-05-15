import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, Numeric, Boolean, DateTime, Time
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Flight(Base):
    __tablename__ = "flights"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    flight_number: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    airline: Mapped[str] = mapped_column(String(100), nullable=False)
    from_code: Mapped[str] = mapped_column(String(3), nullable=False, index=True)
    from_city: Mapped[str] = mapped_column(String(100), nullable=False)
    to_code: Mapped[str] = mapped_column(String(3), nullable=False, index=True)
    to_city: Mapped[str] = mapped_column(String(100), nullable=False)
    departure: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    arrival: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False)
    stops: Mapped[int] = mapped_column(Integer, default=0)
    cabin_class: Mapped[str] = mapped_column(String(30), nullable=False)
    base_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    seats_total: Mapped[int] = mapped_column(Integer, nullable=False)
    seats_available: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f"<Flight {self.flight_number} {self.from_code}→{self.to_code}>"
