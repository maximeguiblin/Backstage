import { Content } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
    Box,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
} from '@material-ui/core';
import { useMemo, useState } from 'react';

const DOCS_WEBAPP_HOST =
    'docs-webapp.thankfulfield-cf356ef2.northeurope.azurecontainerapps.io';

const CUSTOM_DOCS_ANNOTATION = 'sodexo.com/custom-docs';

type CustomDocEntry = {
    name: string;
    path: string;
};

const parseCustomDocs = (raw?: string): CustomDocEntry[] => {
    if (!raw) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(
            (e): e is CustomDocEntry =>
                e &&
                typeof e.name === 'string' &&
                typeof e.path === 'string' &&
                e.path.length > 0,
        );
    } catch {
        return [];
    }
};

export const isCustomDocsAvailable = (entity: {
    spec?: { type?: string };
    metadata?: { annotations?: Record<string, string> };
}) =>
    entity.spec?.type === 'usecase' &&
    parseCustomDocs(entity.metadata?.annotations?.[CUSTOM_DOCS_ANNOTATION])
        .length > 0;

export const CustomDocsTab = () => {
    const { entity } = useEntity();

    const docs = useMemo(
        () =>
            parseCustomDocs(
                entity.metadata.annotations?.[CUSTOM_DOCS_ANNOTATION],
            ),
        [entity],
    );

    const [selectedPath, setSelectedPath] = useState<string>(
        docs[0]?.path ?? '',
    );

    if (docs.length === 0) {
        return (
            <Content>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper style={{ padding: '24px' }}>
                            <Typography variant="h4" gutterBottom>
                                Custom Docs
                            </Typography>
                            <Typography variant="body1">
                                No custom documentation configured for this
                                entity. Add a{' '}
                                <code>{CUSTOM_DOCS_ANNOTATION}</code>{' '}
                                annotation with a JSON array of{' '}
                                <code>{'{ name, path }'}</code> entries.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Content>
        );
    }

    const docsUrl = `/api/webapp-proxy/${DOCS_WEBAPP_HOST}/docs/${selectedPath}/`;

    return (
        <Content>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper style={{ padding: '24px' }}>
                        <Box
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <Typography variant="h4" gutterBottom>
                                Custom Docs
                            </Typography>
                            <FormControl
                                variant="outlined"
                                size="small"
                                style={{ minWidth: 240 }}
                            >
                                <InputLabel id="custom-docs-select-label">
                                    Documentation
                                </InputLabel>
                                <Select
                                    labelId="custom-docs-select-label"
                                    value={selectedPath}
                                    onChange={e =>
                                        setSelectedPath(e.target.value as string)
                                    }
                                    label="Documentation"
                                >
                                    {docs.map(doc => (
                                        <MenuItem
                                            key={doc.path}
                                            value={doc.path}
                                        >
                                            {doc.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box style={{ marginTop: '16px' }}>
                            <div
                                style={{
                                    height: '800px',
                                    width: '100%',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}
                            >
                                <iframe
                                    key={selectedPath}
                                    src={docsUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }}
                                    title="Custom Docs Preview"
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
