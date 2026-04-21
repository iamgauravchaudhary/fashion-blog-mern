import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Heart,
  Users,
  Bookmark,
  User,
} from "lucide-react";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/ai-stylist", icon: MessageSquare, label: "AI Stylist" },
    { path: "/outfit-suggestions", icon: Sparkles, label: "Outfits" },
    { path: "/my-wardrobe", icon: ShoppingBag, label: "Wardrobe" },
    { path: "/saved-outfits", icon: Heart, label: "Saved Outfits" },
    { path: "/community", icon: Users, label: "Community" },
    { path: "/saved-posts", icon: Bookmark, label: "Saved Posts" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            StyleVibe
          </h1>
          <p className="text-sm text-gray-600 mt-1">Fashion Assistant</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all transform hover:scale-105 duration-200 ${isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
