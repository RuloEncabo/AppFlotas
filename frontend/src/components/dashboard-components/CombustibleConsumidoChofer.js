// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { CircularProgress, useTheme, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import ErrorDialog from 'src/components/ErrorDialog'
import { FiltroNombre } from 'src/components/formComponents/Filtros'
import { getMetricaCombustibleConsumidoChofer } from 'src/services/flota_endpoints/metricas'

// Definición de los objetivos de consumo
const objetivos = {
  bien: 0.36, // Define el objetivo "bien" de combustible por chofer
  normal: 0.40, // Define el objetivo "normal" de combustible por chofer
  alto: 0.50 // Define el objetivo "alto" de combustible por chofer
};

const CombustibleConsumidoChofer = ({ filtroFechaDesde, filtroFechaHasta, filtroDestino }) => {
  const [data, setData] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState(null);
  const [filtroObjetivo, setFiltroObjetivo] = useState(null); // Filtro de objetivo inicializado en 'bien'
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

  const debouncedFechaDesde = useDebounce(filtroFechaDesde, 500);
  const debouncedFechaHasta = useDebounce(filtroFechaHasta, 500);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getMetricaCombustibleConsumidoChofer(debouncedFechaDesde, debouncedFechaHasta, filtroDestino, filtroNombre);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [debouncedFechaDesde, debouncedFechaHasta, filtroDestino, filtroNombre]);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setOptions({
        chart: {
          type: 'bar'
        },
        plotOptions: {
          bar: {
            columnWidth: '10px',
            borderRadius: 4,
            horizontal: false,
            endingShape: 'rounded',
            startingShape: 'rounded',
            colors: {
              ranges: [{
                from: 0,
                to: 0.36,
                color: theme.palette.success.main
              }, {
                from: 0.37,
                to: 0.4,
                color: theme.palette.warning.main
              }, {
                from: 0.41,
                to: 2,
                color: theme.palette.error.main
              }

            ]
            }
          }
        },
        xaxis: {
          categories: Object.keys(data),
          title: {
            text: 'Choferes',
            style: {
              colors: theme.palette.text.primary
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
            text: 'Consumo',
            style: {
              colors: theme.palette.text.primary
            }
          },
          labels: {
            style: {
              colors: theme.palette.text.primary
            }
          },

        }
      });

      setSeries([{
        name: "Consumo",
        data: data ? (
          filtroObjetivo === 'bien' ? Object.values(data).map(item => item.ratio_consumo).filter(ratio => ratio <= objetivos.bien).map(item => `${(item).toFixed(2)}`)
          : filtroObjetivo === 'normal' ? Object.values(data).map(item => item.ratio_consumo).filter(ratio => ratio > objetivos.bien && ratio <= objetivos.normal).map(item => `${(item).toFixed(2)}`)
          : filtroObjetivo === 'alto' ? Object.values(data).map(item => item.ratio_consumo).filter(ratio => ratio > objetivos.normal).map(item => `${(item).toFixed(2)}`)
          : filtroObjetivo === null ? Object.values(data).map(item => item.ratio_consumo).map(item => `${(item).toFixed(2)}`)
          : [])
          : [],
      }]);
    }
  }, [data, filtroObjetivo]);

  return (
    <Card sx={{ maxHeight: '600px', minHeight: '500px', width: '49%' }}>
      <Fragment>
        <CardHeader
          title={`CONSUMO DE COMBUSTIBLE POR CHOFER`}
          subheader={`Objetivo: ≤ ${objetivos[filtroObjetivo]} litros`}
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'left', gap: 4 }}>
            <FiltroNombre value={filtroNombre} setValue={setFiltroNombre} />
            <FormControl>
              <InputLabel>Objetivo</InputLabel>
              <Select
                value={filtroObjetivo}
                onChange={(e) => setFiltroObjetivo(e.target.value)}
                label="Objetivo"
              >
                <MenuItem value={null}>Todos</MenuItem>
              <MenuItem value="bien">Bien (≤ {objetivos.bien} litros)</MenuItem>
              <MenuItem value="normal">Normal ({">"} {objetivos.bien} y ≤ {objetivos.normal} litros)</MenuItem>
              <MenuItem value="alto">Alto ({">"} {objetivos.normal} litros)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={"Hubo un problema"} />}
          {isLoading ? <CircularProgress size={20} /> :
            <div style={{ overflowX: 'auto' }}>
              <div style={Object.keys(data).length > 25 ? { minWidth: '1000px' } : { minWidth: '500px' }}>
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

export default CombustibleConsumidoChofer;
