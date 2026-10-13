"""Symbol normalization and market-data error types for vendor calls.

Yahoo Finance (the default vendor) uses specific ticker conventions that
differ from the broker / TradingView / MT5 style symbols users often type:

    user types        Yahoo wants       why
    ---------------   ---------------   -----------------------------------
    XAUUSD, XAU/USD   GC=F              gold has no forex pair on Yahoo;
                                        it is quoted as a COMEX future
    EURUSD, EUR/USD   EURUSD=X          spot forex pairs take a ``=X`` suffix
    BTCUSD, BTC/USD   BTC-USD           crypto pairs use a ``-`` separator
    SPX500, US500     ^GSPC             index CFDs map to Yahoo index symbols
"""

from __future__ import annotations

import logging
import re

from .errors import NoMarketDataError as NoMarketDataError

logger = logging.getLogger(__name__)

# ISO-4217 codes common in retail forex pairs.
_FOREX_CURRENCIES = frozenset(
    {
        "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD",
        "CNY", "CNH", "HKD", "SGD", "SEK", "NOK", "DKK", "PLN",
        "MXN", "ZAR", "TRY", "INR", "KRW", "BRL", "RUB", "THB",
    }
)

# Crypto bases that brokers quote against USD without a separator.
_CRYPTO_BASES = frozenset(
    {"BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "LTC", "BCH", "DOT", "AVAX", "LINK"}
)

# Explicit aliases for commodities, metals, energy, index CFDs
_ALIASES = {
    # Precious metals
    "XAUUSD": "GC=F", "XAU": "GC=F", "GOLD": "GC=F", "GOLDUSD": "GC=F", "GC": "GC=F",
    "XAGUSD": "SI=F", "XAG": "SI=F", "SILVER": "SI=F", "SILVERUSD": "SI=F", "SI": "SI=F",
    "XPTUSD": "PL=F", "XPT": "PL=F", "PLATINUM": "PL=F", "PL": "PL=F",
    "XPDUSD": "PA=F", "XPD": "PA=F", "PALLADIUM": "PA=F", "PA": "PA=F",
    "COPPER": "HG=F", "XCUUSD": "HG=F", "XCU": "HG=F", "HG": "HG=F",

    # Energy
    "WTICOUSD": "CL=F", "USOIL": "CL=F", "WTI": "CL=F", "OIL": "CL=F", "CRUDE": "CL=F", "CRUDEOIL": "CL=F", "CL": "CL=F",
    "BCOUSD": "BZ=F", "UKOIL": "BZ=F", "BRENT": "BZ=F", "BRENTOIL": "BZ=F", "BZ": "BZ=F",
    "NATGAS": "NG=F", "XNGUSD": "NG=F", "GAS": "NG=F", "NG": "NG=F",

    # Index CFDs -> Yahoo index symbols
    "SPX500": "^GSPC", "US500": "^GSPC", "SPX": "^GSPC",
    "NAS100": "^NDX", "US100": "^NDX", "USTEC": "^NDX",
    "US30": "^DJI", "DJI30": "^DJI", "WS30": "^DJI",
    "GER40": "^GDAXI", "GER30": "^GDAXI", "DE40": "^GDAXI",
    "UK100": "^FTSE", "JP225": "^N225", "JPN225": "^N225",
    "FRA40": "^FCHI", "EU50": "^STOXX50E", "HK50": "^HSI",
}

# Yahoo symbols safe charset
_YAHOO_SAFE = re.compile(r"^[A-Za-z0-9._\-\^=]+$")

_CRYPTO_QUOTES = ("USDT", "USDC", "USD")


def crypto_base(raw: str) -> str | None:
    """Return the crypto base (e.g. ``BTC``) for known crypto symbols."""
    if not isinstance(raw, str):
        return None
    compact = raw.strip().upper().rstrip("+").replace("/", "").replace("\\", "").replace("-", "")
    if compact in _CRYPTO_BASES:
        return compact
    for quote in _CRYPTO_QUOTES:
        if compact.endswith(quote):
            base = compact[: -len(quote)]
            return base if base in _CRYPTO_BASES else None
    return None


def _normalize_crypto(s: str) -> str | None:
    """Return ``<BASE>-USD`` for a known crypto, else None."""
    base = crypto_base(s)
    return f"{base}-USD" if base else None


def normalize_symbol(raw: str) -> str:
    """Map user/broker input to canonical Yahoo Finance symbol.
    Supports Gold, Silver, Platinum, Crude Oil, Natural Gas, Forex pairs (with or without slashes),
    Crypto (bare or pairs), Indices, and Stocks.
    """
    if not isinstance(raw, str) or not raw.strip():
        return raw

    s = raw.strip().upper().rstrip("+")
    clean = s.replace("/", "").replace("\\", "").replace(" ", "")

    # 1. Alias check on cleaned and raw symbol
    if clean in _ALIASES:
        return _ALIASES[clean]
    if s in _ALIASES:
        return _ALIASES[s]

    # 2. Crypto check
    crypto = _normalize_crypto(s)
    if crypto is not None:
        return crypto

    # 3. Forex check (6-letter currency pairs like EURUSD, EUR/USD -> EURUSD=X)
    if len(clean) == 6 and clean[:3] in _FOREX_CURRENCIES and clean[3:] in _FOREX_CURRENCIES:
        return f"{clean}=X"

    # 4. If already Yahoo formatted (e.g. GC=F, EURUSD=X, ^GSPC, BTC-USD)
    if s.endswith("=F") or s.endswith("=X") or s.startswith("^") or "-" in s:
        return s

    return clean if clean else s


def is_yahoo_safe(symbol: str) -> bool:
    """True when symbol only contains characters Yahoo symbols use."""
    return bool(symbol) and _YAHOO_SAFE.fullmatch(symbol) is not None
