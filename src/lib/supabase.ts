import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export function broadcastRealtimeEvent(channelName: string, eventName: string, payload: any) {
  try {
    const client = supabaseAdmin || supabase;
    if (client) {
      const channel = client.channel(channelName);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: eventName,
            payload,
          });
          setTimeout(() => {
            client.removeChannel(channel);
          }, 3000);
        }
      });
    }
  } catch (err) {
    console.warn('[Supabase Realtime] Broadcast failed:', err);
  }
}
