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
import { getMetricaTotalOrdenesTrabajo } from 'src/services/flota_endpoints/metricas'

const TotalOrdenesTrabajo = () => {
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
        const res = await getMetricaTotalOrdenesTrabajo();
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
        labels: ['Programadas', 'En Taller', 'Demoradas', 'Cerradas'],
        colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.error.main, theme.palette.success.main], // Colores del gráfico
        legend: {
          show: false // Deshabilitar la leyenda dentro del gráfico
        },
        xaxis: {
          title: {
            text: 'ÓRDENES DE TRABAJO'
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad'
          }
        }
      });

      setSeries([data.CANT_PROGRAMADAS, data.CANT_EN_TALLER, data.CANT_DEMORADAS, data.CANT_CERRADAS]);
    }
  }, [data, theme]);

  return (
    <Card sx={{ height: '100%', width: '450px' }}>
      <Fragment>
        <CardHeader title={`ÓRDENES DE TRABAJO`} />
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
                    Programadas
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.primary.main }}>
                    {data?.CANT_PROGRAMADAS}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.warning.main }}>
                    En Taller
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.warning.main }}>
                    {data?.CANT_EN_TALLER}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Typography variant='body1' sx={{ color: theme.palette.error.main }}>
                    Demoradas
                  </Typography>
                  <Typography variant='h6' sx={{ color: theme.palette.error.main }}>
                    {data?.CANT_DEMORADAS}
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

export default TotalOrdenesTrabajo;
