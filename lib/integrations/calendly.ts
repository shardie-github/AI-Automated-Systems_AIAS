/**
 * Calendly Integration
 * Provides integration with Calendly API for booking management
 */

import { logger } from '@/lib/logging/structured-logger';

export interface CalendlyBooking {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  meetingType: 'video' | 'phone' | 'chat';
  date: string;
  time: string;
  notes?: string;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location?: {
    type: string;
    location: string;
  };
  invitees: Array<{
    email: string;
    name: string;
  }>;
}

/**
 * Create a Calendly event from booking data
 */
export async function createCalendlyEvent(
  booking: CalendlyBooking,
  calendlyApiKey: string,
  eventTypeUri: string
): Promise<CalendlyEvent> {
  try {
    const startDateTime = new Date(`${booking.date}T${booking.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes

    const response = await fetch('https://api.calendly.com/scheduled_events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${calendlyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventTypeUri,
        invitees: [
          {
            email: booking.email,
            name: booking.name,
          },
        ],
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: booking.meetingType === 'video' 
          ? { type: 'zoom', location: 'Zoom Meeting' }
          : booking.meetingType === 'phone'
          ? { type: 'phone', location: booking.phone || 'Phone Call' }
          : { type: 'calendly', location: 'Calendly Chat' },
        notes: booking.notes || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Calendly API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const event = await response.json();
    
    logger.info('Calendly event created', {
      eventUri: event.uri,
      email: booking.email,
    });

    return event;
  } catch (error) {
    const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
    logger.error('Failed to create Calendly event', errorObj, {
      booking: booking.email,
    });
    throw error;
  }
}

/**
 * Get available Calendly event types
 */
export async function getCalendlyEventTypes(
  calendlyApiKey: string,
  userUri?: string
): Promise<Array<{ uri: string; name: string; duration: number }>> {
  try {
    const url = userUri 
      ? `https://api.calendly.com/event_types?user=${userUri}`
      : 'https://api.calendly.com/event_types';
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${calendlyApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.collection.map((eventType: any) => ({
      uri: eventType.uri,
      name: eventType.name,
      duration: eventType.duration,
    }));
  } catch (error) {
    const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
    logger.error('Failed to fetch Calendly event types', errorObj);
    throw error;
  }
}
