export function trackUsage(event: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).analytics?.track) {
    (window as any).analytics.track(event, props);
  }
}

export function trackHeatmap(event: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).heatmap?.capture) {
    (window as any).heatmap.capture(event, props);
  }
}
