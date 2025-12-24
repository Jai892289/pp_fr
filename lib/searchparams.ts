// lib/searchparams.ts
import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  mode: parseAsString.withDefault('Re-Assessment'),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  wardId: parseAsString,
  ownerName: parseAsString,
  uniquePropertyId: parseAsString,
  primaryContactNo: parseAsString,
  propertyType: parseAsString,
  status: parseAsString,
  holdingType: parseAsString
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);