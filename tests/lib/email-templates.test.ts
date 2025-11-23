/**
 * Email Templates Tests
 */

import { describe, it, expect } from 'vitest';
import {
  emailTemplates,
  getTemplateById,
  getTemplatesByStage,
  getTemplatesByCategory,
  replaceTemplateVariables,
} from '@/lib/email-templates';

describe('Email Templates', () => {
  describe('getTemplateById', () => {
    it('should return template by id', () => {
      const template = getTemplateById('welcome');
      expect(template).toBeDefined();
      expect(template?.id).toBe('welcome');
    });

    it('should return undefined for non-existent template', () => {
      const template = getTemplateById('non-existent');
      expect(template).toBeUndefined();
    });
  });

  describe('getTemplatesByStage', () => {
    it('should return all awareness templates', () => {
      const templates = getTemplatesByStage('awareness');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => expect(t.stage).toBe('awareness'));
    });

    it('should return all decision templates', () => {
      const templates = getTemplatesByStage('decision');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => expect(t.stage).toBe('decision'));
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates by category', () => {
      const templates = getTemplatesByCategory('welcome');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => expect(t.category).toBe('welcome'));
    });
  });

  describe('replaceTemplateVariables', () => {
    it('should replace variables in template', () => {
      const template = 'Hello {{firstName}}, welcome to {{company}}!';
      const result = replaceTemplateVariables(template, {
        firstName: 'John',
        company: 'AIAS',
      });
      expect(result).toBe('Hello John, welcome to AIAS!');
    });

    it('should handle missing variables', () => {
      const template = 'Hello {{firstName}}!';
      const result = replaceTemplateVariables(template, {});
      expect(result).toBe('Hello {{firstName}}!');
    });

    it('should replace multiple occurrences', () => {
      const template = '{{firstName}} {{firstName}}';
      const result = replaceTemplateVariables(template, { firstName: 'John' });
      expect(result).toBe('John John');
    });
  });

  describe('Template Structure', () => {
    it('should have all required fields', () => {
      emailTemplates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.subject).toBeDefined();
        expect(template.stage).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.body).toBeDefined();
        expect(template.variables).toBeDefined();
        expect(Array.isArray(template.variables)).toBe(true);
      });
    });

    it('should have valid stage values', () => {
      const validStages = ['awareness', 'consideration', 'decision', 'onboarding', 'retention', 'reengagement'];
      emailTemplates.forEach(template => {
        expect(validStages).toContain(template.stage);
      });
    });
  });

  describe('Template Content', () => {
    it('should contain brand messaging', () => {
      const welcomeTemplate = getTemplateById('welcome');
      expect(welcomeTemplate?.body).toContain('Systems Thinking');
      expect(welcomeTemplate?.body).toContain('AI');
    });

    it('should contain Canadian branding where relevant', () => {
      const canadianTemplate = getTemplateById('canadian-integrations');
      expect(canadianTemplate?.body).toContain('Canada');
    });
  });
});
