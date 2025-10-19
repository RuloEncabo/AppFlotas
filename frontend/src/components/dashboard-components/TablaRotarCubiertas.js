import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardHeader, Typography, Tooltip } from '@mui/material';
import { getFlotaCubiertasPorPatente, getFlotasBateas } from 'src/services/flota_endpoints/cubiertas_flota';
import { getRotacionesCubiertas } from 'src/services/flota_endpoints/metricas';
import { FiltroCheckbox, FiltroNombre } from '../formComponents/Filtros';
import Icon from 'src/@core/components/icon'

// Definir estilos para las celdas según el valor de KM_ROTAR
const getCellStyle = (km_rotar, tiempo,i) => {
  if (km_rotar == undefined || tiempo == undefined || km_rotar === null || tiempo === null || i==7 || i== 16 || i== 17) {
    return { backgroundColor: 'gray', color: 'black' };
  } else if (km_rotar < 30000 && tiempo < 20) {
    return { backgroundColor: 'green', color: 'black' };
  } else if ((km_rotar >= 30000 && km_rotar < 40000) || (tiempo >= 20 && tiempo <= 30)) {
    return { backgroundColor: 'yellow', color: 'black' };
  } else {
    return { backgroundColor: 'red', color: 'black' };
  }
};

const TablaRotarCubiertas = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patentes, setPatentes] = useState({ flotas: [], bateas: [] });
  const [filteredPatentes, setFilteredPatentes] = useState([]);
  const [filterPatente, setFilterPatente] = useState('');
  const [filterType, setFilterType] = useState('Todas');
  const [showKmReales, setShowKmReales] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFlotasBateas();
        const flotas = res[0].map(flo => flo.flo_dom_tractor);
        const bateas = res[1].map(bat => bat.bat_dominio);

        setPatentes({ flotas, bateas });
        setFilteredPatentes([...flotas, ...bateas]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getRotacionesCubiertas();
        const allData = filteredPatentes.map(patente => {
          const vehiculo = response.find(vehiculo => vehiculo.PATENTE === patente);
          return (showKmReales ? {
            patente,
            cubiertas: vehiculo ? vehiculo.KM_LIVE : Array(17).fill(null),
            dias: vehiculo ? vehiculo.DIAS : Array(17).fill(null),
            nroInterno : vehiculo ? vehiculo.NRO_INTERNO : Array(17).fill(null),
            tipo: vehiculo ? vehiculo.TIPO : null
          } : {
            patente,
            cubiertas: vehiculo ? vehiculo.KM_POS : Array(17).fill(null),
            dias: vehiculo ? vehiculo.DIAS : Array(17).fill(null),
            nroInterno : vehiculo ? vehiculo.NRO_INTERNO : Array(17).fill(null),
            tipo: vehiculo ? vehiculo.TIPO : null
          })
        });

        setData(allData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (filteredPatentes.length > 0) {
      fetchData();
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [filteredPatentes, showKmReales]);

  useEffect(() => {
    let newFilteredPatentes = [...patentes.flotas, ...patentes.bateas];

    if (filterPatente) {
      newFilteredPatentes = newFilteredPatentes.filter(patente =>
        patente.toLowerCase().includes(filterPatente.toLowerCase())
      );
    }

    if (filterType === 'Flota') {
      newFilteredPatentes = patentes.flotas.filter(patente =>
        patente.toLowerCase().includes(filterPatente.toLowerCase())
      );
    } else if (filterType === 'Batea') {
      newFilteredPatentes = patentes.bateas.filter(patente =>
        patente.toLowerCase().includes(filterPatente.toLowerCase())
      );
    }

    setFilteredPatentes(newFilteredPatentes);
  }, [filterPatente, filterType, patentes]);

  const getHeaderName = (i) => {
    if (i >= 1 && i <= 2) return `EJE DELANTERO`;         // Posiciones 1-2: Eje delantero
    if (i >= 3 && i <= 6) return `EJE TRACCIÓN`;          // Posiciones 3-6: Eje tracción
    if (i === 7 ) return `AUX TRACCIÓN`;                  // Posiciones 7: Auxiliar tracción
    if (i >= 8 && i <= 11) return `PRIMER EJE BATEA`;     // Posiciones 8-11: Primer eje batea
    if (i >= 12 && i <= 15) return `SEGUNDO EJE BATEA`;   // Posiciones 12-15: Segundo eje batea
    if (i === 17 || i === 16) return `AUX BATEA`;          // Posición 16 y 17: Auxiliar batea
    return '';                                            // Valor predeterminado si no coincide
  };


  // Generar columnas dinámicamente basadas en las posiciones
  const columns = [
    { field: 'patente', headerName: 'Patente', width: 110 }
  ];

  if (filterType === 'Todas') {
    let i = 9;
    for (let i = 1; i <= 17; i++) {
      columns.push({
        renderHeader: (params) => (
          <Tooltip title={`${getHeaderName(i)} POS ${i}`} >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <Typography variant='h6'>
                {`${getHeaderName(i)}`}
              </Typography>
              <Typography variant='body2'>
                {`POS ${i}`}
              </Typography>
            </Box>
          </Tooltip>
        ),
        field: `pos_${i}`,
        width: 90,
        renderCell: (params) => {
          //console.log("PARAMS", params)
          if(params.row["tipo_"] === "BATEA" && i<8){
            return null
          } else if( params.row["tipo_"] === "BATEA" && i>7){
            return (
              <Tooltip
                title={
                  <Box>
                    <Typography variant='h6' color={"primary"}>KM POS: {params.row[`pos_${i - 7}`]}</Typography>
                    <Typography variant='h6' color={"primary"}>Días: {params.row[`val_${i - 7}`]}</Typography>
                    <Typography variant='h6' color={"primary"}>Nro Interno: {params.row[`nro_${i - 7}`]}</Typography>
                  </Box>
                }
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...getCellStyle(params.row[`pos_${i - 7}`], params.row[`val_${i - 7}`], i)
                  }}
                >
                  {params.row[`pos_${i - 7}`] === null ? '' : params.row[`pos_${i - 7}`]}
                </Box>
              </Tooltip>
            );
          } else if( params.row["tipo_"] === "TRACTOR" && i>7){
            return null
          }
          return (
            <Tooltip
              title={
                <Box>
                  <Typography variant='h6' color={"primary"}>KM POS: {params.row[`pos_${i}`]}</Typography>
                  <Typography variant='h6' color={"primary"}>Días: {params.row[`val_${i}`]}</Typography>
                  <Typography variant='h6' color={"primary"}>Nro Interno: {params.row[`nro_${i}`]}</Typography>
                </Box>
              }
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...getCellStyle(params.value, params.row[`val_${i}`], i)
                }}
              >
                {params.value === null ? '' : params.value}
              </Box>
            </Tooltip>
          );
        }
      });
    }
  }

  if (filterType === 'Flota') {
    for (let i = 1; i <= 7; i++) {
      columns.push({
        renderHeader: (params) => (
          <Tooltip title={getHeaderName(i)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>
                {`${getHeaderName(i)}`}
              </Typography>
              <Typography>
                {`POS ${i}`}
              </Typography>
            </Box>
          </Tooltip>
        ),
        field: `pos_${i}`,
        width: 140,
        renderCell: (params) => (
          <Tooltip
            title={
              <Box>
                <Typography variant='h6' color={"primary"}>KM POS: {params.row[`pos_${i}`]}</Typography>
                <Typography variant='h6' color={"primary"}>Días: {params.row[`val_${i}`]}</Typography>
                <Typography variant='h6' color={"primary"}>Nro Interno: {params.row[`nro_${i}`]}</Typography>
              </Box>
            }
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...getCellStyle(params.value, params.row[`val_${i}`], i)
              }}
            >
              {params.value === null ? '' : params.value}
            </Box>
          </Tooltip>
        )
      });
    }
  }

  if (filterType === 'Batea') {
    //for (let i = 9; i <= 17; i++) {
      for (let i = 1; i <= 10; i++) {
      columns.push({
        renderHeader: (params) => (
          <Tooltip title={getHeaderName(i)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>
                {`${getHeaderName(i+7)}`}
              </Typography>
              <Typography>
                {`POS ${i+7}`}
              </Typography>
            </Box>
          </Tooltip>
        ),
        field: `pos_${i}`,
        width: 170,
        renderCell: (params) => (
          <Tooltip
            title={
              <Box>
                <Typography variant='h6' color={"primary"}>KM POS: {params.row[`pos_${i}`]}</Typography>
                <Typography variant='h6' color={"primary"}>Días: {params.row[`val_${i}`]}</Typography>
                <Typography variant='h6' color={"primary"}>Nro Interno: {params.row[`nro_${i}`]}</Typography>
              </Box>
            }
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...getCellStyle(params.value, params.row[`val_${i}`], i)
              }}
            >
              {params.value === null ? '' : params.value}
            </Box>
          </Tooltip>
        )
      });
    }
  }



  // Transformar los datos para que coincidan con las columnas de DataGrid
  const rows = data.map((item, index) => {
    const row = {
      id: index,
      patente: item.patente,
    };

    item.cubiertas.forEach((km, posIndex) => {
      row[`pos_${posIndex + 1}`] = km;
    });

    item.dias.forEach((dia, posIndex) => {
      row[`val_${posIndex + 1}`] = dia;
    });

    item.nroInterno.forEach((interno, posIndex) => {
      row[`nro_${posIndex + 1}`] = interno;
    });

    row['tipo_'] = item.tipo;

    return row;
  });


  return (
    <Card sx={{ p: 4 }}>

      <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Cubiertas</Typography>
        <Tooltip title={
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 2 }}>{/* letras color blanco */}
            <Typography variant='body1' color={'#FFFFFFFF'}>EL COLOR ROJO INDICA QUE LA CUBIERTA SUPERO LOS 40000KM O LOS 30 DIAS EN LA MISMA POSICION </Typography>
            <Typography variant='body1' color={'#FFFFFFFF'}>EL COLOR AMARILLO INDICA QUE LA CUBIERTA SUPERO LOS 30000KM O LOS 20 DIAS EN LA MISMA POSICION </Typography>
            <Typography variant='body1' color={'#FFFFFFFF'}>EL COLOR VERDE INDICA QUE LA CUBIERTA NO SUPERO LOS 30000KM O LOS 20 DIAS EN LA MISMA POSICION </Typography>
            <Typography variant='body1' color={'#FFFFFFFF'}>EL GRIS INDICA QUE NO HAY UNA CUBIERTA EN ESA POSICION </Typography>


          </Box>
        }>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon icon='tabler:info-circle' fontSize={40} color='info'/>
          </Box>
        </Tooltip>
      </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FiltroNombre
            label={'Filtrar por patente'}
            setValue={setFilterPatente}
            value={filterPatente}
            debounceDelay={1000}
          />
          <Box>
          <InputLabel style={{ alignSelf: 'start' ,fontSize:12.5 }}>Tipo</InputLabel>
          <FormControl variant="outlined" sx={{ height: 35 }}>
            <Select
              labelId="filter-type-label"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label=""
              sx={{height:40,alignSelf:'start'}}
            >
              <MenuItem value="Todas" sx={{height:20}}>Todas</MenuItem>
              <MenuItem value="Flota">Flota</MenuItem>
              <MenuItem value="Batea">Batea</MenuItem>
            </Select>
          </FormControl>
          </Box>
          <FiltroCheckbox
            label={'Km en tiempo real'}
            value={showKmReales}
            setValue={setShowKmReales}
          >
          </FiltroCheckbox>
        </Box>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={50}
          rowsPerPageOptions={[50, 100]}
          loading={isLoading}
          disableColumnMenu
          disableSelectionOnClick
          autoHeight={true}//todo
        />
      </Box>
    </Card>
  );
};

export default TablaRotarCubiertas;
