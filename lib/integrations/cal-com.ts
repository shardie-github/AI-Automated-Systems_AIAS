/**
 * Cal.com Integration
 * Provides integration with Cal.com API for booking management
 */

import { logger } from '@/lib/logging/structured-logger';

export interface CalComBooking {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  meetingType: 'video' | 'phone' | 'chat';
  date: string;
  time: string;
  notes?: string;
}

export interface CalComEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    email: string;
    name: string;
  }>;
  location?: string;
  description?: string;
}

/**
 * Create a Cal.com booking
 */
export async function createCalComBooking(
  booking: CalComBooking,
  calComApiKey: string,
  eventTypeId: string
): Promise<CalComEvent> {
  try {
    const startDateTime = new Date(`${booking.date}T${booking.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes

    const response = await fetch('https://api.cal.com/v1/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${calComApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeId: parseInt(eventTypeId),
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        responses: {
          name: booking.name,
          email: booking.email,
          phone: booking.phone || '',
          company: booking.company || '',
          notes: booking.notes || '',
        },
        metadata: {
          meetingType: booking.meetingType,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Cal.com API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const event = await response.json();
    
    logger.info('Cal.com booking created', {
      bookingId: event.id,
      email: booking.email,
    });

    return {
      id: event.id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      attendees: event.attendees,
      location: event.location,
      description: event.description,
    };
  } catch (error) {
    const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
    logger.error('Failed to create Cal.com booking', errorObj, {
      booking: booking.email,
    });
    throw error;
  }
}

/**
 * Get available Cal.com event types
 */
export async function getCalComEventTypes(
  calComApiKey: string
): Promise<Array<{ id: string; title: string; length: number }>> {
  try {
    const response = await fetch('https://api.cal.com/v1/event-types', {
      headers: {
        'Authorization': `Bearer ${calComApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cal.com API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.event_types.map((eventType: any) => ({
      id: eventType.id.toString(),
      title: eventType.title,
      length: eventType.length,
    }));
  } catch (error) {
    const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
    logger.error('Failed to fetch Cal.com event types', errorObj);
    throw error;
  }
}
