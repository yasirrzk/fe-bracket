import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leagueService } from '../../services/leagueService';
import { X, Users, ShieldAlert, Plus, Upload, UploadCloud, Trash2, Link as LinkIcon } from 'lucide-react';

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
  // 1. Try URI list (direct dragged link)
  const uriList = dt.getData('text/uri-list');
  if (uriList) {
    const lines = uriList.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
    if (lines.length > 0 && isImageUrl(lines[0])) {
      return lines[0].trim();
    }
  }

  // 2. Try URL property
  const urlData = dt.getData('URL');
  if (urlData && isImageUrl(urlData)) {
    return urlData.trim();
  }

  // 3. Try HTML markup (e.g. dragging <img> from Google Images or any web page)
  const html = dt.getData('text/html');
  if (html) {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1] && isImageUrl(match[1])) {
      return match[1].trim();
    }
  }

  // 4. Try plain text
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
    // Robust fallback: read as arrayBuffer if FileReader fails (e.g. sandbox/permission issues)
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

    // Check if an image URL was dragged from a browser tab or web page
    const draggedWebUrl = extractImageUrlFromDataTransfer(e.dataTransfer);

    const files = e.dataTransfer.files;
    const hasLocalFileWithContent = files && files.length > 0 && files[0].size > 0;

    if (hasLocalFileWithContent) {
      // Prioritize genuine local files with content
      try {
        await processFile(files[0]);
        return;
      } catch {
        // If file reading failed, check if we have a web URL fallback
        if (draggedWebUrl) {
          setLogoUrl(draggedWebUrl);
          showToast('info', 'Logo Ditautkan', 'URL logo tim dari peramban berhasil diterapkan.');
          return;
        }
      }
    }

    // If dragged from web / browser without a local file, or file.size is 0 (browser synthetic drag object)
    if (draggedWebUrl) {
      setLogoUrl(draggedWebUrl);
      showToast('info', 'Logo Ditautkan', 'URL logo tim dari peramban berhasil diterapkan.');
      return;
    }

    // If there was a 0-byte file without a detectable URL
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
    >
      <div className="relative w-full max-w-md bg-nb-card border-3 border-black shadow-brutal-lg animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-black bg-nb-cardAlt">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-nb-yellow border-2 border-black">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-mono font-black text-sm uppercase text-nb-ink">Daftarkan Tim Liga</h2>
              <p className="text-[10px] font-mono font-bold text-nb-muted uppercase">Pendaftaran Tim Baru</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 border-2 border-black bg-nb-card hover:bg-nb-red hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!isAdmin && (
            <div className="p-3 bg-nb-red/10 border-2 border-nb-red text-nb-red text-xs font-mono font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Akses Terbatas: Role USER tidak dapat mendaftarkan tim baru.</span>
            </div>
          )}

          <div>
            <label htmlFor="team-name" className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
              Nama Tim <span className="text-nb-red">*</span>
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
              className="w-full px-3 py-2 text-sm bg-nb-bg border-3 border-black font-sans font-bold text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
            />
          </div>

          {/* Logo Tim with Drag and Drop */}
          <div>
            <span className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
              Logo Tim <span className="text-nb-muted font-normal text-[11px]">(Opsional)</span>
            </span>

            {/* Drag and Drop Container */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative p-3.5 border-3 transition-all ${
                isDragging
                  ? 'border-nb-yellow bg-nb-yellow/20 border-dashed shadow-brutal translate-x-[-1px] translate-y-[-1px]'
                  : 'border-black bg-nb-cardAlt border-dashed'
              }`}
            >
              {/* Dragging Active Overlay Indicator */}
              {isDragging && (
                <div className="absolute inset-0 bg-nb-yellow/90 z-20 flex flex-col items-center justify-center pointer-events-none font-mono">
                  <UploadCloud className="w-8 h-8 text-black animate-bounce mb-1" />
                  <span className="text-xs font-black uppercase text-black">Lepaskan File Logo di Sini</span>
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
                <div className="flex items-center gap-4">
                  {/* Logo Preview */}
                  <div className="w-16 h-16 border-3 border-black bg-nb-bg flex items-center justify-center overflow-hidden shrink-0 shadow-brutal-sm">
                    <img
                      src={logoUrl}
                      alt="Preview Logo Tim"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap gap-2">
                      <label
                        htmlFor="team-logo-upload"
                        className={`cursor-pointer px-3 py-1.5 bg-nb-yellow border-2 border-black font-mono text-[11px] font-black uppercase text-black shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all inline-flex items-center gap-1.5 ${
                          !isAdmin || isSubmitting ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ganti File</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={!isAdmin || isSubmitting}
                        className="px-2.5 py-1.5 bg-nb-red text-white border-2 border-black font-mono text-[11px] font-black uppercase hover:bg-black transition-colors flex items-center gap-1 shadow-brutal-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-nb-muted">
                      Tarik & lepas (*drag and drop*) gambar lain untuk mengganti logo
                    </p>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone State */
                <label
                  htmlFor="team-logo-upload"
                  className={`flex flex-col items-center justify-center p-3 cursor-pointer text-center group ${
                    !isAdmin || isSubmitting ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <div className="p-2.5 bg-nb-yellow border-2 border-black shadow-brutal-sm mb-2 group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform">
                    <UploadCloud className="w-5 h-5 text-black" />
                  </div>
                  <div className="font-mono text-xs font-black uppercase text-nb-ink mb-0.5">
                    Drag & Drop file gambar ke sini
                  </div>
                  <div className="font-mono text-[11px] text-nb-muted">
                    atau <span className="underline font-bold text-nb-ink group-hover:text-nb-yellow">klik untuk memilih file</span>
                  </div>
                  <span className="mt-1.5 text-[10px] font-mono text-nb-muted/80">
                    PNG, JPG, WebP, SVG, GIF (Maks. 2MB)
                  </span>
                </label>
              )}

              {/* URL Input Alternative */}
              <div className="mt-3 pt-2.5 border-t border-black/20">
                <label htmlFor="team-logo-url" className="block text-[11px] font-mono font-bold text-nb-muted mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>Atau masukkan tautan URL gambar langsung:</span>
                </label>
                <input
                  id="team-logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl.startsWith('data:') ? '' : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2.5 py-1.5 text-xs bg-nb-bg border-2 border-black font-mono text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-nb-cardAlt border-2 border-black font-mono text-[11px] text-nb-muted space-y-1">
            <div className="font-black text-nb-ink uppercase">Catatan Sistem:</div>
            <div>• Jadwal pertandingan round-robin dapat digenerate setelah minimal 2 tim terdaftar.</div>
            <div>• Jika jadwal sudah berjalan, menambah tim akan memperbarui alur matchday.</div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border-2 border-black bg-nb-cardAlt text-xs font-mono font-black uppercase hover:bg-black/10 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isAdmin || isSubmitting || !name.trim()}
              className="px-5 py-2 border-3 border-black bg-nb-yellow text-black text-xs font-mono font-black uppercase shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tim'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
