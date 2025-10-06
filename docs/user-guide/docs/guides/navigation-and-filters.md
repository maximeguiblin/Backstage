# Navigating the Sodexo Developer Portal: Finding Your Team's Components

This guide explains how to effectively navigate the Sodexo Developer Portal and use filters to find your team's components, services, and documentation.

## Overview

The Sodexo Developer Portal provides a comprehensive catalog of all components, services, APIs, and resources in your organization. With proper filtering and navigation techniques, you can quickly locate your team's assets and related information.

## Accessing the Catalog

### Main Catalog Page

1. **Navigate to Catalog**: Click on **"Catalog"** in the main navigation menu
2. **Default View**: You'll see all components across the organization
3. **Quick Overview**: The main page shows components with their basic information:
   - Component name and description
   - Owner (team or individual)
   - Type (service, website, library, etc.)
   - Lifecycle stage (experimental, production, deprecated)

## Understanding Component Types

Before filtering, it's helpful to understand the different component types available:

### **Components**
- **Service**: Backend services, APIs, microservices
- **Website**: Frontend applications, web portals
- **Library**: Shared code libraries, SDKs
- **Documentation**: Technical documentation, user guides
- **Repository**: Source code repositories
- **Usecase**: Business use cases and data science projects

### **Resources**
- **Database**: Data storage systems
- **Queue**: Message queues and event streams
- **Storage**: File storage, blob storage
- **Infrastructure**: Cloud resources, containers

### **APIs**
- **OpenAPI**: REST API specifications
- **GraphQL**: GraphQL API schemas
- **gRPC**: gRPC service definitions

## Using Filters Effectively

### 1. Owner Filter

**Find components owned by your team:**

1. **Locate Owner Filter**: Look for the "Owner" filter in the left sidebar
2. **Search for Your Team**: 
   - Type your team name (e.g., "aip-team", "platform-team", "4site-team")
   - Select your team from the dropdown
3. **Apply Filter**: Click on your team name to filter results

**Example Teams:**
- `aip-team` - AI Platform components
- `platform-team` - Platform infrastructure components
- `4site-team` - 4Site application components
- `powerchef-team` - PowerChef related components
- `product-swap-team`- ProductSwap related components

### 2. Type Filter

**Filter by component type:**

1. **Component Types**:
   - Select "service" for backend services
   - Select "website" for frontend applications
   - Select "documentation" for technical docs
   - Select "repository" for source code repos
   - Select "usecase" for usecase overview

### 3. Lifecycle Filter

**Filter by development stage:**

- **Experimental**: New or prototype components
- **Production**: Live, stable components
- **Deprecated**: Components being phased out

### 4. Tag Filter

**Use tags for specific categorization:**

Common tags in the Sodexo environment:
- `azure` - Azure-hosted components
- `data-science` - Data science related projects
- `machine-learning` - ML models and pipelines
- `databricks` - Databricks-based components
- `api` - API services

## Advanced Search Techniques

### 1. Text Search

**Use the search bar for quick finding:**

1. **Component Names**: Search for specific component names
2. **Descriptions**: Search within component descriptions
3. **Technologies**: Search for specific technologies (e.g., "Python", "React", "Databricks")

**Search Examples:**
- `customer` - Find all customer-related components
- `analytics` - Find analytics and reporting components
- `api` - Find API-related services
- `documentation` - Find all documentation components

### 2. Combined Filters

**Use multiple filters together:**

**Example 1: Find Your Team's Production Services**
1. Owner: `your-team-name`
2. Type: `service`
3. Lifecycle: `production`

**Example 2: Find Experimental Data Science Projects**
1. Type: `usecase`
2. Lifecycle: `experimental`
3. Tag: `data-science`

**Example 3: Find Team Documentation**
1. Owner: `your-team-name`
2. Type: `documentation`

## Navigation Workflows

### Workflow 1: New Team Member Onboarding

**Goal**: Understand what components your team owns

1. **Start with Owner Filter**: Filter by your team name
2. **Review All Types**: Don't filter by type initially to see everything
3. **Explore Each Component**: Click on components to understand their purpose
4. **Check Dependencies**: Look at component relationships and dependencies
5. **Review Documentation**: Check if components have associated documentation

### Workflow 2: Finding Related Components

**Goal**: Discover components that interact with yours

1. **Start with Your Component**: Navigate to a component you know
2. **Check Dependencies**: Look at the "Relations" or "Dependencies" tab
3. **Follow the Chain**: Click on related components to understand the ecosystem
4. **Use System View**: If available, use system diagrams to see relationships

### Workflow 3: Finding Documentation

**Goal**: Locate documentation for your projects

1. **Filter by Type**: Select "documentation" type
2. **Add Owner Filter**: Filter by your team
3. **Check Component Docs**: Many components have embedded documentation
4. **Search by Keywords**: Use search for specific topics

## Practical Example

### Example: AIP Team Component Discovery

```
Filters Applied:
- Owner: aip-team
- Type: All
- Lifecycle: All

Expected Results:
- AI Platform CLI repository
- AIP SDK documentation
- CookieCutter template repository
- AIP related infra environment
```

## Tips and Best Practices

### 1. Bookmark Useful Filters

**Create shortcuts for common searches:**
- Add your team's component page to your Favorites by clicking on the star next to the component name
- Save frequently used filter combinations

### 2. Regular Catalog Maintenance

**Keep your team's components up to date:**
- Review component descriptions regularly
- Update lifecycle status as components mature
- Ensure ownership information is accurate
- Add relevant tags for better discoverability

### 3. Use Component Relationships

**Leverage the relationship system:**
- Check "depends on" relationships
- Review "dependency of" connections
- Use system views when available
- Follow API relationships

### 4. Search Strategy

**Effective search techniques:**
- Start broad, then narrow with filters
- Use multiple search terms
- Try different spellings or abbreviations
- Search in descriptions, not just names

## Troubleshooting Common Issues

### Issue 1: Can't Find Expected Components

**Possible Causes:**
- Component ownership not set correctly
- Component not registered in catalog
- Filters too restrictive

**Solutions:**
1. Clear all filters and search by name
2. Check with team lead about component registration
3. Verify component exists in source repositories
4. Check if component has different owner than expected

### Issue 2: Too Many Results

**Problem**: Filter results show too many components

**Solutions:**
1. Add more specific filters (owner + type + lifecycle)
2. Use text search to narrow results
3. Filter by specific tags
4. Use date ranges if available

### Issue 3: Missing Team Components

**Problem**: Some team components don't appear

**Solutions:**
1. Check if components have `catalog-info.yaml` files
2. Verify components are registered in catalog locations
3. Check if components are in different namespaces
4. Contact platform team for catalog registration help

## Advanced Features

### 1. Starred Components

**Mark important components:**
- Click the star icon on frequently used components
- Access starred components from your profile
- Use for quick navigation to key services

### 2. Component Health Status

**Monitor component health:**
- Check health indicators on component pages
- Review deployment status
- Monitor service availability

### 3. API Explorer Integration

**For API components:**
- Use the API Explorer to test endpoints
- Review API documentation inline
- Check API specifications and schemas

## Integration with Other Tools

### 1. Azure DevOps Integration

**Access related DevOps resources:**
- View linked Azure DevOps projects
- Access build pipelines
- Review work items and boards

### 2. Documentation Links

**Navigate to external documentation:**
- Follow links to AIP WebApp documentation
- Access Azure resource documentation
- Review API documentation portals

### 3. Monitoring and Observability

**Access monitoring dashboards:**
- View component metrics
- Access logging systems
- Review performance dashboards

## Getting Help

### Self-Service Resources

1. **Developer Portal Documentation**: Built-in help and documentation
2. **Component README Files**: Check individual component documentation
3. **Team Wikis**: Access team-specific documentation

### Support Channels

1. **Platform Team**: For catalog and navigation issues
2. **Team Leads**: For component ownership questions
3. **Community Forums**: Share tips and best practices

### Feedback and Improvements

1. **Report Issues**: Missing or incorrect component information
2. **Suggest Improvements**: Navigation and filtering enhancements
3. **Share Best Practices**: Help other teams with effective navigation

---

*This navigation guide is maintained by the Platform Team. For questions or suggestions, contact the platform team or contribute to the documentation.*
