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
import { getMetricaPorcentajeTiposDeViajesActivos } from 'src/services/flota_endpoints/metricas'

const TiposDeViajesActivos = () => {
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
        const res = await getMetricaPorcentajeTiposDeViajesActivos();
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
        labels: ['Nacional', 'Internacional'],
        colors: [theme.palette.success.main, theme.palette.warning.main], // Colores del gráfico
        legend: {
          show: false // Deshabilitar la leyenda dentro del gráfico
        },
        xaxis: {
          title: {
            text: 'TIPOS DE VIAJES ACTIVOS'
          }
        },
        yaxis: {
          title: {
            text: 'Porcentaje'
          }
        }
      });

      setSeries([data.NACIONAL, data.INTERNACIONAL]);
    }
  }, [data, theme.palette.success.main, theme.palette.warning.main]);

  return (
    <Card sx={{ height: '100%', width: '450px' }}>
      <Fragment>
        <CardHeader title={`TIPOS DE VIAJES ACTIVOS`} />
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
                  <Typography variant='body1' sx={{ color: theme.palette.success.main }}>
                    Nacional
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.success.main }}>
                    {data?.NACIONAL}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.warning.main }}>
                    Internacional
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.warning.main }}>
                    {data?.INTERNACIONAL}%
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

export default TiposDeViajesActivos;
