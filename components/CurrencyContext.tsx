"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type CurrencyState = {
  rate: number;       // USD-to-local conversion rate
  symbol: string;     // e.g. "$" or "EUR"
  code: string;       // e.g. "USD" or "EUR"
  showLocal: boolean; // whether to display in local currency
  toggle: () => void;
  /** Format a USD amount in the current display currency. */
  fmt: (usd: number) => string;
};

const CurrencyContext = createContext<CurrencyState>({
  rate: 1,
  symbol: "$",
  code: "USD",
  showLocal: false,
  toggle: () => {},
  fmt: (usd) => `$${usd.toLocaleString()}`,
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({
  localRate,
  localSymbol,
  localCode,
  children,
}: {
  localRate: number | null | undefined;
  localSymbol: string | undefined;
  localCode: string | undefined;
  children: React.ReactNode;
}) {
  const [showLocal, setShowLocal] = useState(false);
  const hasLocal = localRate != null && localRate > 0 && localCode && localCode !== "USD";

  const toggle = useCallback(() => {
    if (hasLocal) setShowLocal((v) => !v);
  }, [hasLocal]);

  const rate = showLocal && hasLocal ? localRate : 1;
  const symbol = showLocal && hasLocal ? (localSymbol || localCode || "$") : "$";
  const code = showLocal && hasLocal ? (localCode || "USD") : "USD";

  const fmt = useCallback(
    (usd: number) => {
      const converted = Math.round(usd * rate);
      return `${symbol}${converted.toLocaleString()}`;
    },
    [rate, symbol],
  );

  return (
    <CurrencyContext.Provider value={{ rate, symbol, code, showLocal, toggle, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
}
