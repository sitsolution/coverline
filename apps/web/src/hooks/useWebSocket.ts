import { useEffect, useRef, useCallback } from 'react';

type MessageHandler = (data: unknown) => void;

interface UseWebSocketOptions {
  onMessage: MessageHandler;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Connects to a WebSocket URL and calls onMessage for each JSON message received.
 * Automatically cleans up on unmount.
 *
 * @param url  Full ws:// or wss:// URL including token query param, or null to skip.
 */
export function useWebSocket(url: string | null, options: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(options.onMessage);
  const onOpenRef = useRef(options.onOpen);
  const onCloseRef = useRef(options.onClose);

  // Keep refs in sync so closures always see the latest handlers
  useEffect(() => { onMessageRef.current = options.onMessage; }, [options.onMessage]);
  useEffect(() => { onOpenRef.current = options.onOpen; }, [options.onOpen]);
  useEffect(() => { onCloseRef.current = options.onClose; }, [options.onClose]);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => onOpenRef.current?.();

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessageRef.current(parsed);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => onCloseRef.current?.();

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [url]);

  const send = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { send };
}
