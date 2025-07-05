import { notFound } from 'next/navigation';
import { getUserById } from '@/lib/data';
import { EditUserForm } from './edit-user-form';
import type { User } from '@/lib/data';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id);

  if (!user) {
    notFound();
  }

  // Client components cannot receive non-serializable props like Timestamp objects.
  const { createdAt, ...serializableUser } = user;

  return <EditUserForm user={serializableUser as User} />;
}
