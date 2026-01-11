import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { processReturnsFromExcel } from '@/app/actions';

export default function ReturnUpload() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = async (file: File) => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const json: any[] = XLSX.utils.sheet_to_json(sheet);

                    // Map Excel data: D row (TELEFON) is usually index 3 or key "TELEFON"
                    // User says D1: TELEFON, K1: IADE MALIYETI
                    // sheet_to_json might use headers.

                    const formattedData = json.map(row => {
                        // Attempt to find phone in column D (TELEFON) and cost in column K
                        // XLSX.utils.sheet_to_json with headers uses header names
                        const phone = row['TELEFON'] || row['phone'] || row['__EMPTY_3']; // __EMPTY_3 is column D if no headers 
                        const returnCost = row['IADE MALIYETI'] || row['return_cost'] || row['__EMPTY_10']; // __EMPTY_10 is column K

                        return {
                            phone: String(phone || ''),
                            returnCost: Number(returnCost || 0)
                        };
                    }).filter(item => item.phone && item.phone.length > 5);

                    if (formattedData.length === 0) {
                        throw new Error('Excel dosyasında geçerli telefon numarası bulunamadı.');
                    }

                    const res = await processReturnsFromExcel(formattedData);
                    if (res.success) {
                        setResult(res.results);
                    } else {
                        setError(res.error || 'İşlem sırasında bir hata oluştu.');
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsBinaryString(file);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Note: useDropzone is not in package.json yet, let me check if I can use a simple input instead or if I should add it.
    // Actually, I'll use a simple file input for now to avoid dependency issues if it's not installed.

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onDrop(file);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Upload size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-white">İade Yönetimi (Excel)</h3>
                        <p className="text-xs text-purple-100 font-semibold">İade olan siparişleri toplu işleyin</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {result ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center space-x-3 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100">
                            <CheckCircle2 size={24} />
                            <div>
                                <p className="font-black uppercase text-sm tracking-tight text-white">İşlem Tamamlandı</p>
                                <p className="text-xs font-bold text-white/80">{result.processed} sipariş iade olarak işaretlendi.</p>
                            </div>
                        </div>

                        {result.notFound > 0 && (
                            <div className="flex items-center space-x-3 text-orange-600 bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <AlertCircle size={24} />
                                <p className="text-xs font-bold">{result.notFound} telefon numarası sistemde bulunamadı.</p>
                            </div>
                        )}

                        <button
                            onClick={() => setResult(null)}
                            className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition"
                        >
                            Yeni Dosya Yükle
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={loading}
                            />
                            <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${loading ? 'bg-gray-50 border-gray-200' : 'border-purple-200 bg-purple-50 group-hover:border-purple-400 group-hover:bg-purple-100/50'
                                }`}>
                                {loading ? (
                                    <div className="flex flex-col items-center space-y-4">
                                        <Loader2 className="animate-spin text-purple-600" size={48} />
                                        <p className="text-purple-700 font-black uppercase tracking-widest text-xs">Dosya İşleniyor...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                            <FileText size={32} />
                                        </div>
                                        <div>
                                            <p className="text-purple-900 font-extrabold text-lg">Excel Dosyasını Sürükle veya Seç</p>
                                            <p className="text-purple-600/60 text-xs font-bold mt-1 uppercase tracking-widest">Kolon D: Telefon | Kolon K: İade Maliyeti</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in shake-in duration-300">
                                <AlertCircle size={20} />
                                <p className="text-xs font-bold">{error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
