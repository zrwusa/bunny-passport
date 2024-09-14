
[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

## Project setup

### .env setup
```text
PORT=8080
FRONT_PORT=3000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=your_postgres_password_here
POSTGRES_DATABASE=your_postgres_database_here

GOOGLE_OAUTH2_AUTHORIZATION_URL=https://accounts.google.com/o/oauth2/auth
GOOGLE_OAUTH2_TOKEN_URL=https://oauth2.googleapis.com/token
SWAGGER_OAUTH2_REDIRECT_URL=http://localhost:8080/api/oauth2-redirect.html

JWT_SECRET=your_secret_key_here
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_SIGN_EXPIRES_IN=60m
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_AUTHORIZED_REDIRECT_URI=http://localhost:8080/auth/google/callback
OAUTH2_LOGIN_CALLBACK_REDIRECT_URL=/success
OAUTH2_GOOGLE_STRATEGY_CALLBACK_URL=http://localhost:8080/auth/google/callback
OAUTH2_GITHUB_STRATEGY_CALLBACK_URL=http://localhost:8080/auth/github/callback

GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Resources

## Stay in touch


## License