/**
 * Form Validation Utilities
 * 
 * Provides consistent validation patterns and user-friendly error messages.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Password validation
 */
export function validatePassword(
  password: string,
  options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecial?: boolean;
  }
): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  const minLength = options?.minLength || 8;
  if (password.length < minLength) {
    return {
      valid: false,
      error: `Password must be at least ${minLength} characters long`,
    };
  }

  if (options?.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (options?.requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  if (options?.requireNumbers && !/\d/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one number',
    };
  }

  if (options?.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one special character',
    };
  }

  return { valid: true };
}

/**
 * URL validation
 */
export function validateURL(url: string): ValidationResult {
  if (!url) {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName?: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      valid: false,
      error: fieldName ? `${fieldName} is required` : 'This field is required',
    };
  }
  return { valid: true };
}

/**
 * Minimum length validation
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName?: string
): ValidationResult {
  if (value.length < minLength) {
    return {
      valid: false,
      error: fieldName
        ? `${fieldName} must be at least ${minLength} characters`
        : `Must be at least ${minLength} characters`,
    };
  }
  return { valid: true };
}

/**
 * Maximum length validation
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName?: string
): ValidationResult {
  if (value.length > maxLength) {
    return {
      valid: false,
      error: fieldName
        ? `${fieldName} must be no more than ${maxLength} characters`
        : `Must be no more than ${maxLength} characters`,
    };
  }
  return { valid: true };
}

/**
 * Phone number validation (basic)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it's all digits and reasonable length
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Phone number must contain only digits' };
  }

  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }

  return { valid: true };
}

/**
 * Combine multiple validation results
 */
export function combineValidations(
  ...results: ValidationResult[]
): ValidationResult {
  for (const result of results) {
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
