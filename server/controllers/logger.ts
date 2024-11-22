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
  const userData: UserData = {
    userinput: res.locals.userQuery,
    parsedpreferences: res.locals.parsedChat,
    filtereddata: res.locals.filteredPlaces,
    recommendation: res.locals.localRecommendation,
  };
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
      return next({
        log: 'logger.insertUserDataMiddleware: Error inserting data' + error,
        status: 500,
        message: {
          err: 'Server Error Occurred while trying to insert log data',
        },
      });
    }

    console.log('Data inserted successfully:', data);
    return next();
  } catch (error) {
    return next({
      log: 'logger.insertUserDataMiddleware: Error inserting data' + error,
      status: 500,
      message: {
        err: 'Server Error Occurred while trying to insert log data',
      },
    });
  }
};

// Middleware to get all user data
export const getUserDataMiddleware = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { data, error } = await supabase.from('user_data').select('*');

    if (error) {
      console.error('Error retrieving data:', error);
      return next({
        log: 'logger.getUserDataMiddleware: Error retrieving data' + error,
        status: 500,
        message: {
          err: 'Server Error Occurred while trying to retrieve log data',
        },
      });
    }

    console.log('Retrieved Data:', data);
    // Store retrieved data in `res.locals` for further use
    res.locals.userData = data;
    return next();
  } catch (err) {
    return next({
      log: 'logger.getUserDataMiddleware: Error retrieving data' + err,
      status: 500,
      message: {
        err: 'Server Error Occurred while trying to retrieve log data',
      },
    });
  }
};
