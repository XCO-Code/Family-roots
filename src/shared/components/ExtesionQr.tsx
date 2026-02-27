import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Copy, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#14161a] rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Compartir Árbol Familiar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center mb-8 bg-gray-50 p-6 rounded-lg">
          <QRCode
            value={treeUrl}
            size={256}
            level="H"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="tree-url" className="block text-sm font-medium text-white">
            Enlace del árbol:
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="tree-url"
              type="text"
              value={treeUrl}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-800 rounded-lg bg-[#111419] text-sm text-gray-300 font-mono"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Copy size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
