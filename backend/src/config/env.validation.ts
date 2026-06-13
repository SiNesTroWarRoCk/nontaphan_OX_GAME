type Environment = Record<string, string | undefined>;

const requiredInProduction = ['DATABASE_URL', 'AUTH0_DOMAIN', 'AUTH0_AUDIENCE'] as const;

export function validateEnv(config: Environment) {
  const port = config.PORT ? Number(config.PORT) : 3000;

  if (Number.isNaN(port) || port <= 0) {
    throw new Error('PORT must be a positive number');
  }

  if (config.NODE_ENV === 'production') {
    for (const key of requiredInProduction) {
      if (!config[key]) {
        throw new Error(`${key} is required in production`);
      }
    }
  }

  return {
    ...config,
    PORT: port,
    FRONTEND_URL: config.FRONTEND_URL ?? config.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    FRONTEND_ORIGIN: config.FRONTEND_ORIGIN ?? config.FRONTEND_URL ?? 'http://localhost:5173',
  };
}
