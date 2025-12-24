"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { authStorage } from "@/lib/auth";
import { authApi } from "@/apicalls/loginauth";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { menuMaster } from "@/apicalls/systemSetup";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuList, setMenuList] = useState([]); // Add menu state
  const [menuLoading, setMenuLoading] = useState(false); // Add menu loading state
  const [selectedUlb, setSelectedUlb] = useState(null);
  const router = useRouter();


  // useEffect(() => {
  //   const initAuth = async () => {
  //     const storedUser = authStorage.getUser();
  //     const accessToken = authStorage.getAccessToken();

  //     if (storedUser && accessToken) {
  //       try {
  //         // Verify token is still valid by checking expiration
  //         const decodedToken = jwtDecode(accessToken);
  //         const currentTime = Date.now() / 1000;

  //         if (decodedToken.exp > currentTime) {
  //           setUser(storedUser);
  //           // Fetch menu data when user is authenticated
  //           if (storedUser?.ulb?.length && !selectedUlb) {
  //             setSelectedUlb(storedUser.ulb[0]);
  //           }

  //           await fetchMenuData();
  //         } else {
  //           // Token expired, clear auth
  //           authStorage.clearAuth();
  //         }
  //       } catch (error) {
  //         console.error("Token validation failed:", error);
  //         authStorage.clearAuth();
  //       }
  //     }
  //     setIsLoading(false);
  //   };

  //   initAuth();
  // }, []);

  const validateToken = async (accessToken) => {
    try {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      // Check if token is expired or about to expire (within 5 minutes)
      if (decodedToken.exp > currentTime + 300) {
        return true; // Token is valid
      }

      // Token is expired or about to expire, try to refresh
      // You'll need to implement a refresh token endpoint
      // For now, we'll just return false
      return false;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };

  const initAuth = async () => {
    const accessToken = authStorage.getAccessToken();
    const storedUser = authStorage.getUser();

    if (accessToken && storedUser) {
      try {
        const isValid = await validateToken(accessToken);

        if (isValid) {
          setUser(storedUser);
          if (storedUser?.ulb?.length && !selectedUlb) {
            setSelectedUlb(storedUser.ulb[0]);
          }
          await fetchMenuData();
        } else {
          // Token is invalid, clear auth
          authStorage.clearAuth();
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        authStorage.clearAuth();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const fetchMenuData = async () => {
    try {
      setMenuLoading(true);
      const res = await menuMaster();

      if (res?.data?.data) {
        // const EXCLUDED = ["Employee List", "Panel Setup"];
        // const EXCLUDED = [ "Panel Setup"];
        const EXCLUDED = [];
        const temp = res.data.data
        const menuData = { menus: temp?.menus?.filter(item => !EXCLUDED.includes(item?.label)) }
        // const menuData = res.data.data;


        setMenuList(menuData.menus || []);
      } else {
        console.warn("Failed to fetch menu data");
        setMenuList([]);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      setMenuList([]);
    } finally {
      setMenuLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Call the login API with username and password
      const response = await authApi.login(credentials);

      // Extract the token from the response
      const token = response.data.data;

      // Decode the JWT token to get user information
      const decodedUser = jwtDecode(token);

      // Store the token and user data
      authStorage.setTokens(token);
      authStorage.setUser(decodedUser);
      setUser(decodedUser);
      if (decodedUser?.ulb?.length) {
        setSelectedUlb(decodedUser.ulb[0]);
      }

      // Fetch menu data after successful login
      await fetchMenuData();

      return decodedUser;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Failed to login");
    }
  };

  const citizenLogin = async (credentials) => {
    try {
      // Call the login API with username and password
      const response = await authApi.citizenLogin(credentials);

      // Extract the token from the response
      const token = response.data.data;

      // Decode the JWT token to get user information
      const decodedUser = jwtDecode(token);

      // Store the token and user data
      authStorage.setTokens(token);
      authStorage.setUser(decodedUser);
      setUser(decodedUser);
      if (decodedUser?.ulb?.length) {
        setSelectedUlb(decodedUser.ulb[0]);
      }

      // Fetch menu data after successful login
      await fetchMenuData();

      return decodedUser;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Failed to login");
    }
  };

  const logout = async () => {
    try {
      authStorage.clearAuth();
      setUser(null);
      setMenuList([]); // Clear menu data on logout
      setSelectedUlb(null);
      router.replace("/");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  };

  const updateUser = (userData) => {
    authStorage.setUser(userData);
    setUser(userData);
  };

  const switchUlb = (ulb) => {
    setSelectedUlb(ulb);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        menuList,        // Add menuList to context
        menuLoading,     // Add menuLoading to context
        fetchMenuData,   // Add fetchMenuData function
        login,
        citizenLogin,
        selectedUlb,
        switchUlb,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}