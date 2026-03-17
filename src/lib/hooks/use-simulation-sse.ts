// ============================================================
// MarketSim Pro - Simulation SSE Hook
// ============================================================

'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { SimulationProgress } from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/constants';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface SSEEvent {
  type: 'connected' | 'status' | 'progress' | 'complete' | 'error' | 'disconnected';
  data: Record<string, unknown>;
}

interface UseSimulationSSEOptions {
  sessionId: string;
  enabled: boolean;
  onComplete?: () => void;
  onError?: (message: string) => void;
}

interface UseSimulationSSEReturn {
  sseEvent: SSEEvent | null;
  progress: SimulationProgress | null;
  isRunning: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

export function useSimulationSSE({
  sessionId,
  enabled,
  onComplete,
  onError,
}: UseSimulationSSEOptions): UseSimulationSSEReturn {
  const [sseEvent, setSseEvent] = React.useState<SSEEvent | null>(null);
  const [progress, setProgress] = React.useState<SimulationProgress | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const eventSourceRef = React.useRef<EventSource | null>(null);

  // Fallback polling query
  const { data: pollingProgress } = useQuery({
    queryKey: ['simulation-progress', sessionId],
    queryFn: () => apiGet<SimulationProgress>(API_ENDPOINTS.SESSION_PROGRESS(sessionId)),
    enabled: enabled && !isRunning,
    refetchInterval: enabled && !isRunning ? 3000 : false,
  });

  // Update progress from polling
  React.useEffect(() => {
    if (pollingProgress && pollingProgress.state === 'running') {
      setProgress(pollingProgress);
      setIsRunning(true);
    }
  }, [pollingProgress]);

  // SSE Connection
  React.useEffect(() => {
    if (!enabled || !sessionId) {
      // Cleanup
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsRunning(false);
      setConnectionStatus('disconnected');
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');

    // Use the SSE proxy route
    const sseUrl = `/api/sse/sessions/${sessionId}/simulation-status`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      setConnectionStatus('connected');
      setSseEvent({ type: 'connected', data: {} });
    };

    // Generic error handler
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setConnectionStatus('error');
      setSseEvent({ type: 'error', data: { message: 'Connection error' } });
      
      // Try to reconnect after delay
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          eventSource.close();
          // Fallback to polling
          setIsRunning(false);
        }
      }, 1000);
    };

    // Handle specific event types
    const handleEvent = (eventType: string) => (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        const newEvent: SSEEvent = { type: eventType as SSEEvent['type'], data };
        setSseEvent(newEvent);

        switch (eventType) {
          case 'status':
          case 'progress':
            if (data.progress_percent !== undefined) {
              setProgress({
                state: 'running',
                progress_percent: data.progress_percent as number,
                current_round: data.current_round as number,
                estimated_completion: data.estimated_completion as string | undefined,
                countdown_seconds: data.countdown_seconds as number | undefined,
              });
            }
            setIsRunning(true);
            break;

          case 'complete':
            setIsRunning(false);
            setProgress({
              state: 'results',
              current_round: data.current_round as number,
            });
            eventSource.close();
            eventSourceRef.current = null;
            onComplete?.();
            break;

          case 'error':
            setIsRunning(false);
            eventSource.close();
            eventSourceRef.current = null;
            onError?.((data.message as string) || 'Une erreur est survenue');
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    // Register event listeners
    eventSource.addEventListener('connected', handleEvent('connected'));
    eventSource.addEventListener('status', handleEvent('status'));
    eventSource.addEventListener('progress', handleEvent('progress'));
    eventSource.addEventListener('complete', handleEvent('complete'));
    eventSource.addEventListener('error', handleEvent('error'));
    eventSource.addEventListener('disconnected', handleEvent('disconnected'));

    // Cleanup
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setConnectionStatus('disconnected');
    };
  }, [enabled, sessionId, onComplete, onError]);

  return {
    sseEvent,
    progress,
    isRunning,
    connectionStatus,
  };
}
