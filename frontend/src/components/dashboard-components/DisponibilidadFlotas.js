// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { CircularProgress, Tooltip, useTheme } from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import ErrorDialog from 'src/components/ErrorDialog'
import { getMetricaPorcentajeDisponibilidadFlotas } from 'src/services/flota_endpoints/metricas'

const DisponibilidadFlotas = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiErrors, setApiErrors] = useState([]);
  const [tractorGaugeOptions, setTractorGaugeOptions] = useState({});
  const [tractorGaugeSeries, setTractorGaugeSeries] = useState([]);
  const [bateaGaugeOptions, setBateaGaugeOptions] = useState({});
  const [bateaGaugeSeries, setBateaGaugeSeries] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getMetricaPorcentajeDisponibilidadFlotas();
        console.log(res);
        setData(res || {});
        setApiErrors([]);
      } catch (error) {
        if (error.response) {
          setApiErrors([{ error: 423, message: error.response.data.detail }]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      // Configuración para el gráfico de disponibilidad de tractores
      let tractorColor = theme.palette.success.main;
      if (data.porcentaje_tractores_disponibles <= 25) {
        tractorColor = theme.palette.error.main;
      } else if (data.porcentaje_tractores_disponibles <= 65) {
        tractorColor = theme.palette.warning.main;
      }

      setTractorGaugeOptions({
        chart: {
          type: 'radialBar'
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: "#e7e7e7",
              strokeWidth: '97%',
              margin: 5,
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                color: '#999',
                opacity: 1,
                blur: 2
              }
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                offsetY: -2,
                fontSize: '28px'
              }
            }
          }
        },
        fill: {
          colors: [tractorColor]
        },
        labels: ['Porcentaje de Tractores Disponibles'],
      });

      setTractorGaugeSeries([data.porcentaje_tractores_disponibles]);

      // Configuración para el gráfico de disponibilidad de bateas
      let bateaColor = theme.palette.success.main;
      if (data.porcentaje_bateas_disponibles <= 25) {
        bateaColor = theme.palette.error.main;
      } else if (data.porcentaje_bateas_disponibles <= 65) {
        bateaColor = theme.palette.warning.main;
      }

      setBateaGaugeOptions({
        chart: {
          type: 'radialBar'
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: "#e7e7e7",
              strokeWidth: '97%',
              margin: 5,
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                color: '#999',
                opacity: 1,
                blur: 2
              }
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                offsetY: -2,
                fontSize: '28px'
              }
            }
          }
        },
        fill: {
          colors: [bateaColor]
        },
        labels: ['Porcentaje de Bateas Disponibles'],
      });

      setBateaGaugeSeries([data.porcentaje_bateas_disponibles]);
    }
  }, [data, theme]);

  return (
    <Fragment>
      <Box sx={{ display: 'flex', gap: 3, width: '100%', flexWrap: 'wrap' }}>
        <Card sx={{ height: '350px', width: '450px', padding: 2 }}>
          <CardHeader title="DISPONIBILIDAD DE TRACTORES" />
          <Tooltip title="Porcentaje de Tractores Disponibles">
            <CardContent>
              {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={"Hubo un problema"} />}
              {isLoading ? <CircularProgress size={20} /> :
                <Box>
                  <ReactApexcharts
                    options={tractorGaugeOptions}
                    series={tractorGaugeSeries}
                    type='radialBar'
                    height='300px'
                  />
                  <Box sx={{ textAlign: 'initial', backgroundColor: theme.palette.action.hover, padding: 1, borderRadius: 1 }}>
                    <Typography variant="h6">Tractores Disponibles: {data?.tractores_disponibles || "-"}</Typography>
                    <Typography variant="h6">Tractores No Disponibles: {data?.tractores_no_disponibles || "-"}</Typography>
                  </Box>
                </Box>
              }
            </CardContent>
          </Tooltip>
        </Card>
        <Card sx={{ height: '350px', width: '450px', padding: 2 }}>
          <CardHeader title="ESTADO DE TRACTORES DISPONIBLES" />
          <Tooltip title="De los tractores disponibles (tractores que no tienen una orden de transporte activa), cuántos tractores se encuentran en tránsito y cuántos tractores se encuentran parados (sin HDR asignada)">
            <CardContent>
              {isLoading ? <CircularProgress size={20} /> :
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', backgroundColor: theme.palette.action.hover, padding: 2, borderRadius: 1 }}>
                    <Typography variant="h6">EN TRANSITO</Typography>
                    <Typography variant="h4">{data?.tractores_disponibles_en_transito || 0} - ({(data?.tractores_disponibles_en_transito * 100 / (data?.tractores_disponibles_en_transito + data?.tractores_disponibles_parado)).toFixed(2) || 0}%)</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', backgroundColor: theme.palette.action.hover, padding: 2, borderRadius: 1 }}>
                    <Typography variant="h6">PARADOS</Typography>
                    <Typography variant="h4">{data?.tractores_disponibles_parado || 0} - ({(data?.tractores_disponibles_parado * 100 / (data?.tractores_disponibles_en_transito + data?.tractores_disponibles_parado)).toFixed(2) || 0}%)</Typography>
                  </Box>
                </Box>
              }
            </CardContent>
          </Tooltip>
        </Card>
        <Card sx={{ height: '350px', width: '450px', padding: 2 }}>
          <CardHeader title="DISPONIBILIDAD DE BATEAS" />
          <Tooltip title="Porcentaje de Bateas Disponibles">
            <CardContent>
              {isLoading ? <CircularProgress size={20} /> :
                <Box>
                  <ReactApexcharts
                    options={bateaGaugeOptions}
                    series={bateaGaugeSeries}
                    type='radialBar'
                    height='300px'
                  />
                  <Box sx={{ textAlign: 'initial', backgroundColor: theme.palette.action.hover, padding: 1, borderRadius: 1 }}>
                    <Typography variant="h6">Bateas Disponibles: {data?.bateas_disponibles || "-"}</Typography>
                    <Typography variant="h6">Bateas No Disponibles: {data?.bateas_no_disponibles || "-"}</Typography>
                  </Box>
                </Box>
              }
            </CardContent>
          </Tooltip>
        </Card>
        <Card sx={{ height: '350px', width: '450px', padding: 2 }}>
          <CardHeader title="ESTADO DE BATEAS DISPONIBLES" />
          <Tooltip title="De las bateas disponibles (bateas que no tienen una orden de transporte activa), cuántas bateas se encuentran en tránsito y cuántas bateas se encuentran paradas (sin HDR asignada)">
            <CardContent>
              {isLoading ? <CircularProgress size={20} /> :
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', backgroundColor: theme.palette.action.hover, padding: 2, borderRadius: 1 }}>
                    <Typography variant="h6">EN TRANSITO</Typography>
                    <Typography variant="h4">{data?.bateas_disponibles_en_transito || 0} - ({(data?.bateas_disponibles_en_transito * 100 / (data?.bateas_disponibles_en_transito + data?.bateas_disponibles_parado)).toFixed(2) || 0}%)</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', backgroundColor: theme.palette.action.hover, padding: 2, borderRadius: 1 }}>
                    <Typography variant="h6">PARADOS</Typography>
                    <Typography variant="h4">{data?.bateas_disponibles_parado || 0} - ({(data?.bateas_disponibles_parado * 100 / (data?.bateas_disponibles_en_transito + data?.bateas_disponibles_parado)).toFixed(2) || 0}%)</Typography>
                  </Box>
                </Box>
              }
            </CardContent>
          </Tooltip>
        </Card>
      </Box>
    </Fragment>
  );
};

export default DisponibilidadFlotas;
