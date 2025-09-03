import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Section } from '@/components/design-system/Section';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface Message {
  author: string;
  content: string;
  created_at: string;
}

export default function CommunityChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channel = supabase
      .channel('community_chat')
      .on('broadcast', { event: 'message' }, (payload) => {
        setMessages((m) => [...m, payload.payload as Message]);
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function sendMessage() {
    const message: Message = { author: 'You', content: text, created_at: new Date().toISOString() };
    channelRef.current?.send({ type: 'broadcast', event: 'message', payload: message });
    if (text.startsWith('/ai')) {
      const ai: Message = { author: 'AI', content: 'This is an AI response.', created_at: new Date().toISOString() };
      channelRef.current?.send({ type: 'broadcast', event: 'message', payload: ai });
    }
    setText('');
  }

  return (
    <Section>
      <Container>
        <Card className="p-6 space-y-4">
          <div className="h-96 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium mr-2">{m.author}:</span>
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
