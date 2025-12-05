/**
 * Enhanced Email Template Engine
 * Supports nested dynamic fields, conditional rendering, and component includes
 */

import dynamicFields from '../../emails/fields/dynamic_fields.json';

export interface TemplateVariables {
  [key: string]: any;
}

/**
 * Replace template variables with support for nested paths
 * Supports: {{user.first_name}}, {{product.site_url}}, etc.
 */
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  // Replace nested variables (e.g., {{user.first_name}})
  const nestedVarRegex = /\{\{([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)\}\}/g;
  result = result.replace(nestedVarRegex, (match, path) => {
    const value = getNestedValue(variables, path);
    return value !== undefined && value !== null ? String(value) : match;
  });

  // Replace simple variables (e.g., {{firstName}})
  const simpleVarRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  result = result.replace(simpleVarRegex, (match, key) => {
    if (variables[key] !== undefined && variables[key] !== null) {
      return String(variables[key]);
    }
    // Check if it's a nested path that wasn't caught
    const nestedValue = getNestedValue(variables, key);
    return nestedValue !== undefined && nestedValue !== null ? String(nestedValue) : match;
  });

  return result;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key];
    }
    return undefined;
  }, obj);
}

/**
 * Render conditional blocks
 * Supports: {{#if condition}}...{{/if}}, {{#if condition}}...{{else}}...{{/if}}
 */
export function renderConditionals(template: string, variables: TemplateVariables): string {
  let result = template;

  // Handle {{#if}}...{{else}}...{{/if}} blocks
  const ifElseRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifElseRegex, (match, condition, trueBlock, falseBlock) => {
    const conditionValue = evaluateCondition(condition, variables);
    return conditionValue ? trueBlock : falseBlock;
  });

  // Handle {{#if}}...{{/if}} blocks (without else)
  const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (match, condition, block) => {
    const conditionValue = evaluateCondition(condition, variables);
    return conditionValue ? block : '';
  });

  return result;
}

/**
 * Evaluate condition expression
 * Supports: variable names, comparisons (==, !=, >, <, >=, <=), logical operators (&&, ||)
 */
function evaluateCondition(condition: string, variables: TemplateVariables): boolean {
  const trimmed = condition.trim();

  // Simple variable check
  if (trimmed.includes('.')) {
    const value = getNestedValue(variables, trimmed);
    return Boolean(value);
  }

  // Check if variable exists and is truthy
  if (variables[trimmed] !== undefined) {
    return Boolean(variables[trimmed]);
  }

  // Comparison operators
  if (trimmed.includes('==')) {
    const [left, right] = trimmed.split('==').map(s => s.trim());
    const leftValue = getNestedValue(variables, left) ?? left;
    const rightValue = getNestedValue(variables, right) ?? right;
    return leftValue == rightValue;
  }

  if (trimmed.includes('!=')) {
    const [left, right] = trimmed.split('!=').map(s => s.trim());
    const leftValue = getNestedValue(variables, left) ?? left;
    const rightValue = getNestedValue(variables, right) ?? right;
    return leftValue != rightValue;
  }

  if (trimmed.includes('>=')) {
    const [left, right] = trimmed.split('>=').map(s => s.trim());
    const leftValue = Number(getNestedValue(variables, left) ?? left);
    const rightValue = Number(getNestedValue(variables, right) ?? right);
    return leftValue >= rightValue;
  }

  if (trimmed.includes('<=')) {
    const [left, right] = trimmed.split('<=').map(s => s.trim());
    const leftValue = Number(getNestedValue(variables, left) ?? left);
    const rightValue = Number(getNestedValue(variables, right) ?? right);
    return leftValue <= rightValue;
  }

  if (trimmed.includes('>')) {
    const [left, right] = trimmed.split('>').map(s => s.trim());
    const leftValue = Number(getNestedValue(variables, left) ?? left);
    const rightValue = Number(getNestedValue(variables, right) ?? right);
    return leftValue > rightValue;
  }

  if (trimmed.includes('<')) {
    const [left, right] = trimmed.split('<').map(s => s.trim());
    const leftValue = Number(getNestedValue(variables, left) ?? left);
    const rightValue = Number(getNestedValue(variables, right) ?? right);
    return leftValue < rightValue;
  }

  // Default: check if truthy
  return Boolean(trimmed);
}

/**
 * Render component includes
 * Supports: {{> component_name}} or {{> component_name variables}}
 */
export function renderComponents(
  template: string,
  components: Record<string, string>,
  variables: TemplateVariables = {}
): string {
  let result = template;
  const componentRegex = /\{\{>\s*([a-zA-Z0-9_]+)(?:\s+([^}]+))?\}\}/g;

  result = result.replace(componentRegex, (match, componentName, componentVars) => {
    if (components[componentName]) {
      let componentTemplate = components[componentName];
      
      // If component has variables, merge them with main variables
      if (componentVars) {
        // Simple variable passing (e.g., {{> button button_url="/pricing" button_text="Upgrade"}})
        const varRegex = /(\w+)=["']([^"']+)["']/g;
        let componentVariables = { ...variables };
        let varMatch;
        while ((varMatch = varRegex.exec(componentVars)) !== null) {
          componentVariables[varMatch[1]] = varMatch[2];
        }
        componentTemplate = renderTemplate(componentTemplate, componentVariables, components);
      } else {
        componentTemplate = renderTemplate(componentTemplate, variables, components);
      }
      
      return componentTemplate;
    }
    return match;
  });

  return result;
}

/**
 * Format dates according to locale
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return String(date);
  }

  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'relative':
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    case 'short':
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
}

/**
 * Get default values for fields based on dynamic_fields.json
 */
export function getDefaultVariables(userData: any = {}): TemplateVariables {
  const defaults: TemplateVariables = {
    user: {
      first_name: userData.firstName || userData.first_name || 'there',
      last_name: userData.lastName || userData.last_name || '',
      email: userData.email || '',
      plan_name: userData.planName || userData.plan_name || 'Trial',
      trial_days_left: userData.trialDaysLeft || userData.trial_days_left || 0,
      workflow_count: userData.workflowCount || userData.workflow_count || 0,
      integration_count: userData.integrationCount || userData.integration_count || 0,
      automation_count: userData.automationCount || userData.automation_count || 0,
      time_saved_hours: userData.timeSavedHours || userData.time_saved_hours || 0,
    },
    product: {
      product_name: 'AIAS Platform',
      site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca',
      dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/dashboard`,
      pricing_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/pricing`,
      help_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/help`,
      signup_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/signup`,
    },
    urls: {
      upgrade_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/pricing?utm_source=email&utm_campaign=trial_ending`,
      dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/dashboard`,
      workflow_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/workflows`,
      integration_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/integrations`,
      template_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/templates`,
      help_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/help`,
    },
  };

  // Merge user data
  if (userData) {
    defaults.user = { ...defaults.user, ...userData };
  }

  return defaults;
}

/**
 * Full template rendering pipeline
 * Handles variables, conditionals, components, and date formatting
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables = {},
  components: Record<string, string> = {}
): string {
  // Merge with defaults
  const allVariables = {
    ...getDefaultVariables(),
    ...variables,
    // Flatten user data if provided at top level
    user: {
      ...getDefaultVariables().user,
      ...(variables.user || {}),
      // Support both camelCase and snake_case
      ...(variables.firstName ? { first_name: variables.firstName } : {}),
      ...(variables.lastName ? { last_name: variables.lastName } : {}),
      ...(variables.planName ? { plan_name: variables.planName } : {}),
    },
  };

  let result = template;

  // 1. Render components first (they may contain variables)
  result = renderComponents(result, components, allVariables);

  // 2. Render conditionals
  result = renderConditionals(result, allVariables);

  // 3. Replace variables
  result = replaceTemplateVariables(result, allVariables);

  // 4. Format dates (if any date helpers are used)
  // This would require additional date helper syntax, skipping for now

  return result;
}

/**
 * Load email template from file system
 * In production, this would read from the emails/ directory
 */
export async function loadEmailTemplate(templatePath: string): Promise<string> {
  // This is a placeholder - in production, use fs or fetch to load templates
  // For now, templates are imported directly
  throw new Error('loadEmailTemplate not implemented - use template strings directly');
}
