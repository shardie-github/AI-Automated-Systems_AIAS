/**
 * User-Friendly Error Messages
 * 
 * Provides clear, actionable error messages for users.
 * Replaces technical error messages with user-friendly alternatives.
 */

export interface ErrorContext {
  action?: string;
  resource?: string;
  field?: string;
  code?: string;
}

/**
 * Convert technical error messages to user-friendly messages
 */
export function getUserFriendlyError(
  error: Error | string,
  context?: ErrorContext
): { title: string; message: string; action?: string } {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection')
  ) {
    return {
      title: 'Connection Problem',
      message: 'We couldn\'t connect to our servers. Please check your internet connection and try again.',
      action: 'Try Again',
    };
  }

  // Authentication errors
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('login') ||
    lowerMessage.includes('token')
  ) {
    return {
      title: 'Authentication Required',
      message: 'Please sign in to continue.',
      action: 'Sign In',
    };
  }

  // Permission errors
  if (
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('permission') ||
    lowerMessage.includes('access denied')
  ) {
    return {
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action.',
      action: context?.action || 'Go Back',
    };
  }

  // Not found errors
  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('404') ||
    lowerMessage.includes('does not exist')
  ) {
    return {
      title: 'Not Found',
      message: context?.resource
        ? `The ${context.resource} you're looking for doesn't exist or has been removed.`
        : 'The requested resource could not be found.',
      action: 'Go Home',
    };
  }

  // Validation errors
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('required')
  ) {
    const field = context?.field || 'field';
    return {
      title: 'Invalid Input',
      message: `Please check the ${field} and try again.`,
      action: 'Fix and Retry',
    };
  }

  // Rate limiting
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('429')
  ) {
    return {
      title: 'Too Many Requests',
      message: 'You\'ve made too many requests. Please wait a moment and try again.',
      action: 'Wait and Retry',
    };
  }

  // Server errors
  if (
    lowerMessage.includes('server error') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('internal error')
  ) {
    return {
      title: 'Server Error',
      message: 'Something went wrong on our end. We\'ve been notified and are working on a fix.',
      action: 'Try Again',
    };
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      title: 'Request Timed Out',
      message: 'The request took too long to complete. Please try again.',
      action: 'Retry',
    };
  }

  // Database errors
  if (
    lowerMessage.includes('database') ||
    lowerMessage.includes('sql') ||
    lowerMessage.includes('query')
  ) {
    return {
      title: 'Database Error',
      message: 'We\'re experiencing technical difficulties. Please try again in a moment.',
      action: 'Retry',
    };
  }

  // Generic fallback
  return {
    title: 'Something Went Wrong',
    message: context?.action
      ? `We couldn't ${context.action}. Please try again.`
      : 'An unexpected error occurred. Please try again.',
    action: 'Try Again',
  };
}

/**
 * Get field-specific validation error message
 */
export function getFieldError(field: string, error: string): string {
  const lowerError = error.toLowerCase();

  if (lowerError.includes('required')) {
    return `${field} is required`;
  }

  if (lowerError.includes('email')) {
    return 'Please enter a valid email address';
  }

  if (lowerError.includes('password')) {
    if (lowerError.includes('short') || lowerError.includes('length')) {
      return 'Password must be at least 8 characters long';
    }
    if (lowerError.includes('weak')) {
      return 'Password is too weak. Please use a stronger password';
    }
    return 'Please check your password';
  }

  if (lowerError.includes('match')) {
    return `${field} does not match`;
  }

  if (lowerError.includes('format')) {
    return `${field} format is invalid`;
  }

  return error;
}

/**
 * Format error for display in UI
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
