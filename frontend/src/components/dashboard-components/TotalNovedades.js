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
import { getMetricaTotalNovedades } from 'src/services/flota_endpoints/metricas'

const TotalNovedades = () => {
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
        const res = await getMetricaTotalNovedades();
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
      setOptions({
        chart: {
          type: 'donut'
        },
        labels: ['Pendientes', 'Asignadas', 'Cerradas'],
        colors: [theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main], // Colores del gráfico
        legend: {
          show: false // Deshabilitar la leyenda dentro del gráfico
        },
        xaxis: {
          title: {
            text: 'NOVEDADES'
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad'
          }
        }
      });

      setSeries([data.CANT_PENDIENTES, data.CANT_ASIGNADAS, data.CANT_CERRADAS]);
    }
  }, [data, theme]);

  return (
    <Card sx={{ height: '100%', width: '450px' }}>
      <Fragment>
        <CardHeader title={`NOVEDADES`} />
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
                  <Typography variant='body1' sx={{ color: theme.palette.warning.main }}>
                    Pendientes
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.warning.main }}>
                    {data?.CANT_PENDIENTES}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.info.main }}>
                    Asignadas
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.info.main }}>
                    {data?.CANT_ASIGNADAS}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.success.main }}>
                    Cerradas
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.success.main }}>
                    {data?.CANT_CERRADAS}
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

export default TotalNovedades;
