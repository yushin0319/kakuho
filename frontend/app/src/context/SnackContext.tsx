import { useState, createContext, useContext } from "react";
import { Snackbar, Alert } from "@mui/material";

export interface Snack {
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

export interface SnackContextType {
  snack: Snack | null;
  setSnack: (snack: Snack | null) => void;
}

const SnackContext = createContext<SnackContextType | null>(null);

export const SnackProvider = ({ children }: { children: React.ReactNode }) => {
  const [snack, setSnack] = useState<Snack | null>(null);

  return (
    <SnackContext.Provider value={{ snack, setSnack }}>
      {children}
      <Snackbar
        open={snack !== null}
        autoHideDuration={1000}
        onClose={() => setSnack(null)}
      >
        <Alert severity={snack?.severity} sx={{ width: "100%" }}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </SnackContext.Provider>
  );
};

export const useSnack = () => {
  const context = useContext(SnackContext);

  if (!context) {
    throw new Error("useSnack must be used within a SnackProvider");
  }

  return context;
};
