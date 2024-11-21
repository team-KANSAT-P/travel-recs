import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env variables
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

//func to insert and get data from the database
export const insertUserData = async (
  userData: UserData,
): Promise<UserData | null> => {
  const { data, error } = await supabase.from('user_data').insert([userData]);

  if (error) {
    console.error('Error inserting data:', error);
    return null;
  }
  console.log('Data inserted successfully:', data);
  return data[0];
};

// Fetch all user data from the database
export const getUserData = async (): Promise<UserData[] | null> => {
  const { data, error } = await supabase.from('user_data').select('*');

  if (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
  return data;
};

//test on get user data
// const getData = async () => {
//   const data = await getUserData();
//   console.log('Retrieved Data:', data);
// };

// getData();

//test on insert user data
//the tested data has been added to the user_data table
// const runTest = async () => {
//   await insertUserData(
//     'I want a beach vacation in Hawaii',
//     '{"activities":"beach","atmosphere":"relaxing","budget":"luxury"}',
//     '{"places":["Waikiki Beach", "Kailua Beach"]}',
//     '{"recommendations":["Stay at Resort A", "Try snorkeling at Place B"]}',
//   );

//   const data = await getUserData();
//   console.log('Retrieved Data:', data);
// };

// runTest();
