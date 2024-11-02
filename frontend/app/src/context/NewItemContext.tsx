import { createContext, useContext, useState } from "react";

interface NewItemContextType {
  newItems: number[];
  addNewItem: (id: number) => void;
  clearNewItems: () => void;
}

const NewItemContext = createContext<NewItemContextType | null>(null);

export const NewItemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [newItems, setNewItems] = useState<number[]>([]);

  const addNewItem = (id: number) => {
    setNewItems((prev) => [...prev, id]);
  };

  const clearNewItems = () => {
    setNewItems([]);
  };

  return (
    <NewItemContext.Provider value={{ newItems, addNewItem, clearNewItems }}>
      {children}
    </NewItemContext.Provider>
  );
};

export const useNewItemContext = () => {
  const context = useContext(NewItemContext);
  if (!context) {
    throw new Error("useNewItemContext must be used within a NewItemProvider");
  }
  return context;
};
