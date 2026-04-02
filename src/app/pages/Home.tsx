import { Sparkles, TrendingUp, Shirt, Calendar } from "lucide-react";

export function Home() {
  const quickActions = [
    {
      icon: Sparkles,
      title: "AI Stylist",
      description: "Get personalized outfit recommendations",
      color: "from-purple-500 to-pink-500",
      path: "/ai-stylist",
    },
    {
      icon: TrendingUp,
      title: "Outfit Suggestions",
      description: "Browse trending outfit ideas",
      color: "from-blue-500 to-cyan-500",
      path: "/outfit-suggestions",
    },
    {
      icon: Shirt,
      title: "My Wardrobe",
      description: "Manage your clothing items",
      color: "from-green-500 to-emerald-500",
      path: "/my-wardrobe",
    },
    {
      icon: Calendar,
      title: "Plan Outfits",
      description: "Schedule your weekly looks",
      color: "from-orange-500 to-red-500",
      path: "/saved-outfits",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to StyleVibe
        </h1>
        <p className="text-gray-600">
          Your personal AI-powered fashion styling assistant
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <a
              key={index}
              href={action.path}
              className="group p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600">{action.description}</p>
            </a>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Your Fashion Journey</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-3xl font-bold mb-1">24</p>
            <p className="text-purple-100">Wardrobe Items</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">12</p>
            <p className="text-purple-100">Saved Outfits</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">48</p>
            <p className="text-purple-100">AI Suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
