import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Daily reminder function called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Pobierz zadania na jutro (planned_date)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    console.log('Fetching tasks for tomorrow:', tomorrow.toISOString());

    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('planned_date', tomorrow.toISOString())
      .lt('planned_date', dayAfterTomorrow.toISOString())
      .eq('completed', false);

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    console.log(`Found ${events?.length || 0} events for tomorrow`);

    if (!events || events.length === 0) {
      console.log('No events found for tomorrow, skipping notification');
      return new Response(JSON.stringify({ message: 'No events for tomorrow' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Formatuj wiadomość
    let message = '# Przypominajka !\n';
    
    events.forEach(event => {
      const dueDate = new Date(event.due_date);
      const plannedDate = new Date(event.planned_date);
      
      message += `** Masz na jutro nowe wydarzenie o nazwie: ${event.title}\n`;
      if (event.description) {
        message += `${event.description}\n`;
      }
      message += `\nJest to na: ${dueDate.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}\n`;
      message += `--------------------------------------------------\n`;
      message += `Do zrobienia w: ${plannedDate.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })} **\n\n`;
    });

    message += '||@here||\n\n';
    message += '-# przypomnienie wysyłane codziennie o 18:00';

    console.log('Sending Discord message:', message);

    // Wyślij wiadomość na Discord
    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord webhook error:', errorText);
      throw new Error(`Discord webhook failed: ${discordResponse.status} ${errorText}`);
    }

    console.log('Discord message sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      eventsCount: events.length,
      message: 'Reminder sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-reminder function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});