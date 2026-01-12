// Supabase Edge Function: send-breaking-daily
// Purpose: Send daily breaking markets newsletter to subscribers
// Method: POST
// Trigger: Cron job or manual invocation
// Returns: { sent: number, failed: number, errors: string[] }

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TEMPLATE_URL = './template.html';
const MAX_RETRIES = 3;
const BATCH_SIZE = 50; // Process subscribers in batches

// ============================================================================
// TYPES
// ============================================================================

interface BreakingMarket {
  rank: number;
  question: string;
  condition_id: string;
  slug: string;
  price_yes: number;
  price_change_24h: number;
  volume_change_24h: number;
  trend: 'up' | 'down' | 'neutral';
  image_url: string | null;
}

interface Subscriber {
  email: string;
  unsubscribe_token: string;
}

interface SendDailyResponse {
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
  timestamp: string;
  duration_ms: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// EMAIL TEMPLATE FUNCTIONS
// ============================================================================

/**
 * Read the email template file
 */
async function readTemplate(): Promise<string> {
  try {
    const templatePath = new URL(TEMPLATE_URL, import.meta.url);
    const template = await Deno.readTextFile(templatePath);
    return template;
  } catch (error) {
    console.error('Error reading template:', error);
    throw new Error('Failed to read email template');
  }
}

/**
 * Generate HTML for a single market card
 */
function generateMarketCard(market: BreakingMarket, baseUrl: string): string {
  const rankColor = market.rank === 1 ? '#fbbf24' : market.rank === 2 ? '#94a3b8' : market.rank === 3 ? '#b45309' : '#64748b';
  const rankBg = market.rank === 1 ? '#fef3c7' : market.rank === 2 ? '#f1f5f9' : market.rank === 3 ? '#fef3c7' : '#f1f5f9';

  const trendIcon = market.trend === 'up' ? '▲' : market.trend === 'down' ? '▼' : '─';
  const trendColor = market.trend === 'up' ? '#22c55e' : market.trend === 'down' ? '#ef4444' : '#64748b';
  const changeText = market.price_change_24h >= 0 ? `+${(market.price_change_24h * 100).toFixed(1)}%` : `${(market.price_change_24h * 100).toFixed(1)}%`;

  return `
    <tr>
      <td class="mobile-padding market-card" style="padding: 16px 40px; border-bottom: 1px solid #f1f5f9;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <!-- Rank Badge -->
            <td width="50" valign="top">
              <div style="width: 40px; height: 40px; background-color: ${rankBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${rankColor}; font-size: 16px; font-weight: 700;">${market.rank}</span>
              </div>
            </td>
            <!-- Market Info -->
            <td valign="top">
              <a href="${baseUrl}/markets/${market.slug}" style="text-decoration: none; color: inherit;">
                <p style="margin: 0 0 6px 0; color: #1e293b; font-size: 16px; font-weight: 600; line-height: 1.4;">
                  ${market.question}
                </p>
              </a>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right: 16px;">
                    <span style="color: #64748b; font-size: 13px;">Current Price: </span>
                    <span style="color: #1e293b; font-size: 13px; font-weight: 600;">${(market.price_yes * 100).toFixed(1)}c</span>
                  </td>
                  <td>
                    <span style="color: ${trendColor}; font-size: 13px; font-weight: 500;">${trendIcon} ${changeText}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Generate the complete email HTML
 */
async function generateEmailHtml(
  markets: BreakingMarket[],
  email: string,
  unsubscribeToken: string,
  baseUrl: string
): Promise<string> {
  const template = await readTemplate();

  // Generate markets HTML
  const marketsHtml = markets.map(market => generateMarketCard(market, baseUrl)).join('');

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create unsubscribe URL
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  // Replace template variables
  return template
    .replace('{{preview_text}}', `Top ${markets.length} breaking markets today from Palpiteiros`)
    .replace('{{date}}', today)
    .replace('{{market_count}}', String(markets.length))
    .replace('{{markets_html}}', marketsHtml)
    .replace('{{base_url}}', baseUrl)
    .replace('{{email}}', email)
    .replace('{{unsubscribe_url}}', unsubscribeUrl);
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send email using Resend API
 */
async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Palpiteiros <noreply@palpiteiros.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Resend API error: ${error}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
}

/**
 * Send email using SendGrid API
 */
async function sendEmailViaSendGrid(
  to: string,
  subject: string,
  html: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject,
        }],
        from: { email: 'noreply@palpiteiros.com', name: 'Palpiteiros' },
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `SendGrid API error: ${error}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
}

/**
 * Send email using Supabase email (Resend integration)
 */
async function sendEmailViaSupabase(
  to: string,
  subject: string,
  html: string,
  supabase: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.admin.sendEmail({
      email: to,
      emailTemplate: 'breaking-newsletter-daily',
      templateData: { html },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
}

/**
 * Send email with fallback chain
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  env: Record<string, string>,
  supabase: any
): Promise<{ success: boolean; error?: string; method?: string }> {
  // Try Resend first
  if (env.RESEND_API_KEY) {
    const result = await sendEmailViaResend(to, subject, html, env.RESEND_API_KEY);
    if (result.success) return { success: true, method: 'resend' };
  }

  // Try SendGrid
  if (env.SENDGRID_API_KEY) {
    const result = await sendEmailViaSendGrid(to, subject, html, env.SENDGRID_API_KEY);
    if (result.success) return { success: true, method: 'sendgrid' };
  }

  // Try Supabase
  if (supabase) {
    const result = await sendEmailViaSupabase(to, subject, html, supabase);
    if (result.success) return { success: true, method: 'supabase' };
  }

  // Development mode: log to console
  if (env.DEPLOY_ENV === 'development' || !env.RESEND_API_KEY) {
    console.log(`[DEV MODE] Would send email to ${to}`);
    console.log(`[DEV MODE] Subject: ${subject}`);
    console.log(`[DEV MODE] HTML length: ${html.length} chars`);
    return { success: true, method: 'console' };
  }

  return { success: false, error: 'No email service configured' };
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
      } as ErrorResponse),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Verify cron authorization (recommended for production)
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
      } as ErrorResponse),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get request parameters
    const body = await req.json().catch(() => ({}));
    const frequency = (body.frequency as string) || 'daily';
    const limit = (body.limit as number) || 10;

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get base URL for email links
    const baseUrl = Deno.env.get('SITE_URL') || 'https://palpiteiros.com';

    console.log(`🚀 Starting ${frequency} newsletter send...`);

    // Step 1: Fetch breaking markets
    console.log('📊 Fetching breaking markets...');
    const { data: breakingMarkets, error: marketsError } = await supabase.rpc('get_breaking_markets', {
      p_limit: limit,
      p_min_price_change: 0.03,
      p_time_range_hours: 24,
    });

    if (marketsError) {
      throw new Error(`Failed to fetch breaking markets: ${marketsError.message}`);
    }

    const markets = (breakingMarkets || []) as BreakingMarket[];
    console.log(`✅ Fetched ${markets.length} breaking markets`);

    if (markets.length === 0) {
      return new Response(
        JSON.stringify({
          sent: 0,
          failed: 0,
          skipped: 0,
          errors: [],
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        } as SendDailyResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Fetch active subscribers
    console.log('👥 Fetching active subscribers...');
    const { data: subscribersData, error: subscribersError } = await supabase.rpc('get_newsletter_subscribers', {
      p_frequency: frequency,
    });

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }

    const subscribers = (subscribersData || []) as Subscriber[];
    console.log(`✅ Fetched ${subscribers.length} active subscribers`);

    // Step 3: Send emails
    console.log('📧 Sending emails...');
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process in batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      for (const subscriber of batch) {
        try {
          // Generate email HTML
          const emailHtml = await generateEmailHtml(
            markets,
            subscriber.email,
            subscriber.unsubscribe_token,
            baseUrl
          );

          // Send email
          const subject = `Breaking Markets Daily - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          const result = await sendEmail(
            subscriber.email,
            subject,
            emailHtml,
            Deno.env.toObject() as Record<string, string>,
            supabase
          );

          if (result.success) {
            // Mark as sent
            await supabase.rpc('mark_newsletter_sent', {
              p_email: subscriber.email,
            });
            sent++;
            console.log(`  ✅ Sent to ${subscriber.email} (${result.method})`);
          } else {
            failed++;
            errors.push(`${subscriber.email}: ${result.error}`);
            console.log(`  ❌ Failed to send to ${subscriber.email}: ${result.error}`);
          }
        } catch (error) {
          failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${subscriber.email}: ${errorMsg}`);
          console.error(`  ❌ Error processing ${subscriber.email}:`, errorMsg);
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const duration = Date.now() - startTime;

    console.log(`✅ Newsletter send complete: ${sent} sent, ${failed} failed, ${skipped} skipped (${duration}ms)`);

    // Return response
    const response: SendDailyResponse = {
      sent,
      failed,
      skipped,
      errors,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Fatal error in send-breaking-daily:', error);

    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
