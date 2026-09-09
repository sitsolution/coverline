import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings

logging.basicConfig(level=logging.INFO if settings.DEBUG else logging.WARNING)

app = FastAPI(
    title="Coverline API",
    description="Backend for the Coverline mobile app and admin dashboard.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Flatten FastAPI's validation errors into `{field: message}`.

    The mobile forms key their error state by field name, so this maps
    straight onto the shape the screens already render.
    """
    fields: dict[str, str] = {}
    for error in exc.errors():
        location = [str(part) for part in error["loc"] if part not in ("body", "query", "path")]
        field = ".".join(location) or "detail"
        # Pydantic prefixes custom validator messages with "Value error, ".
        message = error["msg"].removeprefix("Value error, ")
        fields.setdefault(field, message)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": next(iter(fields.values()), "Validation failed"),
            "fields": fields,
        },
    )


app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "coverline-api", "version": app.version}
