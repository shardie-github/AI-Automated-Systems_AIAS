/**
 * PDF Generation Service
 * Generates PDFs using various methods (PDFKit, Puppeteer, etc.)
 */

import { logger } from '@/lib/logging/structured-logger';

export interface PDFContent {
  title: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

/**
 * Generate PDF using PDFKit (lightweight, server-side)
 * Note: This requires pdfkit package
 */
export async function generatePDFWithPDFKit(content: PDFContent): Promise<Buffer> {
  try {
    // Dynamic import to avoid requiring pdfkit in all environments
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: content.title,
        Author: content.metadata?.author || 'AIAS Platform',
        Subject: content.metadata?.subject || '',
        Keywords: content.metadata?.keywords?.join(', ') || '',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {});

    // Add title
    doc.fontSize(24).text(content.title, { align: 'center' });
    doc.moveDown(2);

    // Add sections
    for (const section of content.sections) {
      doc.fontSize(18).text(section.heading, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(section.content, { align: 'left' });
      doc.moveDown(2);
    }

    doc.end();

    // Wait for PDF to be generated
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
    });
  } catch (error) {
    const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
    logger.error('Failed to generate PDF with PDFKit', errorObj);
    throw error;
  }
}

/**
 * Generate PDF using Puppeteer (renders HTML to PDF)
 * Note: This requires puppeteer package and is heavier but more flexible
 */
export async function generatePDFWithPuppeteer(
  htmlContent: string,
  options?: {
    format?: 'A4' | 'Letter';
    margin?: { top?: string; right?: string; bottom?: string; left?: string };
  }
): Promise<Buffer> {
  try {
    // Dynamic import to avoid requiring puppeteer in all environments
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: options?.format || 'A4',
      margin: options?.margin || {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    logger.info('PDF generated with Puppeteer', { size: pdf.length });
    return Buffer.from(pdf);
  } catch (error) {
    const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
    logger.error('Failed to generate PDF with Puppeteer', errorObj);
    throw error;
  }
}

/**
 * Generate System Prompts PDF (10-page master guide)
 */
export async function generateSystemPromptsPDF(_email: string, name: string): Promise<Buffer> {
  const content: PDFContent = {
    title: 'Master System Prompts Guide',
    metadata: {
      author: 'AIAS Platform',
      subject: 'AI Automation System Prompts',
      keywords: ['AI', 'automation', 'system prompts', 'workflows'],
    },
    sections: [
      {
        heading: 'Introduction to System Prompts',
        content: `Welcome, ${name}! This comprehensive guide will help you master the art of creating effective system prompts for AI automation. System prompts are the foundation of reliable AI behavior and consistent outputs.`,
      },
      {
        heading: 'Understanding System Prompts',
        content: 'System prompts define the role, behavior, and constraints of an AI assistant. They set the context, tone, and boundaries for AI interactions. A well-crafted system prompt ensures consistent, accurate, and useful AI responses.',
      },
      {
        heading: 'Best Practices for System Prompts',
        content: `1. Be Clear and Specific: Define exactly what you want the AI to do.
2. Set Boundaries: Clearly state what the AI should and shouldn't do.
3. Provide Context: Give relevant background information.
4. Use Examples: Show the AI what good outputs look like.
5. Iterate and Refine: Test and improve your prompts over time.`,
      },
      {
        heading: 'Common System Prompt Patterns',
        content: `Pattern 1: Role-Based Prompts - "You are a helpful assistant that..."
Pattern 2: Task-Specific Prompts - "Your task is to analyze..."
Pattern 3: Constraint-Based Prompts - "You must always..."
Pattern 4: Example-Driven Prompts - "Follow this format:..."
Pattern 5: Multi-Step Prompts - "First, analyze... Then, generate..."`,
      },
      {
        heading: 'Advanced Techniques',
        content: `- Chain of Thought: Break complex tasks into steps
- Few-Shot Learning: Provide examples in the prompt
- Temperature Control: Adjust creativity vs consistency
- Token Management: Optimize prompt length
- Context Windows: Manage conversation history`,
      },
      {
        heading: 'Workflow Automation Prompts',
        content: `For workflow automation, system prompts should:
- Define the workflow steps clearly
- Specify error handling behavior
- Include retry logic instructions
- Define success/failure criteria
- Include logging and monitoring instructions`,
      },
      {
        heading: 'Business Process Prompts',
        content: `When automating business processes:
- Understand the business context
- Map the current process flow
- Identify decision points
- Define exception handling
- Include human escalation paths`,
      },
      {
        heading: 'Security and Compliance',
        content: `System prompts must include:
- Data privacy requirements
- Security constraints
- Compliance rules (GDPR, PIPEDA, etc.)
- Audit logging instructions
- Access control rules`,
      },
      {
        heading: 'Testing and Validation',
        content: `Test your system prompts with:
- Various input scenarios
- Edge cases and error conditions
- Performance benchmarks
- Output quality metrics
- User acceptance testing`,
      },
      {
        heading: 'Next Steps',
        content: `Now that you understand system prompts:
1. Start with simple prompts and iterate
2. Test with real-world scenarios
3. Monitor AI behavior and outputs
4. Refine based on feedback
5. Document your prompt patterns

For more help, visit our documentation or contact support at support@aias-platform.com`,
      },
    ],
  };

  return generatePDFWithPDFKit(content);
}

/**
 * Generate HTML content for PDF (alternative method)
 */
export function generateSystemPromptsHTML(_email: string, name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Master System Prompts Guide</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
    h1 { color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #0066cc; margin-top: 30px; }
    p { margin: 15px 0; }
    ul { margin: 15px 0; padding-left: 30px; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <h1>Master System Prompts Guide</h1>
  <p>Welcome, ${name}! This comprehensive guide will help you master the art of creating effective system prompts for AI automation.</p>
  
  <div class="page-break">
    <h2>Introduction to System Prompts</h2>
    <p>System prompts define the role, behavior, and constraints of an AI assistant. They set the context, tone, and boundaries for AI interactions.</p>
  </div>
  
  <!-- Add more sections as needed -->
</body>
</html>
  `.trim();
}
