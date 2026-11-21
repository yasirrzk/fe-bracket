import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leagueService } from '../../services/leagueService';
import { X, Upload, Trash2 } from 'lucide-react';

interface AddLeagueTeamModalProps {
  leagueId: string;
  isOpen: boolean;
  onClose: () => void;
  onTeamAdded: () => void;
}

const isImageFile = (file: File): boolean => {
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|svg|gif|bmp|ico|avif)$/i.test(file.name);
};

const isImageUrl = (str: string): boolean => {
  if (!str) return false;
  const s = str.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('blob:')
  );
};

const extractImageUrlFromDataTransfer = (dt: DataTransfer): string | null => {
  const uriList = dt.getData('text/uri-list');
  if (uriList) {
    const lines = uriList.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
    if (lines.length > 0 && isImageUrl(lines[0])) {
      return lines[0].trim();
    }
  }

  const urlData = dt.getData('URL');
  if (urlData && isImageUrl(urlData)) {
    return urlData.trim();
  }

  const html = dt.getData('text/html');
  if (html) {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1] && isImageUrl(match[1])) {
      return match[1].trim();
    }
  }

  const text = dt.getData('text/plain');
  if (text && isImageUrl(text)) {
    return text.trim();
  }

  return null;
};

const readFileAsDataUrl = async (file: File): Promise<string> => {
  try {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Format pembacaan file tidak valid.'));
        }
      };
      reader.onerror = () => {
        reject(reader.error || new Error('Gagal membaca file dari disk.'));
      };
      reader.readAsDataURL(file);
    });
  } catch (readerErr: any) {
    try {
      const buffer = await file.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('File gambar kosong (0 byte).');
      }
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const mime = file.type || 'image/png';
      return `data:${mime};base64,${window.btoa(binary)}`;
    } catch {
      throw readerErr;
    }
  }
};

export const AddLeagueTeamModal: React.FC<AddLeagueTeamModalProps> = ({
  leagueId,
  isOpen,
  onClose,
  onTeamAdded,
}) => {
  const { isAdmin, role } = useAuth();
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    if (!isImageFile(file)) {
      showToast('warning', 'Format Tidak Didukung', 'Harap pilih file gambar (PNG, JPG, SVG, WebP, GIF).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('warning', 'File Terlalu Besar', 'Ukuran logo maksimal 2MB.');
      return;
    }

    try {
      const result = await readFileAsDataUrl(file);
      setLogoUrl(result);
      showToast('info', 'Logo Dimuat', 'Logo tim berhasil dimuat.');
    } catch (err: any) {
      showToast('error', 'Gagal Membaca File', err.message || 'Terjadi kesalahan saat membaca file logo.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (!isAdmin || isSubmitting) return;

    const draggedWebUrl = extractImageUrlFromDataTransfer(e.dataTransfer);
    const files = e.dataTransfer.files;
    const hasLocalFileWithContent = files && files.length > 0 && files[0].size > 0;

    if (hasLocalFileWithContent) {
      try {
        await processFile(files[0]);
        return;
      } catch {
        if (draggedWebUrl) {
          setLogoUrl(draggedWebUrl);
          showToast('info', 'Logo Ditautkan', 'URL logo tim dari peramban berhasil diterapkan.');
          return;
        }
      }
    }

    if (draggedWebUrl) {
      setLogoUrl(draggedWebUrl);
      showToast('info', 'Logo Ditautkan', 'URL logo tim dari peramban berhasil diterapkan.');
      return;
    }

    if (files && files.length > 0) {
      showToast(
        'warning',
        'File Tidak Terbaca',
        'File tidak memiliki data atau browser membatasi akses drag lintas aplikasi. Silakan gunakan tombol "Pilih Gambar" atau masukkan URL gambar.'
      );
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setIsDragging(false);
    dragCounter.current = 0;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setName('');
    setLogoUrl('');
    setIsDragging(false);
    dragCounter.current = 0;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang berhak menambahkan tim ke dalam liga.');
      return;
    }

    if (!name.trim()) {
      showToast('warning', 'Validasi Gagal', 'Nama tim wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedName = name.trim();
      const words = trimmedName.split(/\s+/).filter(Boolean);
      const autoTag = words.length > 1
        ? words.slice(0, 3).map((w) => w[0]).join('').toUpperCase()
        : trimmedName.slice(0, 3).toUpperCase();

      leagueService.addTeam(
        leagueId,
        {
          name: trimmedName,
          tag: autoTag,
          logoUrl: logoUrl.trim() || undefined,
        },
        role
      );

      showToast('success', 'Tim Terdaftar', `Tim "${trimmedName}" berhasil didaftarkan ke liga.`);
      setName('');
      setLogoUrl('');
      setIsDragging(false);
      dragCounter.current = 0;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onTeamAdded();
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Menambah Tim', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans backdrop-blur-[1px]"
    >
      <div className="relative w-full max-w-md bg-white border-2 border-zinc-900 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-300 bg-white">
          <div>
            <h2 className="font-mono font-bold text-sm uppercase text-zinc-950">Daftarkan Tim Liga</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Pendaftaran Tim Baru</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-zinc-400 hover:text-zinc-950 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {!isAdmin && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
              Akses Terbatas: Role USER tidak dapat mendaftarkan tim baru.
            </div>
          )}

          <div>
            <label htmlFor="team-name" className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
              Nama Tim <span className="text-rose-600">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              required
              autoFocus
              placeholder="contoh: Rex Regum Qeon, Paper Rex..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors disabled:opacity-60"
            />
          </div>

          {/* Logo Tim with Drag and Drop */}
          <div>
            <span className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
              Logo Tim <span className="text-zinc-400 font-normal lowercase">(opsional)</span>
            </span>

            {/* Drag and Drop Container */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative p-3 border border-dashed transition-colors ${
                isDragging
                  ? 'border-zinc-900 bg-zinc-100'
                  : 'border-zinc-300 bg-zinc-50'
              }`}
            >
              {isDragging && (
                <div className="absolute inset-0 bg-zinc-100 z-20 flex items-center justify-center pointer-events-none font-mono">
                  <span className="text-xs font-bold uppercase text-zinc-950">Lepaskan File Logo di Sini</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                id="team-logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={!isAdmin || isSubmitting}
                className="hidden"
              />

              {logoUrl ? (
                /* When Logo is Selected */
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 border border-zinc-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={logoUrl}
                      alt="Preview Logo Tim"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="team-logo-upload"
                        className={`cursor-pointer px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-300 font-mono text-[11px] font-semibold text-zinc-950 transition-colors inline-flex items-center gap-1 ${
                          !isAdmin || isSubmitting ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        <Upload className="w-3 h-3 stroke-[1.75]" />
                        <span>Ganti File</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={!isAdmin || isSubmitting}
                        className="px-2 py-1 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-mono text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3 stroke-[1.75]" />
                        <span>Hapus</span>
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400">
                      Tarik & lepas file gambar lain untuk mengganti logo
                    </p>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone State */
                <label
                  htmlFor="team-logo-upload"
                  className={`flex flex-col items-center justify-center p-3 cursor-pointer text-center ${
                    !isAdmin || isSubmitting ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <div className="font-mono text-xs font-semibold text-zinc-950 mb-0.5">
                    Drag & Drop file gambar ke sini
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500">
                    atau <span className="underline font-bold text-zinc-950">klik untuk memilih file</span>
                  </div>
                  <span className="mt-1 text-[10px] font-mono text-zinc-400">
                    PNG, JPG, WebP, SVG, GIF (Maks. 2MB)
                  </span>
                </label>
              )}

              {/* URL Input Alternative */}
              <div className="mt-2.5 pt-2 border-t border-zinc-200">
                <label htmlFor="team-logo-url" className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Atau masukkan URL gambar:
                </label>
                <input
                  id="team-logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl.startsWith('data:') ? '' : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2.5 py-1 text-xs bg-white border border-zinc-200 focus:border-zinc-950 font-mono text-zinc-950 outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-50 border border-zinc-200 font-mono text-[10px] text-zinc-500 space-y-0.5">
            <div>• Jadwal pertandingan round-robin dapat digenerate setelah minimal 2 tim terdaftar.</div>
            <div>• Menambah tim saat jadwal sudah berjalan akan memperbarui jadwal pekan.</div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 font-mono text-xs">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isAdmin || isSubmitting || !name.trim()}
              className="px-4 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 transition-colors font-semibold uppercase disabled:opacity-50"
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
