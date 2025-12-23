import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">© 2025 Dad-Gaming Hub • Henke-Net</p>
          </div>

          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm hover:text-blue-400 transition-colors"
            >
              Datenschutz
            </Link>
            <Link
              to="/imprint"
              className="text-sm hover:text-blue-400 transition-colors"
            >
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
