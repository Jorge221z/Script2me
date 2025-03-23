// ...existing code...

export function AuthProvider({ children }) {
  // Proporcionar un usuario simulado o null sin intentar la autenticación
  const user = null; // O un usuario fijo si prefieres: { name: "Usuario", email: "usuario@ejemplo.com" }

  return (
    <AuthContext.Provider value={{ user, signIn: () => {}, signOut: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

// ...existing code...
