import { NextResponse } from 'next/server';
import type { ProblemDetails } from '@cinenova/contracts';

export function problemResponse(problem: ProblemDetails): NextResponse<ProblemDetails> {
  return NextResponse.json(problem, { status: problem.status });
}

export function validationProblem(detail: string, traceId?: string): NextResponse<ProblemDetails> {
  return problemResponse({
    type: 'https://docs.cinenova.local/errors/validation-failed',
    title: 'Validation failed',
    status: 400,
    code: 'VALIDATION_FAILED',
    detail,
    traceId,
  });
}

export function notFoundProblem(detail: string): NextResponse<ProblemDetails> {
  return problemResponse({
    type: 'https://docs.cinenova.local/errors/not-found',
    title: 'Resource not found',
    status: 404,
    code: 'NOT_FOUND',
    detail,
  });
}
