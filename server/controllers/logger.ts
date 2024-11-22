import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { ServerError } from '../../types/types.ts';

dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseKey: string = process.env.SUPABASE_API_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_API_KEY in the environment variables.',
  );
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

interface UserData {
  userinput: string;
  parsedpreferences: string;
  filtereddata: string;
  recommendation: string;
}

export const insertUserDataMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userData: UserData = res.locals;

  if (!userData) {
    const error: ServerError = {
      log: 'Missing user data in res.locals',
      status: 400,
      message: { err: 'User data is required but missing.' },
    };
    return next(error);
  }

  try {
    const { data, error } = await supabase.from('user_data').insert([userData]);

    if (error) {
      console.error('Error inserting data:', error);
      return res.status(500).json({ error: 'Failed to insert data' });
    }

    console.log('Data inserted successfully:', data);
    // Store inserted data in `res.locals` for further middleware
    res.locals.insertedData = data[0];
    next();
  } catch (err) {
    console.error('Error during insertion:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// Middleware to get all user data
export const getUserDataMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { data, error } = await supabase.from('user_data').select('*');

    if (error) {
      console.error('Error retrieving data:', error);
      return res.status(500).json({ error: 'Failed to retrieve data' });
    }

    console.log('Retrieved Data:', data);
    // Store retrieved data in `res.locals` for further use
    res.locals.userData = data;
    next();
  } catch (err) {
    console.error('Error during retrieval:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
