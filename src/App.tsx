import React, { useState, useEffect } from 'react';
import { Printer, Save, Upload, Eye } from 'lucide-react';

// --- Interfaces de Tipagem ---
interface Endereco {
  logradouro: string;
  cidade: string;
  uf: string;
  cep: string;
}

interface BoletoData {
  id: string;
  pagadorNome: string; // O usuário definiu que Pagador = Fornecedor no contexto do storage
  pagadorDoc: string; // CPF/CNPJ
  pagadorEndereco: Endereco;
  beneficiarioFinal: string;
  valor: number;
  vencimento: string;
  nossoNumero: string;
  qrCodeImage: string | null; // Base64 da imagem
}

// --- Componente Principal ---
const GeradorBoleto: React.FC = () => {
  // Estado do Formulário
  const [data, setData] = useState<BoletoData>({
    id: Date.now().toString(),
    pagadorNome: '',
    pagadorDoc: '',
    pagadorEndereco: { logradouro: '', cidade: '', uf: '', cep: '' },
    beneficiarioFinal: '',
    valor: 0,
    vencimento: '',
    nossoNumero: '00000.010272 10125.152438 6 12800000005000', // Exemplo do PDF
    qrCodeImage: null
  });

  const [historico, setHistorico] = useState<BoletoData[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);

  // --- Carregar Histórico ao Iniciar ---
  useEffect(() => {
    const saved = localStorage.getItem('historico_boletos');
    if (saved) setHistorico(JSON.parse(saved));
  }, []);

  // --- Função de Upload do QR Code ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, qrCodeImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Salvar no Storage ---
  const salvarDados = () => {
    // Regra: Salvar o Pagador como "Fornecedor" no histórico
    const novoHistorico = [...historico, data];
    setHistorico(novoHistorico);
    localStorage.setItem('historico_boletos', JSON.stringify(novoHistorico));
    alert('Dados salvos com sucesso!');
  };

  // --- Impressão / PDF ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans print:p-0 print:bg-white">
      
      {/* --- ÁREA DE CONFIGURAÇÃO (Não aparece na impressão) --- */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8 print:hidden">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Gerador de Boleto C6</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Dados do Pagador (Fornecedor)</h3>
            <input 
              className="w-full border p-2 rounded" 
              placeholder="Nome Completo"
              value={data.pagadorNome}
              onChange={e => setData({...data, pagadorNome: e.target.value})}
            />
            <input 
              className="w-full border p-2 rounded" 
              placeholder="CPF/CNPJ"
              value={data.pagadorDoc}
              onChange={e => setData({...data, pagadorDoc: e.target.value})}
            />
            <input 
              className="w-full border p-2 rounded" 
              placeholder="Endereço (Rua, Nº)"
              value={data.pagadorEndereco.logradouro}
              onChange={e => setData({...data, pagadorEndereco: {...data.pagadorEndereco, logradouro: e.target.value}})}
            />
            <div className="flex gap-2">
              <input className="w-1/2 border p-2 rounded" placeholder="Cidade" value={data.pagadorEndereco.cidade} onChange={e => setData({...data, pagadorEndereco: {...data.pagadorEndereco, cidade: e.target.value}})} />
              <input className="w-1/4 border p-2 rounded" placeholder="UF" value={data.pagadorEndereco.uf} onChange={e => setData({...data, pagadorEndereco: {...data.pagadorEndereco, uf: e.target.value}})} />
              <input className="w-1/4 border p-2 rounded" placeholder="CEP" value={data.pagadorEndereco.cep} onChange={e => setData({...data, pagadorEndereco: {...data.pagadorEndereco, cep: e.target.value}})} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Dados do Boleto</h3>
            <input 
              className="w-full border p-2 rounded" 
              placeholder="Beneficiário Final"
              value={data.beneficiarioFinal}
              onChange={e => setData({...data, beneficiarioFinal: e.target.value})}
            />
            <div className="flex gap-2">
              <input type="number" className="w-1/2 border p-2 rounded" placeholder="Valor (R$)" onChange={e => setData({...data, valor: Number(e.target.value)})} />
              <input type="date" className="w-1/2 border p-2 rounded" onChange={e => setData({...data, vencimento: e.target.value})} />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 p-4 rounded text-center cursor-pointer hover:bg-gray-50">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-gray-500 mb-2" />
                <span className="text-sm text-gray-600">Upload QR Code PIX</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              {data.qrCodeImage && <p className="text-xs text-green-600 mt-2">Imagem carregada!</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 border-t pt-4">
          <button onClick={() => setModoVisualizacao(!modoVisualizacao)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Eye size={18} /> {modoVisualizacao ? 'Editar' : 'Visualizar'}
          </button>
          <button onClick={salvarDados} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <Save size={18} /> Salvar Fornecedor
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 ml-auto">
            <Printer size={18} /> Imprimir / Gerar PDF
          </button>
        </div>
      </div>

      {/* --- VISUALIZAÇÃO DO BOLETO (PAPEL) --- */}
      {(modoVisualizacao || window.matchMedia('print').matches) && (
        <div className="max-w-[21cm] mx-auto bg-white shadow-lg print:shadow-none print:w-full">
          {/* Layout imitando o C6 Bank conforme PDF anexo */}
          <div className="p-8 print:p-0 text-xs font-sans">
            
            {/* --- Cabeçalho Linha Digitável --- */}
            <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-2">
               <div className="flex items-center gap-2">
                  {/* Logo Simulado C6 */}
                  <div className="font-bold text-lg border-r-2 border-black pr-2">C6 BANK</div> 
                  <div className="font-bold text-lg">336-0</div>
               </div>
               <div className="font-bold text-sm tracking-widest text-right">
                  {data.nossoNumero} {/* */}
               </div>
            </div>

            {/* --- Corpo Principal (Ficha de Compensação) --- */}
            <div className="grid grid-cols-[3fr_1fr] border border-black">
              
              {/* Coluna Esquerda */}
              <div className="border-r border-black">
                <div className="p-1 border-b border-black">
                  <div className="text-[10px] text-gray-600 uppercase">Local de Pagamento</div>
                  <div className="font-bold">PAGÁVEL EM CANAIS ELETRÔNICOS, AGÊNCIAS OU CORRESPONDENTES</div> {/* */}
                </div>
                
                <div className="p-1 border-b border-black">
                  <div className="text-[10px] text-gray-600 uppercase">Beneficiário</div>
                  <div className="font-bold">BANCO C6 S.A. - 31.872.495/0001-72</div> {/* */}
                  <div className="text-[10px]">AV NOVE DE JULHO 3186 - SÃO PAULO SP</div> {/* */}
                </div>

                <div className="grid grid-cols-4 border-b border-black">
                   <div className="p-1 border-r border-black">
                      <div className="text-[10px] text-gray-600">Data Doc</div>
                      <div>{new Date().toLocaleDateString()}</div>
                   </div>
                   <div className="p-1 border-r border-black">
                      <div className="text-[10px] text-gray-600">Nº Doc</div>
                      <div>001</div>
                   </div>
                   <div className="p-1 border-r border-black">
                      <div className="text-[10px] text-gray-600">Espécie</div>
                      <div>R$</div>
                   </div>
                   <div className="p-1">
                      <div className="text-[10px] text-gray-600">Aceite</div>
                      <div>N</div>
                   </div>
                </div>

                {/* Área de Instruções e Dados do Pagador */}
                <div className="p-1 h-64 relative"> 
                  <div className="text-[10px] text-gray-600 mb-2">Informações de responsabilidade do beneficiário</div>
                  
                  {/* --- QR CODE PIX (Inserido na área em branco) --- */}
                  {data.qrCodeImage && (
                    <div className="absolute top-8 left-4 border border-dashed border-gray-400 p-2">
                       <img src={data.qrCodeImage} alt="QR Code PIX" className="w-32 h-32 object-contain"/>
                       <p className="text-[10px] text-center mt-1">Pague com Pix</p>
                    </div>
                  )}

                  <div className="absolute bottom-1 w-full pr-2">
                     <div className="text-[10px] text-gray-600 uppercase">Pagador</div>
                     <div className="font-bold">{data.pagadorNome} - CPF/CNPJ: {data.pagadorDoc}</div> {/* */}
                     <div className="text-[10px]">{data.pagadorEndereco.logradouro}</div>
                     <div className="text-[10px]">{data.pagadorEndereco.cidade} - {data.pagadorEndereco.uf} | CEP: {data.pagadorEndereco.cep}</div>
                     
                     <div className="mt-2 text-[10px] text-gray-600 uppercase">Beneficiário Final</div>
                     <div className="font-bold">{data.beneficiarioFinal}</div> {/* */}
                  </div>
                </div>
              </div>

              {/* Coluna Direita (Valores) */}
              <div className="flex flex-col">
                <div className="p-1 border-b border-black bg-gray-100 h-12">
                   <div className="text-[10px] text-gray-600 uppercase">Vencimento</div>
                   <div className="font-bold text-right text-sm">{data.vencimento ? new Date(data.vencimento).toLocaleDateString() : ''}</div> {/* */}
                </div>
                <div className="p-1 border-b border-black h-12">
                   <div className="text-[10px] text-gray-600 uppercase">Agência/Cód. Beneficiário</div>
                   <div className="text-right">0001 / 12345-6</div>
                </div>
                <div className="p-1 border-b border-black h-12">
                   <div className="text-[10px] text-gray-600 uppercase">Nosso Número</div>
                   <div className="text-right">{data.nossoNumero.substring(20)}</div>
                </div>
                <div className="p-1 border-b border-black h-12 bg-gray-100">
                   <div className="text-[10px] text-gray-600 uppercase">(=) Valor do Documento</div>
                   <div className="font-bold text-right text-sm">R$ {data.valor.toFixed(2)}</div> {/* */}
                </div>
                <div className="p-1 border-b border-black h-12">
                   <div className="text-[10px] text-gray-600 uppercase">(-) Desconto</div>
                   <div className="text-right"></div>
                </div>
                <div className="p-1 border-b border-black h-12">
                   <div className="text-[10px] text-gray-600 uppercase">(+) Mora / Multa</div>
                   <div className="text-right"></div>
                </div>
                <div className="flex-grow"></div> {/* Espaço extra */}
              </div>
            </div>

            {/* Código de Barras (Simulação Visual) */}
            <div className="mt-4 pt-2">
               <div className="h-12 bg-black w-2/3 ml-0"></div> 
               <div className="text-[10px] text-right mt-1">Autenticação Mecânica</div>
            </div>

            <div className="border-t border-dashed border-gray-400 mt-8 pt-4 text-center text-gray-500 text-[10px]">
               Corte na linha pontilhada
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GeradorBoleto;