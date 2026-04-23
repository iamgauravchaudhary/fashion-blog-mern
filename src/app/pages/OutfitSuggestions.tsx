import { useState, useEffect } from "react";
import { Heart, Loader, Trash2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS } from "../../config/api";

interface Outfit {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  image: string;
  category: string;
  season: string;
  colors?: string[];
  styleTip?: string;
  items?: { top: string; bottom: string; shoes: string; accessory: string };
  createdAt?: string;
  liked?: boolean;
}

export function OutfitSuggestions() {
  const navigate = useNavigate();
  // Load cached outfits on initial render
  const cachedOutfits = localStorage.getItem("outfitsCache");
  const initialOutfits = cachedOutfits ? JSON.parse(cachedOutfits) : [];

  const [outfits, setOutfits] = useState<Outfit[]>(initialOutfits);
  const [loading, setLoading] = useState(false);
  const [generatingOutfits, setGeneratingOutfits] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const categories = ["All", "Casual", "Formal", "Work", "Weekend", "Evening", "Sporty"];

  // ✅ Fetch user's generated outfits
  useEffect(() => {
    if (!token || !userId) {
      navigate("/auth");
      return;
    }
    fetchOutfits();
  }, [token, userId, navigate]);

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.GET_OUTFITS_FOR_USER(userId));
      const outfitsData = data || [];
      setOutfits(outfitsData);
      // Cache outfits in localStorage
      localStorage.setItem("outfitsCache", JSON.stringify(outfitsData));
    } catch (err) {
      console.error("Error fetching outfits:", err);
      // Try to load from cache if fetch fails
      const cached = localStorage.getItem("outfitsCache");
      if (cached) {
        console.log("📦 Loading outfits from cache");
        setOutfits(JSON.parse(cached));
      } else {
        setOutfits([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate new outfits using AI
  const generateOutfitsSuggestions = async () => {
    setGeneratingOutfits(true);
    try {
      const data = await apiCall(API_ENDPOINTS.GENERATE_OUTFITS, {
        method: "POST",
        data: { count: 4 },
      });

      // Add generated outfits to state
      const newOutfits = (data.outfits || []).map((outfit: any) => ({
        _id: outfit._id,
        title: outfit.title,
        description: outfit.styleTip || "",
        image: outfit.image || "https://via.placeholder.com/300?text=" + outfit.title,
        category: outfit.category || "Casual",
        season: outfit.season || "All Seasons",
        colors: outfit.colors || [],
        styleTip: outfit.styleTip || "",
        items: outfit.items || {},
        liked: false,
      }));

      const updatedOutfits = [...newOutfits, ...outfits];
      setOutfits(updatedOutfits);
      // Update cache
      localStorage.setItem("outfitsCache", JSON.stringify(updatedOutfits));
      alert("✅ Outfits generated successfully!");
    } catch (err) {
      console.error("Error generating outfits:", err);
      alert("Failed to generate outfits. Please try again.");
    } finally {
      setGeneratingOutfits(false);
    }
  };

  // ✅ Save outfit to saved outfits
  const saveOutfit = async (outfit: Outfit) => {
    try {
      await apiCall(API_ENDPOINTS.SAVE_OUTFIT, {
        method: "POST",
        data: {
          outfitData: {
            title: outfit.title,
            description: outfit.description,
            items: outfit.items,
            image: outfit.image,
            season: outfit.season,
            category: outfit.category,
            styleTip: outfit.styleTip,
            colors: outfit.colors,
          },
        },
      });

      // Update local state
      setOutfits(prev =>
        prev.map(o =>
          o._id === outfit._id ? { ...o, liked: true } : o
        )
      );

      alert("✅ Outfit saved to favorites!");
    } catch (err) {
      console.error("Error saving outfit:", err);
      alert("Failed to save outfit");
    }
  };

  // ✅ Delete outfit
  const deleteOutfit = async (outfitId: string) => {
    if (!window.confirm("Delete this outfit?")) return;

    try {
      await apiCall(API_ENDPOINTS.DELETE_OUTFIT(outfitId), {
        method: "DELETE",
      });
      const updatedOutfits = outfits.filter(o => o._id !== outfitId);
      setOutfits(updatedOutfits);
      localStorage.setItem("outfitsCache", JSON.stringify(updatedOutfits));
      alert("Outfit deleted!");
    } catch (err) {
      console.error("Error deleting outfit:", err);
      alert("Failed to delete outfit");
    }
  };

  // ✅ Clear all outfits
  const clearAllOutfits = async () => {
    if (!window.confirm("🚨 Delete ALL outfits? This action cannot be undone.")) return;

    try {
      // Delete each outfit from backend
      await Promise.all(
        outfits.map(outfit =>
          apiCall(API_ENDPOINTS.DELETE_OUTFIT(outfit._id || ""), {
            method: "DELETE",
          }).catch(() => {
            // Continue even if individual deletion fails
          })
        )
      );

      // Clear local state and cache
      setOutfits([]);
      localStorage.removeItem("outfitsCache");
      alert("✅ All outfits cleared!");
    } catch (err) {
      console.error("Error clearing outfits:", err);
      // Still clear locally even if API fails
      setOutfits([]);
      localStorage.removeItem("outfitsCache");
      alert("Outfits cleared from your device");
    }
  };

  // ✅ Toggle like/save
  const handleLike = (outfit: Outfit) => {
    if (!outfit.liked) {
      saveOutfit(outfit);
    } else {
      deleteOutfit(outfit._id || "");
    }
  };

  const filteredOutfits =
    selectedCategory === "All"
      ? outfits
      : outfits.filter(o => o.category === selectedCategory);

  return (
    <div className="px-3 sm:p-8 py-4 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              ✨ Outfits
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              AI-powered recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={generateOutfitsSuggestions}
          disabled={generatingOutfits}
          className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center sm:justify-start gap-2 font-medium min-h-[44px]"
        >
          {generatingOutfits ? (
            <>
              <Loader size={18} className="animate-spin sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Generating...</span>
              <span className="sm:hidden">Gen...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Generate New Outfits</span>
              <span className="sm:hidden">Generate</span>
            </>
          )}
        </button>

        <button
          onClick={clearAllOutfits}
          disabled={outfits.length === 0}
          className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-2 font-medium min-h-[44px]"
          title="Delete all outfit cards"
        >
          <Trash2 size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Clear All</span>
          <span className="sm:hidden">Clear</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 sm:mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full whitespace-nowrap font-medium transition-all min-h-[36px] sm:min-h-[40px] ${selectedCategory === category
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-purple-500" size={32} />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOutfits.length === 0 && (
        <div className="text-center py-12">
          <Sparkles size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
          <p className="text-gray-600 text-base sm:text-lg">No outfits yet</p>
          <p className="text-gray-500 text-sm mb-6">Generate personalized suggestions using AI</p>
          <button
            onClick={generateOutfitsSuggestions}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:shadow-lg transition font-medium min-h-[44px]"
          >
            Generate Outfits
          </button>
        </div>
      )}

      {/* Outfit Grid */}
      {!loading && filteredOutfits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredOutfits.map(outfit => (
            <div
              key={outfit._id}
              className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={outfit.image}
                  alt={outfit.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                {/* Action Buttons */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleLike(outfit)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto ${outfit.liked
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                      }`}
                    title={outfit.liked ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={`w-5 h-5 ${outfit.liked ? "fill-current" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() => deleteOutfit(outfit._id || "")}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/80 text-red-600 hover:bg-red-50 transition-all min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
                    title="Delete outfit"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-2">
                  {outfit.title}
                </h3>

                <p className="text-gray-600 text-xs mb-2 sm:mb-3 line-clamp-2 h-7 sm:h-8">
                  {outfit.styleTip}
                </p>

                {/* Category & Season */}
                <div className="flex gap-2 mb-2 sm:mb-3 flex-wrap">
                  <span className="px-2 py-0.5 sm:py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    {outfit.category}
                  </span>
                  <span className="px-2 py-0.5 sm:py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                    {outfit.season}
                  </span>
                </div>

                {/* Colors */}
                {outfit.colors && outfit.colors.length > 0 && (
                  <div className="flex gap-1 mb-2 sm:mb-3">
                    {outfit.colors.slice(0, 4).map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
                    ))}
                  </div>
                )}

                {/* Items */}
                {outfit.items && (
                  <div className="text-xs text-gray-600 space-y-0.5 sm:space-y-1">
                    <p className="font-semibold text-gray-700 text-xs">Items:</p>
                    {outfit.items.top && <p className="truncate">👕 {outfit.items.top}</p>}
                    {outfit.items.bottom && <p className="truncate">👖 {outfit.items.bottom}</p>}
                    {outfit.items.shoes && <p className="truncate">👟 {outfit.items.shoes}</p>}
                    {outfit.items.accessory && <p className="truncate">✨ {outfit.items.accessory}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
