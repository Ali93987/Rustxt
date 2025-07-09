import { getAdminCredentials } from '@/lib/data';
import { AdminSettingsForm } from './settings-form';

export default async function AdminSettingsPage() {
  const credentials = await getAdminCredentials();
  
  return <AdminSettingsForm credentials={credentials} />;
}
