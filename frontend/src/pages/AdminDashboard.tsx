import React, { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/adminService";
import { getImageUrl } from "../utils/imageUrl";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  _id: string;
  userId: { name: string; email: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  image: string;
  images: string[];
  featured?: boolean;
  specifications?: Record<string, string>;
}

interface Specification {
  key: string;
  value: string;
}

interface ProductErrors {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  brand?: string;
  stock?: string;
  images?: string;
}

const CATEGORIES = [
  "smartphones",
  "laptops",
  "tablets",
  "accessories",
  "audio",
  "wearables",
  "gaming",
];

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImages, setEditingImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    brand: "",
    stock: 0,
    images: [] as File[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newSpecs, setNewSpecs] = useState<Specification[]>([]);
  const [editSpecs, setEditSpecs] = useState<Specification[]>([]);
  const [newProductErrors, setNewProductErrors] = useState<ProductErrors>({});
  const [editProductErrors, setEditProductErrors] = useState<ProductErrors>({});

  const fetchProducts = useCallback(async () => {
    try {
      const response = await adminService.getAllProducts();
      setProducts(response.products || []);
      if (!selectedCategory && response.products.length > 0) {
        setSelectedCategory(response.products[0]?.category || CATEGORIES[0]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchDashboardStats();
    fetchProducts();
  }, [fetchProducts]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  // Product Validation Functions
  const validateProductField = (
    fieldName: string,
    value: string | number,
  ): string | null => {
    switch (fieldName) {
      case "name":
        if (!String(value).trim()) return "Product name is required";
        if (String(value).trim().length < 3)
          return "Product name must be at least 3 characters";
        return null;
      case "description":
        if (!String(value).trim()) return "Description is required";
        if (String(value).trim().length < 10)
          return "Description must be at least 10 characters";
        return null;
      case "price":
        const priceNum = Number(value);
        if (isNaN(priceNum) || priceNum <= 0)
          return "Price must be greater than 0";
        return null;
      case "category":
        if (!String(value).trim()) return "Please select a category";
        return null;
      case "brand":
        if (String(value).trim() && String(value).trim().length < 2)
          return "Brand name must be at least 2 characters";
        return null;
      case "stock":
        const stockNum = Number(value);
        if (isNaN(stockNum) || stockNum < 0)
          return "Stock must be 0 or greater";
        return null;
      default:
        return null;
    }
  };

  // Real-time validation for new product form
  useEffect(() => {
    const errors: ProductErrors = {};

    if (newProduct.name)
      if (validateProductField("name", newProduct.name))
        errors.name = validateProductField("name", newProduct.name) || "";
    if (newProduct.description)
      if (validateProductField("description", newProduct.description))
        errors.description =
          validateProductField("description", newProduct.description) || "";
    if (newProduct.price > 0)
      if (validateProductField("price", newProduct.price))
        errors.price = validateProductField("price", newProduct.price) || "";
    if (newProduct.category)
      if (validateProductField("category", newProduct.category))
        errors.category =
          validateProductField("category", newProduct.category) || "";
    if (newProduct.brand)
      if (validateProductField("brand", newProduct.brand))
        errors.brand = validateProductField("brand", newProduct.brand) || "";
    if (newProduct.stock >= 0)
      if (validateProductField("stock", newProduct.stock))
        errors.stock = validateProductField("stock", newProduct.stock) || "";

    setNewProductErrors(errors);
  }, [newProduct]);

  const handleProductChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const input = e.target as HTMLInputElement;

    if (input.type === "file") {
      const files = input.files ? Array.from(input.files) : [];

      // Validate file count (max 4)
      if (files.length > 4) {
        toast.error("Maximum 4 images allowed");
        return;
      }

      // Validate each file
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (const file of files) {
        if (!validTypes.includes(file.type)) {
          toast.error("Please upload only PNG or JPG images");
          return;
        }

        if (file.size > maxSize) {
          toast.error("Each image must be less than 5MB");
          return;
        }
      }

      setNewProduct({
        ...newProduct,
        images: files,
      });

      // Create previews for all images
      const previews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setNewProduct({
        ...newProduct,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate all fields
      const errors: ProductErrors = {};

      const nameError = validateProductField("name", newProduct.name);
      if (nameError) errors.name = nameError;

      const descError = validateProductField(
        "description",
        newProduct.description,
      );
      if (descError) errors.description = descError;

      const priceError = validateProductField("price", newProduct.price);
      if (priceError) errors.price = priceError;

      const catError = validateProductField("category", newProduct.category);
      if (catError) errors.category = catError;

      if (newProduct.brand) {
        const brandError = validateProductField("brand", newProduct.brand);
        if (brandError) errors.brand = brandError;
      }

      const stockError = validateProductField("stock", newProduct.stock);
      if (stockError) errors.stock = stockError;

      if (newProduct.images.length === 0) {
        errors.images = "Please select at least one image (up to 4)";
      }

      setNewProductErrors(errors);

      if (Object.keys(errors).length > 0) {
        toast.error("Please fix all validation errors");
        return;
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price.toString());
      formData.append("category", newProduct.category);
      formData.append("brand", newProduct.brand);
      formData.append("stock", newProduct.stock.toString());

      // Append all images
      newProduct.images.forEach((image) => {
        formData.append("images", image);
      });

      // Append specifications as JSON
      const specsObj = newSpecs.reduce(
        (acc, spec) => {
          if (spec.key.trim()) {
            acc[spec.key] = spec.value;
          }
          return acc;
        },
        {} as Record<string, string>,
      );
      if (Object.keys(specsObj).length > 0) {
        formData.append("specifications", JSON.stringify(specsObj));
      }

      await adminService.createProduct(formData);
      toast.success("Product added successfully");
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category: "",
        brand: "",
        stock: 0,
        images: [],
      });
      setImagePreviews([]);
      setNewSpecs([]);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditingImages([]);
    setEditImagePreviews([]);
    // Convert specifications object to array format
    if (product.specifications) {
      const specsArray = Object.entries(product.specifications).map(
        ([key, value]) => ({ key, value }),
      );
      setEditSpecs(specsArray);
    } else {
      setEditSpecs([]);
    }
    setShowEditModal(true);
  };

  const handleAddSpecRow = () => {
    setNewSpecs([...newSpecs, { key: "", value: "" }]);
  };

  const handleRemoveNewSpecRow = (index: number) => {
    setNewSpecs(newSpecs.filter((_, i) => i !== index));
  };

  const handleNewSpecChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updatedSpecs = [...newSpecs];
    updatedSpecs[index][field] = value;
    setNewSpecs(updatedSpecs);
  };

  const handleAddEditSpecRow = () => {
    setEditSpecs([...editSpecs, { key: "", value: "" }]);
  };

  const handleRemoveEditSpecRow = (index: number) => {
    setEditSpecs(editSpecs.filter((_, i) => i !== index));
  };

  const handleEditSpecChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updatedSpecs = [...editSpecs];
    updatedSpecs[index][field] = value;
    setEditSpecs(updatedSpecs);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    // Validate file count (max 4)
    if (files.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    // Validate each file
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload only PNG or JPG images");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Each image must be less than 5MB");
        return;
      }
    }

    setEditingImages(files);

    // Create previews for all images
    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setEditImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      // Validate all fields
      const errors: ProductErrors = {};

      const nameError = validateProductField("name", editingProduct.name);
      if (nameError) errors.name = nameError;

      const descError = validateProductField(
        "description",
        editingProduct.description,
      );
      if (descError) errors.description = descError;

      const priceError = validateProductField("price", editingProduct.price);
      if (priceError) errors.price = priceError;

      const catError = validateProductField(
        "category",
        editingProduct.category,
      );
      if (catError) errors.category = catError;

      if (editingProduct.brand) {
        const brandError = validateProductField("brand", editingProduct.brand);
        if (brandError) errors.brand = brandError;
      }

      const stockError = validateProductField("stock", editingProduct.stock);
      if (stockError) errors.stock = stockError;

      setEditProductErrors(errors);

      if (Object.keys(errors).length > 0) {
        toast.error("Please fix all validation errors");
        return;
      }

      // If new images are uploaded, use FormData; otherwise use regular object
      if (editingImages.length > 0) {
        const formData = new FormData();
        formData.append("name", editingProduct.name);
        formData.append("description", editingProduct.description);
        formData.append("price", editingProduct.price.toString());
        formData.append("category", editingProduct.category);
        formData.append("brand", editingProduct.brand);
        formData.append("stock", editingProduct.stock.toString());
        formData.append(
          "featured",
          (editingProduct.featured || false).toString(),
        );

        // Append all images
        editingImages.forEach((image) => {
          formData.append("images", image);
        });

        // Append specifications as JSON
        const specsObj = editSpecs.reduce(
          (acc, spec) => {
            if (spec.key.trim()) {
              acc[spec.key] = spec.value;
            }
            return acc;
          },
          {} as Record<string, string>,
        );
        if (Object.keys(specsObj).length > 0) {
          formData.append("specifications", JSON.stringify(specsObj));
        }

        await adminService.updateProduct(editingProduct._id, formData);
      } else {
        // Update without images
        const specsObj = editSpecs.reduce(
          (acc, spec) => {
            if (spec.key.trim()) {
              acc[spec.key] = spec.value;
            }
            return acc;
          },
          {} as Record<string, string>,
        );

        const updateData: any = {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          brand: editingProduct.brand,
          stock: editingProduct.stock,
          featured: editingProduct.featured || false,
        };

        if (Object.keys(specsObj).length > 0) {
          updateData.specifications = specsObj;
        }

        await adminService.updateProduct(editingProduct._id, updateData);
      }
      toast.success("Product updated successfully");
      setShowEditModal(false);
      setEditingProduct(null);
      setEditingImages([]);
      setEditImagePreviews([]);
      setEditSpecs([]);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (
    productId: string,
    productName: string,
  ) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await adminService.deleteProduct(productId);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updateData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        featured: !product.featured,
      };

      await adminService.updateProduct(product._id, updateData);
      toast.success(
        `Product ${!product.featured ? "marked as" : "unmarked from"} featured`,
      );
      fetchProducts();
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  if (loading) {
    return <div className="admin-dashboard loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="dashboard-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats?.totalUsers || 0}</p>
              </div>

              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-number">{stats?.totalProducts || 0}</p>
              </div>

              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">{stats?.totalOrders || 0}</p>
              </div>

              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-number">
                  ₹{stats?.totalRevenue.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>

            <div className="recent-orders">
              <h2>Recent Orders</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id.slice(-8).toUpperCase()}</td>
                        <td>{order.userId.name}</td>
                        <td>₹{order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span
                            className={`status-badge status-${order.status}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge payment-${order.paymentStatus}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="products-section">
            <div className="products-container">
              <div className="add-product-form">
                <h2>Add New Product</h2>
                <form onSubmit={handleAddProduct}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleProductChange}
                        placeholder="Enter product name"
                        className={newProductErrors.name ? "input-error" : ""}
                        required
                      />
                      {newProductErrors.name && (
                        <span className="error-message">
                          {newProductErrors.name}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleProductChange}
                        placeholder="Enter brand name"
                        className={newProductErrors.brand ? "input-error" : ""}
                      />
                      {newProductErrors.brand && (
                        <span className="error-message">
                          {newProductErrors.brand}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleProductChange}
                      placeholder="Enter detailed product description (min 10 characters)"
                      className={
                        newProductErrors.description ? "input-error" : ""
                      }
                      required
                    />
                    {newProductErrors.description && (
                      <span className="error-message">
                        {newProductErrors.description}
                      </span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleProductChange}
                        placeholder="Enter price"
                        className={newProductErrors.price ? "input-error" : ""}
                        required
                      />
                      {newProductErrors.price && (
                        <span className="error-message">
                          {newProductErrors.price}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleProductChange}
                        className={
                          newProductErrors.category ? "input-error" : ""
                        }
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="smartphones">Smartphones</option>
                        <option value="laptops">Laptops</option>
                        <option value="tablets">Tablets</option>
                        <option value="accessories">Accessories</option>
                        <option value="audio">Audio</option>
                        <option value="wearables">Wearables</option>
                        <option value="gaming">Gaming</option>
                      </select>
                      {newProductErrors.category && (
                        <span className="error-message">
                          {newProductErrors.category}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleProductChange}
                        placeholder="Enter stock quantity"
                        className={newProductErrors.stock ? "input-error" : ""}
                        required
                      />
                      {newProductErrors.stock && (
                        <span className="error-message">
                          {newProductErrors.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Product Images (PNG, JPG, JPEG - Up to 4 images, Max 5MB
                      each)
                    </label>
                    <input
                      type="file"
                      name="images"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      onChange={handleProductChange}
                      multiple
                      required
                    />
                    {newProductErrors.images && (
                      <span className="error-message">
                        {newProductErrors.images}
                      </span>
                    )}
                    {imagePreviews.length > 0 && (
                      <div className="image-previews">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <p className="preview-label">Image {index + 1}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Specifications</label>
                    <table className="specs-table">
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newSpecs.map((spec, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={spec.key}
                                onChange={(e) =>
                                  handleNewSpecChange(
                                    index,
                                    "key",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., Storage, RAM, Display"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) =>
                                  handleNewSpecChange(
                                    index,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., 256GB, 12GB, 6.2 inch"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="delete-spec-btn"
                                onClick={() => handleRemoveNewSpecRow(index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      className="add-spec-btn"
                      onClick={handleAddSpecRow}
                    >
                      + Add Specification
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={
                      Object.keys(newProductErrors).length > 0 ||
                      !newProduct.name ||
                      !newProduct.description ||
                      newProduct.price <= 0 ||
                      !newProduct.category ||
                      newProduct.stock < 0 ||
                      newProduct.images.length === 0
                    }
                  >
                    Add Product
                  </button>
                </form>
              </div>

              <div className="products-list-section">
                <h2>Manage Products</h2>

                <div className="category-filter">
                  <label>Filter by Category:</label>
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="products-grid">
                  {products
                    .filter((p) => p.category === selectedCategory)
                    .map((product) => (
                      <div key={product._id} className="product-card">
                        <div className="product-image">
                          <img
                            src={
                              product.image
                                ? getImageUrl(product.image)
                                : "https://via.placeholder.com/200"
                            }
                            alt={product.name}
                          />
                        </div>
                        <div className="product-info">
                          <div className="product-header">
                            <h3>{product.name}</h3>
                            <button
                              className={`featured-btn ${product.featured ? "active" : ""}`}
                              onClick={() => handleToggleFeatured(product)}
                              title={
                                product.featured
                                  ? "Remove from featured"
                                  : "Mark as featured"
                              }
                            >
                              ⭐
                            </button>
                          </div>
                          <p className="brand">{product.brand}</p>
                          <p className="price">₹{product.price.toFixed(2)}</p>
                          <div className="stock-info">
                            <span
                              className={
                                product.stock > 0 ? "in-stock" : "out-of-stock"
                              }
                            >
                              Stock: {product.stock}
                            </span>
                          </div>
                          <div className="product-actions">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteProduct(product._id, product.name)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {products.filter((p) => p.category === selectedCategory)
                  .length === 0 && (
                  <div className="no-products">
                    <p>No products found in this category</p>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingProduct && (
              <div
                className="modal-overlay"
                onClick={() => setShowEditModal(false)}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h2>Edit Product</h2>
                    <button
                      className="close-btn"
                      onClick={() => setShowEditModal(false)}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleUpdateProduct}>
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter product name"
                        className={editProductErrors.name ? "input-error" : ""}
                        required
                      />
                      {editProductErrors.name && (
                        <span className="error-message">
                          {editProductErrors.name}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        value={editingProduct.brand}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            brand: e.target.value,
                          })
                        }
                        placeholder="Enter brand name"
                        className={editProductErrors.brand ? "input-error" : ""}
                      />
                      {editProductErrors.brand && (
                        <span className="error-message">
                          {editProductErrors.brand}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter detailed product description (min 10 characters)"
                        className={
                          editProductErrors.description ? "input-error" : ""
                        }
                        required
                      />
                      {editProductErrors.description && (
                        <span className="error-message">
                          {editProductErrors.description}
                        </span>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              price: parseFloat(e.target.value),
                            })
                          }
                          placeholder="Enter price"
                          className={
                            editProductErrors.price ? "input-error" : ""
                          }
                          required
                        />
                        {editProductErrors.price && (
                          <span className="error-message">
                            {editProductErrors.price}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={editingProduct.stock}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              stock: parseInt(e.target.value),
                            })
                          }
                          placeholder="Enter stock quantity"
                          className={
                            editProductErrors.stock ? "input-error" : ""
                          }
                          required
                        />
                        {editProductErrors.stock && (
                          <span className="error-message">
                            {editProductErrors.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value,
                          })
                        }
                        className={
                          editProductErrors.category ? "input-error" : ""
                        }
                        required
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                      {editProductErrors.category && (
                        <span className="error-message">
                          {editProductErrors.category}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        Product Images (Optional - Leave empty to keep current
                        images)
                      </label>
                      <input
                        type="file"
                        name="images"
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        onChange={handleEditImageChange}
                        className="file-input"
                      />
                      <p className="file-help">
                        PNG or JPG, max 5MB each, up to 4 images
                      </p>
                    </div>

                    {editImagePreviews.length > 0 && (
                      <div className="image-previews">
                        <label>New Image Previews:</label>
                        <div className="preview-grid">
                          {editImagePreviews.map((preview, idx) => (
                            <div key={idx} className="preview-item">
                              <img src={preview} alt={`Preview ${idx + 1}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {editingImages.length === 0 &&
                      editingProduct.images.length > 0 && (
                        <div className="image-previews">
                          <label>Current Images:</label>
                          <div className="preview-grid">
                            {editingProduct.images.map((img, idx) => (
                              <div key={idx} className="preview-item">
                                <img
                                  src={getImageUrl(img)}
                                  alt={`Current ${idx + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="form-group">
                      <label>Specifications</label>
                      <table className="specs-table">
                        <thead>
                          <tr>
                            <th>Key</th>
                            <th>Value</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editSpecs.map((spec, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  value={spec.key}
                                  onChange={(e) =>
                                    handleEditSpecChange(
                                      index,
                                      "key",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g., Storage, RAM, Display"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={spec.value}
                                  onChange={(e) =>
                                    handleEditSpecChange(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g., 256GB, 12GB, 6.2 inch"
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="delete-spec-btn"
                                  onClick={() => handleRemoveEditSpecRow(index)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        type="button"
                        className="add-spec-btn"
                        onClick={handleAddEditSpecRow}
                      >
                        + Add Specification
                      </button>
                    </div>

                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={editingProduct.featured || false}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              featured: e.target.checked,
                            })
                          }
                        />
                        Mark as Featured Product
                      </label>
                    </div>

                    <div className="modal-actions">
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={
                          Object.keys(editProductErrors).length > 0 ||
                          !editingProduct.name ||
                          !editingProduct.description ||
                          editingProduct.price <= 0 ||
                          !editingProduct.category ||
                          editingProduct.stock < 0
                        }
                      >
                        Update Product
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowEditModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-section">
            <h2>All Orders</h2>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id.slice(-8).toUpperCase()}</td>
                      <td>{order.userId.name}</td>
                      <td>₹{order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge payment-${order.paymentStatus}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
