import { useState } from "react";
import { Heart, Calendar, Trash2 } from "lucide-react";

interface SavedOutfit {
  id: string;
  name: string;
  image: string;
  items: string[];
  occasion: string;
  date?: string;
}

export function SavedOutfits() {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([
    {
      id: "1",
      name: "Business Meeting",
      image: "https://images.unsplash.com/photo-1768508665014-7e567bf7fdb2?w=400",
      items: ["Navy Blazer", "White Shirt", "Black Trousers", "Leather Shoes"],
      occasion: "Professional",
      date: "2026-03-20",
    },
    {
      id: "2",
      name: "Weekend Casual",
      image: "https://images.unsplash.com/photo-1765436607852-7ae171f0d13b?w=400",
      items: ["White T-Shirt", "Blue Jeans", "Sneakers", "Denim Jacket"],
      occasion: "Casual",
    },
    {
      id: "3",
      name: "Date Night",
      image: "https://images.unsplash.com/photo-1763336016192-c7b62602e993?w=400",
      items: ["Red Dress", "Heels", "Clutch", "Statement Earrings"],
      occasion: "Evening",
      date: "2026-03-22",
    },
    {
      id: "4",
      name: "Gym Session",
      image: "https://images.unsplash.com/photo-1768407683930-7cdf3cad33c3?w=400",
      items: ["Sports Bra", "Leggings", "Running Shoes", "Gym Bag"],
      occasion: "Sporty",
    },
  ]);

  const handleDelete = (id: string) => {
    setSavedOutfits(savedOutfits.filter((outfit) => outfit.id !== id));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Outfits</h1>
        <p className="text-gray-600">
          Your favorite outfit combinations for any occasion
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">{savedOutfits.length}</p>
          <p className="text-sm text-purple-100">Total Outfits</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">
            {savedOutfits.filter((o) => o.date).length}
          </p>
          <p className="text-sm text-gray-600">Scheduled</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">
            {new Set(savedOutfits.map((o) => o.occasion)).size}
          </p>
          <p className="text-sm text-gray-600">Occasions</p>
        </div>
      </div>

      {/* Outfits Grid */}
      {savedOutfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={outfit.image}
                  alt={outfit.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                    <Heart className="w-4 h-4 fill-current text-red-500 hover:text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(outfit.id)}
                    className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {outfit.date && (
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(outfit.date)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {outfit.name}
                  </h3>
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                    {outfit.occasion}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">Items:</p>
                  {outfit.items.map((item, index) => (
                    <p key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Saved Outfits Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start creating and saving your favorite outfit combinations
          </p>
          <a
            href="/outfit-suggestions"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Browse Suggestions
          </a>
        </div>
      )}
    </div>
  );
}
