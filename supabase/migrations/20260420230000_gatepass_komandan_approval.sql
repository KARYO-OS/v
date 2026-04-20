-- ============================================================
-- Fase C: Gate Pass — Approval oleh Komandan (bukan auto-approve)
-- Perubahan:
-- 1. api_insert_gate_pass → status 'pending' (bukan auto-approved)
-- 2. api_approve_gate_pass → komandan/admin setujui atau tolak
-- ============================================================

-- 1. Ubah api_insert_gate_pass: submit sebagai 'pending'
CREATE OR REPLACE FUNCTION public.api_insert_gate_pass(
  p_user_id       UUID,
  p_caller_role   TEXT,
  p_keperluan     TEXT,
  p_tujuan        TEXT,
  p_waktu_keluar  TIMESTAMPTZ,
  p_waktu_kembali TIMESTAMPTZ,
  p_qr_token      TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT is_feature_enabled('gate_pass') THEN
    RAISE EXCEPTION 'gate_pass feature is disabled';
  END IF;

  INSERT INTO public.gate_pass (
    user_id,
    keperluan,
    tujuan,
    waktu_keluar,
    waktu_kembali,
    qr_token,
    status,
    approved_by
  )
  VALUES (
    p_user_id,
    p_keperluan,
    p_tujuan,
    p_waktu_keluar,
    p_waktu_kembali,
    p_qr_token,
    'pending',
    NULL
  );
END;
$$;

-- 2. Tambah RPC untuk komandan/admin approve atau reject gate pass
CREATE OR REPLACE FUNCTION public.api_approve_gate_pass(
  p_caller_id   UUID,
  p_caller_role TEXT,
  p_id          UUID,
  p_approved    BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  IF NOT is_feature_enabled('gate_pass') THEN
    RAISE EXCEPTION 'gate_pass feature is disabled';
  END IF;

  IF p_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  IF p_caller_role NOT IN ('komandan', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: hanya komandan atau admin yang dapat menyetujui gate pass';
  END IF;

  SELECT status::TEXT INTO v_current_status
  FROM public.gate_pass
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gate pass tidak ditemukan';
  END IF;

  IF v_current_status <> 'pending' THEN
    RAISE EXCEPTION 'Hanya gate pass berstatus pending yang dapat disetujui atau ditolak';
  END IF;

  UPDATE public.gate_pass
  SET
    status      = CASE WHEN p_approved THEN 'approved'::public.gate_pass_status ELSE 'rejected'::public.gate_pass_status END,
    approved_by = CASE WHEN p_approved THEN p_caller_id ELSE NULL END,
    updated_at  = NOW()
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.api_approve_gate_pass(UUID, TEXT, UUID, BOOLEAN) TO anon, authenticated;
