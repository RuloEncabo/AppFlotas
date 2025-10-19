// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts';
import { CircularProgress, useTheme } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import ErrorDialog from 'src/components/ErrorDialog';
import {FiltroNombre } from 'src/components/formComponents/Filtros';
import { getMetricaKmPorChofer, getMetricaKmPorFlota } from 'src/services/flota_endpoints/metricas';

const objetivos = {
  KM_MEDIO: 1000, // Define el valor del objetivo para KM Promedio
  KM_CORTO: 500,
  KM_LARGO: 2000
};

const KmRecorridos = ({ tipo, filtroFechaDesde, filtroFechaHasta, filtroDestino }) => {
  const [data, setData] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroObjetivo, setFiltroObjetivo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState([]);
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({});
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // debounce filter
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("HACIENDO FETCH A METRICA DE KILOMETROS POR ", tipo === 'CHOFER' ? 'CHOFER' : 'FLOTA');

      try {
        setIsLoading(true);
        const functionEndpoint = tipo === 'CHOFER' ? getMetricaKmPorChofer : getMetricaKmPorFlota;
        const res = await functionEndpoint(filtroNombre, filtroFechaDesde, filtroFechaHasta);
        console.log(res);
        if (res !== null) {
          setData(res);
          setApiErrors([]);
        } else {
          setData([]);
        }
      } catch (error) {
        if (error.response) {
          setApiErrors([{ error: 423, message: error.response.data.detail }]);
        }
      }
    };
    fetchData();
  }, [filtroFechaDesde, filtroFechaHasta, filtroDestino, filtroNombre]);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        setOptions({
          chart: {
            type: 'bar'
          },
          legend: {
            show: false,
          },
          plotOptions: {
            bar: {
              columnWidth: '10px',
              borderRadius: 4,
              horizontal: false,
              endingShape: 'rounded',
              startingShape: 'rounded',
              colors: {
                ranges: [
                  {
                    from: 0,
                    to: 500,
                    color: theme.palette.success.main
                  },
                  {
                    from: 1001,
                    to: 2000,
                    color: theme.palette.warning.main
                  },
                  {
                    from: 2001,
                    to: 100000,
                    color: theme.palette.error.main
                  }
                ]
              }
            }
          },
          xaxis: {
            categories: data ? data.map(item => item["NOMBRE"]) : [],
            title: {
              text: tipo === 'CHOFER' ? 'Choferes' : 'Flotas',
              style: {
                color: theme.palette.text.primary  // si es dark mode  theme.palette.text.secondary
              }
            },
            labels: {
              style: {
                colors: theme.palette.text.primary
              }
            }
          },
          yaxis: {
            title: {
              text: 'Kilómetros',
              style: {
                color: theme.palette.text.secondary
              }
            },
            labels: {
              style: {
                colors: theme.palette.text.secondary
              }
            }
          }
        });

        setSeries([{
          name: "Kilómetros",
          data: data ? (
            filtroObjetivo === 'KM_CORTO' ? data.map(item => item["KM"]).filter(km =>  km <= 1000)
            : filtroObjetivo === 'KM_MEDIO' ? data.map(item => item["KM"]).filter(km =>  km > 1000 && km <= 2000)
            : filtroObjetivo === 'KM_LARGO' ? data.map(item => item["KM"]).filter(km =>  km > 2000)
            : data.map(item => item["KM"])
          ) : [],
        }]);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [data, tipo, filtroObjetivo, theme.palette.success.main, theme.palette.warning.main]);

  return (
    <Card sx={{ maxHeight: '600px', minHeight: '500px', width: '49%' }}>
      <Fragment>
        <CardHeader
          title={tipo === 'CHOFER' ? 'Kilómetros recorridos por chofer' : 'Kilómetros recorridos por flota'}
          subheader={`Objetivo: ≤ ${objetivos[filtroObjetivo]?? ""} KM`}
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'left', gap: 4 }}>
            <FiltroNombre value={filtroNombre} setValue={setFiltroNombre} label={tipo === 'CHOFER' ? 'Chofer' : 'Flota'} />
            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Objetivo</InputLabel>
              <Select
                value={filtroObjetivo}
                onChange={(e) => setFiltroObjetivo(e.target.value)}
                label="Objetivo"
              >
              <MenuItem value={null}>Todos</MenuItem>
              <MenuItem value="KM_CORTO">Cortos ({"≤"} 1000 KM)</MenuItem>
              <MenuItem value="KM_MEDIO">Medios ({">"} 1000 KM y ≤ 2000 KM)</MenuItem>
              <MenuItem value="KM_LARGO">Largos ({">"} 2000 KM)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={"Hubo un problema"} />}
          {isLoading ? <CircularProgress size={20} /> :
            <div style={{ overflowX: 'auto' }}>
              <div style={data.length > 100 ? { minWidth: '2000px' } : data.length > 50 ? { minWidth: '1500px' } : data.length > 25 ? { minWidth: '1000px' } : { minWidth: '500px' }}>
                <ReactApexcharts
                  options={options}
                  series={series}
                  type='bar'
                  height='300px'
                />
              </div>
            </div>
          }
        </CardContent>
      </Fragment>
    </Card>
  );
};

export default KmRecorridos;
