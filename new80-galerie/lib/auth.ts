// Maquette : pas d'authentification, tout visiteur de /admin est considéré comme admin.
const user = { email: 'demo@new80.fr' };

export async function getAdmin() {
  return { user };
}

export async function requireAdmin() {
  return { user };
}
