import { useState } from "react";
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export function Community() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        name: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        username: "@emmastyle",
      },
      image: "https://images.unsplash.com/photo-1765436607852-7ae171f0d13b?w=600",
      caption: "Loving this casual weekend vibe! 🌟 Perfect for brunch with friends.",
      likes: 234,
      comments: 18,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      author: {
        name: "Sofia Martinez",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        username: "@sofiamode",
      },
      image: "https://images.unsplash.com/photo-1768508665014-7e567bf7fdb2?w=600",
      caption: "Power dressing for today's presentation 💼✨ #bossbabe",
      likes: 456,
      comments: 32,
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      author: {
        name: "Ava Chen",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        username: "@avachic",
      },
      image: "https://images.unsplash.com/photo-1632178386020-40e5fcc73156?w=600",
      caption: "Embracing boho vibes this summer ☀️🌻",
      likes: 589,
      comments: 45,
      timestamp: "1 day ago",
    },
  ]);

  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  const handleLike = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  const handleSave = (postId: string) => {
    if (savedPosts.includes(postId)) {
      setSavedPosts(savedPosts.filter((id) => id !== postId));
    } else {
      setSavedPosts([...savedPosts, postId]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-sm text-gray-600">Discover style inspiration from others</p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto py-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
                />
                <div>
                  <p className="font-semibold text-gray-900">{post.author.name}</p>
                  <p className="text-xs text-gray-500">{post.author.username}</p>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Image */}
            <img
              src={post.image}
              alt="Post"
              className="w-full aspect-square object-cover"
            />

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 transition-all transform hover:scale-110"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        likedPosts.includes(post.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-700"
                      }`}
                    />
                    <span className="font-semibold text-gray-900">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 transition-all transform hover:scale-110">
                    <MessageCircle className="w-6 h-6 text-gray-700" />
                    <span className="font-semibold text-gray-900">{post.comments}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleSave(post.id)}
                  className="transition-all transform hover:scale-110"
                >
                  <Bookmark
                    className={`w-6 h-6 ${
                      savedPosts.includes(post.id)
                        ? "fill-purple-600 text-purple-600"
                        : "text-gray-700"
                    }`}
                  />
                </button>
              </div>

              {/* Post Caption */}
              <p className="text-gray-900">
                <span className="font-semibold">{post.author.name}</span>{" "}
                {post.caption}
              </p>
              <p className="text-xs text-gray-500 mt-2">{post.timestamp}</p>
            </div>
          </div>
        ))}

        {/* Load More */}
        <div className="text-center py-8">
          <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
}
