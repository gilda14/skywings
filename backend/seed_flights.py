"""Seed the database with sample flights."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import date, datetime, time, timedelta, timezone
from sqlalchemy import select
from app.database import async_session
from app.models.flight import Flight

FLIGHTS = [
    {"flight_number": "SW101", "airline": "SkyWings", "from_code": "JFK", "from_city": "New York", "to_code": "LAX", "to_city": "Los Angeles", "hour": 8, "duration": 360, "stops": 0, "cabin": "economy", "price": 299.00, "seats": 180},
    {"flight_number": "SW102", "airline": "SkyWings", "from_code": "JFK", "from_city": "New York", "to_code": "LAX", "to_city": "Los Angeles", "hour": 14, "duration": 360, "stops": 1, "cabin": "economy", "price": 249.00, "seats": 180},
    {"flight_number": "SW103", "airline": "SkyWings", "from_code": "JFK", "from_city": "New York", "to_code": "LAX", "to_city": "Los Angeles", "hour": 19, "duration": 360, "stops": 0, "cabin": "business", "price": 899.00, "seats": 60},
    {"flight_number": "SW201", "airline": "SkyWings", "from_code": "LAX", "from_city": "Los Angeles", "to_code": "JFK", "to_city": "New York", "hour": 7, "duration": 370, "stops": 0, "cabin": "economy", "price": 319.00, "seats": 180},
    {"flight_number": "SW202", "airline": "SkyWings", "from_code": "LAX", "from_city": "Los Angeles", "to_code": "JFK", "to_city": "New York", "hour": 15, "duration": 370, "stops": 1, "cabin": "economy", "price": 269.00, "seats": 180},
    {"flight_number": "SW301", "airline": "SkyWings", "from_code": "JFK", "from_city": "New York", "to_code": "ORD", "to_city": "Chicago", "hour": 9, "duration": 150, "stops": 0, "cabin": "economy", "price": 149.00, "seats": 160},
    {"flight_number": "SW302", "airline": "SkyWings", "from_code": "JFK", "from_city": "New York", "to_code": "ORD", "to_city": "Chicago", "hour": 16, "duration": 150, "stops": 0, "cabin": "economy", "price": 129.00, "seats": 160},
    {"flight_number": "SW401", "airline": "SkyWings", "from_code": "JFK", "from_city": "New York", "to_code": "MIA", "to_city": "Miami", "hour": 10, "duration": 180, "stops": 0, "cabin": "economy", "price": 199.00, "seats": 170},
    {"flight_number": "SW402", "airline": "SkyWings", "from_code": "JFK", "from_city": "New York", "to_code": "MIA", "to_city": "Miami", "hour": 18, "duration": 180, "stops": 0, "cabin": "business", "price": 549.00, "seats": 50},
    {"flight_number": "SW501", "airline": "SkyWings", "from_code": "LAX", "from_city": "Los Angeles", "to_code": "ORD", "to_city": "Chicago", "hour": 8, "duration": 240, "stops": 0, "cabin": "economy", "price": 229.00, "seats": 180},
    {"flight_number": "SW502", "airline": "SkyWings", "from_code": "LAX", "from_city": "Los Angeles", "to_code": "ORD", "to_city": "Chicago", "hour": 13, "duration": 260, "stops": 1, "cabin": "economy", "price": 199.00, "seats": 180},
    {"flight_number": "SW601", "airline": "SkyWings", "from_code": "LAX", "from_city": "Los Angeles", "to_code": "MIA", "to_city": "Miami", "hour": 6, "duration": 300, "stops": 0, "cabin": "economy", "price": 349.00, "seats": 190},
    {"flight_number": "SW602", "airline": "SkyWings", "from_code": "LAX", "from_city": "Los Angeles", "to_code": "MIA", "to_city": "Miami", "hour": 22, "duration": 300, "stops": 0, "cabin": "business", "price": 999.00, "seats": 50},
    {"flight_number": "SW701", "airline": "SkyWings", "from_code": "ORD", "from_city": "Chicago", "to_code": "MIA", "to_city": "Miami", "hour": 9, "duration": 170, "stops": 0, "cabin": "economy", "price": 159.00, "seats": 160},
    {"flight_number": "SW702", "airline": "SkyWings", "from_code": "ORD", "from_city": "Chicago", "to_code": "MIA", "to_city": "Miami", "hour": 17, "duration": 170, "stops": 0, "cabin": "economy", "price": 139.00, "seats": 160},
    {"flight_number": "SW801", "airline": "SkyWings", "from_code": "ORD", "from_city": "Chicago", "to_code": "LAX", "to_city": "Los Angeles", "hour": 7, "duration": 250, "stops": 0, "cabin": "economy", "price": 219.00, "seats": 180},
    {"flight_number": "SW802", "airline": "SkyWings", "from_code": "ORD", "from_city": "Chicago", "to_code": "LAX", "to_city": "Los Angeles", "hour": 19, "duration": 250, "stops": 0, "cabin": "business", "price": 699.00, "seats": 60},
    {"flight_number": "SW901", "airline": "SkyWings", "from_code": "MIA", "from_city": "Miami", "to_code": "JFK", "to_city": "New York", "hour": 8, "duration": 175, "stops": 0, "cabin": "economy", "price": 189.00, "seats": 170},
    {"flight_number": "SW902", "airline": "SkyWings", "from_code": "MIA", "from_city": "Miami", "to_code": "JFK", "to_city": "New York", "hour": 20, "duration": 175, "stops": 0, "cabin": "economy", "price": 169.00, "seats": 170},
    {"flight_number": "SW1001", "airline": "SkyWings", "from_code": "MIA", "from_city": "Miami", "to_code": "ORD", "to_city": "Chicago", "hour": 10, "duration": 165, "stops": 0, "cabin": "economy", "price": 149.00, "seats": 160},
]


async def seed():
    async with async_session() as session:
        existing = await session.execute(select(Flight).limit(1))
        if existing.scalar_one_or_none() is not None:
            print("Flights already seeded.")
            return

        today = date.today()
        for day_offset in range(7):
            flight_date = today + timedelta(days=day_offset)
            suffix = str(day_offset + 1)
            for f in FLIGHTS:
                dep = datetime(flight_date.year, flight_date.month, flight_date.day, f["hour"], 0, tzinfo=timezone.utc)
                arr = dep + timedelta(minutes=f["duration"])
                flight = Flight(
                    flight_number=f"{f['flight_number']}-{suffix}",
                    airline=f["airline"],
                    from_code=f["from_code"],
                    from_city=f["from_city"],
                    to_code=f["to_code"],
                    to_city=f["to_city"],
                    departure=dep,
                    arrival=arr,
                    duration_min=f["duration"],
                    stops=f["stops"],
                    cabin_class=f["cabin"],
                    base_price=f["price"],
                    seats_total=f["seats"],
                    seats_available=f["seats"],
                )
                session.add(flight)
        await session.commit()
        print(f"Seeded {len(FLIGHTS) * 7} flights.")


if __name__ == "__main__":
    asyncio.run(seed())
