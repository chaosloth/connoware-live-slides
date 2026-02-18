declare module 'jose' {
  export interface JWTPayload {
    [key: string]: any;
  }

  export function jwtVerify(token: string, secret: Uint8Array): Promise<{ payload: JWTPayload }>;

  export class SignJWT {
    constructor(payload: Record<string, any>);
    setProtectedHeader(header: { alg: string }): SignJWT;
    setIssuedAt(): SignJWT;
    setExpirationTime(time: string | number): SignJWT;
    sign(secret: Uint8Array): Promise<string>;
  }
}