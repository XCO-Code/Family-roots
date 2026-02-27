import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Check, X } from 'lucide-react';

interface ExtensionQRProps {
  treeId: string;
  onClose: () => void;
}

export function ExtensionQR({ treeId, onClose }: ExtensionQRProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const treeUrl = `${window.location.origin}/extend-family-tree/${treeId}`;

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d24] border border-white/8 rounded-2xl shadow-2xl p-6 max-w-sm w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Compartir árbol</h2>
            <p className="text-xs text-white/35 mt-0.5">Escanea el QR o copia el enlace</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <X size={14} className="text-white/50" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-5 bg-white rounded-xl p-5">
          <QRCode
            value={treeUrl}
            size={200}
            level="H"
          />
        </div>

        {/* URL + Copy */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-white/40 uppercase tracking-widest">
            Enlace
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={treeUrl}
              readOnly
              className="flex-1 px-3 py-2 rounded-xl bg-[#111318] border border-white/8 text-xs text-white/50 font-mono focus:outline-none min-w-0"
            />
            <button
              onClick={handleCopy}
              className={`
                px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all border
                ${copied
                  ? 'bg-green-500/20 border-green-500/30 text-green-300'
                  : 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                }
              `}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}