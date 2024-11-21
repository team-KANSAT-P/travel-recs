import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
//obtain userQuery from controller
import { userQuery } from './controller';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface ParsedPreferences {
  activities: string;
  atmosphere: string;
  budget: string;
  duration: string;
}

export const getParsedPreferences = async (
  userQuery: string,
): Promise<ParsedPreferences | null> => {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: ` 
    Extract the following information from the user's input: 
        - activities (e.g., hiking, dining, sightseeing),
        - atmosphere (e.g., relaxing, adventurous, lively),
        - budget (e.g., $ low, $$ average, $$$ high, $$$$ very high),
        - duration (e.g., 1 day, 1 week).
    If any information is not explicitly provided, leave the value as an empty string.
    Output format (always in JSON):
    {
    "activities": "",
    "atmosphere": "",
    "budget": "",
    "duration": ""
    }
    Expect input as User input ("{userQuery}"), and output as JSON Output
    `,
      max_tokens: 100,
    });

    const parsedpreferences: ParsedPreferences = JSON.parse(
      response.data.choices[0].text.trim(),
    );
    return parsedpreferences;
  } catch (error) {
    console.error('Error processing input with OpenAI:', error);
    return null;
  }
};
