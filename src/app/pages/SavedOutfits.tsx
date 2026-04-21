import { useState, useEffect } from "react";
import { Heart, Trash2, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS } from "../../config/api";

interface SavedOutfit {
  _id: string;
  userId: string;
  outfitData: {
    title?: string;
    name?: string;
    description?: string;
    styleTip?: string;
    items?: { top: string; bottom: string; shoes: string; accessory: string };
    image: string;
    category?: string;
    season?: string;
    colors?: string[];
  };
  likes: string[];
  comments: any[];
  createdAt: string;
}

export function SavedOutfits() {
  const navigate = useNavigate();
  // Load cached saved outfits on initial render
  const cachedSavedOutfits = localStorage.getItem("savedOutfitsCache");
  const initialSavedOutfits = cachedSavedOutfits ? JSON.parse(cachedSavedOutfits) : [];

  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(initialSavedOutfits);
  const [loading, setLoading] = useState(false);
  const [likedOutfits, setLikedOutfits] = useState<string[]>([]);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // ✅ Fetch saved outfits on load
  useEffect(() => {
    if (!token || !userId) {
      navigate("/auth");
      return;
    }
    fetchSavedOutfits();
  }, [token, userId, navigate]);

  const fetchSavedOutfits = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.GET_SAVED_OUTFITS(userId));
      const outfitsData = data || [];
      setSavedOutfits(outfitsData);
      // Cache saved outfits
      localStorage.setItem("savedOutfitsCache", JSON.stringify(outfitsData));

      // Set initially liked outfits
      const initialLiked = outfitsData
        .filter((outfit: SavedOutfit) => outfit.likes.includes(userId))
        .map((outfit: SavedOutfit) => outfit._id);
      setLikedOutfits(initialLiked);
    } catch (err) {
      console.error("Error fetching saved outfits:", err);
      // Try to load from cache if fetch fails
      const cached = localStorage.getItem("savedOutfitsCache");
      if (cached) {
        console.log("📦 Loading saved outfits from cache");
        setSavedOutfits(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete outfit
  const handleDelete = async (outfitId: string) => {
    if (!confirm("Delete this outfit?")) return;

    try {
      await apiCall(API_ENDPOINTS.DELETE_SAVED_OUTFIT(outfitId), {
        method: "DELETE",
      });

      const updatedOutfits = savedOutfits.filter((outfit) => outfit._id !== outfitId);
      setSavedOutfits(updatedOutfits);
      // Update cache
      localStorage.setItem("savedOutfitsCache", JSON.stringify(updatedOutfits));
      alert("✅ Outfit deleted!");
    } catch (err) {
      console.error("Error deleting outfit:", err);
      alert("Failed to delete outfit");
    }
  };

  // ✅ Handle like/unlike
  const handleLike = async (outfitId: string) => {
    try {
      const updatedOutfit = await apiCall(API_ENDPOINTS.LIKE_SAVED_OUTFIT(outfitId), {
        method: "POST",
      });

      setSavedOutfits(
        savedOutfits.map((outfit) =>
          outfit._id === outfitId ? updatedOutfit : outfit
        )
      );

      if (likedOutfits.includes(outfitId)) {
        setLikedOutfits(likedOutfits.filter((id) => id !== outfitId));
      } else {
        setLikedOutfits([...likedOutfits, outfitId]);
      }
    } catch (err) {
      console.error("Error liking outfit:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="p-8 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          💖 Saved Outfits
        </h1>
        <p className="text-gray-600">
          Your favorite outfit combinations for any occasion
        </p>
      </div>

      {/* Stats */}
      {savedOutfits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-4 text-white shadow-lg">
            <p className="text-3xl font-bold">{savedOutfits.length}</p>
            <p className="text-sm text-purple-100">Saved Outfits</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-3xl font-bold text-gray-900">
              {savedOutfits.reduce((total, o) => total + o.likes.length, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-3xl font-bold text-gray-900">
              {savedOutfits.length}
            </p>
            <p className="text-sm text-gray-600">Collections</p>
          </div>
        </div>
      )}

      {/* Outfits Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : savedOutfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOutfits.map((outfit) => {
            const outfitTitle = outfit.outfitData.title || outfit.outfitData.name || "Saved Outfit";
            return (
              <div
                key={outfit._id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={outfit.outfitData.image}
                    alt={outfitTitle}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleLike(outfit._id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${likedOutfits.includes(outfit._id)
                        ? "bg-red-500 text-white"
                        : "bg-white/80 text-gray-700 hover:bg-white"
                        }`}
                      title={likedOutfits.includes(outfit._id) ? "Unlike" : "Like"}
                    >
                      <Heart
                        className={`w-5 h-5 ${likedOutfits.includes(outfit._id) ? "fill-current" : ""
                          }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(outfit._id)}
                      className="w-10 h-10 rounded-full bg-white/80 text-red-600 hover:bg-red-100 backdrop-blur-sm flex items-center justify-center transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Category Badge */}
                  {outfit.outfitData.category && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-medium rounded-full">
                      {outfit.outfitData.category}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {outfitTitle}
                  </h3>

                  {/* Season & Colors */}
                  <div className="flex items-center gap-2 mb-3">
                    {outfit.outfitData.season && (
                      <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                        {outfit.outfitData.season}
                      </span>
                    )}
                    {outfit.outfitData.colors && outfit.outfitData.colors.length > 0 && (
                      <div className="flex gap-1">
                        {outfit.outfitData.colors.slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description/Style Tip */}
                  {outfit.outfitData.styleTip && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      💡 {outfit.outfitData.styleTip}
                    </p>
                  )}

                  {/* Items */}
                  {outfit.outfitData.items && (
                    <div className="space-y-1 mb-4">
                      <p className="text-xs font-semibold text-gray-700">Items:</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {outfit.outfitData.items.top && <p>👕 {outfit.outfitData.items.top}</p>}
                        {outfit.outfitData.items.bottom && <p>👖 {outfit.outfitData.items.bottom}</p>}
                        {outfit.outfitData.items.shoes && <p>👟 {outfit.outfitData.items.shoes}</p>}
                        {outfit.outfitData.items.accessory && <p>✨ {outfit.outfitData.items.accessory}</p>}
                      </div>
                    </div>
                  )}

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                      {outfit.likes.length}
                    </div>
                    <span>{formatDate(outfit.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No Saved Outfits Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start generating outfit suggestions and save your favorites to build your personal collection
          </p>
          <button
            onClick={() => navigate("/outfit-suggestions")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            ✨ Browse Suggestions
          </button>
        </div>
      )}
    </div>
  );
}
