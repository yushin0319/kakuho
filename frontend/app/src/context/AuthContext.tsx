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
import { UserResponse } from "../services/interfaces";

// AuthContextの型定義
type AuthContextType = {
  isAuthenticated: boolean;
  user: UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  // ログイン関数
  const login = async (email: string, password: string) => {
    try {
      await apiLogin(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
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
