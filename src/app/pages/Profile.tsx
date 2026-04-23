import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Edit,
  LogOut,
  Sparkles,
  ShoppingBag,
  Heart,
  Trash2,
  MessageCircle,
  MapPin,
  Loader,
} from "lucide-react";
import { apiCall, API_ENDPOINTS } from "../../config/api";

interface Post {
  _id: string;
  image: string;
  caption: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

export function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    age: "",
    email: "",
    avatar: "",
    joinedDate: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    email: "",
  });

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  /* ===========================
     LOAD USER FROM DATABASE
  =========================== */

  useEffect(() => {
    console.log("USER ID =", userId);

    if (!userId || !token) {
      navigate("/auth");
      return;
    }

    // Load user data
    apiCall(API_ENDPOINTS.GET_USER(userId))
      .then((data) => {
        console.log("USER DATA =", data);

        if (!data || data.error) return;

        const realUser = {
          name: data.name || "",
          age: data.age || "",
          email: data.email || "",
          avatar:
            "https://ui-avatars.com/api/?name=" +
            (data.name || "User"),
          joinedDate:
            new Date().toISOString(),
        };

        setUser(realUser);

        setEditForm({
          name: data.name || "",
          age: data.age || "",
          email: data.email || "",
        });
      })
      .catch((err) => {
        console.log(err);
      });

    // Load user posts
    fetchUserPosts();
  }, [userId, token, navigate]);

  /* ===========================
     FETCH USER POSTS
  =========================== */

  const fetchUserPosts = async () => {
    if (!userId) return;

    try {
      setLoadingPosts(true);
      const posts = await apiCall(API_ENDPOINTS.GET_USER_POSTS(userId));
      setUserPosts(posts || []);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  /* ===========================
     DELETE POST
  =========================== */

  const deletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await apiCall(API_ENDPOINTS.DELETE_POST(postId), {
        method: "DELETE",
      });

      setUserPosts(prev => prev.filter(p => p._id !== postId));
      setSelectedPost(null);
      alert("Post deleted successfully");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post");
    }
  };

  /* ===========================
     LOGOUT
  =========================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/auth");
  };

  /* ===========================
     SAVE EDIT
  =========================== */

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: editForm.name,
      age: editForm.age,
      email: editForm.email,
    };

    setUser(updatedUser);
    setIsEditing(false);
  };

  /* ===========================
     CHANGE AVATAR
  =========================== */

  const handleChangeAvatar = () => {
    const url = prompt("Enter avatar URL");

    if (url) {
      setUser({
        ...user,
        avatar: url,
      });
    }
  };

  /* ===========================
     DATE FORMAT
  =========================== */

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatPostDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  /* ===========================
     STATS
  =========================== */

  const stats = [
    {
      icon: ShoppingBag,
      label: "Wardrobe",
      value: "24",
    },
    {
      icon: Heart,
      label: "Saved",
      value: "12",
    },
    {
      icon: Sparkles,
      label: "AI Chats",
      value: "48",
    },
  ];

  /* ===========================
     UI
  =========================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-4 sm:p-6 rounded-lg sm:rounded-xl text-white mx-3 sm:mx-8 mt-4 sm:mt-8">

        <div className="flex items-start justify-between gap-3">
          <img
            src={user.avatar}
            className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-white/30"
          />

          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={handleChangeAvatar}
              className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition min-h-[36px] min-w-[36px]"
              title="Change avatar"
            >
              <Camera size={16} className="sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition min-h-[36px] min-w-[36px]"
              title="Edit profile"
            >
              <Edit size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <h2 className="text-lg sm:text-3xl font-bold mt-2 sm:mt-3 truncate">
          {user.name}
        </h2>

        <p className="text-xs sm:text-sm text-white/80 truncate">
          {user.email}
        </p>

      </div>

      <div className="px-3 sm:px-8 py-4 sm:py-8">
        {/* STATS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;

            return (
              <div
                key={i}
                className="bg-white p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition text-center"
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500" />

                <p className="font-bold text-sm sm:text-lg text-gray-900">
                  {s.value}
                </p>

                <p className="text-xs sm:text-sm text-gray-600">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* DETAILS */}
        <div className="bg-white p-4 sm:p-6 mb-6 sm:mb-8 rounded-lg sm:rounded-xl shadow-sm">

          {isEditing ? (
            <>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Full name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    value={editForm.age}
                    type="number"
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        age: e.target.value,
                      })
                    }
                    placeholder="Age"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="Email"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:shadow-lg transition font-medium min-h-[40px]"
                >
                  Save
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:bg-gray-300 transition font-medium min-h-[40px]"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                <div className="pb-3 sm:pb-4 border-b border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Age</p>
                  <p className="text-sm sm:text-base text-gray-900 font-semibold">
                    {user.age || "Not provided"}
                  </p>
                </div>

                <div className="pb-3 sm:pb-4 border-b border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Email</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-semibold break-all">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Joined</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-semibold">
                    {formatDate(user.joinedDate)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* MY POSTS SECTION - Modern Instagram/Pinterest Style */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-2xl">📸</span> My Posts ({userPosts.length})
          </h3>

          {loadingPosts ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No posts yet</p>
              <p className="text-gray-500 text-sm mt-1">Share your fashion moments with the community!</p>
              <button
                onClick={() => navigate("/community")}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
              >
                Create Post
              </button>
            </div>
          ) : (
            <>
              {/* Instagram Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {userPosts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => setSelectedPost(post)}
                    className="group cursor-pointer bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                        <div className="flex items-center gap-4 text-white w-full">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                            <span className="text-xs sm:text-sm font-semibold">{post.likes.length}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-semibold">{post.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Info */}
                    <div className="p-3 sm:p-4">
                      {post.caption && (
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 mb-2">
                          {post.caption}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                        <span>{formatPostDate(post.createdAt)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost(post._id);
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div className="bg-black aspect-square md:aspect-auto md:h-full">
                  <img
                    src={selectedPost.image}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="p-4 sm:p-6 flex flex-col">
                  {/* Caption */}
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-gray-700 mb-4">
                      {selectedPost.caption || "No caption"}
                    </p>

                    {/* Engagement Stats */}
                    <div className="flex gap-6 mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {selectedPost.likes.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <Heart className="w-4 h-4" /> Likes
                        </p>
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {selectedPost.comments.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" /> Comments
                        </p>
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {formatPostDate(selectedPost.createdAt)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">Posted</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => deletePost(selectedPost._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 sm:py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 min-h-[40px]"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 sm:py-2.5 rounded-lg transition font-medium min-h-[40px]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition font-medium flex items-center justify-center gap-2 min-h-[44px]"
        >
          <LogOut size={16} className="sm:w-5 sm:h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}