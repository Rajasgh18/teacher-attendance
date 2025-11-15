import React, { createContext, useContext, useEffect, useState } from "react";

import watermelonDB from "@/db";

interface DatabaseContextType {
  database: any;
  isLoading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  database: null,
  isLoading: true,
});

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [database, setDatabase] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        if (watermelonDB) {
          setDatabase(watermelonDB);
        } else {
          throw new Error("WatermelonDB instance is null");
        }
      } catch (error) {
        console.error("❌ Database initialization failed:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ database, isLoading }}>
      {children}
    </DatabaseContext.Provider>
  );
};
