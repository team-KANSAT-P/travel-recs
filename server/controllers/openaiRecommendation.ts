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
  const localRec = mapsApiResult
    .map(
      (reco: any, i) =>
        //Will need to add MANY more to this, all with the '?'
        `'''Option ${i}: $[reco-metadata?.name): ${reco.info}'''`,
    )
    .join(', ');
  const instructRole = `You are a stereotypical valley girl who gives advice to people about where is a good spot for them.`;
  const instructGoal = `Your recommendation can be one or many based off of the results passed to you here ${localRec}.
    If you are given more than one, please make your recommendations with this in mind so that each recomendation doesn't sound like the only one.`;
  const instructFormat = `Your response should be in the format:
  "[Location Name] - [Short description and reasons it's a good choice]"`;
  const systemMessage = instructRole + instructGoal + instructFormat;
  const userMessage = `
  User request: "I want to go to a to a place with: ${userQuery}",
  Place options: ${localRec}`;
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `${systemMessage}`,
      },
    ],
    model: 'gpt-4o-mini',
  });
  if (!response || response === undefined) {
    return next(error);
  }

  res.locals.localRecommendation = (await response.choices[0].message
    .content) as string;
  // 'Wishmaster - A malevolent genie wreaks havoc after being freed, leading to a battle between his dark desires and those trying to stop him.';
  return next();
};

// const instructRole =
// You are a helpful assistant and an expert in textual analysis.

// const instructGoal =

// You will be given a GENERATED string and a REFERENCE string.
// Compare the two strings to determine if any details are present in the GENERATED string that is not present in the REFERENCE string.
// Your response should be 0 if the GENERATED string uses simplification, rephrasing, summarization, highlighting broad themes, and/or presenting a different perspective. These should not be Your response should be 1 if the GENERATED string contains specific events in the movie plot that are not present in the REFERENCE string.

// const instructFormat =

// Your response should be 0 if the GENERATED string contains no new details.
// Your response should be 1 if the GENERATED string contains new details.
// Only include the number in your response (0 or 1).
// const systemMessage = instructRole + instructGoal + instructFormat

/*
const movieOptions = embeddingQueryResult
• map (
(movie, i) =
•'''Option ${i}: $[movie-metadata?.title): ${movie-metadata?-plot)''*•
• join(', ');
const instructRole = *
You are a helpful assistant that recommends movies to users based on their interests.
const instructGoal =
When given a user's query and a list of movies, recommend a single movie to the user and include a brief one-sentence description without spoilers.
DO NOT add any information to your description that is not present in information provided to you.
const instructFormat = *
Your response should be in the format:
"[Movie Title] - [One-sentence description]"
*;
const systemMessage = instructRole + instructGoal + instructFormat;
const userMessage =
User request: **"I want to watch a movie about: ${userQuery}"*
Movie ontions: "*"*{movielotions?"™

response');
PROBLEMS
OUTPUT
DEBUG CONSOLE
TERMINAL
PORTS
const systemMessage = *
You are an expert query parser.
Extract any information that should be used to filter the search - the only valid filters are years, genre, and director.
- For "years", extract the start and end years as "startYear" and "endYear". If the user provides only one year, use it as both "startYear" and "endYear".
Given a user's query, determine whether they have provided a movie summary to embed, a title to find, or other.
- If the user provides a summary to embed, include it in your response as "summaryToEmbed" and do NOT include a "titleToFind".
- Else if the user provides a title to
find, include it in your response as "titleToFind" and do NOT include a "summaryToEmbed" .
- If
the user provides "other", generate a hypothetical movie summary based on the user's query and include it in your response as
"summaryToEmbed"
and do NOT include a "title
Be sure that your response includes EITHER "summaryToEmbed" OR "titleToFind", but not both.

try {
const completion = await
openai.chat.completions.create(f
model:
'gpt-40-mini',
messages: [
role:
'system',
content: systemMessage,
role: 'user', content: userQuery,
temperature: 0.7,
response_format: {
type:
'json_schema',
json_schema: responseSchema,
}.
n: 3,



if (completion.choices [0].finish_reason throw new Error ('Incomplete response');
'length'){
if
(completion. choices [0] message. refusal) {
throw new Error ('Refused response');




const movieOptions = embeddingQueryResult
• map (
(movie, i) =
•'''Option ${i}: $[movie-metadata?.title): ${movie-metadata?-plot)''*•
• join(', ');
const instructRole = *
You are a helpful assistant that recommends movies to users based on their interests.
const instructGoal =
When given a user's query and a list of movies, recommend a single movie to the user and include a brief one-sentence description without spoilers.
DO NOT add any information to your description that is not present in information provided to you.
const instructFormat = *
Your response should be in the format:
"[Movie Title] - [One-sentence description]"
*;
const systemMessage = instructRole + instructGoal + instructFormat;
const userMessage =
User request: **"I want to watch a movie about: ${userQuery}"*
Movie ontions: "*"*{movielotions?"
*/
