import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Edit,
  LogOut,
  Sparkles,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { apiCall, API_ENDPOINTS } from "../../config/api";

export function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    age: "",
    email: "",
    avatar: "",
    joinedDate: "",
  });

  const [isEditing, setIsEditing] =
    useState(false);

  const [editForm, setEditForm] =
    useState({
      name: "",
      age: "",
      email: "",
    });

  /* ===========================
     LOAD USER FROM DATABASE
  =========================== */

  useEffect(() => {

    const userId =
      localStorage.getItem("userId");
    const token =
      localStorage.getItem("token");

    console.log(
      "USER ID =",
      userId
    );

    if (!userId || !token) {

      navigate("/auth");

      return;

    }

    apiCall(API_ENDPOINTS.GET_USER(userId))
      .then((data) => {

        console.log(
          "USER DATA =",
          data
        );

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

  }, [navigate]);

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

  const handleChangeAvatar =
    () => {

      const url = prompt(
        "Enter avatar URL"
      );

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

  const formatDate = (
    dateString: string
  ) => {

    if (!dateString) return "";

    const date =
      new Date(dateString);

    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

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

    <div className="px-3 sm:px-8 py-4 sm:py-8 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-4 sm:p-6 rounded-lg sm:rounded-xl text-white">

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
              onClick={() =>
                setIsEditing(
                  !isEditing
                )
              }
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

      {/* STATS */}

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">

        {stats.map(
          (s, i) => {

            const Icon =
              s.icon;

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

          }
        )}

      </div>

      {/* DETAILS */}

      <div className="bg-white p-4 sm:p-6 mt-4 sm:mt-6 rounded-lg sm:rounded-xl shadow-sm">

        {isEditing ? (

          <>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={
                    editForm.name
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Full name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  value={
                    editForm.age
                  }
                  type="number"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      age:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Age"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  value={
                    editForm.email
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      email:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={
                  handleSaveProfile
                }
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:shadow-lg transition font-medium min-h-[40px]"
              >
                Save
              </button>

              <button
                onClick={() =>
                  setIsEditing(
                    false
                  )
                }
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
                  {formatDate(
                    user.joinedDate
                  )}
                </p>
              </div>
            </div>

          </>

        )}

      </div>

      {/* LOGOUT */}

      <button
        onClick={
          handleLogout
        }
        className="w-full mt-4 sm:mt-6 bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition font-medium flex items-center justify-center gap-2 min-h-[44px]"
      >

        <LogOut size={16} className="sm:w-5 sm:h-5" />

        <span className="hidden sm:inline">Logout</span>
        <span className="sm:hidden">Logout</span>

      </button>

    </div>

  );

}