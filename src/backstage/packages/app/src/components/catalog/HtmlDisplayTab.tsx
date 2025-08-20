import { Content } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box, Grid, Paper, Typography } from '@material-ui/core';

interface HtmlDisplayTabProps {
  annotationKey: string;
  title: string;
  description: string;
  height?: string | number;
  showSourceLink?: boolean;
}

export const HtmlDisplayTab = ({ 
  annotationKey,
  title,
  description,
  height = '800px',
  showSourceLink = true
}: HtmlDisplayTabProps) => {
  // Convert height to string if it's a number (add 'px' suffix)
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  const { entity } = useEntity();
  
  // Get the HTML content URL from the entity annotation
  const htmlContentUrl = entity.metadata.annotations?.[annotationKey];
  
  if (!htmlContentUrl) {
    return (
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper style={{ padding: '24px' }}>
              <Typography variant="h4" gutterBottom>
                {title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                No {title.toLowerCase()} configured for this entity.
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: '16px' }}>
                To enable {title.toLowerCase()}, add the annotation{' '}
                <code>{annotationKey}: [URL]</code> to your component.
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
              {title}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {description}
            </Typography>
            
            <Box style={{ marginTop: '24px' }}>
              <div style={{ 
                height: heightValue, 
                width: '100%', 
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <iframe
                  src={htmlContentUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title={title}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              </div>
            </Box>
            
            {showSourceLink && (
              <Box style={{ marginTop: '16px' }}>
                <Typography variant="body2" color="textSecondary">
                  Source: <a href={htmlContentUrl} target="_blank" rel="noopener noreferrer">{htmlContentUrl.split('?')[0]}</a>
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Content>
  );
};
