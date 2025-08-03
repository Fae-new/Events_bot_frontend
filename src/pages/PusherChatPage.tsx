import React, { useState, useEffect, useCallback } from "react";
import { chatAPI, type Conversation as ApiConversation } from "../services/api";
import ChatComponent from "../components/ChatComponent";
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import SmartToyIcon from "@mui/icons-material/SmartToy";

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

const GradientButton = styled(IconButton)({
  background: "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
  color: "white",
  fontWeight: 500,
  "&:hover": {
    background: "linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)",
  },
  "&:disabled": {
    background: "rgba(0,0,0,0.05)",
    color: "rgba(0,0,0,0.26)",
  },
});

const PusherChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await chatAPI.listConversations(
          DEFAULT_USER_ID,
          1,
          20
        );
        console.log("Fetched conversations:", response);

        if (response.success && response.data) {
          // Convert the API response to our Conversation type
          const conversations: Conversation[] = response.data.data.map(
            (conv) => ({
              conversationId: conv.conversation_id,
              external_user_id: conv.user_id,
              message_count: 0, // API doesn't provide message count in list
              created_at: conv.created_at,
              updated_at: conv.updated_at,
            })
          );
          setConversations(conversations);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("Error selecting conversation:", error);
    }
  }, []);

  const createNewConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.createConversation(
        undefined,
        DEFAULT_USER_ID
      );
      if (response.success && response.data) {
        const newConversation: Conversation = {
          conversationId: response.data.conversation_id,
          external_user_id: response.data.user_id,
          message_count: 0,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        };
        setConversations((prev) => [...prev, newConversation]);
        await selectConversation(newConversation.conversationId);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectConversation]);

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
                Attend Agent
              </Typography>
            </Box>
            <GradientButton
              onClick={createNewConversation}
              disabled={isLoading}
              size="small"
            >
              <AddIcon fontSize="small" />
            </GradientButton>
          </Box>
          <List className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <Box className="p-4 text-center">
                <Typography color="textSecondary" gutterBottom>
                  No conversations yet
                </Typography>
                <GradientButton
                  onClick={createNewConversation}
                  className="mt-2"
                  size="small"
                  disabled={isLoading}
                >
                  <AddIcon />
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
                      sx={{ marginLeft: "10px" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {/* Main Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {currentConversationId ? (
            <ChatComponent
              conversationId={currentConversationId}
              userId={DEFAULT_USER_ID}
              height="100vh"
              placeholder="Ask me anything about event planning..."
            />
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 6,
                background: "white",
                color: "text.primary",
              }}
            >
              <Box sx={{ maxWidth: "md", textAlign: "center", px: 4 }}>
                <Box
                  sx={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <ChatIcon sx={{ fontSize: 32, color: "primary.main" }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 500, color: "text.primary" }}
                >
                  Welcome to Attend Agent
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: "text.secondary" }}
                >
                  Start a conversation with our AI assistant to help plan your
                  events
                </Typography>
                <GradientButton
                  onClick={createNewConversation}
                  disabled={isLoading}
                  size="large"
                >
                  <AddIcon sx={{ mr: 1 }} />
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

export default PusherChatPage;
