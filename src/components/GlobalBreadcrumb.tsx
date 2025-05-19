import React from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from '@/components/ui/breadcrumb';
import { generateBreadcrumb } from '@/utils/breadcrumbUtils';
const GlobalBreadcrumb = () => {
  const location = useLocation();
  const breadcrumbItems = generateBreadcrumb(location.pathname);

  // Only display breadcrumb if we have items
  if (breadcrumbItems.length === 0) {
    return null;
  }

  // Truncate middle items if we have more than 3 levels
  const displayItems = breadcrumbItems.length > 3 ? [breadcrumbItems[0], {
    label: '...',
    href: ''
  }, breadcrumbItems[breadcrumbItems.length - 1]] : breadcrumbItems;
  return <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        return <React.Fragment key={index}>
              {item.label === '...' ? <>
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </> : <>
                  <BreadcrumbItem>
                    {isLast ? <BreadcrumbPage>{item.label}</BreadcrumbPage> : <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </>}
            </React.Fragment>;
      })}
      </BreadcrumbList>
    </Breadcrumb>;
};
export default GlobalBreadcrumb;