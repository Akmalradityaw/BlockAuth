import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from '@/Components/feedback/Toast';

export default function SecurityPolicyTab({ security = {} }) {
    const [minLength, setMinLength] = useState(security.min_length || 8);
    const [requireUppercase, setRequireUppercase] = useState(Boolean(security.require_uppercase));
    const [requireNumeric, setRequireNumeric] = useState(Boolean(security.require_numeric));
    const [requireSpecialChar, setRequireSpecialChar] = useState(Boolean(security.require_special_char));
    const [checkPwnedPasswords, setCheckPwnedPasswords] = useState(Boolean(security.check_pwned_passwords));
    const [mustVerifyEmail, setMustVerifyEmail] = useState(Boolean(security.must_verify_email));
    const [maxLoginAttempts, setMaxLoginAttempts] = useState(security.max_login_attempts || 5);
    const [decayMinutes, setDecayMinutes] = useState(security.decay_minutes || 1);

    const [saving, setSaving] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        const payload = {
            min_length: parseInt(minLength, 10),
            require_uppercase: requireUppercase,
            require_numeric: requireNumeric,
            require_special_char: requireSpecialChar,
            check_pwned_passwords: checkPwnedPasswords,
            must_verify_email: mustVerifyEmail,
            max_login_attempts: parseInt(maxLoginAttempts, 10),
            decay_minutes: parseInt(decayMinutes, 10),
        };

        router.put('/settings/security', payload, {
            preserveScroll: true,
            onSuccess: () => toast.success('Kebijakan keamanan sistem berhasil diperbarui.'),
            onError: () => toast.error('Gagal memperbarui kebijakan keamanan.'),
            onFinish: () => setSaving(false),
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kebijakan Kata Sandi */}
            <section className="card-shell p-4 sm:p-6">
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="type-h2 font-bold text-[#1E1B4B]">Kebijakan Kerumitan Kata Sandi</h2>
                    <p className="type-small mt-1 text-[#334155]">
                        Tentukan standar kekuatan kata sandi pengguna saat mendaftar, mengatur ulang, atau mengubah sandi.
                    </p>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="type-caption font-semibold text-[#1E1B4B]">
                                Panjang Minimum Sandi: <span className="font-bold text-[#6D28D9]">{minLength} Karakter</span>
                            </label>
                        </div>
                        <input
                            type="range"
                            min="6"
                            max="32"
                            value={minLength}
                            onChange={(e) => setMinLength(e.target.value)}
                            className="range range-sm range-primary mt-2"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400">
                            <span>6 (Cepat)</span>
                            <span>8 (Standar)</span>
                            <span>16 (Kuat)</span>
                            <span>32 (Maksimum)</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                        <label className="flex cursor-pointer items-center justify-between py-1">
                            <div>
                                <p className="text-sm font-semibold text-[#1E1B4B]">Wajib Huruf Besar & Kecil</p>
                                <p className="text-xs text-slate-500">Sandi harus mengandung kombinasi huruf besar (A-Z) dan kecil (a-z).</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={requireUppercase}
                                onChange={(e) => setRequireUppercase(e.target.checked)}
                                className="checkbox checkbox-sm checkbox-primary"
                            />
                        </label>

                        <label className="flex cursor-pointer items-center justify-between pt-2 py-1">
                            <div>
                                <p className="text-sm font-semibold text-[#1E1B4B]">Wajib Angka Numerik</p>
                                <p className="text-xs text-slate-500">Sandi harus mengandung minimal satu digit angka (0-9).</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={requireNumeric}
                                onChange={(e) => setRequireNumeric(e.target.checked)}
                                className="checkbox checkbox-sm checkbox-primary"
                            />
                        </label>

                        <label className="flex cursor-pointer items-center justify-between pt-2 py-1">
                            <div>
                                <p className="text-sm font-semibold text-[#1E1B4B]">Wajib Simbol / Karakter Khusus</p>
                                <p className="text-xs text-slate-500">Sandi harus mengandung simbol khusus seperti @, #, $, %, !.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={requireSpecialChar}
                                onChange={(e) => setRequireSpecialChar(e.target.checked)}
                                className="checkbox checkbox-sm checkbox-primary"
                            />
                        </label>
                    </div>
                </div>
            </section>

            {/* Proteksi Brute Force Throttling */}
            <section className="card-shell p-4 sm:p-6">
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="type-h2 font-bold text-[#1E1B4B]">Proteksi Percobaan Masuk (Brute Force)</h2>
                    <p className="type-small mt-1 text-[#334155]">
                        Batasi jumlah percobaan login gagal untuk mencegah peretasan tebak sandi otomatis.
                    </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="type-caption block font-semibold text-[#1E1B4B]">
                            Batas Maksimal Percobaan Gagal
                        </label>
                        <input
                            type="number"
                            min="3"
                            max="20"
                            value={maxLoginAttempts}
                            onChange={(e) => setMaxLoginAttempts(e.target.value)}
                            className="input input-sm border-slate-300 bg-white mt-1 w-full text-sm text-[#1E1B4B] focus:border-[#6D28D9] focus:outline-none"
                        />
                        <span className="mt-1 block text-[11px] text-slate-500">
                            Rekomendasi: 5 kali percobaan.
                        </span>
                    </div>

                    <div>
                        <label className="type-caption block font-semibold text-[#1E1B4B]">
                            Durasi Penangguhan (Menit)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={decayMinutes}
                            onChange={(e) => setDecayMinutes(e.target.value)}
                            className="input input-sm border-slate-300 bg-white mt-1 w-full text-sm text-[#1E1B4B] focus:border-[#6D28D9] focus:outline-none"
                        />
                        <span className="mt-1 block text-[11px] text-slate-500">
                            Waktu tunggu pengguna setelah melewati batas percobaan.
                        </span>
                    </div>
                </div>
            </section>

            {/* Deteksi Sandi Bocor (HaveIBeenPwned) */}
            <section className="card-shell p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="type-h2 font-bold text-[#1E1B4B]">Deteksi Kata Sandi Bocor (HaveIBeenPwned API)</h2>
                            <span className="badge border-0 bg-emerald-100 text-xs font-semibold text-emerald-800">k-Anonymity</span>
                        </div>
                        <p className="type-small mt-1 text-[#334155]">
                            Otomatis tolak kata sandi yang pernah bocor dalam insiden peretasan publik global. Aman: kata sandi tidak pernah dikirim secara utuh ke internet.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={checkPwnedPasswords}
                        onChange={(e) => setCheckPwnedPasswords(e.target.checked)}
                        className="toggle border-slate-300 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                        aria-label="Deteksi kata sandi bocor"
                    />
                </div>
            </section>

            {/* Verifikasi Email */}
            <section className="card-shell p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="type-h2 font-bold text-[#1E1B4B]">Wajib Verifikasi Alamat Email</h2>
                        <p className="type-small mt-1 text-[#334155]">
                            Pengguna baru harus mengonfirmasi tautan email sebelum dapat mengakses fitur dashboard.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={mustVerifyEmail}
                        onChange={(e) => setMustVerifyEmail(e.target.checked)}
                        className="toggle border-slate-300 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                        aria-label="Wajib verifikasi email"
                    />
                </div>
            </section>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-sm border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5b21b6] disabled:opacity-60"
                >
                    {saving ? 'Menyimpan Aturan...' : 'Simpan Kebijakan Keamanan'}
                </button>
            </div>
        </form>
    );
}

