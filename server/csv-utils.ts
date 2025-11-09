/**
 * CSV Utility Functions
 * For importing and exporting data in CSV format
 */

import type { Lead, Contact, Account, Opportunity } from '@shared/schema';

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(data: T[], columns?: string[]): string {
  if (data.length === 0) return '';

  // Use provided columns or extract from first object
  const headers = columns || Object.keys(data[0]);

  // Create CSV header row
  const csvHeaders = headers.join(',');

  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];

      // Handle null/undefined
      if (value === null || value === undefined) return '';

      // Handle dates
      if (value instanceof Date) return value.toISOString();

      // Handle strings with commas, quotes, or newlines
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Parse CSV string to array of objects
 */
export function csvToArray(csvString: string): Record<string, string>[] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of value
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Add last value
  values.push(currentValue.trim());

  return values;
}

/**
 * Generate CSV filename with timestamp
 */
export function generateCSVFilename(prefix: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}.csv`;
}

/**
 * Validate CSV data for leads import
 */
export function validateLeadCSV(data: Record<string, string>[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const requiredFields = ['name'];

  data.forEach((row, index) => {
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });

    // Validate email format if provided
    if (row.email && !isValidEmail(row.email)) {
      errors.push(`Row ${index + 1}: Invalid email format '${row.email}'`);
    }

    // Validate phone format if provided (basic validation)
    if (row.phone && row.phone.length < 10) {
      errors.push(`Row ${index + 1}: Invalid phone number '${row.phone}'`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Export leads to CSV format
 */
export function leadsToCSV(leads: Lead[]): string {
  const columns = [
    'name',
    'company',
    'email',
    'phone',
    'status',
    'source',
    'rating',
    'value',
    'description',
    'createdAt'
  ];

  return arrayToCSV(leads, columns);
}

/**
 * Export contacts to CSV format
 */
export function contactsToCSV(contacts: Contact[]): string {
  const columns = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'mobile',
    'title',
    'department',
    'accountId',
    'createdAt'
  ];

  return arrayToCSV(contacts, columns);
}

/**
 * Export opportunities to CSV format
 */
export function opportunitiesToCSV(opportunities: Opportunity[]): string {
  const columns = [
    'name',
    'stage',
    'value',
    'probability',
    'expectedCloseDate',
    'source',
    'description',
    'accountId',
    'ownerId',
    'createdAt'
  ];

  return arrayToCSV(opportunities, columns);
}
