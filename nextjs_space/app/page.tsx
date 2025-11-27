import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Redirect to Manchester United hub
  redirect('/manchester-united');
}
