import { GlobalWithFetchMock } from 'jest-fetch-mock';

interface GlobalWithFetchMockAndVars extends GlobalWithFetchMock {
  LASTFM_USERNAME: string;
  LASTFM_API_KEY: string;
}

const customGlobal: GlobalWithFetchMockAndVars = (global as unknown) as GlobalWithFetchMockAndVars;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
customGlobal.LASTFM_USERNAME = 'testusername';
customGlobal.LASTFM_API_KEY = 'testapikey';
