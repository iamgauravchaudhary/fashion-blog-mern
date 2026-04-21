import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthPage } from "./pages/AuthPage";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { AIStylistChat } from "./pages/AIStylistChat";
import { OutfitSuggestions } from "./pages/OutfitSuggestions";
import { MyWardrobe } from "./pages/MyWardrobe";
import { SavedOutfits } from "./pages/SavedOutfits";
import { Community } from "./pages/Community";
import { SavedPosts } from "./pages/SavedPosts";
import { Profile } from "./pages/Profile";


/* ======================
   AUTH CHECK
====================== */

const isAuthenticated = () => {
  return !!localStorage.getItem("userId");
};


/* ======================
   PROTECTED
====================== */

const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};


/* ======================
   ROUTER
====================== */

export const router = createBrowserRouter([

  /* AUTH */

  {
    path: "/auth",
    element: <AuthPage />,
  },


  /* APP */

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),

    children: [

      { index: true, element: <Home /> },

      {
        path: "ai-stylist",
        element: <AIStylistChat />,
      },

      {
        path: "outfit-suggestions",
        element: <OutfitSuggestions />,
      },

      {
        path: "my-wardrobe",
        element: <MyWardrobe />,
      },

      {
        path: "saved-outfits",
        element: <SavedOutfits />,
      },

      {
        path: "community",
        element: <Community />,
      },

      {
        path: "saved-posts",
        element: <SavedPosts />,
      },

      {
        path: "profile",
        element: <Profile />,
      },

    ],
  },


  /* FALLBACK */

  {
    path: "*",
    element: <Navigate to="/auth" replace />,
  },

]);