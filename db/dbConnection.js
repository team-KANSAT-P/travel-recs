//connect to the supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

//func to insert and get data from the database
export const insertUserData = async (
  userinput,
  parsedpreferences,
  filtereddata,
  recommendation,
) => {
  const { data, error } = await supabase.from('user_data').insert([
    {
      userinput,
      parsedpreferences,
      filtereddata,
      recommendation,
    },
  ]);

  if (error) {
    console.error('Error inserting data:', error);
    return null;
  }
  console.log('Data inserted successfully:', data);
  return data;
};

// Fetch all user data from the database
export const getUserData = async () => {
  const { data, error } = await supabase.from('user_data').select('*');

  if (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
  return data;
};

const getData = async () => {
  const data = await getUserData();
  console.log('Retrieved Data:', data);
};

getData();
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
