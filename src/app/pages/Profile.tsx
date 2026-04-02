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

    console.log(
      "USER ID =",
      userId
    );

    if (!userId) {

      navigate("/auth");

      return;

    }

    fetch(
      "http://localhost:5000/auth/user/" +
      userId
    )
      .then((res) => res.json())
      .then((data) => {

        console.log(
          "USER DATA =",
          data
        );

        if (!data) return;

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

    localStorage.removeItem(
      "userId"
    );

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

    <div className="p-8">

      {/* HEADER */}

      <div className="bg-purple-500 p-6 rounded-xl text-white">

        <img
          src={user.avatar}
          className="w-24 h-24 rounded-full"
        />

        <h2>
          {user.name}
        </h2>

        <button
          onClick={
            handleChangeAvatar
          }
        >
          <Camera size={18} />
        </button>

        <button
          onClick={() =>
            setIsEditing(
              !isEditing
            )
          }
        >
          <Edit size={18} />
        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-4 mt-6">

        {stats.map(
          (s, i) => {

            const Icon =
              s.icon;

            return (

              <div
                key={i}
                className="bg-white p-4 rounded"
              >

                <Icon />

                <p>
                  {s.value}
                </p>

                <p>
                  {s.label}
                </p>

              </div>

            );

          }
        )}

      </div>

      {/* DETAILS */}

      <div className="bg-white p-6 mt-6 rounded">

        {isEditing ? (

          <>

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
            />

            <input
              value={
                editForm.age
              }
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  age:
                    e.target
                      .value,
                })
              }
            />

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
            />

            <button
              onClick={
                handleSaveProfile
              }
            >
              Save
            </button>

          </>

        ) : (

          <>

            <p>
              Age:
              {user.age}
            </p>

            <p>
              Email:
              {user.email}
            </p>

            <p>
              Joined:
              {formatDate(
                user.joinedDate
              )}
            </p>

          </>

        )}

      </div>

      {/* LOGOUT */}

      <button
        onClick={
          handleLogout
        }
        className="mt-6 bg-red-500 text-white p-3 rounded"
      >

        <LogOut size={18} />

        Logout

      </button>

    </div>

  );

}