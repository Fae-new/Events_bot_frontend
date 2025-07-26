// React hook for ReactPHP WebSocket connection
import { useState, useEffect, useRef, useCallback } from "react";
import { conversationAPI } from "../services/api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  conversationId: string;
  timestamp: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  messages: Message[];
  error: string | null;
  sendMessage: (content: string, role?: "user" | "assistant") => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  connectionId: string | null;
  reconnect: () => void;
  refreshMessages: () => Promise<void>;
}

const useReactWebSocket = (
  conversationId: string | null
): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // Load existing messages for a conversation
  const loadConversationMessages = useCallback(async (convId: string) => {
    try {
      const response = await conversationAPI.get(convId);
      console.log(response);
      if (response?.messages) {
        // Convert API messages to our Message format
        const apiMessages = response.messages.map((msg, index) => ({
          id: msg.id || Date.now() + index, // Use API id or generate one
          role: msg.role as "user" | "assistant",
          content: msg.content,
          conversationId: convId,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));
        setMessages(apiMessages);
      }
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      setError("Failed to load conversation messages");
    }
  }, []);

  // WebSocket connection
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket("ws://localhost:8080");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);

        // Set conversation ID if provided
        if (conversationId) {
          ws.send(
            JSON.stringify({
              type: "setConversation",
              conversationId: conversationId,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          switch (data.type) {
            case "connection":
              setConnectionId(data.connectionId);
              break;

            case "conversationSet":
              console.log("Conversation set:", data.conversationId);
              break;

            case "chatResponse":
              if (data.success) {
                const assistantMessage: Message = {
                  id: Date.now(),
                  role: "assistant",
                  content: data.response || "",
                  conversationId: data.conversationId || "",
                  timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
              }
              break;

            case "error":
              console.error("WebSocket error:", data.message);
              setError(data.message);
              break;

            default:
              console.log("Unknown message type:", data.type);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setConnectionId(null);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
        setIsConnected(false);
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Failed to create WebSocket connection");
    }
  }, [conversationId]);

  // Send message via WebSocket
  const sendMessage = useCallback(
    async (content: string, role: "user" | "assistant" = "user") => {
      if (!conversationId) {
        setError("No conversation ID provided");
        return;
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setError("WebSocket not connected");
        return;
      }

      try {
        // Add user message immediately to UI
        const userMessage: Message = {
          id: Date.now(),
          role: role,
          content: content,
          conversationId: conversationId,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send to WebSocket server
        wsRef.current.send(
          JSON.stringify({
            type: "chat",
            conversationId,
            content,
            role,
          })
        );
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        throw error;
      }
    },
    [conversationId]
  );

  // Connect when hook mounts
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Update conversation when it changes
  useEffect(() => {
    if (conversationId) {
      // Load existing messages for this conversation
      loadConversationMessages(conversationId);

      // Set conversation in WebSocket if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "setConversation",
            conversationId: conversationId,
          })
        );
      }
    } else {
      // Clear messages if no conversation
      setMessages([]);
    }
  }, [conversationId, loadConversationMessages]);

  return {
    isConnected,
    messages,
    error,
    sendMessage,
    setMessages,
    connectionId,
    reconnect: connect,
    refreshMessages: () =>
      conversationId
        ? loadConversationMessages(conversationId)
        : Promise.resolve(),
  };
};

export default useReactWebSocket;
