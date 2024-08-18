// @flow

export const getServerUrl = (
  socketUrlBase: string,
  organizationId: string,
  visitorId: string,
  sessionId: string,
): string => {
  const socketUrl = new URL(socketUrlBase);
  const protocol = socketUrl.protocol === 'wss:' ? 'https' : 'http';
  const port = socketUrl.port ? `:${socketUrl.port}` : '';
  return `${protocol}://${socketUrl.hostname}${port}/feed/${organizationId}/${visitorId}/${sessionId}`;
};
