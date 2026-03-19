import { HtmlDisplayTab } from './HtmlDisplayTab';

export const AipCheckTab = () => {
  return (
    <HtmlDisplayTab
      annotationKey="aip.check"
      title="AIP Infrastructure Check"
      description="Azure Infrastructure Platform (AIP) infrastructure validation and compliance check results for this component. This report shows infrastructure health, security compliance, and operational status."
      height="100%"
      showSourceLink
    />
  );
};
