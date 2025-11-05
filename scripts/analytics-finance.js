// Analytics script to generate finance dashboard data (CAD)
// Run via GitHub Actions daily or manually: node scripts/analytics-finance.js
//
// Setup:
// 1. Install dependencies: npm install stripe @supabase/supabase-js (if using)
// 2. Set environment variables: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_KEY
// 3. Customize data sources below

const fs = require('fs');
const path = require('path');

// Uncomment if using Stripe
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Uncomment if using Supabase
// const { createClient } = require('@supabase/supabase-js');
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

// GST/HST rates by province (2025)
const TAX_RATES = {
  'AB': 0.05, // GST only
  'BC': 0.12, // GST + PST
  'MB': 0.12, // GST + PST
  'NB': 0.15, // HST
  'NL': 0.15, // HST
  'NS': 0.15, // HST
  'NT': 0.05, // GST only
  'NU': 0.05, // GST only
  'ON': 0.13, // HST
  'PE': 0.15, // HST
  'QC': 0.14975, // GST + QST
  'SK': 0.11, // GST + PST
  'YT': 0.05  // GST only
};

function calculateTax(amount, province = 'ON') {
  const rate = TAX_RATES[province.toUpperCase()] || TAX_RATES['ON'];
  return parseFloat((amount * rate).toFixed(2));
}

async function generateFinanceAnalytics() {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const readableDate = new Date().toISOString().split('T')[0];
    const reportsDir = path.join(__dirname, '../ops/dashboards/reports');
    
    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log(`Created reports directory: ${reportsDir}`);
    }

    // Initialize CSV header
    const financeData = [
      ['Date', 'Transaction ID', 'Customer Email', 'Product/Service', 'Amount (CAD)', 'GST/HST (CAD)', 'Total (CAD)', 'Payment Method', 'Status', 'Notes']
    ];

    // OPTION 1: Fetch from Stripe API
    // Uncomment and customize:
    /*
    try {
      const charges = await stripe.charges.list({
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
        }
      });

      for (const charge of charges.data) {
        if (charge.currency !== 'cad') continue; // Only CAD transactions
        
        const amount = charge.amount / 100; // Convert from cents
        const province = charge.billing_details.address?.state || 'ON';
        const tax = calculateTax(amount, province);
        const total = amount + tax;
        
        financeData.push([
          new Date(charge.created * 1000).toISOString().split('T')[0],
          charge.id,
          charge.billing_details.email || 'N/A',
          charge.description || 'Product/Service',
          amount.toFixed(2),
          tax.toFixed(2),
          total.toFixed(2),
          charge.payment_method_details?.type || 'Stripe',
          charge.status === 'succeeded' ? 'Completed' : charge.status,
          charge.metadata?.notes || ''
        ]);
      }
    } catch (error) {
      console.error('Error fetching from Stripe:', error.message);
    }
    */

    // OPTION 2: Fetch from Supabase transactions table
    // Uncomment and customize:
    /*
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      transactions.forEach(txn => {
        const amount = parseFloat(txn.amount_cad);
        const tax = calculateTax(amount, txn.province || 'ON');
        const total = amount + tax;
        
        financeData.push([
          txn.date.split('T')[0],
          txn.stripe_id || txn.id,
          txn.customer_email,
          txn.product_service || 'Product/Service',
          amount.toFixed(2),
          tax.toFixed(2),
          total.toFixed(2),
          txn.payment_method || 'Stripe',
          txn.status || 'Completed',
          txn.notes || ''
        ]);
      });
    } catch (error) {
      console.error('Error fetching from Supabase:', error.message);
    }
    */

    // OPTION 3: Read from CSV export (if exported manually)
    // Uncomment to read from existing export:
    /*
    try {
      const csvPath = path.join(__dirname, '../ops/dashboards/finance-export.csv');
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').slice(1); // Skip header
        lines.forEach(line => {
          if (line.trim()) {
            financeData.push(line.split(','));
          }
        });
      }
    } catch (error) {
      console.error('Error reading CSV:', error.message);
    }
    */

    // If no data fetched, add sample row for testing
    if (financeData.length === 1) {
      console.warn('⚠️  No data sources configured. Adding sample row for testing.');
      const sampleAmount = 29.99;
      const sampleTax = calculateTax(sampleAmount, 'ON');
      financeData.push([
        readableDate,
        'TXN-SAMPLE-001',
        'sample@example.com',
        'Basic Plan',
        sampleAmount.toFixed(2),
        sampleTax.toFixed(2),
        (sampleAmount + sampleTax).toFixed(2),
        'Stripe',
        'Completed',
        'Sample transaction - configure data sources'
      ]);
    }

    // Convert to CSV
    const csvContent = financeData.map(row => {
      return row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',');
    }).join('\n');
    
    const outputPath = path.join(reportsDir, `finance-${today}.csv`);
    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    
    // Calculate summary statistics
    const transactions = financeData.slice(1); // Exclude header
    const totalRevenue = transactions.reduce((sum, row) => {
      return sum + parseFloat(row[4] || 0); // Amount column
    }, 0);
    const totalTax = transactions.reduce((sum, row) => {
      return sum + parseFloat(row[5] || 0); // Tax column
    }, 0);
    
    console.log(`✅ Finance analytics report generated: ${outputPath}`);
    console.log(`   Transactions: ${transactions.length}`);
    console.log(`   Total Revenue: $${totalRevenue.toFixed(2)} CAD`);
    console.log(`   Total Tax: $${totalTax.toFixed(2)} CAD`);
    
    return { 
      success: true, 
      file: outputPath, 
      transactions: transactions.length,
      revenue: totalRevenue,
      tax: totalTax
    };
    
  } catch (error) {
    console.error('❌ Error generating finance analytics:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  generateFinanceAnalytics().catch(console.error);
}

module.exports = { generateFinanceAnalytics };
