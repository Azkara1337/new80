import { redirect } from 'next/navigation';

// Maquette : pas de connexion, on va directement à l'admin.
export default function Login() {
  redirect('/admin');
}
