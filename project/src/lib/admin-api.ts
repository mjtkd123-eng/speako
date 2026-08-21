/**
 * Admin API client.
 *
 * The admin password is never compared in the browser: it is sent to the
 * `admin-ops` function, which checks it server-side and is the only thing
 * holding the service-role key. The password lives in sessionStorage for the
 * duration of the tab so admin actions can be re-authorised without prompting.
 */

const STORAGE_KEY = 'speako.admin.pw';
const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ops`;

export type AdminApplication = {
  id: string;
  applicant_name: string;
  email: string;
  teaches_language: string;
  native_language: string;
  bio: string;
  experience_years: number;
  video_url: string | null;
  status: string;
  created_at: string;
};

export function getAdminPassword(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setAdminPassword(password: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, password);
  } catch {
    /* storage unavailable — admin actions will prompt again */
  }
}

export function clearAdminPassword() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function call<T>(body: Record<string, unknown>, password?: string): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'X-Admin-Password': password ?? getAdminPassword(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('admin request failed');
  return (await res.json()) as T;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    await call<{ success: boolean }>({ action: 'verify' }, password);
    setAdminPassword(password);
    return true;
  } catch {
    return false;
  }
}

export async function listApplications(): Promise<AdminApplication[]> {
  const data = await call<{ applications: AdminApplication[] }>({
    action: 'list_applications',
  });
  return data.applications ?? [];
}

export async function updateApplicationStatus(
  id: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  await call({ action: 'update_application_status', id, status });
}
