import { useState, useEffect } from "react";
import { ArrowLeft, Heart, MessageCircle, Trash2, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS } from "../../config/api";

interface Post {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar: string;
  };
  image: string;
  caption: string;
  likes: string[];
  comments: any[];
  saves: string[];
  createdAt: string;
}

export function SavedPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token || !userId) {
      navigate("/auth");
      return;
    }
    fetchSavedPosts();
  }, [token, userId, navigate]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.GET_SAVED_POSTS(userId));
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching saved posts:", err);
      alert("Failed to load saved posts");
    } finally {
      setLoading(false);
    }
  };

  const unsavePost = async (postId: string) => {
    try {
      await apiCall(API_ENDPOINTS.SAVE_POST(postId), {
        method: "POST",
      });
      setPosts(prev => prev.filter(post => post._id !== postId));
      setSelectedPost(null);
    } catch (err) {
      console.error("Error unsaving post:", err);
      alert("Failed to unsave post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button
            onClick={() => navigate("/community")}
            className="p-2 hover:bg-gray-100 rounded-lg transition transform hover:scale-110"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Saved Posts</h1>
          <span className="ml-auto text-sm font-medium text-gray-500">
            {posts.length} saved
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader size={40} className="animate-spin text-purple-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No saved posts yet</p>
            <button
              onClick={() => navigate("/community")}
              className="mt-4 text-purple-500 hover:text-purple-600 font-medium transition"
            >
              Browse community posts
            </button>
          </div>
        ) : (
          <>
            {/* Instagram-Style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition"
                >
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full aspect-square object-cover group-hover:scale-110 transition duration-300"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 text-white">
                      <Heart size={20} className="fill-white" />
                      <span className="font-semibold">{post.likes.length}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <MessageCircle size={20} />
                      <span className="font-semibold">{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Post Details Modal */}
            {selectedPost && (
              <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image */}
                    <div className="bg-black">
                      <img
                        src={selectedPost.image}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-6 flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedPost.userId.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedPost.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPost(null)}
                          className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Caption */}
                      <p className="text-gray-700 mb-6 flex-1">
                        {selectedPost.caption}
                      </p>

                      {/* Stats */}
                      <div className="flex space-x-6 py-4 border-t border-b border-gray-200">
                        <div className="text-center">
                          <p className="font-bold text-gray-900">
                            {selectedPost.likes.length}
                          </p>
                          <p className="text-xs text-gray-500">Likes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">
                            {selectedPost.comments.length}
                          </p>
                          <p className="text-xs text-gray-500">Comments</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 mt-6">
                        <button
                          onClick={() => {
                            unsavePost(selectedPost._id);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-medium"
                        >
                          <Trash2 size={18} />
                          <span>Unsave</span>
                        </button>
                        <button
                          onClick={() => setSelectedPost(null)}
                          className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
