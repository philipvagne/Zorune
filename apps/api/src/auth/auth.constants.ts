const DEFAULT_JWT_SECRET = 'dev-secret';
const DEFAULT_HTTP_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
];

function parseOriginList(value?: string) {
  return (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return DEFAULT_JWT_SECRET;
}

export function getHttpCorsOrigins() {
  const configuredOrigins = parseOriginList(process.env.CORS_ORIGINS);
  return configuredOrigins.length > 0
    ? configuredOrigins
    : DEFAULT_HTTP_CORS_ORIGINS;
}

export function getWebsocketCorsOrigins() {
  const configuredOrigins = parseOriginList(
    process.env.WS_CORS_ORIGINS || process.env.CORS_ORIGINS,
  );

  return configuredOrigins.length > 0
    ? configuredOrigins
    : getHttpCorsOrigins();
}
