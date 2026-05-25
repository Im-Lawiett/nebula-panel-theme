import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListChatMessages, useSendChatMessage, getListChatMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Chat() {
  const [username, setUsername] = useState("Guest" + Math.floor(Math.random() * 1000));
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useListChatMessages({
    query: {
      refetchInterval: 5000,
    }
  });

  const sendMessage = useSendChatMessage();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage.mutate(
      { data: { username, content: message } },
      {
        onSuccess: () => {
          setMessage("");
          queryClient.invalidateQueries({ queryKey: getListChatMessagesQueryKey() });
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col border-border bg-card/50 backdrop-blur overflow-hidden">
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
            Global Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages yet. Be the first to say hello!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={msg.avatar || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {msg.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">{msg.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 break-words bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5 inline-block">
                      {msg.content}
                      {msg.attachmentUrl && (
                        <div className="mt-2">
                          <a 
                            href={msg.attachmentUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-xs"
                          >
                            <ImageIcon className="w-3 h-3" /> View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background/50">
            <form onSubmit={handleSend} className="flex gap-3">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-32 bg-card border-border"
                maxLength={20}
              />
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message the server..."
                className="flex-1 bg-card border-border"
                disabled={sendMessage.isPending}
              />
              <Button 
                type="submit" 
                disabled={!message.trim() || sendMessage.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
