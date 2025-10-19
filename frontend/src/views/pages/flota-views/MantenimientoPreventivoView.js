import React, { Fragment, useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Chip, LinearProgress, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ErrorDialog from 'src/components/ErrorDialog';
import { FiltroCheckbox, FiltroNombre } from 'src/components/formComponents/Filtros';
import { getControlAceite, getHistoricoAceite } from 'src/services/flota_endpoints/parametros_config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import FormRealizarMantenimiento from 'src/components/mantenimiento-components/FormRealizarMantenimiento';
import { parse } from 'date-fns';

const MantenimientoPreventivoView = () => {
  const [apiErrors, setApiErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filterNombre, setFilterNombre] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [reload,setReload] = useState(false);
  const [showKmReales,setShowKmReales] = useState(false);
  const [dataTabla2, setDataTabla2] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getControlAceite();
        setData(response);
      } catch (error) {
        setApiErrors([error.message]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reload]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getHistoricoAceite();
        setDataTabla2(response);
      } catch (error) {
        setApiErrors([error.message]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reload]);


  const handleFilterChange = (value) => {
    setFilterNombre(value);
  };

  const filteredData = data.filter((item) =>
    item.patente.toLowerCase().includes(filterNombre.toLowerCase())
  ) //.sort((a, b) =>  b["Km_reales"] - a["Km_reales"]) // ordenar por km

  const columns = [
    { field: 'patente', headerName: 'Patente', flex: 1, sortable: false },
    { field: 'flota', headerName: 'Flota', flex: 1 , sortable: false },
    { field: 'En uso', headerName: 'Disponibilidad', flex: 1, type: 'boolean', renderCell: (params) => (params.value ? 'Ocupada' : 'Libre') , sortable: false },
    { field: 'Ultimo cambio', headerName: 'Ultimo cambio', flex: 1 , sortable: true ,
      valueGetter: (params) =>new Date(params.row['Ultimo cambio']),
      renderCell: (params) => format(new Date(params.row['Ultimo cambio']), 'dd-MM-yyyy', { locale: es }),
      sortComparator: (v1, v2) => v1 - v2
    },
    { field: 'Km', headerName: 'Km '+(showKmReales ? 'reales':'verificados'), flex: 1, sortable: true,
      valueGetter:  (params) => {
        return showKmReales ? params.row['Km_reales'] : params.row['Km_verificados'];
      },
    renderCell: (params) => {
      let km = params.row['Km_verificados']
      if(showKmReales){
        km = params.row['Km_reales']
      }
      return (
      <Chip
        label={km}
        color={km < 20000 ? 'success' : km >= 20000 && km < 30000 ? 'warning' : 'error'}
        sx={{ width: '100%' }}
      />

      )
    }
    },
    {
      minWidth: 240,
      field: 'action',
      headerName: 'Acciones',
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const onClick = (e) => {
          e.stopPropagation();
          setSelectedRow(params.row);
          setOpenDialog(true);
        };
        return (
          <Button variant="outlined" color="primary" onClick={onClick}  disabled={params.row.Km_reales == 0}>
            Realizar Mantenimiento
          </Button>
        );
      },
    },
  ];


  /*
  {
    "id": 1,
    "hist_aceite_fecha_cambio": "2024-08-24T15:18:14",
    "hist_aceite_tipo_aceite": "tipo 1",
    "hist_aceite_km": "5000",
    "hist_flota_id": 1,
    "hist_aceite_fecha_ultimo_cambio": null,
    "hist_aceite_ultimo_tipo_aceite": null,
    "hist_user_flota": "MARCELO ENCABO"
  },
  */
  const columns2 = [
    { field : "id" , headerName: 'ID',flex : 0.7,  sortable: false,},
    { field : "hist_aceite_fecha_cambio" ,flex : 1, headerName: 'Fecha de cambio', sortable: true,
      valueGetter: (params) => new Date(params.row['hist_aceite_fecha_cambio']).getTime(),
      sortComparator:  (v1, v2, cellParams1, cellParams2) => {
        return v1 - v2;
      },
      renderCell: (params) => {
        return format(new Date(params.row['hist_aceite_fecha_cambio']), 'dd/MM/yyyy', { locale: es });
      }
    },
    { field : "hist_tipo_aceite" , flex : 1,headerName: 'Tipo de aceite utilizado', sortable: false,},
    { field : "hist_taller" , flex : 1,headerName: 'Taller', sortable: false,},
    { field : "hist_aceite_km" , headerName: 'Km',flex : 1, sortable: false, },
    { field : "hist_flota_patente" , headerName: 'Patente',flex : 1, sortable: false, },
    { field : "hist_aceite_fecha_ultimo_cambio" ,flex : 1, headerName: 'Fecha de mantenimiento anterior', sortable: true,
      valueGetter: (params) => new Date(params.row['hist_aceite_fecha_ultimo_cambio']).getTime(),
      sortComparator:  (v1, v2, cellParams1, cellParams2) => {
        return v1 - v2;
      },
      renderCell: (params) => {
        return format(new Date(params.row['hist_aceite_fecha_ultimo_cambio']), 'dd/MM/yyyy', { locale: es });
      }
    },
    { field : "hist_aceite_ultimo_tipo_aceite" ,flex : 1, headerName: 'Aceite anterior', sortable: false, },
    { field : "hist_user_flota" , headerName: 'Quien autorizo el mantenimiento',flex : 1, sortable: false, },
  ]

  return (
    <Fragment>
      {openDialog && selectedRow && ( <FormRealizarMantenimiento row_id={selectedRow.id} onClose={() => setOpenDialog(false)} open={openDialog} setReload={setReload}/>)}
      <Card>
        <CardHeader title="Mantenimiento Preventivo" />
        <CardContent sx={{ height: '500px', overflow: 'auto' }}>
          {apiErrors.length > 0 && (
            <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Error'} />
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'initial',height: 60, width: '100%',gap:6 }}>
          <FiltroNombre
            label={'Patente'}
            value={filterNombre}
            setValue={handleFilterChange}
          />

          <FiltroCheckbox
            label={'Km en tiempo real'}
            value={showKmReales}
            setValue={setShowKmReales}
          />
          </Box>
          <Box sx={{ height: 20, width: '100%' }} />
          {isLoading ? (
            <LinearProgress />
          ) : (
            <DataGrid
              columns={columns}
              rows={filteredData}
              disableRowSelectionOnClick
              autoPageSize = {true}
              disableColumnSelector
              getRowId={(row) => row.id}
              loading={isLoading}
            />
          )}
        </CardContent>
      </Card>
      <Card sx={{ mt: 4 }}>
        <CardHeader title="Historial de Mantenimiento Preventivo" />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'initial',height: 500, width: '100%',gap:6 }}>
          <DataGrid
            columns={columns2}
            rows={dataTabla2}
            autoPageSize = {true}
            disableRowSelectionOnClick
            disableColumnSelector
            getRowId={(row) => row.id}
            loading={isLoading}
          />
          </Box>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default MantenimientoPreventivoView;
