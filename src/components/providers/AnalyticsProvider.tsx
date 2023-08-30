"use client";
import React, { useContext, createContext } from "react";
import { AnalyticsBrowser } from "@segment/analytics-next";

const analytics = AnalyticsBrowser.load({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
});

const AnalyticsContext = createContext<AnalyticsBrowser>(analytics);

export const AnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
