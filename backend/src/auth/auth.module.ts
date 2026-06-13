import { Global, Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtVerifierService } from './jwt-verifier.service';

@Global()
@Module({
  providers: [AuthGuard, JwtVerifierService],
  exports: [AuthGuard, JwtVerifierService],
})
export class AuthModule {}
