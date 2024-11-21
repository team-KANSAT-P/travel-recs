//file for creating the initial table in the database
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseKey: string = process.env.SUPABASE_API_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_API_KEY in the environment variables.',
  );
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Create the `createTable` function
export const createTable = async (): Promise<void> => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userInput TEXT NOT NULL,
      parsedPreferences TEXT,
      filteredData TEXT,
      recommendation TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    const { data, error } = await supabase.rpc('execute_sql', { query });

    if (error) {
      console.error('Error creating table:', error.message);
      return;
    }

    console.log('Table created successfully:', data);
  } catch (err) {
    console.error('Error executing query:', (err as Error).message);
  }
};

// Call the function (only if this file is run directly)
if (require.main === module) {
  createTable();
}
