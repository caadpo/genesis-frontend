export function calcularResumoPorOmeRange(
  distSelecionado: any[],
  omeMin: number,
  omeMax: number
) {
  let somaTotalCtOfEvento = 0;
  let somaGeralCotaOfEscala = 0;
  let somaTotalCtPrcEvento = 0;
  let somaGeralCotaPrcEscala = 0;

  distSelecionado.forEach((dist) => {
    dist.eventos
      .filter((evento: any) => evento.omeId >= omeMin && evento.omeId <= omeMax)
      .forEach((evento: any) => {
        somaTotalCtOfEvento += evento.ttCtOfEvento || 0;
        somaGeralCotaOfEscala += evento.somaCotaOfEscala || 0;
        somaTotalCtPrcEvento += evento.ttCtPrcEvento || 0;
        somaGeralCotaPrcEscala += evento.somaCotaPrcEscala || 0;
      });
  });

  const valorTtPlanejado =
    somaTotalCtOfEvento * 300 + somaTotalCtPrcEvento * 200;
  const valorTtExecutado =
    somaGeralCotaOfEscala * 300 + somaGeralCotaPrcEscala * 200;
  const saldoFinal = valorTtPlanejado - valorTtExecutado;

  return {
    somaTotalCtOfEvento,
    somaGeralCotaOfEscala,
    somaTotalCtPrcEvento,
    somaGeralCotaPrcEscala,
    valorTtPlanejado,
    valorTtExecutado,
    saldoFinal,
  };
}
