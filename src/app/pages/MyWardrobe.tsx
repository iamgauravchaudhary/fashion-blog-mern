import { useState } from "react";
import { Plus, Search, Trash2, Tag } from "lucide-react";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  image: string;
  season: string;
}

export function MyWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([
    {
      id: "1",
      name: "White T-Shirt",
      category: "Tops",
      color: "White",
      image: "https://images.unsplash.com/photo-1626160200951-fc4b4f8d4de9?w=300",
      season: "All Seasons",
    },
    {
      id: "2",
      name: "Blue Jeans",
      category: "Bottoms",
      color: "Blue",
      image: "https://images.unsplash.com/photo-1713880442898-0f151fba5e16?w=300",
      season: "All Seasons",
    },
    {
      id: "3",
      name: "Leather Jacket",
      category: "Outerwear",
      color: "Black",
      image: "https://images.unsplash.com/photo-1727524366429-27de8607d5f6?w=300",
      season: "Fall/Winter",
    },
    {
      id: "4",
      name: "White Sneakers",
      category: "Shoes",
      color: "White",
      image: "https://images.unsplash.com/photo-1651371409956-20e79c06a8bb?w=300",
      season: "All Seasons",
    },
    {
      id: "5",
      name: "Red Dress",
      category: "Dresses",
      color: "Red",
      image: "https://images.unsplash.com/photo-1612470561070-8a9488645211?w=300",
      season: "Summer",
    },
    {
      id: "6",
      name: "Blazer",
      category: "Outerwear",
      color: "Navy",
      image: "https://images.unsplash.com/photo-1770364022753-7bb3ffe973dd?w=300",
      season: "All Seasons",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wardrobe</h1>
          <p className="text-gray-600">Manage your clothing collection</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your wardrobe..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-sm text-gray-600">Total Items</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
          <p className="text-sm text-gray-600">Categories</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">
            {items.filter((i) => i.season === "All Seasons").length}
          </p>
          <p className="text-sm text-gray-600">All Season</p>
        </div>
      </div>

      {/* Wardrobe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {item.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {item.color}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{item.season}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Item</h2>
            <p className="text-gray-600 mb-6">
              Feature coming soon! You'll be able to add custom items to your wardrobe.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
