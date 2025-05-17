
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ProductMeta } from "@/types/product-meta";
import { updateProductMeta } from "@/services/ProductService";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

const ProductMetaAdmin = () => {
  const [products, setProducts] = useState<ProductMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductMeta | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch all products metadata
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('product_meta').select('*');
      
      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load product metadata");
      } else {
        setProducts(data || []);
      }
      
      setLoading(false);
    };
    
    fetchProducts();
  }, []);

  // Start editing a product
  const handleEditProduct = (product: ProductMeta) => {
    setEditingProductId(product.product_id);
    setEditForm({ ...product });
  };

  // Handle form input changes
  const handleInputChange = (field: keyof ProductMeta, value: string) => {
    if (!editForm) return;
    
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  // Save edited product
  const handleSaveProduct = async () => {
    if (!editForm) return;
    
    const success = await updateProductMeta(editForm);
    
    if (success) {
      // Update local state
      setProducts(products.map(p => 
        p.product_id === editForm.product_id ? editForm : p
      ));
      
      setEditingProductId(null);
      setEditForm(null);
      toast.success("Product metadata updated");
    } else {
      toast.error("Failed to update product metadata");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditForm(null);
  };

  // Handle CSV file upload
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadLoading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Create ProductMeta objects from CSV lines
      const productsToUpload: ProductMeta[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const product: any = {};
        
        headers.forEach((header, index) => {
          if (header === 'product_id') {
            product.product_id = values[index] || '';
          } else if (values[index]) {
            product[header] = values[index];
          } else {
            product[header] = null;
          }
        });
        
        // Only include products with valid product_id
        if (product.product_id) {
          productsToUpload.push(product as ProductMeta);
        }
      }
      
      // Save all products to database
      if (productsToUpload.length > 0) {
        const { error } = await supabase
          .from('product_meta')
          .upsert(productsToUpload, { onConflict: 'product_id' });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Refresh products list
        const { data } = await supabase.from('product_meta').select('*');
        setProducts(data || []);
        
        toast.success(`Uploaded ${productsToUpload.length} product metadata records`);
      } else {
        toast.error("No valid product records found in CSV");
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      toast.error("Failed to process CSV file");
    } finally {
      setUploadLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Mock API sync function (no-op placeholder)
  const handleApiSync = () => {
    toast.info("API sync feature coming soon");
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Product Metadata Admin</h1>
      
      <div className="mb-6 flex flex-wrap gap-4">
        {/* CSV Upload */}
        <Card className="w-full md:w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upload CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center p-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-[var(--uber-gray-10)]">
              <Upload className="h-8 w-8 mb-2 text-[var(--uber-gray-60)]" />
              <span className="text-sm text-center">
                {uploadLoading ? "Uploading..." : "Drop product_meta.csv here or click to browse"}
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvUpload}
                disabled={uploadLoading}
              />
            </label>
          </CardContent>
        </Card>
        
        {/* API Sync Button */}
        <Card className="w-full md:w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">API Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleApiSync} 
              className="w-full"
              disabled={uploadLoading}
            >
              Refresh from Source API (future)
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Product Priority</TableHead>
              <TableHead>PM POC</TableHead>
              <TableHead>Prod Ops POC</TableHead>
              <TableHead>Launch Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No product metadata found
                </TableCell>
              </TableRow>
            ) : (
              products.map(product => (
                <TableRow key={product.product_id}>
                  <TableCell>{product.product_id}</TableCell>
                  <TableCell>
                    {editingProductId === product.product_id ? (
                      <Input
                        value={editForm?.company_priority || ''}
                        onChange={e => handleInputChange('company_priority', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      product.company_priority ? (
                        <Badge variant="success">{product.company_priority}</Badge>
                      ) : "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProductId === product.product_id ? (
                      <Input
                        value={editForm?.pm_poc || ''}
                        onChange={e => handleInputChange('pm_poc', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      product.pm_poc || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProductId === product.product_id ? (
                      <Input
                        value={editForm?.prod_ops_poc || ''}
                        onChange={e => handleInputChange('prod_ops_poc', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      product.prod_ops_poc || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProductId === product.product_id ? (
                      <Input
                        type="date"
                        value={editForm?.launch_date || ''}
                        onChange={e => handleInputChange('launch_date', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      product.launch_date || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProductId === product.product_id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveProduct}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Product Detail Editor Modal would go here in a more complete implementation */}
    </div>
  );
};

export default ProductMetaAdmin;
