import { useState, useEffect, useRef, useCallback } from "react";
import { createPusherInstance } from "../services/pusherConfig";
import { chatAPI, type Message } from "../services/api";

export const usePusherChat = (
  conversationId: string | null,
  userId: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set<string>());
  const [isLoading, setIsLoading] = useState(false);

  const pusherRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Initialize Pusher connection
  useEffect(() => {
    if (!conversationId) return;

    pusherRef.current = createPusherInstance();

    // Subscribe to conversation channel (public channel)
    channelRef.current = pusherRef.current.subscribe(
      `conversation.${conversationId}`
    );

    // Connection state handlers
    pusherRef.current.connection.bind("connected", () => {
      console.log("Connected to Pusher");
      setIsConnected(true);
    });

    pusherRef.current.connection.bind("disconnected", () => {
      console.log("Disconnected from Pusher");
      setIsConnected(false);
    });

    pusherRef.current.connection.bind("error", (error: any) => {
      console.error("Pusher connection error:", error);
      setIsConnected(false);
    });

    // Message event handler
    channelRef.current.bind("message.sent", (data: Message) => {
      console.log("New message received:", data);
      setMessages((prev) => {
        // Check if message already exists by ID
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;

        return [...prev, data];
      });
    });

    // Typing event handler
    channelRef.current.bind(
      "user.typing",
      (data: { user_id: string; is_typing: boolean }) => {
        console.log("Typing indicator:", data);
        const { user_id, is_typing } = data;

        if (user_id !== userId) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (is_typing) {
              newSet.add(user_id);
            } else {
              newSet.delete(user_id);
            }
            return newSet;
          });
        }
      }
    );

    // Load initial messages
    loadMessages();

    // Cleanup
    return () => {
      if (channelRef.current) {
        pusherRef.current.unsubscribe(`conversation.${conversationId}`);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, userId]);

  // Load messages from API
  const loadMessages = useCallback(
    async (page = 1) => {
      if (!conversationId) return;

      try {
        setIsLoading(true);
        const response = await chatAPI.getMessages(conversationId, page);

        if (response.success && response.data) {
          // Check if data has messages array
          let newMessages: Message[] = [];
          if (response.data.messages && Array.isArray(response.data.messages)) {
            newMessages = [...response.data.messages].reverse(); // API returns newest first
          } else {
            console.error("❌ Expected messages array but got:", response.data);
            return;
          }

          if (page === 1) {
            setMessages(newMessages);
          } else {
            setMessages((prev) => [...newMessages, ...prev]);
          }

          return response.data.pagination;
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string, role: "user" | "assistant" | "system" = "user") => {
      if (!content.trim() || !conversationId) return;

      try {
        setIsLoading(true);
        const response = await chatAPI.sendMessage(
          conversationId,
          content,
          role
        );

        if (response.success && response.data) {
          // Return the user message data from the response
          return response.data.userMessage;
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  // Send typing indicator (disabled to prevent API failures)
  const sendTypingIndicator = useCallback(async () => {
    // Disabled - typing indicators can cause API failures and aren't essential
  }, []);

  // Handle typing with debounce (disabled)
  const handleTyping = useCallback(() => {
    // Disabled - no longer sending typing indicators
  }, []);

  return {
    messages,
    isConnected,
    typingUsers,
    isLoading,
    sendMessage,
    sendTypingIndicator,
    handleTyping,
    loadMessages,
    setMessages,
  };
};
