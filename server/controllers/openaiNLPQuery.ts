import { RequestHandler } from 'express';
import OpenAI from 'openai';
import 'dotenv/config';
import { fields, includedType } from '../dataFields.ts';

interface ServerError {
  log: string;
  status: number;
  message: { err: string };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const queryOpenAIChat: RequestHandler = async (_req, res, next) => {
  const { userQuery } = res.locals;

  // // testing query
  // const userQuery: string = 'how are you';

  const mockRequest = {
    textQuery: userQuery,
    fields: fields,
    includedType: includedType,
    maxResultCount: 5,
  };

  const instructRole = `
  You are a parsing expert that converts natural language prompts to JSON key value pairs.
  You're our best friend, be concise if there's not enough information in the userQuery.
    `;

  const instructGoal = `
  When given a user's query, break their query up into values for the keys:textQuery, field and includedType.
  If the user query request is pluralized set the default maxResultCount to a number between 2-5 in the JSON object.
  maxResultCount cannot be greater than 5.
  If the user query request is singular, set the default maxResultCount to 1 in the JSON object.
  Do not add any information to your description that is not present in information provided to you.
  Do not add any information to the field key that are not present in ${mockRequest.fields}.
  Do not add any information to the includedType key that are not present in ${mockRequest.includedType}.
  Always include displayName, location and businessStatus in the fields array, but add to that array based on keywords from the userQuery.
  Example: { textQuery: 'Tacos in Mountain View', fields: ['displayName', 'location', 'businessStatus'], includedType: 'restaurant', maxResultCount: 8, }
  Do not add any markdown or any other preceeding text to the output.
  Remove any back slashes in the output.
  If there's not enough information given by the user, ask for more information naturally.
  If you are unsure about an includedType, add an additional includedType that you may be less confident about.
    `;

  const instructFormat = `
  Your response should be a JSON in the format: ${mockRequest}
    `;

  const systemMessage = instructRole + instructGoal + instructFormat;

  const userMessage = `
  User request: """I want to go to a place like: ${userQuery}"""
  JSON: """${mockRequest}"""
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: `
              ${systemMessage}
                `,
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${userMessage}`,
            },
          ],
        },
      ],
      temperature: 0.8,
    });

    const openAiResponse = response?.choices?.[0]?.message?.content;
    if (!openAiResponse) {
      const error: ServerError = {
        log: 'queryOpenAIChat did not receive valid response',
        status: 500,
        message: { err: 'An error occurred while querying OpenAI' },
      };
      return next(error);
    }

    console.log('openAiResponse:', openAiResponse);

    function processOpenAiResponse(response: string): void {
      try {
        const parsedResponse = JSON.parse(response);
        console.log('JSON Response:', parsedResponse);
        res.locals.parsedChat = parsedResponse;
      } catch (error) {
        console.log('String Response:', response);
        res.locals.parsedChat = openAiResponse;
      }
    }

    processOpenAiResponse(openAiResponse);

    return next();
  } catch (err) {
    const error = {
      log: `Error querying OpenAI: ${err}`,
      status: 500,
      message: { err: 'Failed to process the OpenAI request.' },
    };
    return next(error);
  }
};
