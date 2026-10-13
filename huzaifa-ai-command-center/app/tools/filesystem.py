from pathlib import Path

from app.config import settings


class WorkspaceTool:
    def __init__(self, root: Path | None = None) -> None:
        self.root = (root or settings.workspace_root).resolve()

    def resolve(self, relative_path: str) -> Path:
        candidate = (self.root / relative_path).resolve()
        if candidate != self.root and self.root not in candidate.parents:
            raise ValueError("Path escapes the configured workspace root")
        return candidate

    def list_files(self, relative_path: str = ".") -> list[str]:
        folder = self.resolve(relative_path)
        return [str(path.relative_to(self.root)) for path in folder.rglob("*") if path.is_file()]

    def read_file(self, relative_path: str) -> str:
        return self.resolve(relative_path).read_text(encoding="utf-8")
