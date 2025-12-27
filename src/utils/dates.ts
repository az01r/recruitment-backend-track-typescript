import { ParsedQs } from 'qs';
import { Prisma } from "../generated/prisma/client.js";
import ReqValidationError from "../types/request-validation-error.js";
import { INVALID_DATE_RANGE } from "./constants.js";

const validateDateRange = (from: Date, to: Date) => {
  if (from.getTime() > to.getTime()) {
    throw new ReqValidationError({ message: INVALID_DATE_RANGE, statusCode: 422 });
  }
}

type QueryParam = string | ParsedQs | (string | ParsedQs)[] | undefined;

export const getValidatedWhereDateTimeFilter: <T>(from: QueryParam, to: QueryParam) => Prisma.DateTimeFilter<T> =
  (from: QueryParam, to: QueryParam) => {
    const fromDate = from ? new Date(String(from)) : undefined;
    const toDate = to ? new Date(String(to)) : undefined;
    if (fromDate && toDate) {
      validateDateRange(fromDate, toDate);
    }
    return {
      gte: fromDate,
      lte: toDate
    };
  }