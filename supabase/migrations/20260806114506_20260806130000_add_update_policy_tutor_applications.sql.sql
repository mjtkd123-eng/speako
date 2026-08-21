/*
# Add UPDATE policy on tutor_applications for admin approve/reject

1. Security
- Add UPDATE policy so anon + authenticated can update application status.
- This is required because the admin dashboard runs client-side (no server auth yet)
  and the admin mode toggle is a simulation.
- In production, this would be restricted to an admin role.
*/

DROP POLICY IF EXISTS "anon_update_applications" ON tutor_applications;
CREATE POLICY "anon_update_applications" ON tutor_applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);