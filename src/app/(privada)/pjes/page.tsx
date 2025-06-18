'use client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaCalendar, FaCheck } from 'react-icons/fa';

export default function PjesPage() {
  const searchParams = useSearchParams();
  const ano = searchParams.get('ano');
  const mes = searchParams.get('mes');

  const [pjestetos, setPjestetos] = useState<any[]>([]);
  const [pjesdists, setPjesdists] = useState<any[]>([]);
  const [pjeseventos, setPjeseventos] = useState<any[]>([]);
  const [pjesoperacoes, setPjesoperacoes] = useState<any[]>([]);
  const [pjesescalas, setPjesescalas] = useState<any[]>([]);
  const [selectedTetoId, setSelectedTetoId] = useState<number | null>(null);
  const [selectedDistId, setSelectedDistId] = useState<number | null>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [selectedOperacaoId, setSelectedOperacaoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarTeto, setMostrarTeto] = useState(true);
  const [mostrarDist, setMostrarDist] = useState(true);
  const [mostrarEvento, setMostrarEvento] = useState(true);
  const [mostrarOperacao, setMostrarOperacao] = useState(true);
  const [busca, setBusca] = useState('');
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  const toggleMenu = (id: number) => {setMenuAbertoId(prev => (prev === id ? null : id));};
  const menuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resTeto, resDist, resEvento, resOperacao, resEscala] = await Promise.all([
          fetch('/api/pjesteto'),
          fetch('/api/pjesdist'),
          fetch('/api/pjesevento'),
          fetch('/api/pjesoperacao'),
          fetch('/api/pjesescala')
        ]);

        const tetos = await resTeto.json();
        const dists = await resDist.json();
        const eventos = await resEvento.json();
        const operacoes = await resOperacao.json();
        const escalas = await resEscala.json();

        const mapMes: Record<string, number> = {
          JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
          JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12
        };

        const mesNum = mapMes[(mes || '').toUpperCase().trim()];

        setPjestetos(tetos.filter((item: any) => item.ano === Number(ano) && item.mes === mesNum));
        setPjesdists(dists.filter((item: any) => item.ano === Number(ano) && item.mes === mesNum));
        setPjeseventos(eventos.filter((item: any) => item.ano === Number(ano) && item.mes === mesNum));
        setPjesoperacoes(operacoes.filter((item: any) => item.ano === Number(ano) && item.mes === mesNum));
        setPjesescalas(escalas.filter((item: any) => item.ano === Number(ano) && item.mes === mesNum));

        if (tetos.length > 0) setSelectedTetoId(tetos[0].id);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    if (ano && mes) {
      fetchDados();
    }

    const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuAbertoId(null);
    }
    };

    if (menuAbertoId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ano, mes, menuAbertoId]);

  const handleTetoClick = (id: number) => {
    setSelectedTetoId(id);
    setSelectedDistId(null);
    setSelectedEventoId(null);
    setSelectedOperacaoId(null);
  };

  const handleDistClick = (id: number) => {
    setSelectedDistId(id);
    setSelectedEventoId(null);
    setSelectedOperacaoId(null);
  };

  const handleEventoClick = (id: number) => {
    setSelectedEventoId(id);
    setSelectedOperacaoId(null);
  };

  const handleOperacaoClick = (id: number) => {
    setSelectedOperacaoId(prev => (prev === id ? null : id));
  };
  const menuItemStyle = {
  padding: '8px',
  cursor: 'pointer',
  color: '#fff',
  fontSize: '13px',
  borderBottom: '1px solid #444'
};

  const distSelecionado = pjesdists.filter(dist => dist.pjesTetoId === selectedTetoId);
  const eventoSelecionado = pjeseventos.filter(evento => evento.pjesDistId === selectedDistId);
  const operacaoSelecionado = pjesoperacoes.filter(op => op.pjesEventoId === selectedEventoId);
  const escalaSelecionado = pjesescalas.filter(esc => esc.pjesOperacaoId === selectedOperacaoId);

  if (loading) return <p style={{ color: 'white' }}>Carregando dados...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontSize:'12px', color: 'white', minHeight: '100vh', position: 'relative' }}>

          <div>

                {mostrarTeto && (
                  <div style={{
                    width: '100%',
                    borderBottom: '1px solid #288b00',
                    padding: '8px',
                    backgroundColor: '#111',
                    zIndex: 5
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3>Tetos PJES ({mes}/{ano})</h3>
                    </div>
                    <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {pjestetos.map(teto => (
                        <li
                          key={teto.id}
                          onClick={() => handleTetoClick(teto.id)}
                          style={{
                            cursor: 'pointer',
                            fontWeight: selectedTetoId === teto.id ? 'bold' : 'normal',
                            background: selectedTetoId === teto.id ? '#333' : 'transparent',
                            borderRadius: '4px',
                            padding: '4px',
                            listStyle: 'none'
                          }}
                        >
                          {teto.nomeVerba}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mostrarDist && (
                  <div style={{
                    width: '100%',
                    borderBottom: '1px solid #288b00',
                    padding: '8px',
                    backgroundColor: '#111',
                    zIndex: 5
                  }}>
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                  <h3>DISTRIBUIÇÃO</h3>
                  
                </div>
                <ul>
                  {distSelecionado.map(dist => (
                    <li
                      key={dist.id}
                      onClick={() => handleDistClick(dist.id)}
                      style={{
                            cursor: 'pointer',
                            fontWeight: selectedDistId === dist.id ? 'bold' : 'normal',
                            background: selectedDistId === dist.id ? '#333' : 'transparent',
                            borderRadius: '4px',
                            padding: '4px',
                            listStyle: 'none'
                          }}
                    >
                      {dist.nomeDist}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flex: 1 }}>


            
              <div style={{ width: '20%',padding:'10px', borderRight: '2px solid #000000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding:'10px', height: '40px', fontSize:'12px', alignItems: 'center', background:'#000000' }}>
                  <h3>UNIDADES</h3>
                </div>
                  <table style={{ width: '100%', marginTop: '8px', fontSize: '11px', borderCollapse: 'collapse', textAlign:'center' }}>
                    <thead>
                      <tr style={{ background: '#222' }}>
                        <th style={{ border: '1px solid #555', padding: '4px' }}>Unidade</th>
                        <th style={{ border: '1px solid #555', padding: '4px' }}>Of</th>
                        <th style={{ border: '1px solid #555', padding: '4px' }}>Valor (R$)</th>
                        <th style={{ border: '1px solid #555', padding: '4px' }}>Prç</th>
                        <th style={{ border: '1px solid #555', padding: '4px' }}>Valor (R$)</th>
                        <th style={{ border: '1px solid #555', padding: '4px' }}>#</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{color:'#000000'}}>
                        <td> 11º BPM</td>
                        <td> 100 | 100</td>
                        <td> R$ 300.000,00</td>
                        <td> 100 | 100</td>
                        <td> R$ 200.000,00</td>
                        <td> <FaCheck/></td>
                      </tr>
                      <tr style={{color:'#000000'}}>
                        <td> 11º BPM</td>
                        <td> 100 | 100</td>
                        <td> R$ 300.000,00</td>
                        <td> 100 | 100</td>
                        <td> R$ 200.000,00</td>
                        <td> <FaCheck/></td>
                      </tr>
                      <tr style={{color:'#000000'}}>
                        <td> 11º BPM</td>
                        <td> 100 | 100</td>
                        <td> R$ 300.000,00</td>
                        <td> 100 | 100</td>
                        <td> R$ 200.000,00</td>
                        <td> <FaCheck/></td>
                      </tr>
                      <tr style={{color:'#000000'}}>
                        <td> 11º BPM</td>
                        <td> 100 | 100</td>
                        <td> R$ 300.000,00</td>
                        <td> 100 | 100</td>
                        <td> R$ 200.000,00</td>
                        <td> <FaCheck/></td>
                      </tr>
                      <tr style={{color:'#000000'}}>
                        <td> 11º BPM</td>
                        <td> 100 | 100</td>
                        <td> R$ 300.000,00</td>
                        <td> 100 | 100</td>
                        <td> R$ 200.000,00</td>
                        <td> <FaCheck/></td>
                      </tr>
                      <tr style={{color:'#000000'}}>
                        <td> 11º BPM</td>
                        <td> 100 | 100</td>
                        <td> R$ 300.000,00</td>
                        <td> 100 | 100</td>
                        <td> R$ 200.000,00</td>
                        <td> <FaCheck/></td>
                      </tr>
                    </tbody>
                  </table>
              </div>
          

            

            {mostrarEvento && (
              <div style={{ width: '20%',padding:'10px', borderRight: '1px solid #cfcfcf' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding:'10px', height: '40px', fontSize:'12px', alignItems: 'center', background:'#144953' }}>
                  <h3>EVENTOS</h3>
                </div>
                <input
                          type="text"
                          placeholder="Buscar..."
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          style={{
                            width: '90%',
                            padding: '6px',
                            margin: '10px',
                            fontSize: '14px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                          }}
                        />
                {eventoSelecionado.length === 0 ? (
                  <p>Nenhum evento para esta distribuição.</p>
                ) : (
                  <ul style={{ padding:'2px', height: '80px', fontSize:'12px' }}>
                    {eventoSelecionado.map((evento: any) => {
                      let backgroundColor = '#f8f9fa';
                      if (evento.statusEvento === 'REALIZADA') backgroundColor = '#ffffff';
                      else if (evento.statusEvento === 'HOMOLOGADA') backgroundColor = '#e79f9f';
                      

                      return (
                        
                        <li
                            key={evento.id}
                            onClick={() => handleEventoClick(evento.id)}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '15px',
                              cursor: 'pointer',
                              fontWeight: selectedEventoId === evento.id ? 'bold' : 'normal',
                              backgroundColor,
                              padding: '5px',
                              borderRadius: '6px',
                              marginBottom: '1px',
                            }}
                          >
                            {/* Botão de menu (três pontinhos) */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(evento.id);
                              }}
                              style={{
                                position: 'absolute',
                                top: '3px',
                                right: '8px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                color: '#ccc',
                              }}
                            >
                              ⋮
                            </div>

                            {/* Submenu */}
                            {menuAbertoId === evento.id && (
                              <div ref={menuRef} style={{
                                position: 'absolute',
                                top: '32px',
                                right: '8px',
                                backgroundColor: '#222',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                zIndex: 100,
                                minWidth: '120px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                              }}>
                                <div style={menuItemStyle} onClick={() => alert('Homologar')}>Homologar</div>
                                <div style={menuItemStyle} onClick={() => alert('Editar')}>Editar</div>
                                <div style={{ ...menuItemStyle, borderBottom: 'none' }} onClick={() => alert('Excluir')}>Excluir</div>
                              </div>
                            )}

                            {/* Imagem e unidade */}
                            <div style={{
                              flexShrink: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Image
                                src="/assets/images/logo.png"
                                alt="logo"
                                width={30}
                                height={30}
                                style={{ borderRadius: '50%' }}
                              />
                              <div style={{ textAlign: "center", fontSize: '12px', color: '#000000' }}>
                                {evento?.ome?.nomeOme || 'Unidade'}
                              </div>
                            </div>

                            {/* Texto à direita */}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000' }}>
                                {evento.nomeEvento}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6e6e6e' }}>
                                100 Of — 200 Prç  |   100 Of — 200 Prç
                              </div>
                            </div>
                        </li>

                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {mostrarOperacao && (
              <div style={{ width: '60%',padding:'10px', borderRight: '1px solid #cfcfcf' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding:'10px', height: '40px', fontSize:'12px', alignItems: 'center', background:'#145323' }}>
                  <h3>OPERAÇÕES</h3>
                </div>
                <ul>
                  {operacaoSelecionado.map(op => {
                    const escalaDaOperacao = pjesescalas.filter(esc => esc.pjesOperacaoId === op.id);
                    const isAberto = selectedOperacaoId === op.id;

                    return (
                      <li key={op.id} style={{ marginBottom: '1rem' }}>
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            margin: '10px',
                            fontSize: '14px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                          }}
                        />

                        <div
                          onClick={() => handleOperacaoClick(op.id)}
                          style={{
                            cursor: 'pointer',
                            fontWeight: isAberto ? 'bold' : 'normal',
                            background: isAberto ? '#666' : '#333',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          {op.nomeOperacao} — {op.statusOperacao}
                          <span style={{ float: 'right' }}>{isAberto ? '▲' : '▼'}</span>
                        </div>

                        {isAberto && escalaDaOperacao.length > 0 && (() => {
                          const escalaFiltrada = escalaDaOperacao
                            .filter((escala: any) => {
                              const termo = busca.toLowerCase();
                              return (
                                escala.nomeGuerraSgp?.toLowerCase().includes(termo) ||
                                escala.nomeCompletoSgp?.toLowerCase().includes(termo) ||
                                escala.pgSgp?.toLowerCase().includes(termo) ||
                                escala.matSgp?.toString().includes(termo) ||
                                escala.phone?.toString().includes(termo) ||
                                escala.localApresentacao?.toLowerCase().includes(termo) ||
                                escala.statusEscala?.toLowerCase().includes(termo) ||
                                new Date(escala.dataInicio).toLocaleDateString('pt-BR').includes(termo)
                              );
                            })
                            .sort((a: any, b: any) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

                          return (
                            <table style={{ width: '100%', marginTop: '8px', fontSize: '12px', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: '#222' }}>
                                  <th style={{ border: '1px solid #555', padding: '4px' }}>Identificação do Policial</th>
                                  <th style={{ border: '1px solid #555', padding: '4px' }}>Data/Hora</th>
                                  <th style={{ border: '1px solid #555', padding: '4px' }}>Local</th>
                                  <th style={{ border: '1px solid #555', padding: '4px' }}>Telefone</th>
                                  <th style={{ border: '1px solid #555', padding: '4px' }}>Serv</th>
                                </tr>
                              </thead>
                              <tbody>
                                {escalaFiltrada.map((escala: any) => {
                                  let backgroundColor = '#eee';
                                  if (escala.statusEscala === 'REALIZADA') backgroundColor = '#d4edda';
                                  else if (escala.statusEscala === 'PENDENTE') backgroundColor = '#303249';
                                  else if (escala.statusEscala === 'CANCELADA') backgroundColor = '#f8d7da';

                                  return (
                                    <tr key={escala.id} style={{ backgroundColor }}>
                                      <td style={{ border: '1px solid #555', padding: '4px' }}>
                                        {escala.pgSgp} {escala.matSgp} {escala.nomeGuerraSgp} BPCHOQUE
                                      </td>
                                      <td style={{ border: '1px solid #555', padding: '4px' }}>
                                        {new Date(escala.dataInicio).toLocaleDateString('pt-BR')} das {escala.horaInicio} às {escala.horaFinal}
                                      </td>
                                      <td style={{ border: '1px solid #555', padding: '4px' }}>{escala.localApresentacao}</td>
                                      <td style={{ border: '1px solid #555', padding: '4px' }}>{escala.phone}</td>
                                      <td style={{ border: '1px solid #555', padding: '4px' }}>12</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          );
                        })()}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          </div>
    </div>
  );
}
