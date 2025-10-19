import React, { Fragment, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import ReactApexcharts from 'src/@core/components/react-apexcharts';
import ErrorDialog from 'src/components/ErrorDialog';
import { getEstadoDeCubiertas } from 'src/services/flota_endpoints/metricas';

const EstadoCubiertas = () => {
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
        const res = await getEstadoDeCubiertas();
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
        labels: ['Depósito', 'Taller', 'Rodando', 'Baja', 'Baja Definitiva'],
        legend: {
          labels: {
            colors: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary,
            useSeriesColors: false
          }
        },
        dataLabels: {
          style: {
            colors: ['#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9'],
            fontSize: '12px'
          }
        },
        xaxis: {
          title: {
            text: 'ESTADO DE CUBIERTAS'
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad'
          }
        }
      });

      setSeries([data.DEPOSITO, data.TALLER, data.RODANDO, data.BAJA, data['BAJA DEFINITIVA']]);
    }
  }, [data]);

  return (
    <Card sx={{ height: '450px', width: '450px' }}>
      <Fragment>
        <CardHeader
          title={`CUBIERTAS POR ESTADO`}
        />
        <CardContent sx={{ mt: 4 }}>
          {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={"Hubo un problema"} />}
          {isLoading ? <CircularProgress size={20} /> :
            <ReactApexcharts
              options={options}
              series={series}
              type='donut'
              height='300px'
            />
          }
        </CardContent>
      </Fragment>
    </Card>
  );
};

export default EstadoCubiertas;
