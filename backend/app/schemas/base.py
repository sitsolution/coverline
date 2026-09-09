from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for every request/response schema.

    Both clients are TypeScript, so the wire format is camelCase while Python
    stays snake_case. ``populate_by_name`` means server-side construction with
    snake_case keyword arguments still works.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class MessageResponse(CamelModel):
    message: str


class CountResponse(CamelModel):
    count: int
