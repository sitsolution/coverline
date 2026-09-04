"""Local-disk file storage for uploaded documents.

Files land under ``settings.UPLOAD_DIR`` in a per-user subdirectory with a
random name — the original filename is kept in the database, never on disk, so
a hostile filename cannot escape the upload root.
"""

import secrets
from pathlib import Path
from typing import Tuple

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

EXTENSIONS = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}


def upload_root() -> Path:
    root = Path(settings.UPLOAD_DIR).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def save_upload(file: UploadFile, user_id: int) -> Tuple[str, int]:
    """Validate and persist an upload. Returns (relative_path, size_bytes)."""
    if file.content_type not in settings.allowed_upload_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Allowed: {', '.join(settings.allowed_upload_types)}",
        )

    # Read in chunks and abort as soon as the cap is passed, so an oversized
    # upload never gets fully buffered.
    max_bytes = settings.max_upload_bytes
    chunks, size = [], 0
    while chunk := file.file.read(1024 * 1024):
        size += len(chunk)
        if size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds the {settings.MAX_UPLOAD_MB} MB limit",
            )
        chunks.append(chunk)

    if size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty")

    user_dir = upload_root() / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)

    name = f"{secrets.token_hex(16)}{EXTENSIONS[file.content_type]}"
    (user_dir / name).write_bytes(b"".join(chunks))
    return f"{user_id}/{name}", size


def resolve(relative_path: str) -> Path:
    """Map a stored path back to an absolute one, refusing anything that
    escapes the upload root."""
    root = upload_root()
    target = (root / relative_path).resolve()
    if not target.is_relative_to(root):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file path")
    return target


def delete(relative_path: str) -> None:
    target = resolve(relative_path)
    target.unlink(missing_ok=True)
