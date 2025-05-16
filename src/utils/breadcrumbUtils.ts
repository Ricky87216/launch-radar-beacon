
// Mock utility to get region/country names from IDs
// In a real implementation, this would query your market_dim table
const getMarketLabel = (id: string, type: 'region' | 'country'): string => {
  // This is just a placeholder - replace with actual lookup logic
  return id.charAt(0).toUpperCase() + id.slice(1);
};

interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Generates breadcrumb items based on the current route
 */
export const generateBreadcrumb = (pathname: string): BreadcrumbItem[] => {
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Handle specific routes
  if (pathParts.length === 0) {
    // Root path
    return [{ label: 'Dashboard', href: '/' }];
  }
  
  if (pathParts[0] === 'my') {
    return [{ label: 'My Coverage', href: '/my' }];
  }
  
  if (pathParts[0] === 'escalations') {
    return [{ label: 'Escalations Log', href: '/escalations' }];
  }
  
  if (pathParts[0] === 'admin') {
    breadcrumbs.push({ label: 'Admin', href: '/admin' });
    
    if (pathParts[1] === 'data-sync') {
      breadcrumbs.push({ label: 'Data Sync', href: '/admin/data-sync' });
    } else if (pathParts[1] === 'bulk-edit') {
      breadcrumbs.push({ label: 'Ops Update Center', href: '/admin/bulk-edit' });
    } else if (pathParts[1] === 'logs') {
      breadcrumbs.push({ label: 'System Logs', href: '/admin/logs' });
    }
    
    return breadcrumbs;
  }
  
  // Handle region/country routes
  if (pathParts[0] === 'region' && pathParts.length > 1) {
    breadcrumbs.push({ label: 'Dashboard', href: '/' });
    const regionId = pathParts[1];
    const regionName = getMarketLabel(regionId, 'region');
    breadcrumbs.push({ label: regionName, href: `/region/${regionId}` });
  }
  
  if (pathParts[0] === 'country' && pathParts.length > 1) {
    breadcrumbs.push({ label: 'Dashboard', href: '/' });
    // In a real implementation, we'd look up the parent region from your data
    breadcrumbs.push({ label: 'Region', href: '#' });
    const countryId = pathParts[1];
    const countryName = getMarketLabel(countryId, 'country');
    breadcrumbs.push({ label: countryName, href: `/country/${countryId}` });
  }
  
  return breadcrumbs;
};
