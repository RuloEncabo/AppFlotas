import React, { Fragment, useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Box,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactApexcharts from 'src/@core/components/react-apexcharts';
import ErrorDialog from 'src/components/ErrorDialog';
import { getCubiertasPorDeposito } from 'src/services/flota_endpoints/metricas';

const CubiertasPorDeposito = () => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [apiErrors, setApiErrors] = useState([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Cargar datos desde API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getCubiertasPorDeposito();
        setData(res || {});
        setApiErrors([]);
      } catch (error) {
        if (error.response) {
          setApiErrors([{ error: 423, message: error.response.data.detail }]);
        } else {
          setApiErrors([{ error: 500, message: 'Error al conectar con el servidor.' }]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Configurar gráfico con useMemo para optimización
  const { options, series } = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return { options: {}, series: [] };
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    const total = values.reduce((sum, value) => sum + value, 0);

    return {
      options: {
        chart: {
          type: 'donut',
          height: 280
        },
        labels: labels.map(label =>
          label.length > 15 ? `${label.substring(0, 12)}...` : label
        ),
        legend: {
          position: isSmallScreen ? 'bottom' : 'bottom',
          horizontalAlign: 'center',
          floating: false,
          fontSize: '12px',
          fontFamily: theme.typography.fontFamily,
          labels: {
            colors: theme.palette.text.secondary,
            useSeriesColors: false
          },
          itemMargin: {
            horizontal: 8,
            vertical: 4
          },
          markers: {
            size: 8,
            radius: 2
          },
          formatter: function(seriesName, opts) {
            const percentage = ((values[opts.seriesIndex] / total) * 100).toFixed(1);
            return `${seriesName}: ${values[opts.seriesIndex]} (${percentage}%)`;
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '11px',
            fontFamily: theme.typography.fontFamily,
            colors: [theme.palette.common.white]
          },
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.45
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: 70,
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total',
                  fontSize: '14px',
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  formatter: function(w) {
                    return total.toString();
                  }
                },
                value: {
                  fontSize: '14px',
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  formatter: function(val) {
                    return val;
                  }
                }
              }
            }
          }
        },
        tooltip: {
          y: {
            formatter: function(val, { seriesIndex }) {
              const percentage = ((val / total) * 100).toFixed(1);
              return `${val} cubiertas (${percentage}%)`;
            }
          }
        },
        colors: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main,
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#F9A826'
        ],
        responsive: [{
          breakpoint: theme.breakpoints.values.sm,
          options: {
            chart: {
              height: 250
            },
            legend: {
              position: 'bottom',
              horizontalAlign: 'center'
            }
          }
        }]
      },
      series: values
    };
  }, [data, theme, isSmallScreen]);

  return (
    <Card sx={{
      height: { xs: '450px', sm: '450px', md: '450px' },
      width: '100%',
      maxWidth: '450px',
      minWidth: '300px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Fragment>
        <CardHeader
          title={
            <Typography variant="h6" component="h2" noWrap>
              CUBIERTAS POR DEPÓSITO
            </Typography>
          }
        />
        <CardContent sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pt: 0,
          position: 'relative'
        }}>
          {apiErrors.length > 0 && (
            <ErrorDialog
              errores={apiErrors}
              onClose={() => setApiErrors([])}
              titulo={"Hubo un problema"}
            />
          )}

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="300px"
            >
              <CircularProgress size={40} />
            </Box>
          ) : Object.keys(data).length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="300px"
            >
              <Typography variant="body2" color="textSecondary">
                No hay datos disponibles
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: '100%' }}>
              <ReactApexcharts
                options={options}
                series={series}
                type="donut"
                height="100%"
                width="100%"
              />
            </Box>
          )}
        </CardContent>
      </Fragment>
    </Card>
  );
};

export default CubiertasPorDeposito;
