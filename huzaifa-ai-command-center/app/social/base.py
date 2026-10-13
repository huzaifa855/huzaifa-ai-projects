from abc import ABC, abstractmethod
from typing import Any


class SocialPublisher(ABC):
    platform: str

    @abstractmethod
    def validate(self, payload: dict[str, Any]) -> list[str]:
        raise NotImplementedError

    @abstractmethod
    def publish(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


class NotConfiguredPublisher(SocialPublisher):
    def __init__(self, platform: str) -> None:
        self.platform = platform

    def validate(self, payload: dict[str, Any]) -> list[str]:
        return [f"{self.platform} adapter is not configured"]

    def publish(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError(f"{self.platform} publishing requires official API credentials")
