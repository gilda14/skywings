from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, union

from app.database import get_db
from app.models.flight import Flight

router = APIRouter(prefix="/api/airports", tags=["airports"])


@router.get("")
async def search_airports(
    q: str = Query("", min_length=0),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, str]]:
    base = union(
        select(Flight.from_code.label("code"), Flight.from_city.label("city")),
        select(Flight.to_code.label("code"), Flight.to_city.label("city")),
    ).subquery()

    stmt = select(base.c.code, base.c.city).distinct().order_by("city")

    if q:
        term = f"{q.upper()}%"
        stmt = stmt.where(
            (base.c.code.like(term)) | (base.c.city.ilike(term))
        )
    else:
        stmt = stmt.limit(20)

    result = await db.execute(stmt)
    rows = result.all()

    seen: set[str] = set()
    airports: list[dict[str, str]] = []
    for r in rows:
        if r.code not in seen:
            seen.add(r.code)
            airports.append({"code": r.code, "city": r.city, "label": f"{r.city} ({r.code})"})

    return airports
