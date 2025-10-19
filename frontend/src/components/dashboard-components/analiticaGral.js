import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material';
import ReactApexcharts from 'src/@core/components/react-apexcharts';
import { Fragment, useEffect, useState } from 'react';

const AnaliticaGral = ({ data }) => {
  const theme = useTheme();

  const [optionsConsumo, setOptionsConsumo] = useState({});
  const [optionsKm, setOptionsKm] = useState({});
  const [optionsDispFlotas, setOptionsDispFlotas] = useState({});

  const [seriesConsumo, setSeriesConsumo] = useState([]);
  const [seriesKm, setSeriesKm] = useState([]);
  const [seriesDispFlotas, setSeriesDispFlotas] = useState([]);

  useEffect(() => {
    if (data) {
      // Configuración de las gráficas
      const configOptions = (label, labels, colors) => ({
        chart: {
          type: 'donut'
        },
        labels: labels,
        legend: {
          show: true,
          position : 'bottom',
          labels: {
            colors: theme.palette.text.primary,
            useSeriesColors: true
          }
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: label,
                  color: theme.palette.text.primary,
                }
              }
            }
          }
        },
        colors: colors
      });

      setOptionsConsumo(configOptions('Consumo', [
        `Bien (≤ ${0.37} litros)`,
        `Regular (> ${0.37} y ≤ ${0.4} litros)`,
        `Mal (> ${0.4} litros)`
      ], [
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main
      ]));

      setOptionsKm(configOptions('Kilómetros Promedio', [
        `Corto (≤ ${1000} KM)`,
        `Medio (> ${1000} y ≤ ${2000} KM)`,
        `Largo (> ${2000} KM)`
      ], [
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main
      ]));

      setOptionsDispFlotas(configOptions('Disponibilidad de Flotas', [
        'No disponible',
        'Disponible'
      ], [
        theme.palette.error.main,
        theme.palette.success.main
      ]));

      setSeriesConsumo([
        data.CONSUMO_SEGMENTO_BIEN,
        data.CONSUMO_SEGMENTO_REGULAR,
        data.CONSUMO_SEGMENTO_MAL
      ]);

      setSeriesKm([
        data.KM_SEGMENTO_CORTO,
        data.KM_SEGMENTO_MEDIO,
        data.KM_SEGMENTO_LARGO
      ]);

      setSeriesDispFlotas([
        100 - data.PORCENTAJE_FLOTAS_DISPONIBLES,
        data.PORCENTAJE_FLOTAS_DISPONIBLES
      ]);
    }
  }, [data, theme.palette.text.primary]);

  return (
    <Box>
      {data &&
      <Box display="flex" justifyContent="space-around" mb={4}>
        <Card sx={{ width: '22%', textAlign: 'center', backgroundColor: 'transparent', border: `1px solid ${theme.palette.primary.main}` }}>
          <CardHeader title="Cantidad de HDR" />
          <CardContent>
            <Typography variant="h4" color={theme.palette.primary.main}>{data.CANTIDAD_HDR}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '22%', textAlign: 'center', backgroundColor: 'transparent', border: `1px solid ${data.CONSUMO_PROMEDIO <= 0.37 ? theme.palette.success.main : data.CONSUMO_PROMEDIO <= 0.4 ? theme.palette.warning.main : theme.palette.error.main}` }}>
          <CardHeader title="Consumo Promedio" subheader={`Objetivo: Bien ≤ 0.37, Regular ≤ 0.4`} />
          <CardContent>
            <Typography variant="h4" color={data.CONSUMO_PROMEDIO <= 0.37 ? theme.palette.success.main : data.CONSUMO_PROMEDIO <= 0.4 ? theme.palette.warning.main : theme.palette.error.main}>
              { `${(data.CONSUMO_PROMEDIO).toFixed(2)}`}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '22%', textAlign: 'center', backgroundColor: 'transparent', border: `1px solid ${data.KM_PROMEDIO <= 1000 ? theme.palette.success.main : data.KM_PROMEDIO <= 2000 ? theme.palette.warning.main : theme.palette.error.main}` }}>
          <CardHeader title="KM Promedio" subheader={`Objetivo: Corto ≤ 1000, Medio ≤ 2000`} />
          <CardContent>
            <Typography variant="h4" color={data.KM_PROMEDIO <= 1000 ? theme.palette.success.main : data.KM_PROMEDIO <= 2000 ? theme.palette.warning.main : theme.palette.error.main}>
              {data.KM_PROMEDIO.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '22%', textAlign: 'center', backgroundColor: 'transparent', border: `1px solid ${data.PORCENTAJE_FLOTAS_DISPONIBLES > 90 ? theme.palette.success.main : theme.palette.warning.main}` }}>
          <CardHeader title="Disponibilidad de Flotas" subheader={`Objetivo: > 90%`} />
          <CardContent>
            <Typography variant="h4" color={data.PORCENTAJE_FLOTAS_DISPONIBLES > 90 ? theme.palette.success.main : theme.palette.warning.main}>
              {data.PORCENTAJE_FLOTAS_DISPONIBLES.toFixed(2)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>
      }

      {data && (
        <Box display="flex" justifyContent="space-around">
          <Card sx={{ width: '33%' }}>
            <Fragment>
              <CardHeader title="Consumo" />
              <CardContent>
                <ReactApexcharts
                  options={optionsConsumo}
                  series={seriesConsumo}
                  type='donut'
                  height='300px'
                />
              </CardContent>
            </Fragment>
          </Card>

          <Card sx={{ width: '33%' }}>
            <Fragment>
              <CardHeader title="Kilómetros Promedio" />
              <CardContent>
                <ReactApexcharts
                  options={optionsKm}
                  series={seriesKm}
                  type='donut'
                  height='300px'
                  width='100%'
                />
              </CardContent>
            </Fragment>
          </Card>

          <Card sx={{ width: '33%' }}>
            <Fragment>
              <CardHeader title="Disponibilidad de Flotas" />
              <CardContent>
                <ReactApexcharts
                  options={optionsDispFlotas}
                  series={seriesDispFlotas}
                  type='donut'
                  height='300px'
                  width='100%'
                />
              </CardContent>
            </Fragment>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AnaliticaGral;
