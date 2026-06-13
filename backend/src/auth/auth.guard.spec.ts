import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtVerifierService } from './jwt-verifier.service';

function contextWithAuthHeader(authorization?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  it('rejects missing token', async () => {
    const guard = new AuthGuard({ verifyAccessToken: jest.fn() } as unknown as JwtVerifierService);
    await expect(guard.canActivate(contextWithAuthHeader())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts valid token when verifier succeeds', async () => {
    const verifier = {
      verifyAccessToken: jest.fn().mockResolvedValue({ provider: 'auth0', providerUserId: 'auth0|1' }),
    } as unknown as JwtVerifierService;
    const guard = new AuthGuard(verifier);
    await expect(guard.canActivate(contextWithAuthHeader('Bearer token'))).resolves.toBe(true);
  });
});
