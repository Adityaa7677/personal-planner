/// <reference types="vite/client" />

interface QovaMetrics {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  minX?: number;
  minY?: number;
  qWidth?: number;
  qHeight?: number;
  ovaWidth?: number;
  ovaHeight?: number;
  narrow: boolean;
  qRatio?: number;
  qOffsetRatio?: number;
}

interface Window {
  __qovaIntroActive?: boolean;
  __qovaFadeOverride?: number;
  __qovaTargetMetrics?: QovaMetrics;
  THREE?: any;
}
