import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leagueService } from '../../services/leagueService';
import { X, Users, ShieldAlert, Plus } from 'lucide-react';

interface AddLeagueTeamModalProps {
  leagueId: string;
  isOpen: boolean;
  onClose: () => void;
  onTeamAdded: () => void;
}

export const AddLeagueTeamModal: React.FC<AddLeagueTeamModalProps> = ({
  leagueId,
  isOpen,
  onClose,
  onTeamAdded,
}) => {
  const { isAdmin, role } = useAuth();
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      leagueService.addTeam(
        leagueId,
        {
          name: name.trim(),
          tag: tag.trim().toUpperCase() || undefined,
          captainName: captainName.trim() || undefined,
        },
        role
      );

      showToast('success', 'Tim Terdaftar', `Tim "${name.trim()}" berhasil ditambahkan ke liga.`);
      setName('');
      setTag('');
      setCaptainName('');
      onTeamAdded();
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Menambah Tim', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-md bg-nb-card border-3 border-black shadow-brutal-lg animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-black bg-nb-cardAlt">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-nb-yellow border-2 border-black">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-mono font-black text-sm uppercase text-nb-ink">Tambah Tim Liga</h2>
              <p className="text-[10px] font-mono font-bold text-nb-muted uppercase">Pendaftaran Tim Baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
            <label className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
              Nama Tim <span className="text-nb-red">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Rex Regum Qeon"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-sm bg-nb-bg border-3 border-black font-sans font-bold text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
                Tag Singkatan
              </label>
              <input
                type="text"
                maxLength={5}
                placeholder="RRQ"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                disabled={!isAdmin || isSubmitting}
                className="w-full px-3 py-2 text-sm bg-nb-bg border-3 border-black font-mono font-black text-nb-ink uppercase focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
              />
              <span className="text-[10px] font-mono text-nb-muted">Maksimal 5 karakter</span>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
                Nama Kapten
              </label>
              <input
                type="text"
                placeholder="contoh: fl1pzjder"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                disabled={!isAdmin || isSubmitting}
                className="w-full px-3 py-2 text-sm bg-nb-bg border-3 border-black font-sans font-bold text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
              />
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
              onClick={onClose}
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
