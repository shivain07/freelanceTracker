import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import api from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const verifyUser = useCallback((userData) => {
    if (userData?.user?.id) {
      // userData = {
      //   success: true,
      //   message: "Authentication successful",
      //   user: {
      //     id: 1,
      //     name: "Shivain Gusain",
      //     email: "shivaingusain007@gmail.com",
      //     picture:
      //       "https://lh3.googleusercontent.com/a/ACg8ocJBbVWBpcjDZID1ncHSbl6xuokVJO19y9ja4zg3oc88fHoWHlmD=s96-c",
      //   },
      // };
      setUser(userData?.user);
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, authenticated, setLoading, verifyUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
