import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  login as apiLogin,
  getCurrentUser,
  logout as apiLogout,
} from "../services/api/auth";
import { UserResponse } from "../services/interfaces";

// AuthContextの型定義
type AuthContextType = {
  isAuthenticated: boolean;
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// デフォルト値を持つContextを作成
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
});

// AuthProviderのプロパティの型
type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);

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
        logout(); // 失敗時はログアウト処理
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContextを使うためのカスタムフック
export const useAuth = () => useContext(AuthContext);
