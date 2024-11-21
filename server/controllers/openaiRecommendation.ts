import { RequestHandler } from 'express';
import OpenAI from 'openai';
import { error } from 'console';
import { ServerError } from '../../types/types.ts';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY as string,
});

export const openAIRecommendationResponse: RequestHandler = async (
  _req,
  res,
  next,
) => {
  const { mapsApiResult, userQuery } = res.locals;
  //   const userQuery = 'I am looking for a spot with a large beer selection and a view if possible. I'd like it to be on the eat coast somewhere.'
  //const mapsApiResult = [
  // {name: 'sparky's', description: 'quaint small restaurant with a view of the ocean serving seafood with vegan options', location: 'Seattle, Washington'},
  // {name: 'The Pit', description: 'large chain restaurant with serving American style cuisine such as appetizers, entries, and desserts. Also serves a large variety of beer both craft and domestic.', location: 'Austin, Texas'},
  // {name: 'Killer Sam', description: 'Small pizza joint serving artisanal pizza. Also offers beer and cocktails.', location: Portland, Oregon},
  // {name: 'Nancy Eating People', description: 'Small restaurant with big flavors serving bite sized Swedish appetizers with your choice of cocktails.', location: 'New York, New York'},
  // {name: 'Git God Aiden', description: 'Fun large restaurant with surf and turf options that you eat with your hands such as lobster and fried chicken. Serves a variety of beer and cocktails located on the 14th floor in downtown Boston with a view of the city.', location: 'Boston, Massachusetts'}
  // ]

  console.log(
    'mapsApiResult in openAIRecommendationResponse middleware from res.locals: ',
    mapsApiResult,
  );

  if (!mapsApiResult) {
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
  const instructGoal = `Your recommendation can be one or many based off of the user query here - ${userQuery} and you are to choose the best answer from these choices - ${mapsApiResult.map(
    (rec: any, i: number) => {
      `${i}: ${JSON.stringify(rec)}`;
    },
  )}.
    If you are given more than one, please make your recommendations with this in mind so that each recomendation doesn't sound like the only one.`;
  const instructFormat = `Your response should be in the format:
  "[Location Name] - [Short description and reasons it's a good choice]"`;
  const systemMessage = instructRole + instructGoal + instructFormat;
  const userMessage = `
  User request: "Describe your ideal trip: ${userQuery}",
  Place options: ${mapsApiResult}`;
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

  res.locals.localRecommendation = (await response.choices[0].message
    .content) as string;
  return next();
};
