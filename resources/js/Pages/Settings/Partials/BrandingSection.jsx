import { useRef, useState } from 'react';
import FormInput from '@/Components/ui/FormInput';

export default function BrandingSection({
    data,
    setData,
    logoPreview,
    setLogoPreview,
    pickedFile,
    setPickedFile,
}) {
    const fileInputRef = useRef(null);
    const [showUrlFallback, setShowUrlFallback] = useState(false);

    const currentName = data.app_name?.trim() || 'BlockAuth';
    const currentTagline = data.app_tagline?.trim() || 'Auth dan Profil';

    function handleFilePick(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setPickedFile(file);
        setLogoPreview(URL.createObjectURL(file));
        setData((prev) => ({
            ...prev,
            app_logo_file: file,
            remove_logo: false,
        }));
    }

    function handleRemoveLogo() {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setPickedFile(null);
        setLogoPreview(null);
        setData((prev) => ({
            ...prev,
            app_logo_file: null,
            app_logo_url: '',
            remove_logo: true,
        }));
    }

    function handleUrlChange(e) {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            app_logo_url: val,
            app_logo_file: null,
            remove_logo: false,
        }));
        setPickedFile(null);
        setLogoPreview(val ? val.trim() : null);
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
                <h3 className="type-h3 text-[#1E1B4B]">Identitas & Branding Aplikasi</h3>
                <p className="type-caption text-slate-500">
                    Nama dan logo ini akan otomatis diterapkan di Sidebar, Topbar, Halaman Login, dan Footer.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                    <FormInput
                        label="Nama Aplikasi"
                        placeholder="misal: BlockAuth, Portal Perusahaan"
                        value={data.app_name}
                        onChange={(e) => setData({ ...data, app_name: e.target.value })}
                        required
                    />

                    <FormInput
                        label="Slogan / Deskripsi Singkat"
                        placeholder="misal: Auth dan Profil, Sistem Manajemen Terpadu"
                        value={data.app_tagline}
                        onChange={(e) => setData({ ...data, app_tagline: e.target.value })}
                    />

                    {/* Upload File Logo */}
                    <div>
                        <label className="type-caption mb-1.5 block font-semibold text-[#1E1B4B]">
                            Logo Aplikasi
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleFilePick}
                            className="hidden"
                        />

                        {logoPreview ? (
                            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1">
                                    <img
                                        src={logoPreview}
                                        alt="Logo Preview"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-slate-800">
                                        {pickedFile ? pickedFile.name : 'Logo Aktif Saat Ini'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {pickedFile
                                            ? `${(pickedFile.size / 1024).toFixed(1)} KB (Siap diunggah)`
                                            : 'Tersimpan di sistem'}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs font-semibold text-[#6D28D9] hover:underline"
                                        >
                                            Ganti File
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="text-xs font-semibold text-red-600 hover:underline"
                                        >
                                            Hapus Logo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-[#6D28D9] hover:bg-purple-50/30"
                            >
                                <svg
                                    className="h-8 w-8 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="mt-2 text-xs font-semibold text-slate-700">
                                    Klik di sini untuk memilih file logo
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Format PNG, JPG, WebP, atau SVG (Maksimal 2MB)
                                </p>
                            </div>
                        )}

                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => setShowUrlFallback(!showUrlFallback)}
                                className="text-xs text-slate-500 hover:text-slate-700 underline"
                            >
                                {showUrlFallback ? 'Sembunyikan opsi URL eksternal' : 'Atau gunakan URL gambar luar'}
                            </button>

                            {showUrlFallback && (
                                <div className="mt-2">
                                    <FormInput
                                        placeholder="https://domain.com/logo.png"
                                        value={data.app_logo_url}
                                        onChange={handleUrlChange}
                                        hint="Gunakan opsi ini hanya jika ingin menautkan logo dari CDN eksternal."
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <FormInput
                        label="Teks Footer / Hak Cipta"
                        placeholder="misal: © 2026 BlockAuth. All rights reserved."
                        value={data.app_footer_text}
                        onChange={(e) => setData({ ...data, app_footer_text: e.target.value })}
                    />
                </div>

                {/* Live Preview Box */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
                    <div>
                        <span className="type-caption font-bold text-slate-500 uppercase tracking-wider block mb-3">
                            Live Preview Tampilan
                        </span>

                        {/* Preview Sidebar Brand */}
                        <div className="rounded-xl bg-[#1E1B4B] p-4 text-white flex items-center gap-3">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt={currentName}
                                    className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white p-1"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] text-xl font-extrabold text-[#1E1B4B]">
                                    {currentName.charAt(0).toUpperCase()}
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-bold">{currentName}</p>
                                <p className="truncate text-xs text-white/60">{currentTagline}</p>
                            </div>
                        </div>

                        {/* Preview Footer */}
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-center">
                            <p className="text-xs text-slate-500">{data.app_footer_text}</p>
                        </div>
                    </div>

                    <p className="type-caption text-slate-400 mt-4">
                        Logo dan identitas akan langsung diperbarui di seluruh sistem setelah disimpan.
                    </p>
                </div>
            </div>
        </div>
    );
}

