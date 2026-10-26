import { supabase } from './supabase';

export const trackEvent = async (eventName: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('events').insert({ 
      user_id: session?.user?.id || null, 
      event_name: eventName 
    });
  } catch (err) { 
    console.error('Tracking failed', err); 
  }
};