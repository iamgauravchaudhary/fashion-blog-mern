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
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FV</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">FashionVibe</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {currentUser?.name || "User"}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Post Box */}
        <div
          ref={dragRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bg-white rounded-xl shadow-sm border-2 p-4 mb-6 transition-all duration-300 transform hover:shadow-md ${dragActive ? "border-purple-500 bg-purple-50 scale-105" : "border-gray-200 hover:shadow-lg"
            }`}
        >
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="What's your fashion vibe today?"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                rows={3}
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Drag and Drop Hint */}
              {dragActive && (
                <div className="mt-3 p-6 border-2 border-dashed border-purple-500 rounded-lg bg-purple-50 text-center animate-pulse">
                  <p className="text-purple-600 font-medium">Drop your image here</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <ImageIcon size={18} />
                    <span className="text-sm">Photo</span>
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 active:scale-95"
                >
                  {creatingPost ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span className="text-sm font-medium">Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share your fashion vibe!</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div
                key={post._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Post Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.userId.name}</p>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock size={12} />
                          <span>{getTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button for own posts */}
                    {post.userId._id === userId && (
                      <button
                        onClick={() => deletePost(post._id)}
                        className="text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mt-3">
                    <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="mt-3">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleLike(post._id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition transform hover:scale-105 ${post.likes.includes(userId)
                          ? "text-red-500 bg-red-50"
                          : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <Heart
                          size={18}
                          className={post.likes.includes(userId) ? "fill-current" : ""}
                        />
                        <span className="text-sm font-medium">{post.likes.length}</span>
                      </button>

                      <button
                        onClick={() => setExpandedComments(expandedComments === post._id ? null : post._id)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition transform hover:scale-105"
                      >
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">{post.comments.length}</span>
                      </button>

                      <button
                        onClick={() => toggleSave(post._id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition transform hover:scale-105 ${post.saves.includes(userId)
                          ? "text-yellow-500 bg-yellow-50"
                          : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <Bookmark
                          size={18}
                          className={post.saves.includes(userId) ? "fill-current" : ""}
                        />
                        <span className="text-sm font-medium">{post.saves.length}</span>
                      </button>

                      <button
                        onClick={() => sharePost(post._id)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition transform hover:scale-105"
                      >
                        <Share size={18} />
                        <span className="text-sm font-medium">
                          {shareNotification === post._id ? "Copied!" : "Share"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedComments === post._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Existing Comments */}
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                        {post.comments.length === 0 ? (
                          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
                        ) : (
                          post.comments.map((comment, idx) => (
                            <div key={idx} className="flex space-x-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">{comment.username}</p>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {comment.createdAt ? getTimeAgo(comment.createdAt) : "Just now"}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Input */}
                      <div className="flex space-x-2 pt-2 border-t border-gray-100">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText[post._id] || ""}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addComment(post._id);
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => addComment(post._id)}
                          disabled={!commentText[post._id]?.trim()}
                          className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
