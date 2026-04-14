-- Enable RLS
ALTER TABLE gate_pass ENABLE ROW LEVEL SECURITY;

-- Prajurit: hanya bisa akses data sendiri
CREATE POLICY "Prajurit dapat melihat dan insert gate pass sendiri"
  ON gate_pass
  FOR SELECT TO anon USING (current_karyo_user_id() = user_id);

CREATE POLICY "Prajurit dapat insert gate pass"
  ON gate_pass
  FOR INSERT TO anon WITH CHECK (current_karyo_user_id() = user_id);

-- Komandan: hanya bisa approve unitnya (satuan sebagai pengganti unit_id)
CREATE POLICY "Komandan dapat approve/reject gate pass unitnya"
  ON gate_pass
  FOR UPDATE TO anon USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_karyo_user_id()
      AND u.role = 'komandan'
      AND u.satuan = (
        SELECT satuan FROM users WHERE users.id = gate_pass.user_id
      )
    )
  );

-- Guard: hanya bisa update status (out/returned) via QR scan
CREATE POLICY "Guard hanya bisa update status via QR"
  ON gate_pass
  FOR UPDATE TO anon USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_karyo_user_id()
      AND u.role = 'guard'
    )
  ) WITH CHECK (
    status IN ('out', 'returned', 'overdue')
  );
