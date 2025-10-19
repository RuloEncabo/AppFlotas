import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, CardHeader, MenuItem, Select, Typography, useTheme } from '@mui/material'
import FormBajaCubierta from 'src/components/cubiertas-components/FormBajaCubierta'
import TablaCubiertasCargadas from 'src/components/cubiertas-components/TablaCubiertasCargadas'
import { getAllCubiertas, putCubiertaBajaDefinitiva } from 'src/services/flota_endpoints/cubiertas_flota'
import { DataGrid } from '@mui/x-data-grid'
import ErrorDialog from 'src/components/ErrorDialog'
import { Box, minWidth } from '@mui/system'
import { uploadFile } from 'src/services/foto'
import TablaCubiertasBajaDefinitiva from 'src/components/cubiertas-components/TablaCubiertasBajaDefinitiva'

function BajaDefinitivaCubiertaView() {

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    console.log("CAMBIANDO ARCHIVO DE LA CUBIERTA CON ID " + id)
    setData(data.map(row => (row.CUBIERTA.cub_id === id ? { ...row, file : file} : row)));
  };

  const handleMotivoChange = (e, id) => {
    const motivo = e.target.value;
    console.log("CAMBIANDO MOTIVO DE LA CUBIERTA CON ID " + id + " A " + motivo)
    setData(data.map(row => (row.CUBIERTA.cub_id === id ? { ...row, cub_motivo: motivo} : row)));
  };

  const columns = [
    {
      flex:0.100,
      minWidth:100,
      field:'cub_nro_interno',
      headerName:'NÚMERO INTERNO',
      renderCell: params =>{
        const {row} = params
        const theme = useTheme()
        return (
          <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <Typography variant='h5' color={theme.palette.text.primary}>#{row.CUBIERTA.cub_nro_interno}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.22,
      minWidth:130,
      field:'cub_observaciones',
      headerName:'OBSERVACIONES',
      renderCell: params =>{
        const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_observaciones}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.22,
      minWidth:130,
      field:'cub_fecha_alta',
      headerName:'FECHA DE ALTA',
      renderCell: params =>{
        const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_fecha_alta}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.22,
      minWidth:130,
      field:'cub_fecha_baja',
      headerName:'FECHA DE BAJA',
      renderCell: params =>{
        const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_fecha_baja || '-'}</Typography>
          </Box>
        )
      }
    },
    //cub_estado
    {
      flex:0.22,
      minWidth:130,
      field:'cub_estado',
      headerName:'ESTADO',
      renderCell: params =>{
        const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_estado == "MOVIMIENTO INTERNO"? "Mov.Interno" : row.CUBIERTA.cub_estado  || '-'}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.22,
      minWidth:130,
      field:'cub_motivo_baja',
      headerName:'MOTIVO DE BAJA',
      renderCell: params =>{
        const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_motivo_baja || '-'}</Typography>
          </Box>
        )
      }
    },

    {
      flex:0.26,
      minWidth : 250,
      field:'cub_motivo',
      headerName:'MOTIVO DE BAJA DEFINITIVA',
      renderCell: params =>{
        const {row} = params
        return (
            <Select
              value={params.row.cub_motivo}
              onChange={(e) => handleMotivoChange(e, params.row.CUBIERTA.cub_id)}
              fullWidth
            >
              <MenuItem value="FIN DE CICLO">FIN DE CICLO</MenuItem>
              <MenuItem value="GARANTIA RECAPADO">GARANTIA RECAPADO</MenuItem>
              <MenuItem value="GARANTIA FABRICANTE">GARANTIA FABRICANTE</MenuItem>
              <MenuItem value="VENTA CASCO">VENTA CASCO</MenuItem>
            </Select>
        )
      }
    },

    {
      field: 'file',
      headerName: 'Archivo',
      width: 350,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Button variant='contained' component='label' fullWidth>
        <input hidden accept='image/*'
          type="file"
          onChange={(e) => handleFileChange(e, params.row.CUBIERTA.cub_id)}
        />
        Subir Imagen
      </Button>
       { params.row.file && <Typography>{params.row.file.name}</Typography>}
      </Box>
      ),
    },


  ]


  const [apiErrors, setApiErrors] = useState([])
  const [data, setData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [filtroNroInterno, setFiltroNroInterno] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [reload, setReload] = useState(false)
  const [certificadoBaja, setCertificadoBaja] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const init = paginationModel.page * paginationModel.pageSize
        // Llama a tu API con el valor correcto de 'init' y 'pageSize'
        const res = await getAllCubiertas(
          init,
          paginationModel.pageSize,
          filtroNroInterno,
          null,
          null,
          null,
          null,
          "BAJA"
        )

        // Cubiertas en estado MOVIMIENTO INTERNO
        const res2 = await getAllCubiertas(
          init,
          paginationModel.pageSize,
          filtroNroInterno,
          null,
          null,
          null,
          null,
          "MOVIMIENTO INTERNO"
        )

        setData([...res.CUB_LIST, ...res2.CUB_LIST]);
        setTotalRows(res.TOTAL)
        console.log(res)
      } catch (error) {
        console.log('Error al enviar la data:', error)

        if (error.response) {
          console.log('Respuesta completa del error:', error.response)
          const errorDetails = error.response.data.detail
          if (Array.isArray(errorDetails)) {
            let arrayErrores = []
            for (error in errorDetails) {
              arrayErrores = [...arrayErrores, { error: 422, message: errorDetails[error].msg }]
            }
            setApiErrors(arrayErrores) // Actualiza el estado con los mensajes de error
          } else {
            // Si 'errorDetails' no es un array, maneja el caso alternativo
            setApiErrors([{ error: 423, message: errorDetails }])
          }
        } else {
          // Manejo de errores que no son de Axios
          console.error('Error en la solicitud que no proviene de una respuesta HTTP:', error.message)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [
    paginationModel,
    filtroNroInterno,
    reload
  ])


  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection);
  };

  const handleBajaDefinitiva = async () => {
    if (selectedRows.length === 0) {
      return
    }

    const selectedRowsData = data.filter((row) => selectedRows.includes(row.CUBIERTA.cub_id));

    let erroresIndividuales = []

    console.log(selectedRowsData);

    try {
      console.log('IDs seleccionados para dar de baja:', selectedRows);

      // subir certificado
      if (certificadoBaja) {
        const res = await uploadFile(certificadoBaja, "DOCUMENTOS");
        if (res == null) {
          console.log('Error al subir el certificado de baja:', res);
          throw new Error('Error al subir el certificado de baja');
        }
      }

      for (const row of selectedRowsData) {
        // subir file si es que existe
        let dataUpdate = {
          cub_motivo: "",
          cub_imgs: ""
        }
        console.log(row)
        if (row.file) {
          const nombreArchivo = await uploadFile(row.file, "FOTOS");
          if (nombreArchivo != null) {
            dataUpdate = {
              ...dataUpdate,
              cub_imgs: nombreArchivo
            }
          }
        }
        dataUpdate = {
          ...dataUpdate,
          cub_motivo: row.cub_motivo
        }
        const res = await putCubiertaBajaDefinitiva(row.CUBIERTA.cub_id, dataUpdate)
      }

    } catch (error) {
      erroresIndividuales = [...erroresIndividuales, error]
      console.error('Error al dar de baja definitiva:', error);
    } finally {
      if (erroresIndividuales.length > 0) {
        setApiErrors(erroresIndividuales)
      } else {
        setApiErrors([])
      }

      setReload(!reload)
    }
  };

  return apiErrors.length > 0 ? (
    <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores'} />
  ) : (
    <Fragment>
      <Card>
        <CardHeader title='Cubiertas dadas de Baja y en Movimiento interno' />

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          getRowId={row => row.CUBIERTA.cub_id}
          checkboxSelection = {true}
          rowCount={totalRows}
          paginationMode='server'
          loading={loading}
          onPaginationModelChange={setPaginationModel}
          onRowSelectionModelChange={handleSelectionChange}
          rows={data}
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: '1.125rem'
            }
          }}
          slotProps={{
            baseButton: {
              size: 'medium',
              variant: 'outlined'
            }
          }}
        />
      </Card>
      <Box sx={{ display: 'flex', flexDirection: 'column',m:4, alignItems: 'center', justifyContent: 'center',width: '350px', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row',m:4, alignItems: 'center', justifyContent: 'center',width: '350px', gap: 3 }}>
        <Button variant='contained' component='label' fullWidth>
        {/* acepta solo documentos pdf , word , excel y csv */}
        <input hidden accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/*"
          type="file"
          onChange={(e) => setCertificadoBaja(e.target.files[0])}
        />
        Subir Certificado de baja
      </Button>
       { certificadoBaja && <Typography>{ certificadoBaja.name }</Typography>}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row',m:4, alignItems: 'center', justifyContent: 'center',width: '350px', gap: 3 }}>
      <Button variant='contained' onClick={handleBajaDefinitiva}> Dar de baja definitiva </Button>
      </Box>
      </Box>
      <Box mt={4}>
        <TablaCubiertasBajaDefinitiva
          reload={reload}
          setReload={setReload}
        />
      </Box>

    </Fragment>
  )
}

export default BajaDefinitivaCubiertaView
