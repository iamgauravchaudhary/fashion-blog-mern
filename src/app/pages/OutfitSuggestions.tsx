import { useState } from "react";
import { Heart, Filter } from "lucide-react";

interface Outfit {
  id: string;
  title: string;
  image: string;
  category: string;
  season: string;
  likes: number;
}

export function OutfitSuggestions() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [likedOutfits, setLikedOutfits] = useState<string[]>([]);

  const categories = ["All", "Casual", "Formal", "Bohemian", "Evening", "Sporty", "Minimalist"];

  const outfits: Outfit[] = [
    {
      id: "1",
      title: "Casual Weekend Look",
      image: "https://images.unsplash.com/photo-1765436607852-7ae171f0d13b?w=400",
      category: "Casual",
      season: "Spring",
      likes: 234,
    },
    {
      id: "2",
      title: "Business Professional",
      image: "https://images.unsplash.com/photo-1768508665014-7e567bf7fdb2?w=400",
      category: "Formal",
      season: "All Seasons",
      likes: 456,
    },
    {
      id: "3",
      title: "Boho Chic Vibes",
      image: "https://images.unsplash.com/photo-1632178386020-40e5fcc73156?w=400",
      category: "Bohemian",
      season: "Summer",
      likes: 589,
    },
    {
      id: "4",
      title: "Elegant Evening",
      image: "https://images.unsplash.com/photo-1763336016192-c7b62602e993?w=400",
      category: "Evening",
      season: "All Seasons",
      likes: 892,
    },
    {
      id: "5",
      title: "Athleisure Comfort",
      image: "https://images.unsplash.com/photo-1768407683930-7cdf3cad33c3?w=400",
      category: "Sporty",
      season: "All Seasons",
      likes: 445,
    },
    {
      id: "6",
      title: "Minimalist Aesthetic",
      image: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=400",
      category: "Minimalist",
      season: "Fall",
      likes: 678,
    },
  ];

  const filteredOutfits =
    selectedCategory === "All"
      ? outfits
      : outfits.filter((outfit) => outfit.category === selectedCategory);

  const handleLike = (outfitId: string) => {
    if (likedOutfits.includes(outfitId)) {
      setLikedOutfits(likedOutfits.filter((id) => id !== outfitId));
    } else {
      setLikedOutfits([...likedOutfits, outfitId]);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Outfit Suggestions
        </h1>
        <p className="text-gray-600">
          Discover curated outfit ideas for every occasion
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filter by category:</span>
        </div>
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

      {/* Outfit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOutfits.map((outfit) => (
          <div
            key={outfit.id}
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={outfit.image}
                alt={outfit.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => handleLike(outfit.id)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                  likedOutfits.includes(outfit.id)
                    ? "bg-red-500 text-white"
                    : "bg-white/80 text-gray-700 hover:bg-white"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    likedOutfits.includes(outfit.id) ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {outfit.title}
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full font-medium">
                  {outfit.category}
                </span>
                <span className="text-gray-600">{outfit.season}</span>
              </div>
              <div className="flex items-center gap-1 mt-3 text-gray-600">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{outfit.likes} likes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
