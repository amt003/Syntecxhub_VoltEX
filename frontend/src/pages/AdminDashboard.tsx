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
      if (newProduct.images.length === 0) {
        toast.error("Please select at least one image (up to 4)");
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
    setShowEditModal(true);
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

        await adminService.updateProduct(editingProduct._id, formData);
      } else {
        // Update without images
        const updateData = {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          brand: editingProduct.brand,
          stock: editingProduct.stock,
          featured: editingProduct.featured || false,
        };

        await adminService.updateProduct(editingProduct._id, updateData);
      }
      toast.success("Product updated successfully");
      setShowEditModal(false);
      setEditingProduct(null);
      setEditingImages([]);
      setEditImagePreviews([]);
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
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleProductChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleProductChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleProductChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleProductChange}
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
                    </div>

                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleProductChange}
                        required
                      />
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

                  <button type="submit" className="submit-btn">
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
                        required
                      />
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
                      />
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
                        required
                      />
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
                          required
                        />
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
                          required
                        />
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
                        required
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
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
                      <button type="submit" className="submit-btn">
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
                      <td>Pending</td>
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
