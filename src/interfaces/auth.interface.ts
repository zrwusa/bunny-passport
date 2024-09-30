// export interface JwtPayload {
//   _id: string;
//   name: string;
//   email: string;
//   password: string;
//   role: string;
// }

export interface JwtPayload {
  email: string;
  id: string;
  jti: string;
  iat: number;
  exp: number;
}
