import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PulseLoader, BounceLoader } from "react-spinners";
import { usePusherChat } from "../hooks/usePusherChat";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Circle as StatusIcon,
} from "@mui/icons-material";

interface ChatComponentProps {
  conversationId: string | null;
  userId: string;
  className?: string;
  placeholder?: string;
  height?: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  conversationId,
  userId,
  className = "",
  placeholder = "Type your message...",
  height = "100%",
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isConnected, typingUsers, isLoading, sendMessage } =
    usePusherChat(conversationId, userId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageToSend = newMessage;
    setNewMessage(""); // Clear input immediately

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      // Restore message on error
      setNewMessage(messageToSend);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    // Removed handleTyping() to prevent API failures
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If no conversation is selected
  if (!conversationId) {
    return (
      <Box
        className={className}
        sx={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          color: "text.secondary",
        }}
      >
        <Box textAlign="center">
          <Typography variant="h6" mb={1}>
            No conversation selected
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Select a conversation to start chatting
          </Typography>
        </Box>
      </Box>
    );
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  const typingVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
      },
    },
  };

  return (
    <Box
      className={className}
      sx={{
        height,
        display: "flex",
        flexDirection: "column",
        background: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          borderRadius: 0,
          backgroundColor: "white",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 24,
                height: 24,
              }}
            >
              <BotIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.primary"
                sx={{ fontSize: "0.8rem" }}
              >
                Attend Agent
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.65rem" }}
              >
                AI Assistant
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<StatusIcon />}
            label={isConnected ? "Connected" : "Connecting..."}
            color={isConnected ? "success" : "warning"}
            size="small"
            sx={{
              fontWeight: 500,
              fontSize: "0.7rem",
              height: "20px",
              "& .MuiChip-icon": {
                fontSize: "10px",
              },
              "& .MuiChip-label": {
                px: 0.5,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          backgroundColor: "#f8f9fa",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.05)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.15)",
            borderRadius: "10px",
            "&:hover": {
              background: "rgba(0,0,0,0.25)",
            },
          },
        }}
      >
        {messages.length === 0 && !isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            <Box>
              <Typography variant="h6" mb={1}>
                No messages yet
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Start a conversation by sending a message!
              </Typography>
            </Box>
          </Box>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                {message.role === "assistant" && (
                  <Avatar
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      width: 28,
                      height: 28,
                      mb: 0.5,
                    }}
                  >
                    <BotIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}

                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    maxWidth: "75%",
                    minWidth: "100px",
                    bgcolor: message.role === "user" ? "primary.main" : "white",
                    color: message.role === "user" ? "white" : "text.primary",
                    borderRadius:
                      message.role === "user"
                        ? "20px 20px 5px 20px"
                        : "20px 20px 20px 5px",
                    boxShadow:
                      message.role === "user"
                        ? "0 4px 20px rgba(99, 102, 241, 0.3)"
                        : "0 4px 20px rgba(0, 0, 0, 0.1)",
                    position: "relative",
                    "&::before":
                      message.role === "assistant"
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: -8,
                            width: 0,
                            height: 0,
                            borderStyle: "solid",
                            borderWidth: "0 0 15px 15px",
                            borderColor:
                              "transparent transparent white transparent",
                          }
                        : {},
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      wordBreak: "break-word",
                      lineHeight: 1.5,
                      fontSize: "0.95rem",
                    }}
                  >
                    {message.content}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      opacity: 0.7,
                      fontSize: "0.75rem",
                    }}
                  >
                    {formatTime(message.created_at)}
                  </Typography>
                </Paper>

                {message.role === "user" && (
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.9)",
                      color: "primary.main",
                      width: 28,
                      height: 28,
                      mb: 0.5,
                    }}
                  >
                    <UserIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {(typingUsers.size > 0 || isLoading) && (
            <motion.div
              variants={typingVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    width: 28,
                    height: 28,
                  }}
                >
                  <BotIcon sx={{ fontSize: 16 }} />
                </Avatar>

                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    bgcolor: "white",
                    borderRadius: "20px 20px 20px 5px",
                    minHeight: "50px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PulseLoader color="#6366f1" size={6} speedMultiplier={0.8} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Thinking...
                  </Typography>
                </Paper>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          borderRadius: 0,
          backgroundColor: "white",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Box display="flex" gap={0.5} alignItems="flex-end">
          <TextField
            fullWidth
            multiline={false}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                backgroundColor: "white",
                height: "36px",
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                  borderWidth: "2px",
                },
              },
              "& .MuiOutlinedInput-input": {
                py: 0,
                px: 1.25,
                fontSize: "0.85rem",
                height: "36px",
                display: "flex",
                alignItems: "center",
              },
            }}
          />

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "grey.300",
                },
              }}
            >
              {isLoading ? (
                <BounceLoader color="white" size={20} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </motion.div>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatComponent;
