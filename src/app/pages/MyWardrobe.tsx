import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS } from "../../config/api";

interface WardrobeItem {
  _id: string;
  userId: string;
  name: string;
  category: string;
  color: string;
  image: string;
  season?: string;
  createdAt: string;
}

export function MyWardrobe() {
  const navigate = useNavigate();
  // Load cached wardrobe data on initial render
  const cachedWardrobe = localStorage.getItem("wardrobeCache");
  const initialItems = cachedWardrobe ? JSON.parse(cachedWardrobe) : [];

  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Tops",
    color: "Mixed",
    season: "All Seasons",
    image: "",
  });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
  const colors = ["Mixed", "Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Brown", "Gray"];

  // ✅ Fetch wardrobe items on load
  useEffect(() => {
    if (!token || !userId) {
      navigate("/auth");
      return;
    }
    fetchWardrobeItems();
  }, [token, userId, navigate]);

  const fetchWardrobeItems = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.GET_ITEMS);
      const wardrobeData = data || [];
      setItems(wardrobeData);
      // Cache wardrobe in localStorage
      localStorage.setItem("wardrobeCache", JSON.stringify(wardrobeData));
    } catch (err) {
      console.error("Error fetching wardrobe:", err);
      // Try to load from cache if fetch fails
      const cached = localStorage.getItem("wardrobeCache");
      if (cached) {
        console.log("📦 Loading wardrobe from cache");
        setItems(JSON.parse(cached));
      } else {
        alert("Failed to load wardrobe items");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle file picker
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData({ ...formData, name: file.name.split(".")[0], image: reader.result as string });
    };
  };

  // ✅ Add new item
  const handleAddItem = async () => {
    if (!formData.name || !formData.image) {
      alert("Please fill in all fields and select an image");
      return;
    }

    try {
      setAddingItem(true);

      const newItem = await apiCall(API_ENDPOINTS.ADD_ITEM, {
        method: "POST",
        data: {
          name: formData.name,
          category: formData.category,
          color: formData.color,
          season: formData.season,
          image: formData.image,
        },
      });

      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      // Update cache
      localStorage.setItem("wardrobeCache", JSON.stringify(updatedItems));

      setFormData({ name: "", category: "Tops", color: "Mixed", season: "All Seasons", image: "" });
      setShowForm(false);
      alert("✅ Item added successfully!");
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  // ✅ Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await apiCall(API_ENDPOINTS.DELETE_ITEM(itemId), {
        method: "DELETE",
      });

      const updatedItems = items.filter((item) => item._id !== itemId);
      setItems(updatedItems);
      // Update cache
      localStorage.setItem("wardrobeCache", JSON.stringify(updatedItems));
      alert("✅ Item deleted!");
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            👗 My Wardrobe
          </h1>
          <p className="text-gray-600">Store and manage your clothing collection</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={addingItem}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {addingItem ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Add Item
        </button>
      </div>

      {/* Add Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Item</h2>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image *
              </label>
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:bg-purple-50 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-lg" />
                  ) : (
                    <div className="text-gray-500">
                      <Plus size={32} className="mx-auto mb-2" />
                      Click to upload image
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Item Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Blue T-Shirt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color *
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", category: "Tops", color: "Mixed", season: "All Seasons", image: "" });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={addingItem}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingItem ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${selectedCategory === cat
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{item.category}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Color:</span>
                    <span className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color.toLowerCase() || "#ccc" }}
                      ></div>
                      {item.color}
                    </span>
                  </p>
                  {item.season && (
                    <p className="flex justify-between">
                      <span className="font-medium">Season:</span>
                      <span>{item.season}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">No items found</p>
          {items.length === 0 ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition"
            >
              Add your first wardrobe item
            </button>
          ) : (
            <p className="text-gray-400">Try adjusting your filters</p>
          )}
        </div>
      )}
    </div>
  );
}
