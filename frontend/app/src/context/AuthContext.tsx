// app/src/context/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
} from "../services/api/auth";
import { signupUser } from "../services/api/user";
import { UserCreate, UserResponse } from "../services/interfaces";
import { useSnack } from "./SnackContext";

// AuthContextの型定義
type AuthContextType = {
  isAuthenticated: boolean;
  user: UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserResponse>;
  signup: (data: UserCreate) => Promise<UserResponse>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserResponse | null>>; // 追加
};

// デフォルト値を持たないContextを作成
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProviderのプロパティの型
type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { setSnack } = useSnack();

  // ログイン関数
  const login = async (email: string, password: string) => {
    try {
      await apiLogin(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // 新規登録関数
  const signup = async (data: UserCreate) => {
    try {
      const newUser = await signupUser(data);
      const currentUser = await login(newUser.email, data.password);
      return currentUser;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  // ログアウト関数
  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // 初期ロード時にユーザー情報を取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false); // ローディング完了
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      setSnack({
        message: `こんにちは、 ${user.nickname || user.email}さん！`,
        severity: "success",
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        signup,
        logout,
        setUser, // 追加
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// AuthContextを使うためのカスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
