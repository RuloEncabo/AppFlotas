import React, { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, Grid, List, Slide, Snackbar, Typography } from '@mui/material';
import { cambiarFlotaCubiertasPorPatente, getAllCubiertas } from 'src/services/flota_endpoints/cubiertas_flota';
import ErrorDialog from '../ErrorDialog';
import CustomTextField from 'src/@core/components/mui/text-field';
import CustomAutocomplete from 'src/@core/components/mui/autocomplete';
import ControladorCargaCombo, { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import { ELTA_URL } from 'src/config';
import { axiosService } from 'src/services/axios';
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog';

function FormAsignarNuevaCubierta({open, onClose, setReload, patente, posicion,dataCard,km_ot,flotaCubiertas}) {
  const [apiErrors, setApiErrors] = useState([])
  const [data, setApiData] = useState([])
  const [dataCubierta, setDataCubierta] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCub, setSelectedCub] = useState(null)
  const [nroInterno, setNroInterno] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [depositos, setDepositos] = useState([])
  const [selectedDep, setSelectedDep] = useState(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const km_ot_int = parseInt(km_ot)

  // si la cubierta es nueva
  const isAsignando = dataCard.NRO_INTERNO === 0

  const asignarNuevaCubierta = async() => {
    setIsLoading(true)
    setApiErrors([])
    try {
      const dataEnviar = {
        fc_id: flotaCubiertas.fc_id,
        pos_id: dataCard.POSICION,
        cub_id: dataCard.ID_CUBIERTA || 0,
        km_base: dataCard.KM_BASE || 0,
        numero_interno: dataCubierta.cub_nro_interno || 0,
        km_ot: km_ot_int || 0,
        dep_id : (!isAsignando) ? selectedDep.id : null,
      }

      await cambiarFlotaCubiertasPorPatente(dataEnviar)
      setSnackbarOpen(true)
      setSelectedDep(null)
      setSelectedCub(null)
      onClose()

    } catch (error) {
      console.log('Error al enviar la data:', error);
      if (error.response) {
          console.log("Respuesta completa del error:", error.response);
          const errorDetails = error.response.data.detail;
          if (Array.isArray(errorDetails)) {
            let arrayErrores = []
            for (error in errorDetails) {
              arrayErrores = [...arrayErrores,{error:422,message:errorDetails[error].msg}]
            }
            setApiErrors(arrayErrores); // Actualiza el estado con los mensajes de error
          } else {
              // Si 'errorDetails' no es un array, envio detail
            setApiErrors([{ error: 423, message:error.response.data.detail}]);
          }
      } else {
          // Manejo de errores que no son de Axios
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }
    setReload(prev => !prev)

    setIsLoading(false)
  }

  const handleClose = () => {
    setSelectedCub(null)
    setSelectedDep(null)
    onClose()
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (nroInterno === null) {
          const res1 = await getAllCubiertas(0, 100000,null,null,null,null,null,"ACTIVA",true)
          const res2 = await getAllCubiertas(0, 100000,null,null,null,null,null,"MOVIMIENTO INTERNO",true)
          setApiData([ {
              "CUBIERTA": {
                "cub_fecha_alta": "2024-08-26",
                "cub_pos_actual": 0,
                "cub_imgs": null,
                "cub_serie": "14",
                "cub_modelo": "TR01",
                "cub_cant_recapados": 0,
                "cub_id": 0,
                "cub_marca": "Pirelli",
                "cub_observaciones": "obs",
                "cub_mm": 10,
                "cub_estado": "ACTIVA",
                "cub_nro_interno": 0,
                "cub_presion": 10.0,
                "cub_motivo": null,
                "cub_banda": "LISA",
                "cub_fecha_baja": null,
                "cub_dot": "2024-08-26 20:53:08.619385-03",
                "cub_medida": "295",
                "cub_mot_baja": null,
                "cub_id_dep": 1,
                "cub_km_recorridos": 0
            },
            "KM_ROTAR": 0,
            "DEPOSITO": "Rodando"
        } ,...res1.CUB_LIST ,...res2.CUB_LIST]);
        } else {
          const res = await getAllCubiertas(0, 100000, nroInterno,null,null,null,null,"ACTIVA",true)
          setApiData([ {
            "CUBIERTA": {
              "cub_fecha_alta": "2024-08-26",
              "cub_pos_actual": 0,
              "cub_imgs": null,
              "cub_serie": "14",
              "cub_modelo": "TR01",
              "cub_cant_recapados": 0,
              "cub_id": 0,
              "cub_marca": "Pirelli",
              "cub_observaciones": "obs",
              "cub_mm": 10,
              "cub_estado": "ACTIVA",
              "cub_nro_interno": 0,
              "cub_presion": 10.0,
              "cub_motivo": null,
              "cub_banda": "LISA",
              "cub_fecha_baja": null,
              "cub_dot": "2024-08-26 20:53:08.619385-03",
              "cub_medida": "295",
              "cub_mot_baja": null,
              "cub_id_dep": 1,
              "cub_km_recorridos": 0
          },
          "KM_ROTAR": 0,
          "DEPOSITO": "Rodando"
      } ,...res.CUB_LIST]);
        }
      } catch (error) {
        console.log('Error al recibir la data:', error);

        if (error.response) {
            const errorDetails = error.response.data.detail;
            if (Array.isArray(errorDetails)) {
              let arrayErrores = []
              for (error in errorDetails) {
                arrayErrores = [...arrayErrores,{error:422,message:errorDetails[error].msg}]
              }
              setApiErrors(arrayErrores);
            } else {
                setApiErrors([{ error: 423, message: errorDetails}]);
            }
        } else {
            console.error("Error en la solicitud que no proviene de una respuesta HTTP:");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData()
  }, [nroInterno]);


  useEffect(() => {
    const fetchData = async () => {
      setDepositos([])

      setIsLoading(true)
      try {
        const resData =await axiosService.get(`${ELTA_URL}${"/params/deposito/"}`)

        const listaDepositos = resData.data.filter(deposito =>
          deposito.dep_nombre !== "Rodando" &&
          deposito.dep_nombre !== "Deposito Baja" &&
          deposito.dep_nombre !== "Deposito Baja Definitiva" &&
          deposito.dep_nombre !== "Deposito Movimiento Interno"
        )
        setDepositos(listaDepositos)

      } catch (error) {
        setApiErrors( [...apiErrors, error] )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    }, [] )




    const handleCloseConfirmDialog = () => {
      setOpenConfirmDialog(false)
    }


    const validateData = () => {
      if(selectedCub == null) {
        setApiErrors([{ error: 423, message: "Por favor, seleccione una cubierta"}])
        setIsLoading(false)
        return
      }

      if(!isAsignando && selectedDep == null) {
        setApiErrors([{ error: 423, message: "Por favor, seleccione un deposito"}])
        setIsLoading(false)
        return
      }

      if (apiErrors.length > 0) {
        return false
      } else {
        return true
      }
    }

    const onSubmit = async (event) => {
      event.preventDefault()
      if(validateData()){
        setOpenConfirmDialog(true)
      }
    }

  return (
    {data} &&(
    <Dialog
        open={open}
        keepMounted
        fullWidth={true}
        maxWidth={'sm'}
        aria-describedby="alert-dialog-slide-description"
      >
        <Snackbar open={snackbarOpen} autoHideDuration={3000} >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Cubierta modificada
        </Alert>
      </Snackbar>


      <ConfirmSimpleDialog
          open={openConfirmDialog}
          onConfirm={async() => {
            await asignarNuevaCubierta()
            setOpenConfirmDialog(false)
            handleClose()
          }}
          handleClose={ () => handleCloseConfirmDialog()}
          title={isAsignando ? "Asignar Cubierta" : "Rotar Cubierta"}
          message={(selectedCub == 0 && dataCard.NRO_INTERNO == 0)
            ? `No puede quitar una cubierta que no existe`
            : (selectedCub == 0 && dataCard.NRO_INTERNO != 0 && selectedDep != null)
            ? `Desea quitar de la posicion ${posicion} y enviar la cubierta ${dataCard.NRO_INTERNO} al deposito ${selectedDep.dep_nombre}? `
            : (selectedCub != 0 && dataCard.NRO_INTERNO == 0 && selectedDep == null)
            ? `Desea agregar la cubierta ${selectedCub} a la posicion ${posicion}`
            : (selectedCub != 0 && dataCard.NRO_INTERNO != 0 && selectedDep != null)
            ?`Desea quitar la cubierta ${dataCard.NRO_INTERNO} y remplazarla por la cubierta ${selectedCub} en la posicion ${posicion} y enviarla al deposito ${selectedDep.dep_nombre}`
            : "ELTA"

          }
        />
        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <form onSubmit = {onSubmit} >

        <DialogTitle>{"Asignar cubierta a la posicion " + posicion }</DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant='h4' sx={{ mb: 2 }}>BUSCAR CUBIERTA</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'left', width: '90%',gap: 2, justifyContent: 'space-between' }}>

              <CustomAutocomplete
                options={data}
                fullWidth
                value={data.find(option => option.CUBIERTA["cub_nro_interno"] === selectedCub) || null}
                getOptionLabel={option => option.CUBIERTA["cub_nro_interno"] || 'Quitar la cubierta'}
                onChange={(event,newValue) => { setSelectedCub(newValue ? newValue.CUBIERTA["cub_nro_interno"] : null)
                setDataCubierta(newValue ? newValue.CUBIERTA : null)
                }}
                isOptionEqualToValue={(option, value) => option["cub_nro_interno"] === value["cub_nro_interno"]}
                sx={{ width: '100%' }}
                renderInput={params => (
                  <CustomTextField {...params} label={'Seleccione la cubierta a ingresar'} />
                )}
              />

              { !isAsignando &&(
                <CustomAutocomplete
                  options={depositos}
                  fullWidth
                  value = {selectedDep || null}
                  getOptionLabel={option => option.dep_nombre || 'Quitar el deposito'}
                  onChange={(event,newValue) => {setSelectedDep(newValue ? newValue : null) }}
                  isOptionEqualToValue={(option, value) => option["dep_id"] === value["dep_id"]}
                  renderInput={params => (
                    <CustomTextField {...params} label={'Seleccione el deposito para la cubierta saliente'} />
                )}
              />
              )}

            </Box>


            <Typography variant='h4' sx={{  mt: 7}}>DATOS CUBIERTA</Typography>
            {dataCubierta&& dataCubierta.cub_nro_interno != 0 && (<Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
              <CustomTextField label={'Deposito'} disabled value={dataCubierta.cub_id_dep} fullWidth/>
              </Grid>

              <Grid item xs={12} sm={6}>
              <CustomTextField label={'Modelo'} disabled value={dataCubierta.cub_modelo} fullWidth/>
              </Grid>
              <Grid item xs={12} sm={6}>
              <CustomTextField label={'Marca'} disabled value={dataCubierta.cub_marca} fullWidth/>
              </Grid>
              <Grid item xs={12} sm={6}>
              <CustomTextField label={'Medida'} disabled value={dataCubierta.cub_medida} fullWidth/>
              </Grid>
              <Grid item xs={12} sm={6}>
              <CustomTextField label={'MM'} disabled value={dataCubierta.cub_mm} fullWidth/>
              </Grid>
              <Grid item xs={12} sm={6}>
              <CustomTextField label={'Banda'} disabled value={dataCubierta.cub_banda} fullWidth/>
              </Grid>
            </Grid>)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button> : <Button type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>{dataCard.NRO_INTERNO ===  0 ? 'Asignar Cubierta' : 'Cambiar Cubierta' }</Button> }
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}} onClick={handleClose}>Cancelar</Button>
          </Box>
        </DialogActions>
      </form>

      </Dialog>
    )

  )
}

export default FormAsignarNuevaCubierta
