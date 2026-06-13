import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';
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
    this.audience = this.config.get<string>('AUTH0_AUDIENCE') ?? '';
    this.issuerUrl = this.resolveIssuerUrl();
    this.client = jwksClient({
      jwksUri: `${this.issuerUrl}.well-known/jwks.json`,
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
          issuer: this.issuerUrl,
        },
        (error, decoded) => {
          if (error || !decoded || typeof decoded === 'string') {
            reject(error ?? new Error('Invalid token'));
            return;
          }

          resolve(decoded as Auth0JwtPayload);
        },
      );
    }).catch(() => {
      throw new UnauthorizedException('Invalid or expired token');
    });

    if (!payload.sub) {
      throw new UnauthorizedException('Token subject is missing');
    }

    return {
      provider: this.extractProvider(payload.sub),
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
      return explicitIssuer.endsWith('/') ? explicitIssuer : `${explicitIssuer}/`;
    }

    const domain = this.config.get<string>('AUTH0_DOMAIN') ?? '';
    if (!domain) {
      return '';
    }

    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${normalizedDomain}/`;
  }

  private extractProvider(subject: string): string {
    return subject.includes('|') ? subject.split('|')[0] : 'auth0';
  }
}
