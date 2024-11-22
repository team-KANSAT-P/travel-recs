import { Request, Response, NextFunction } from 'express';
import {
  getPlacesBySearchText,
  filterPlacesByUserQuery,
} from '../server/controllers/googlePlacesApi';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const { Response: FetchResponse } = jest.requireActual('node-fetch');

describe('googlePlacesApi controller', () => {
  describe('getPlacesBySearchText unittests', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {};
      res = {
        locals: {
          parsedChat: {},
        },
      };
      next = jest.fn();
    });

    it('should call next with error if fetch fails', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        new FetchResponse(JSON.stringify({ error: 'API error' }), {
          status: 500,
        }),
      );

      await getPlacesBySearchText(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          log: expect.stringContaining(
            'googlePlacesController.getPlacesBySearchText: Google API request Error:',
          ),
          status: 500,
          message: {
            err: 'A Server Error Occurred while searching for Places',
          },
        }),
      );
    });

    it('should set res.locals.placesUnfiltered and call next on success', async () => {
      const mockPlaces = [{ name: 'Place 1' }, { name: 'Place 2' }];
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        new FetchResponse(JSON.stringify({ places: mockPlaces }), {
          status: 200,
        }),
      );

      await getPlacesBySearchText(req as Request, res as Response, next);

      expect(res.locals!.placesUnfiltered).toEqual(mockPlaces);
      expect(next).toHaveBeenCalled();
    });

    it('should call next with error if an exception occurs', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Fetch error'),
      );

      await getPlacesBySearchText(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          log: expect.stringContaining(
            'googlePlacesController.getPlacesBySearchText:',
          ),
          status: 500,
          message: {
            err: 'A Server Error Occurred while searching for Places',
          },
        }),
      );
    });
  });

  describe('filterPlacesByUserQuery', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {};
      res = {
        locals: {
          placesUnfiltered: [{ name: 'Place 1' }, { name: 'Place 2' }],
        },
      };
      next = jest.fn();
    });

    it('should call next with error if res.locals.placesUnfiltered is undefined', () => {
      res.locals!.placesUnfiltered = undefined;

      filterPlacesByUserQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          log: expect.stringContaining(
            'googlePlacesController.filterPlacesByUserQuery: res.locals.placesUnfiltered is undefined!',
          ),
          status: 500,
          message: { err: 'A Surver Error Occurred while filtering Places' },
        }),
      );
    });

    it('should set res.locals.filteredPlaces and call next', () => {
      filterPlacesByUserQuery(req as Request, res as Response, next);

      expect(res.locals!.filteredPlaces).toEqual(res.locals!.placesUnfiltered);
      expect(next).toHaveBeenCalled();
    });
  });
});
