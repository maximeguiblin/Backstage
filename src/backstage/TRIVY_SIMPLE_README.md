# Simple Trivy Security Reports in Backstage

This is a simple implementation that adds a "Security Report" tab to repository entities in Backstage, displaying Trivy HTML reports directly from Azure Storage URLs.

## How It Works

1. **Annotation-based**: Add a `trivy.security-report` annotation to your component in the catalog
2. **Direct URL**: The annotation contains the direct Azure Storage URL to the HTML report
3. **Iframe Display**: Backstage renders the HTML report in an iframe within a new tab

## Setup

### 1. Add Annotation to Your Component

In your `aip-catalog.yaml` or component catalog file, add the annotation:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: GLB.GLB.DataLab.AIPlatform.SDK
  annotations:
    # ... other annotations ...
    trivy.security-report: https://aziest1doc001.blob.core.windows.net/report/GLB.GLB.DataLab.AIPlatform.SDK.html
spec:
  type: repo
  # ... rest of spec
```

### 2. URL Format

The URL should point directly to your HTML file in Azure Storage:
```
https://{storage-account}.blob.core.windows.net/{container}/{path-to-file}.html
```

For example:
```
https://aziest1doc001.blob.core.windows.net/report/aip/sdk/trivy_report.html
```

## Usage

1. Navigate to any repository entity in your Backstage catalog
2. Click on the **"Security Report"** tab
3. The Trivy HTML report will be displayed in a full-width iframe

## Features

- **Simple Configuration**: Just add one annotation to your component
- **No Backend Changes**: Works entirely on the frontend
- **Direct Storage Access**: Reads HTML directly from Azure Storage
- **Responsive Design**: Full-width iframe optimized for security reports
- **Fallback Handling**: Shows helpful message if no report is configured

## File Structure

```
src/backstage/
├── packages/app/src/components/catalog/
│   ├── EntityPage.tsx          # Modified to add Security Report tab
│   └── TrivyReportTab.tsx      # New: Simple report display component
├── sodexo/
│   └── aip-catalog.yaml        # Modified: Added trivy.security-report annotation
└── TRIVY_SIMPLE_README.md      # This file
```

## Customization

### Change Tab Title
Edit the `title` attribute in `EntityPage.tsx`:
```typescript
<EntityLayout.Route path="/security-report" title="Security Report">
```

### Change Iframe Height
Edit the height in `TrivyReportTab.tsx`:
```typescript
<div style={{ 
  height: '800px',  // Change this value
  width: '100%',
  // ... other styles
}}>
```

### Add More Annotations
You can add multiple Trivy-related annotations if needed:
```yaml
annotations:
  trivy.security-report: https://.../security-report.html
  trivy.compliance-report: https://.../compliance-report.html
  trivy.vulnerability-report: https://.../vulnerability-report.html
```

## Troubleshooting

### Report Not Displaying
1. Check if the annotation is correctly added to your component
2. Verify the Azure Storage URL is accessible
3. Check browser console for iframe-related errors
4. Ensure the HTML file exists at the specified URL

### Iframe Security Issues
The component includes basic sandbox attributes:
```typescript
sandbox="allow-same-origin allow-scripts allow-forms"
```

If you need to adjust these, modify the `sandbox` attribute in `TrivyReportTab.tsx`.

### URL Access Issues
1. Verify the Azure Storage account is accessible
2. Check if the container and file paths are correct
3. Ensure the storage account allows public read access (if needed)
4. Verify CORS settings if accessing from different domains

## Example

Here's a complete example of how your component should look:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: MyRepository
  description: My repository with security reports
  annotations:
    backstage.io/source-location: url:https://github.com/org/repo
    trivy.security-report: https://mystorage.blob.core.windows.net/reports/MyRepository.html
spec:
  type: repo
  owner: my-team
  lifecycle: experimental
```

This simple approach gives you a clean, maintainable way to display Trivy security reports without complex backend infrastructure! 