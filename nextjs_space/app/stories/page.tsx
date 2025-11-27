import { redirect } from 'next/navigation';

export default async function StoriesPage() {
  // Redirect to Manchester United hub
  redirect('/manchester-united');
}
