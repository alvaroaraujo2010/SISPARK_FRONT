export const environment = {
  production: false,
  /** Mismo path que produccion; `ng serve` reenvia `/api` al backend via proxy.conf.json */
  apiBaseUrl: '/api',
  /** Clave para POST /api/webhooks/whatsapp/simulate en local */
  channelDevApiKey: 'SISPARK_DEV_CHANNEL_KEY',
};
