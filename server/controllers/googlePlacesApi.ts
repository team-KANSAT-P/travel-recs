import { NextFunction, Request, RequestHandler, Response } from 'express';
import 'dotenv/config';

/**
 * Handles the request to get places by search text using the Google Places API.
 * @middleware
 * @function getPlacesBySearchText
 * @param _req - The incoming request object (not used in this handler).
 * @param res - The response object, used to send back the search results.
 * @param res.locals.parsedQueryParams - The parsed query parameters from openai natural language prompt parsing.
 * @param res.locals.placesUnfiltered - Modified to return unfiltered search results from the Google Places API.
 * @param next - The next middleware function in the stack.
 *
 * @throws Will call the next middleware with an error object if the googleAPI call fails.
 *
 * @remarks
 * This function constructs a request object with default parameters and merges it with
 * any parsed query parameters from `res.locals.parsedQueryParams`. It then performs a
 * search using the Google Places API and stores the unfiltered results in `res.locals.placesUnfiltered`.
 */
export const getPlacesBySearchText: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const request = {
      textQuery: 'RV park near Yosemite',
      includedtype: 'campground',
      languageCode: 'en',
      pageSize: 20,
      minRating: 2.0,
      regionCode: 'en',
      strictTypeFiltering: false,
      // may need to filter out parts of our parsedQueryParams that aren't explicit options for googleAPI
      // but for now, we just overwrite any defaults with our parsed query params
      ...res.locals.parsedQueryParams,
      fields: undefined,
    };
    const defaultFields = [
      'places.displayName',
      'places.editorialSummary',
      'places.rating',
      'places.priceRange',
      'places.regularOpeningHours',
    ];

    // we want to combine the fields instead of overwriting them
    const fieldsHeader: string = (res.locals.parsedQueryParams?.fields ?? [])
      .concat(defaultFields)
      .join(',');

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Goog-Api-Key':
            process.env.GOOGLE_API_KEY ??
            'could not load api key from environment variables',
          'X-Goog-FieldMask': fieldsHeader,
        },
        body: JSON.stringify(request),
      },
    );

    if (response.status !== 200) {
      const data = await response.json();
      return next({
        log:
          'googlePlacesController.getPlacesBySearchText: Google API request Error: ' +
          data,
        status: 500,
        message: { err: 'A Server Error Occurred while searching for Places' },
      });
    }

    const data = await response.json();
    res.locals.placesUnfiltered = data.places ?? [];
    return next();
  } catch (error) {
    console.log(error);
    return next({
      log: 'googlePlacesController.getPlacesBySearchText: ' + error,
      status: 500,
      message: { err: 'A Server Error Occurred while searching for Places' },
    });
  }
};

/**
 * Filters the places stored in `res.locals.placesUnfiltered` based on user query.
 * @middleware
 * @function filterPlacesByUserQuery
 * @param _req - The incoming request object (not used in this handler).
 * @param res - The response object, used to send back the filtered search results.
 * @param res.locals.placesUnfiltered - The unfiltered search results from the Google Places API.
 * @param res.locals.filteredPlaces - Modified to store the filtered search results.
 * @param next - The next middleware function in the stack.
 *
 * @throws Will call the next middleware with an error object if `res.locals.placesUnfiltered` is undefined.
 *
 * @remarks
 * This function assumes that `res.locals.placesUnfiltered` has been populated by a preceding middleware,
 * such as `getPlacesBySearchText`. It filters the places based on user query and stores the filtered results
 * in `res.locals.filteredPlaces`.
 */
export const filterPlacesByUserQuery: RequestHandler = (_req, res, next) => {
  if (!res.locals.placesUnfiltered)
    return next({
      log: 'googlePlacesController.filterPlacesByUserQuery: res.locals.placesUnfiltered is undefined! ( Make sure you are preceeding this middleware with another middleware function that populates the places, like `getPlacesBySearchText` )',
      status: 500,
      message: { err: 'A Surver Error Occurred while filtering Places' },
    });
  res.locals.filteredPlaces = res.locals.placesUnfiltered;
  // TODO: Implement filtering logic here when we understand the format/data of user queries
  res.locals.filteredPlaces.filter();
  return next();
};

const res: Partial<Response> = {
  locals: {
    parsedQueryParams: {},
  },
};

getPlacesBySearchText(
  {} as Request,
  res as Response,
  ((_req: Request, _res: Response, _next: NextFunction) => {
    console.log('next middleware');
  }) as NextFunction,
);
