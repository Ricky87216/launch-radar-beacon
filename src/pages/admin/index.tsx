
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, Grid } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const modules = [
    {
      id: "data-sync",
      title: "Data Import & Refresh",
      description: "Upload CSV files or connect to APIs to update coverage and blocker data.",
      icon: <Upload className="h-8 w-8" />,
      path: "/admin/data-sync",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "bulk-edit",
      title: "Bulk Edit Workspace",
      description: "Efficiently manage product coverage across markets with powerful filtering and bulk editing tools.",
      icon: <Grid className="h-8 w-8" />,
      path: "/admin/bulk-edit",
      color: "bg-green-100 text-green-700",
    },
    {
      id: "logs",
      title: "Change Logs",
      description: "View history of data imports and bulk edits with detailed before/after comparisons.",
      icon: <Database className="h-8 w-8" />,
      path: "/admin/logs",
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Product Ops Update Center</h1>
        <p className="text-muted-foreground">
          Manage product coverage data, track blockers, and implement bulk updates efficiently.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader className={`${module.color} pb-2`}>
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-md p-2 shadow-sm">
                  {module.icon}
                </div>
                <CardTitle>{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <CardDescription className="mb-6 text-foreground/80 min-h-[60px]">
                {module.description}
              </CardDescription>
              <Button 
                className="w-full" 
                onClick={() => navigate(module.path)}
              >
                Open Module
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
