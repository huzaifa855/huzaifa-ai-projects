"""TradingAgents -> MetaTrader 5 (MT5) Auto-Execution Bridge

Connects TradingAgents AI decisions directly to your MT5 Demo Account.
Places automated BUY/SELL market orders with Stop Loss & Take Profit.
"""

import sys
from pathlib import Path

# Ensure project root is in python path
project_dir = Path(__file__).resolve().parent
if str(project_dir) not in sys.path:
    sys.path.insert(0, str(project_dir))

import MetaTrader5 as mt5
from dotenv import load_dotenv

load_dotenv(project_dir / ".env", override=True)


def check_mt5_connection():
    """Verify connection to MetaTrader 5 terminal."""
    if not mt5.initialize():
        error = mt5.last_error()
        return False, f"Failed to initialize MT5: {error}. Please open MetaTrader 5 terminal application."

    acc = mt5.account_info()
    if acc is None:
        return False, f"No active account logged in. Error: {mt5.last_error()}"

    mode_str = "DEMO" if acc.trade_mode == 0 else "CONTEST" if acc.trade_mode == 1 else "REAL"
    term = mt5.terminal_info()

    info = {
        "login": acc.login,
        "server": acc.server,
        "currency": acc.currency,
        "balance": acc.balance,
        "equity": acc.equity,
        "mode": mode_str,
        "trade_allowed": term.trade_allowed if term else False,
    }
    return True, info


def map_to_mt5_symbol(symbol: str) -> str:
    """Map common ticker symbols to MT5 broker symbols."""
    s = symbol.upper().replace("/", "").replace("-", "").replace("=F", "").replace("=X", "")
    if s in ("GOLD", "GC", "XAU"):
        s = "XAUUSD"
    elif s in ("SILVER", "SI", "XAG"):
        s = "XAGUSD"

    # Verify if symbol exists in MT5
    all_symbols = [sym.name for sym in (mt5.symbols_get() or [])]
    if s in all_symbols:
        return s
    # Check with suffix (e.g. XAUUSDm, EURUSD.a)
    for sym_name in all_symbols:
        if sym_name.startswith(s):
            return sym_name
    return s


def execute_order(symbol: str, action: str, lot_size: float = 0.01, sl_points: float = 0, tp_points: float = 0):
    """Execute Market Order on MT5 Demo Account.

    Args:
        symbol: e.g. 'XAUUSD', 'EURUSD'
        action: 'BUY' or 'SELL'
        lot_size: Volume (default 0.01)
        sl_points: Stop loss distance (or 0)
        tp_points: Take profit distance (or 0)
    """
    mt5_symbol = map_to_mt5_symbol(symbol)

    # Ensure symbol is selected in Market Watch
    if not mt5.symbol_select(mt5_symbol, True):
        return False, f"Symbol {mt5_symbol} not found in MT5 Market Watch."

    tick = mt5.symbol_info_tick(mt5_symbol)
    if not tick:
        return False, f"Could not get live price tick for {mt5_symbol}."

    sym_info = mt5.symbol_info(mt5_symbol)
    point = sym_info.point if sym_info else 0.0001
    digits = sym_info.digits if sym_info else 2

    action_upper = action.upper()
    if action_upper not in ("BUY", "SELL"):
        return False, f"Invalid action: {action}. Must be BUY or SELL."

    order_type = mt5.ORDER_TYPE_BUY if action_upper == "BUY" else mt5.ORDER_TYPE_SELL
    price = tick.ask if action_upper == "BUY" else tick.bid

    sl = 0.0
    tp = 0.0
    if sl_points > 0:
        sl = round(price - (sl_points * point) if action_upper == "BUY" else price + (sl_points * point), digits)
    if tp_points > 0:
        tp = round(price + (tp_points * point) if action_upper == "BUY" else price - (tp_points * point), digits)

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": mt5_symbol,
        "volume": float(lot_size),
        "type": order_type,
        "price": price,
        "sl": sl,
        "tp": tp,
        "deviation": 20,
        "magic": 100100,
        "comment": "TradingAgents AI",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    # First test order check
    check_result = mt5.order_check(request)
    if check_result is None or check_result.retcode != 0:
        # Fallback to ORDER_FILLING_FOK / RETURN if broker requires different filling
        request["type_filling"] = mt5.ORDER_FILLING_FOK
        check_result = mt5.order_check(request)
        if check_result is None or check_result.retcode != 0:
            request["type_filling"] = mt5.ORDER_FILLING_RETURN

    result = mt5.order_send(request)
    if result is None:
        return False, f"Order send failed: {mt5.last_error()}"

    if result.retcode != mt5.TRADE_RETCODE_DONE:
        return False, f"Order rejected (code {result.retcode}): {result.comment}"

    return True, {
        "order": result.order,
        "deal": result.deal,
        "volume": result.volume,
        "price": result.price,
        "symbol": mt5_symbol,
        "action": action_upper,
        "sl": sl,
        "tp": tp,
    }


if __name__ == "__main__":
    print("=" * 60)
    print("  TRADINGAGENTS -> METATRADER 5 (MT5) BRIDGE")
    print("=" * 60)

    connected, info = check_mt5_connection()
    if not connected:
        print(f"\n[ERROR] {info}")
        sys.exit(1)

    print("\n[OK] Connected to MetaTrader 5 Successfully!")
    print(f"  Account Number: {info['login']}")
    print(f"  Account Type:   {info['mode']}")
    print(f"  Server:         {info['server']}")
    print(f"  Balance:        ${info['balance']:,.2f} {info['currency']}")
    print(f"  Equity:         ${info['equity']:,.2f} {info['currency']}")
    print(f"  Algo Trading:   {'ENABLED [OK]' if info['trade_allowed'] else 'DISABLED [Note: Click \"Algo Trading\" button in MT5]'}")
    print("=" * 60)
