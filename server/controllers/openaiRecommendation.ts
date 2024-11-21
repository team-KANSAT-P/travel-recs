import { RequestHandler } from 'express';
import OpenAI from 'openai';
import 'dotenv/config';
import { error } from 'console';
import { ServerError } from '../../types/types.ts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export const openAIRecommendationResponse: RequestHandler = async (
  _req,
  res,
  next,
) => {
  const { filteredPlaces, userQuery } = res.locals;
  // console.log(' In the openairecommendationResponse that i want to be in');

  if (!filteredPlaces) {
    const error: ServerError = {
      log: 'queryOpenAIChat did not receive a user query',
      status: 500,
      message: {
        err: 'An error occurred before querying OpenAI for a recommendation',
      },
    };
    return next(error);
  }
  const instructRole = `You are a stereotypical valley girl who recommends locations based off what users are looking for.`;
  const instructGoal = `Your recommendation can be one or many based off of the user query here - ${userQuery} and you are to choose the best answer from these choices - ${filteredPlaces.map(
    (rec: any, i: number) => {
      return `${i}: ${JSON.stringify(rec)}`;
    },
  )}.
    If you are given more than one, please make your recommendations with this in mind so that each recomendation doesn't sound like the only one.`;
  const instructFormat = `Your response should be in the format:
  "[Location Name] - [Short description and reasons it's a good choice]"`;
  const systemMessage = instructRole + instructGoal + instructFormat;
  const userMessage = `
  User request: "Describe your ideal trip: ${userQuery}",
  Place options: ${filteredPlaces}`;
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    model: 'gpt-4o',
  });
  if (!response || response === undefined) {
    return next(error);
  }
  //   console.log(await response.choices[0].message.content);
  res.locals.localRecommendation = (await response.choices[0].message
    .content) as string;
  console.log('localRecommendation:', res.locals.localRecommendation);
  return next();
};
