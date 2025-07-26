import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import useReactWebSocket from "../hooks/useWebSocket";
import {
  conversationAPI,
  type Conversation as ApiConversation,
} from "../services/api";
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
  TextField,
  Button,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";

export const SOCKET_SERVER_URL = "http://127.0.0.1:8000/api";
export const WS_SERVER_URL = "ws://127.0.0.1:8080";
export const DEFAULT_USER_ID = "user123";

type Conversation = ApiConversation;

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1",
    },
    background: {
      default: "#f9fafb",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "24px",
            backgroundColor: "#fff",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const GradientButton = styled(Button)({
  background: "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
  color: "white",
  fontWeight: 500,
  "&:hover": {
    background: "linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)",
  },
});

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the custom WebSocket hook
  const { messages, sendMessage, setMessages } = useReactWebSocket(
    currentConversationId
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await conversationAPI.list(1, 20, DEFAULT_USER_ID);
        console.log(response);
        setConversations(response);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoading(true);
        setCurrentConversationId(conversationId);
        setMessages([]); // Clear previous messages
        // The WebSocket hook will automatically handle the conversation change
      } catch (error) {
        console.error("Error fetching conversation:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [setMessages]
  );

  const createNewConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await conversationAPI.create(DEFAULT_USER_ID);
      if (response.success && response.data) {
        const newConversation: Conversation = response.data;
        setConversations((prev) => [...prev, newConversation]);
        await selectConversation(newConversation.conversationId);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectConversation]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !currentConversationId) return;

      try {
        // Send message using the WebSocket hook
        await sendMessage(newMessage.trim());
        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [newMessage, currentConversationId, sendMessage]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar */}
        <Paper
          elevation={0}
          className="w-[280px] border-r border-gray-200 flex flex-col"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.1)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0,0,0,0.15)",
            },
          }}
        >
          <Box className="p-3 border-b border-gray-200 flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <ChatIcon color="primary" fontSize="small" />
              <Typography variant="h6" color="primary" fontWeight="500">
                Chat History
              </Typography>
            </Box>
            <IconButton
              onClick={createNewConversation}
              disabled={isLoading}
              size="small"
              sx={{
                background: "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
                color: "white",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)",
                },
                "&:disabled": {
                  background: "rgba(0,0,0,0.05)",
                  color: "rgba(0,0,0,0.26)",
                },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          <List className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <Box className="p-4 text-center">
                <Typography color="textSecondary" gutterBottom>
                  No conversations yet
                </Typography>
                <GradientButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={createNewConversation}
                  className="mt-2"
                  size="small"
                  disabled={isLoading}
                >
                  New Chat
                </GradientButton>
              </Box>
            ) : (
              conversations.map((convo) => (
                <ListItem
                  key={convo.conversationId}
                  disablePadding
                  className="mb-1"
                >
                  <ListItemButton
                    selected={convo.conversationId === currentConversationId}
                    onClick={() => selectConversation(convo.conversationId)}
                    disabled={isLoading}
                    sx={{
                      borderRadius: "8px",
                      margin: "2px 4px",
                      "&.Mui-selected": {
                        backgroundColor: "rgba(99, 102, 241, 0.08)",
                        "&:hover": {
                          backgroundColor: "rgba(99, 102, 241, 0.12)",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.03)",
                      },
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <SmartToyIcon
                          fontSize="small"
                          sx={{
                            color: "primary.main",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "2px",
                            width: "16px",
                            height: "16px",
                          }}
                        />
                      }
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: "primary.main",
                          fontSize: "0.875rem",
                        }}
                      >
                        {convo.conversationId?.charAt(0)?.toUpperCase() || "C"}
                      </Avatar>
                    </Badge>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={
                            convo.conversationId === currentConversationId
                              ? "500"
                              : "400"
                          }
                        >
                          {`Chat ${convo.conversationId.substring(0, 8)}`}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          noWrap
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {convo.message_count} messages
                        </Typography>
                      }
                      sx={{ marginLeft: "10px" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {/* Main Chat Area */}
        <Box className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm custom-scrollbar">
          {currentConversationId ? (
            <>
              <Box
                className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 pb-2"
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.1)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Box className="max-w-3xl mx-auto space-y-3 custom-scrollbar">
                  {messages.length === 0 ? (
                    <Box className="text-center py-8">
                      <Typography variant="body1" color="textSecondary">
                        Start a conversation with the AI Assistant
                      </Typography>
                    </Box>
                  ) : (
                    messages
                      .filter((msg: any) => msg.role !== "system")
                      .map((msg: any, index: number) => (
                        <Box
                          key={`${msg.timestamp}-${index}`}
                          className={`flex ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              maxWidth: "85%",
                              gap: "8px",
                              alignItems: "flex-start",
                            }}
                          >
                            {msg.role !== "user" && (
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: "primary.main",
                                  mt: "2px",
                                }}
                              >
                                <SmartToyIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                            )}
                            <Box>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: "10px 16px",
                                  borderRadius:
                                    msg.role === "user"
                                      ? "16px 16px 4px 16px"
                                      : "16px 16px 16px 4px",
                                  backgroundColor:
                                    msg.role === "user"
                                      ? "primary.main"
                                      : "grey.50",
                                  color:
                                    msg.role === "user"
                                      ? "white"
                                      : "text.primary",
                                  border:
                                    msg.role === "user" ? "none" : "1px solid",
                                  borderColor: "grey.200",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ lineHeight: 1.5 }}
                                >
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </Typography>
                              </Paper>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  mt: "2px",
                                  ml: "4px",
                                  fontSize: "0.7rem",
                                  color: "text.secondary",
                                }}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Typography>
                            </Box>
                            {msg.role === "user" && (
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: "grey.300",
                                  mt: "2px",
                                }}
                              >
                                <PersonIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                            )}
                          </Box>
                        </Box>
                      ))
                  )}
                  <div ref={messagesEndRef} />
                </Box>
              </Box>
              <Box
                className="bg-white"
                sx={{
                  borderTop: "1px solid",
                  borderColor: "rgba(0,0,0,0.06)",
                  py: 2,
                }}
              >
                <Box className="max-w-2xl mx-auto px-4">
                  <Box
                    className="bg-gray-50 rounded-2xl p-2"
                    sx={{
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <form
                      onSubmit={handleSendMessage}
                      className="flex gap-2 max-w-xl mx-auto"
                    >
                      <TextField
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        variant="outlined"
                        size="small"
                        autoComplete="off"
                        sx={{
                          flexGrow: 1,
                          width: "auto",
                          "& .MuiOutlinedInput-root": {
                            height: "48px",
                            backgroundColor: "white",
                            transition: "all 0.2s ease",
                            border: "1px solid rgba(0,0,0,0.1)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            "&:hover": {
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              border: "1px solid rgba(99, 102, 241, 0.5)",
                              boxShadow: "0 2px 4px rgba(99, 102, 241, 0.1)",
                            },
                            "& fieldset": {
                              borderColor: "transparent",
                            },
                            "&:hover fieldset": {
                              borderColor: "transparent",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "transparent",
                            },
                          },
                        }}
                      />
                      <IconButton
                        type="submit"
                        disabled={!newMessage.trim()}
                        sx={{
                          width: "48px",
                          height: "48px",
                          background:
                            "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
                          color: "white",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)",
                            boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)",
                          },
                          "&:disabled": {
                            background: "rgba(0,0,0,0.05)",
                            color: "rgba(0,0,0,0.26)",
                            boxShadow: "none",
                          },
                        }}
                      >
                        <SendIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </form>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Box className="flex-1 flex items-center justify-center p-6">
              <Box className="max-w-md text-center px-4">
                <Box
                  sx={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "rgba(99, 102, 241, 0.08)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <ChatIcon color="primary" sx={{ fontSize: 32 }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 500, color: "text.primary" }}
                >
                  Welcome to EventAI
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ mb: 3 }}
                >
                  Start a new conversation to get personalized event
                  recommendations
                </Typography>
                <GradientButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={createNewConversation}
                  disabled={isLoading}
                >
                  New Conversation
                </GradientButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ChatPage;
