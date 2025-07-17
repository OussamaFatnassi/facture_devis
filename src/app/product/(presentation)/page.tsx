"use client";

import { useState, useEffect, useRef } from "react";
import { searchProducts, getAllProducts, createProduct } from "../actions/product-actions";
import { TextField } from "@radix-ui/themes";

interface SerializedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProductPage() {
  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load all products on component mount
  useEffect(() => {
    loadProducts();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getAllProducts(undefined, undefined, true);
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      
      try {
        if (query.trim().length >= 2) {
          const response = await searchProducts(query);
          if (response.success) {
            setProducts(response.products);
          }
        } else if (query.trim().length === 0) {
          // If query is empty, load all products
          await loadProducts();
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay
  };

  const handleCreateProduct = async (formData: FormData) => {
    setIsCreating(true);
    try {
      const response = await createProduct(formData);
      if (response.success) {
        setShowCreateForm(false);
        await loadProducts(); // Reload products
      } else {
        console.error("Failed to create product:", response.message);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="mt-2 text-gray-600">
                Manage your product catalog and search for products
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <TextField.Root
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Create Product Form */}
        {showCreateForm && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Product</h3>
            <form action={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <TextField.Root
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <TextField.Root
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isCreating ? "Creating..." : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {product.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={() => {
                        // TODO: Add to quotation/invoice functionality
                        console.log("Add product to quotation:", product);
                      }}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first product"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 