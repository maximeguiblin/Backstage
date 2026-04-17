; import { Content } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box, Grid, Paper, Typography } from '@material-ui/core';

const WEBAPP_URL_ANNOTATION = 'webapp.io/url';

const getProxyUrl = (directUrl: string | undefined): string | undefined => {
  if (!directUrl) return undefined;
  try {
    const url = new URL(directUrl);
    return `/api/webapp-proxy/${url.hostname}${url.pathname}`;
  } catch {
    return undefined;
  }
};

export const isWebAppAvailable = (entity: { metadata: { annotations?: Record<string, string> } }) =>
  Boolean(entity.metadata.annotations?.[WEBAPP_URL_ANNOTATION]);

export const WebAppIFrameTab = () => {
  const { entity } = useEntity();
  const directUrl = entity.metadata.annotations?.[WEBAPP_URL_ANNOTATION];
  const webAppUrl = getProxyUrl(directUrl);

  if (!webAppUrl) {
    return (
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper style={{ padding: '24px' }}>
              <Typography variant="h4" gutterBottom>
                Web Application
              </Typography>
              <Typography variant="body1" color="textSecondary">
                No web application URL configured for this entity.
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: '16px' }}>
                Add the annotation <code>{WEBAPP_URL_ANNOTATION}: https://your-app-url</code> to your entity.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Content>
    );
  }

  return (
    <Content>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper style={{ padding: '24px' }}>
            <Typography variant="h4" gutterBottom>
              Web Application
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Live preview of the deployed application.{' '}
              <a href={directUrl} target="_blank" rel="noopener noreferrer">
                Open in new tab (direct)
              </a>
            </Typography>
            <Box style={{ marginTop: '16px' }}>
              <div style={{
                height: '800px',
                width: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <iframe
                  src={webAppUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title="Web Application Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Content>
  );
};
