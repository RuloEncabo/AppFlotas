// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { CircularProgress, useTheme } from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import ErrorDialog from 'src/components/ErrorDialog'
import { getMetricaPorcentajeHDRPorMotivo } from 'src/services/flota_endpoints/metricas'

const HDRPorMotivo = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiErrors, setApiErrors] = useState([]);
  const [options, setOptions] = useState({});
  const [series, setSeries] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getMetricaPorcentajeHDRPorMotivo();
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
      setOptions({
        chart: {
          type: 'donut'
        },
        labels: ['Rendición de Cuenta', 'Cambio de Flota', 'Rotura'],
        colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.error.main], // Colores del gráfico
        legend: {
          show: false // Deshabilitar la leyenda dentro del gráfico
        },
        xaxis: {
          title: {
            text: 'HDR POR MOTIVO'
          }
        },
        yaxis: {
          title: {
            text: 'Porcentaje'
          }
        }
      });

      setSeries([data.RENDICION_DE_CUENTA, data.CAMBIO_DE_FLOTA, data.ROTURA]);
    }
  }, [data, theme]);

  return (
    <Card sx={{ height: '100%', width: '450px' }}>
      <Fragment>
        <CardHeader title={`HDR POR MOTIVO`} />
        <CardContent>
          {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={"Hubo un problema"} />}
          {isLoading ? <CircularProgress size={20} /> :
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ReactApexcharts
                options={options}
                series={series}
                type='donut'
                height='300px'
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.primary.main }}>
                    Rendición de Cuenta
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.primary.main }}>
                    {data?.RENDICION_DE_CUENTA}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.warning.main }}>
                    Cambio de Flota
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.warning.main }}>
                    {data?.CAMBIO_DE_FLOTA}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.error.main }}>
                    Rotura
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.error.main }}>
                    {data?.ROTURA}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          }
        </CardContent>
      </Fragment>
    </Card>
  );
};

export default HDRPorMotivo;
