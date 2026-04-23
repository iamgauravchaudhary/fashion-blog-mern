import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share, Image as ImageIcon, Send, Loader, User, Clock, Trash2, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS } from "../../config/api";

interface Post {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
  };
  image: string;
  caption: string;
  likes: string[];
  comments: any[];
  saves: string[];
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  avatar: string;
  email: string;
}

export function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [creatingPost, setCreatingPost] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [shareNotification, setShareNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // ✅ Fetch posts and user data on load
  useEffect(() => {
    if (!token || !userId) {
      navigate("/auth");
      return;
    }
    fetchPosts();
    fetchCurrentUser();
  }, [token, userId, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.GET_POSTS);
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      alert("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await apiCall(API_ENDPOINTS.GET_USER(userId));
      setCurrentUser(userData);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // ✅ Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        alert("Please drop an image file");
      }
    }
  };

  // ✅ Create new post
  const createPost = async () => {
    if (!newCaption.trim() && !selectedImage) return;

    setCreatingPost(true);
    try {
      const formData = new FormData();
      formData.append("caption", newCaption);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await apiCall(API_ENDPOINTS.CREATE_POST, {
        method: "POST",
        data: formData,
        headers: {
          // Let axios set Content-Type automatically for FormData with boundary
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setNewCaption("");
      setSelectedImage(null);
      setImagePreview("");

      // Refresh posts
      fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setCreatingPost(false);
    }
  };

  // ✅ Like/Unlike post
  const toggleLike = async (postId: string) => {
    try {
      await apiCall(API_ENDPOINTS.LIKE_POST(postId), {
        method: "POST",
      });

      // Update local state
      setPosts(prev =>
        prev.map(post =>
          post._id === postId
            ? {
              ...post,
              likes: post.likes.includes(userId)
                ? post.likes.filter(id => id !== userId)
                : [...post.likes, userId]
            }
            : post
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // ✅ Delete post
  const deletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await apiCall(API_ENDPOINTS.DELETE_POST(postId), {
        method: "DELETE",
      });
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  // ✅ Format time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  // ✅ Add comment to post
  const addComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      await apiCall(API_ENDPOINTS.ADD_COMMENT(postId), {
        method: "POST",
        data: { text },
      });

      // Reset comment input
      setCommentText(prev => ({ ...prev, [postId]: "" }));

      // Refresh posts to get updated comments
      fetchPosts();
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  // ✅ Share post (copy to clipboard)
  const sharePost = (postId: string) => {
    const postUrl = `${window.location.origin}/community?post=${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setShareNotification(postId);
      setTimeout(() => setShareNotification(null), 2000);
    }).catch(() => {
      alert("Failed to copy link");
    });
  };

  // ✅ Save/Unsave post
  const toggleSave = async (postId: string) => {
    try {
      const response = await apiCall(API_ENDPOINTS.SAVE_POST(postId), {
        method: "POST",
      });

      // Update local state
      setPosts(prev =>
        prev.map(post =>
          post._id === postId
            ? {
              ...post,
              saves: post.saves.includes(userId)
                ? post.saves.filter(id => id !== userId)
                : [...post.saves, userId]
            }
            : post
        )
      );
    } catch (err) {
      console.error("Error toggling save:", err);
      alert("Failed to save post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">FV</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">FashionVibe</h1>
          </div>
          <div className="flex items-center gap-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={14} className="sm:w-4 sm:h-4 text-gray-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
              {currentUser?.name || "User"}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        {/* Create Post Box */}
        <div
          ref={dragRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 p-3 sm:p-4 mb-4 sm:mb-6 transition-all duration-300 transform ${dragActive ? "border-purple-500 bg-purple-50 scale-105" : "border-gray-200 hover:shadow-lg"
            }`}
        >
          <div className="flex gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="What's your fashion vibe today?"
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                rows={3}
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-2 sm:mt-3 relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg sm:rounded-xl transition-transform duration-300 hover:scale-105"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200 transform hover:scale-110 text-sm"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Drag and Drop Hint */}
              {dragActive && (
                <div className="mt-2 sm:mt-3 p-3 sm:p-6 border-2 border-dashed border-purple-500 rounded-lg sm:rounded-xl bg-purple-50 text-center animate-pulse">
                  <p className="text-purple-600 font-medium text-sm sm:text-base">Drop your image here</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 min-h-[36px]"
                  >
                    <ImageIcon size={16} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Photo</span>
                    <span className="sm:hidden">📸</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                <button
                  onClick={createPost}
                  disabled={creatingPost || (!newCaption.trim() && !selectedImage)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 font-medium min-h-[36px] sm:min-h-auto"
                >
                  {creatingPost ? (
                    <Loader size={14} className="sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Send size={14} className="sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline">Post</span>
                  <span className="sm:hidden">Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 animate-pulse">
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 sm:h-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ImageIcon size={20} className="sm:w-6 sm:h-6 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No posts yet</h3>
              <p className="text-xs sm:text-sm text-gray-500">Be the first to share your fashion vibe!</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div
                key={post._id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Post Header */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={16} className="sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{post.userId.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          <span className="truncate">{getTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button for own posts */}
                    {post.userId._id === userId && (
                      <button
                        onClick={() => deletePost(post._id)}
                        className="text-gray-400 hover:text-red-500 transition-all duration-200 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mt-2 sm:mt-3">
                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">{post.caption}</p>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="mt-2 sm:mt-3">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full rounded-lg sm:rounded-xl max-h-48 sm:max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 gap-1">
                    <button
                      onClick={() => toggleLike(post._id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition min-h-[32px] ${post.likes.includes(userId)
                        ? "text-red-500 bg-red-50"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Heart
                        size={14}
                        className={`sm:w-4 sm:h-4 ${post.likes.includes(userId) ? "fill-current" : ""}`}
                      />
                      <span className="font-medium">{post.likes.length}</span>
                    </button>

                    <button
                      onClick={() => setExpandedComments(expandedComments === post._id ? null : post._id)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition min-h-[32px]"
                    >
                      <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                      <span className="font-medium">{post.comments.length}</span>
                    </button>

                    <button
                      onClick={() => toggleSave(post._id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition min-h-[32px] ${post.saves.includes(userId)
                        ? "text-yellow-500 bg-yellow-50"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Bookmark
                        size={14}
                        className={`sm:w-4 sm:h-4 ${post.saves.includes(userId) ? "fill-current" : ""}`}
                      />
                      <span className="hidden sm:inline font-medium">{post.saves.length}</span>
                    </button>

                    <button
                      onClick={() => sharePost(post._id)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition min-h-[32px]"
                    >
                      <Share size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline font-medium">
                        {shareNotification === post._id ? "Copied!" : "Share"}
                      </span>
                      <span className="sm:hidden font-medium">
                        {shareNotification === post._id ? "✓" : "↗"}
                      </span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments === post._id && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      {/* Existing Comments */}
                      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
                        {post.comments.length === 0 ? (
                          <p className="text-gray-500 text-xs sm:text-sm">No comments yet. Be the first!</p>
                        ) : (
                          post.comments.map((comment, idx) => (
                            <div key={idx} className="flex gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs sm:text-sm text-gray-900">{comment.username}</p>
                                <p className="text-xs sm:text-sm text-gray-700 break-words">{comment.text}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {comment.createdAt ? getTimeAgo(comment.createdAt) : "Just now"}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Input */}
                      <div className="flex gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                        <input
                          type="text"
                          placeholder="Comment..."
                          value={commentText[post._id] || ""}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addComment(post._id);
                            }
                          }}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[32px]"
                        />
                        <button
                          onClick={() => addComment(post._id)}
                          disabled={!commentText[post._id]?.trim()}
                          className="bg-purple-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[32px]"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
