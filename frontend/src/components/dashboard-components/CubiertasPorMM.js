import React, { Fragment, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import ReactApexcharts from 'src/@core/components/react-apexcharts';
import ErrorDialog from 'src/components/ErrorDialog';
import { getCubiertasPorMM } from 'src/services/flota_endpoints/metricas';

const CubiertasPorMM = () => {
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
        const res = await getCubiertasPorMM();
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
        labels: ['Entre 0-2 mm', 'Entre 3-5 mm', 'Entre 6-8 mm', 'Entre 9-10 mm'],
        legend: {
          labels: {
            colors: theme.palette.text.primary,
            useSeriesColors: false
          }
        },
        xaxis: {
          title: {
            text: 'ESTADO DE POR MM'
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad'
          }
        }
      });

      setSeries([data.ENTRE_0_2, data.ENTRE_3_5, data.ENTRE_6_8, data.ENTRE_9_10]);
    }
  }, [data]);

  return (
    <Card sx={{ height: '450px', width: '450px' }}>
      <Fragment>
        <CardHeader
          title={`CUBIERTAS POR PROFUNDIDAD DE BANDA DE RODAJE`}
        />
        <CardContent>
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

export default CubiertasPorMM;
