//this file is used to create the initial data in the database. And since it ran successfully, the table was created.

import dotenv from 'dotenv';

// load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Key:', supabaseKey);

const createTable = async () => {
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
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (response.ok) {
      const text = await response.text();
      const result = text ? JSON.parse(text) : {}; // Parse JSON if response body is not empty
      console.log('Table created successfully:', result);
    } else {
      const error = await response.json();
      console.error('Error creating table:', error);
    }
  } catch (err) {
    console.error('Error executing query:', err);
  }
};

createTable();
