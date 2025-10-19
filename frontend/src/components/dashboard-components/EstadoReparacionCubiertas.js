import React, { Fragment, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import ReactApexcharts from 'src/@core/components/react-apexcharts';
import ErrorDialog from 'src/components/ErrorDialog';
import { getEstadoReparacionCubiertas } from 'src/services/flota_endpoints/metricas';

const EstadoReparacionCubiertas = () => {
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
        const res = await getEstadoReparacionCubiertas();
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
        labels: ['Necesita Recapar', 'Necesita Rotar'],
        legend: {
          labels: {
            colors: theme.palette.text.primary,
            useSeriesColors: false
          }
        },
        xaxis: {
          title: {
            text: 'ESTADO DE REPARACIÓN DE CUBIERTAS'
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad'
          }
        }
      });

      setSeries([data.NECESITA_RECAPAR, data.NECESITA_ROTAR]);
    }
  }, [data]);

  return (
    <Card sx={{ height: '450px', width: '450px' }}>
      <Fragment>
        <CardHeader
          title={`ESTADO DE REPARACIÓN DE CUBIERTAS`}
        />
        <CardContent>
          {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={"Hubo un problema"} />}
          {isLoading ? <CircularProgress size={20} /> :
            <ReactApexcharts
              options={options}
              series={series}
              type='donut'
              height='300px'
            />}
        </CardContent>
      </Fragment>
    </Card>
  );
};

export default EstadoReparacionCubiertas;
