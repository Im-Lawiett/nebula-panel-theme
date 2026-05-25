import { createContext, useContext, useState } from "react";

interface UserContextType {
  currentUserId: number;
  currentUsername: string;
  isOwner: boolean;
  setCurrentUser: (id: number, username: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUserId: 1,
  currentUsername: "dilzz",
  isOwner: true,
  setCurrentUser: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    const stored = localStorage.getItem("nebula_user_id");
    return stored ? Number(stored) : 1;
  });
  const [currentUsername, setCurrentUsernameState] = useState<string>(() => {
    return localStorage.getItem("nebula_username") || "dilzz";
  });

  const isOwner = currentUserId === 1;

  const setCurrentUser = (id: number, username: string) => {
    setCurrentUserId(id);
    setCurrentUsernameState(username);
    localStorage.setItem("nebula_user_id", String(id));
    localStorage.setItem("nebula_username", username);
  };

  const logout = () => {
    localStorage.removeItem("nebula_user_id");
    localStorage.removeItem("nebula_username");
    setCurrentUserId(1);
    setCurrentUsernameState("dilzz");
  };

  return (
    <UserContext.Provider value={{ currentUserId, currentUsername, isOwner, setCurrentUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
