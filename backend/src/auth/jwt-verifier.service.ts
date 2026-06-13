import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { JwtHeader, JwtPayload, SigningKeyCallback, VerifyErrors } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import type { AuthUser } from './auth.types';

type Auth0JwtPayload = JwtPayload & {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
};

@Injectable()
export class JwtVerifierService {
  private readonly audience: string;
  private readonly issuerUrl: string;
  private readonly client: JwksClient;

  constructor(private readonly config: ConfigService) {
    this.audience = this.config.get<string>('GOOGLE_CLIENT_ID') ?? this.config.get<string>('AUTH0_AUDIENCE') ?? '';
    this.issuerUrl = this.resolveIssuerUrl();
    this.client = new JwksClient({
      jwksUri: this.resolveJwksUri(),
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  async verifyAccessToken(token: string): Promise<AuthUser> {
    if (!this.audience || !this.issuerUrl) {
      throw new UnauthorizedException('Authentication is not configured');
    }

    const payload = await new Promise<Auth0JwtPayload>((resolve, reject) => {
      jwt.verify(
        token,
        this.getSigningKey.bind(this),
        {
          algorithms: ['RS256'],
          audience: this.audience,
          issuer: this.getAllowedIssuers(),
        },
        (error: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
          if (error || !decoded || typeof decoded === 'string') {
            reject(error ?? new Error('Invalid token'));
            return;
          }

          resolve(decoded as Auth0JwtPayload);
        },
      );
    }).catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('JWT verification failed:', error instanceof Error ? error.message : error);
      }
      throw new UnauthorizedException('Invalid or expired token');
    });

    if (!payload.sub) {
      throw new UnauthorizedException('Token subject is missing');
    }

    return {
      provider: this.extractProvider(payload.sub, payload.iss),
      providerUserId: payload.sub,
      email: payload.email,
      displayName: payload.name ?? payload.nickname ?? payload.email,
      avatarUrl: payload.picture,
    };
  }

  private getSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
    if (!header.kid) {
      callback(new Error('Token key id is missing'));
      return;
    }

    this.client.getSigningKey(header.kid, (error, key) => {
      if (error || !key) {
        callback(error ?? new Error('Signing key not found'));
        return;
      }

      callback(null, key.getPublicKey());
    });
  }

  private resolveIssuerUrl(): string {
    const explicitIssuer = this.config.get<string>('AUTH0_ISSUER_URL');
    if (explicitIssuer) {
      return explicitIssuer;
    }

    const domain = this.config.get<string>('AUTH0_DOMAIN') ?? '';
    if (!domain) {
      return '';
    }

    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${normalizedDomain}/`;
  }

  private resolveJwksUri(): string {
    const explicitJwksUri = this.config.get<string>('AUTH0_JWKS_URI');
    if (explicitJwksUri) {
      return explicitJwksUri;
    }

    const normalizedIssuer = this.issuerUrl.endsWith('/') ? this.issuerUrl : `${this.issuerUrl}/`;
    return `${normalizedIssuer}.well-known/jwks.json`;
  }

  private getAllowedIssuers(): [string, ...string[]] {
    const issuers = [this.issuerUrl];

    if (this.issuerUrl.endsWith('/')) {
      issuers.push(this.issuerUrl.replace(/\/$/, ''));
    } else {
      issuers.push(`${this.issuerUrl}/`);
    }

    if (this.issuerUrl.includes('accounts.google.com')) {
      issuers.push('accounts.google.com', 'https://accounts.google.com');
    }

    const uniqueIssuers = [...new Set(issuers.filter(Boolean))];
    return [uniqueIssuers[0], ...uniqueIssuers.slice(1)];
  }

  private extractProvider(subject: string, issuer?: string): string {
    if (issuer?.includes('accounts.google.com')) {
      return 'google';
    }

    return subject.includes('|') ? subject.split('|')[0] : 'oidc';
  }
}
