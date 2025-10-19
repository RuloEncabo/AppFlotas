import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CircularProgress, Dialog, FormLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import CardPosCubierta from 'src/components/cubiertas-components/CardPosCubierta'
import FiltroTablaDesplegable from 'src/components/formComponents/Filtros'
import {
  getFlotaCubiertasPorId,
  getFlotaCubiertasPorPatente,
  getFlotasBateas
} from 'src/services/flota_endpoints/cubiertas_flota'
import ErrorDialog from 'src/components/ErrorDialog'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { ConfirmSimpleDialog } from 'src/components/ConfirmOptionDialog'

function AltaCubiertaFlotaView() {
  const [filtroPatente, setFiltroPatente] = useState(null)
  const [flotaCubiertas, setFlotaCubiertas] = useState(null)
  const [filtroTipoPatente, setFiltroTipoPatente] = useState(null)
  const [kmOT, setKmOT] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState([])
  const [reload, setReload] = useState(false)
  const [showDialogCubsRequired, setShowDialogCubsRequired] = useState({})

  /// MODIFICACIONES PARA SEPARAR PATENTES DE TRACTOR Y BATEA
  const [patenteTractorLista, setPatenteTractorLista] = useState(null)
  const [patenteBateaLista, setPatenteBateaLista] = useState(null)
  const [kmOTAux, setKmOTAux] = useState('')

  // useEffect para traer las cubiertas por patente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await getFlotasBateas()
        if (res.length > 0 && filtroTipoPatente === true) {
          setFiltroPatente(null)
          setKmOT(null)
          setPatenteTractorLista(res[0])
        } else if (res.length > 0 && filtroTipoPatente === false) {
          setFiltroPatente(null)
          setKmOT(null)
          setPatenteBateaLista(res[1])
        } else {
          if (filtroTipoPatente != null) {
            setApiErrors([{ error: 423, message: 'No hay patentes' }])
          }
        }
      } catch (error) {
        setApiErrors([{ error: 423, message: error.response.data.detail }])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [filtroTipoPatente])

  const validatePosiciones = () => {
    console.log("Validando posiciones...");

    // Verifica si los datos están disponibles
    if (!flotaCubiertas || !flotaCubiertas.POSICIONES) {
      console.log("flotaCubiertas o POSICIONES no están disponibles aún");
      return;
    } else {
      console.log("flotaCubiertas y POSICIONES están disponibles", flotaCubiertas, flotaCubiertas.POSICIONES);
    }

    let posiciones = [];

    // Filtra las posiciones según el filtro y valida que ID_CUBIERTA no sea null
    if (filtroTipoPatente) {
      posiciones = flotaCubiertas.POSICIONES.filter(posicion =>
        [1, 2, 3, 4, 5, 6].includes(posicion.POSICION) && posicion.ID_CUBIERTA === null
      ).map(posicion => posicion.POSICION);
    } else {
      posiciones = flotaCubiertas.POSICIONES.filter(posicion =>
        [8, 9, 10, 11].includes(posicion.POSICION) && posicion.ID_CUBIERTA === null
      ).map(posicion => posicion.POSICION);
    }

    console.log("Posiciones requeridas detectadas sin cubiertas asignadas:", posiciones);

    // Muestra el diálogo si hay posiciones sin cubierta asociada
    if (posiciones.length > 0) {
      const dialogState = {
        show: true,
        posiciones,
      };
      console.log("Actualizando estado del diálogo:", dialogState);
      setShowDialogCubsRequired(dialogState);
    }
  };



  useEffect(() => {
    if (flotaCubiertas && flotaCubiertas.POSICIONES) {
      validatePosiciones();
    }
  }, [flotaCubiertas]);


  useEffect(() => {
    console.log("Estado actualizado de showDialogCubsRequired:", showDialogCubsRequired);
  }, [showDialogCubsRequired]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (filtroPatente != null) {
          const res = await getFlotaCubiertasPorPatente(filtroPatente)
          setFlotaCubiertas(res)
        }
      } catch (error) {
        console.log(error)
        setApiErrors([{ error: 423, message: error.response.data.detail }])
      }

      setIsLoading(false)
    }
    fetchData()

  }, [filtroPatente, reload])

  const handleFijarKm = () => {
    setKmOT(kmOTAux)
  }

  const renderCard = (cubierta, key, indicator) => (
    <Box key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 5 }}>
      <CardPosCubierta
        cubierta={cubierta}
        patente={filtroPatente}
        setReload={setReload}
        km_ot={kmOT}
        flotaCubiertas={flotaCubiertas.FLOTA_CUBIERTAS}
        posiciones={flotaCubiertas.POSICIONES}
        isBatea={filtroTipoPatente == false}
      />
      <Typography variant='caption'>{indicator}</Typography>
    </Box>
  )

  const renderAxleLine = length => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: `${length * 50}px`, height: '2px', backgroundColor: 'black' }} />
    </Box>
  )

  return (
    <div>
      {apiErrors.length > 0 && (
        <ErrorDialog
          errores={apiErrors}
          setErrores={setApiErrors}
          onClose={() => setApiErrors([])}
          titulo={'Error al cargar Cubiertas'}
        />
      )}

      {showDialogCubsRequired?.show && showDialogCubsRequired?.posiciones?.length > 0 && kmOT != null && kmOT != '' && (
        <ConfirmSimpleDialog
          open={showDialogCubsRequired?.show}
          onConfirm={() => setShowDialogCubsRequired({})}
          handleClose={() => setShowDialogCubsRequired({})}
          title="Advertencia de cubiertas"
          message={`Las posiciones ${showDialogCubsRequired.posiciones.join(', ')} no tienen cubiertas asignadas`}
        />
      )}
      <Typography variant='h2' sx={{ mt: 5, mb: 5 }}>
        MODIFICAR/ROTAR/ASIGNAR CUBIERTA
      </Typography>

      <Card sx={{ p: 6, m: 6, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Typography variant='h4' sx={{ mt: 5, mb: 5, width: '30%' }}>
          BUSCAR PATENTE
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', mx: 5 }}>
          <FormLabel sx={{ fontSize: 12 }}>Tipo Patente</FormLabel>
          <Select
            sx={{ height: '40px' }}
            value={filtroTipoPatente ?? ''}
            onChange={e => {
              setFiltroTipoPatente(e.target.value)
              setKmOT(null)
              setKmOTAux(null)
            }}
          >
            <MenuItem sx={{ height: '50px' }} value={true}>
              Tractor
            </MenuItem>
            <MenuItem value={false}>Batea</MenuItem>
          </Select>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
            <CircularProgress />
          </Box>
        ) : filtroTipoPatente == true ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              height: '30vh'
            }}
          >
            <CustomAutocomplete
              sx={{ width: 150 }}
              options={patenteTractorLista ?? []}
              getOptionLabel={option => option.flo_dom_tractor.toUpperCase()}
              value={
                filtroPatente === '' || filtroPatente === null
                  ? null
                  : patenteTractorLista?.find(patente => patente.flo_dom_tractor === filtroPatente) ?? null
              }
              onChange={(event, newValue) => {
                setFiltroPatente(newValue?.flo_dom_tractor.toUpperCase()  ?? '')
                setKmOT(null)
                setKmOTAux(null)
              }}
              isOptionEqualToValue={(option, value) => option.flo_dom_tractor.toUpperCase()  === value?.flo_dom_tractor.toUpperCase() }
              renderInput={params => (
                <Box sx={{ display: 'flex', mt:14 ,flexDirection: 'column' }}>
                  <CustomTextField {...params} label={'Patente Tractor'} />
                  <Typography mt = {2} variant='h6'>KM: { patenteTractorLista && patenteTractorLista.find(patente => patente.flo_dom_tractor.toUpperCase()  === filtroPatente?.toUpperCase() ) && patenteTractorLista.find(patente => patente.flo_dom_tractor.toUpperCase()  === filtroPatente.toUpperCase() ).flo_km_odo }</Typography> {/*   "flo_km_odo": , */}
                  <Typography mt = {2} variant='h6'>NOMBRE: { patenteTractorLista && patenteTractorLista.find(patente => patente.flo_dom_tractor.toUpperCase()  === filtroPatente?.toUpperCase() ) && patenteTractorLista.find(patente => patente.flo_dom_tractor.toUpperCase()  === filtroPatente.toUpperCase() ).flo_nombre }</Typography> {/*   "flo_km_odo": , */}
                </Box>
              )}
            />
          </Box>
        ) : filtroTipoPatente == false ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              height: '30vh'
            }}
          >
            <CustomAutocomplete
              sx={{ width: 150 }}
              options={patenteBateaLista ?? []}
              getOptionLabel={option => option.bat_dominio.toUpperCase()}
              value={
                filtroPatente === '' || filtroPatente === null
                  ? null
                  : patenteBateaLista?.find(patente => patente.bat_dominio.toUpperCase()  === filtroPatente.toUpperCase()) ?? null
              }
              onChange={(event, newValue) => {
                setFiltroPatente(newValue?.bat_dominio.toUpperCase() ?? '')
                setKmOT(null)
                setKmOTAux(null)
              }}
              isOptionEqualToValue={(option, value) => option.bat_dominio.toUpperCase() === value.bat_dominio.toUpperCase()}
              renderInput={params => (
                <Box sx={{ display: 'flex', mt:14 ,flexDirection: 'column' }}>
                  <CustomTextField {...params} label={'Patente Batea'} />
                  <Typography mt = {2} variant='h6'>KM: { patenteBateaLista && patenteBateaLista.find(patente => patente.bat_dominio.toUpperCase()  === filtroPatente?.toUpperCase() ) && patenteBateaLista.find(patente => patente.bat_dominio.toUpperCase()  === filtroPatente.toUpperCase() ).bat_km }</Typography> {/*   "flo_km_odo": , */}
                  <Typography mt = {2} variant='h6'>NOMBRE: { patenteBateaLista && patenteBateaLista.find(patente => patente.bat_dominio.toUpperCase()  === filtroPatente?.toUpperCase() ) && patenteBateaLista.find(patente => patente.bat_dominio.toUpperCase()  === filtroPatente.toUpperCase() ).bat_nombre }</Typography> {/*   "flo_km_odo": , */}
                </Box>
              )}
            />
          </Box>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            height: '60px', // Altura deseada
            mx: 5,
            mt: 5,
            mb: 4
            //overflow: 'hidden', // Evita que el contenido exceda
          }}
        >
          <FormLabel sx={{ fontSize: 12, lineHeight: '18px', whiteSpace: 'nowrap' }}>
            KM. OT
          </FormLabel>
          <Box sx={{ height: '18px' }}>
            <TextField
              value={kmOTAux ?? ''}
              type="text"
              size="small" // Ajusta el tamaño del campo de texto
              InputProps={{
                sx: {
                  height: '100%', // Ajusta la altura al contenedor
                  fontSize: '14px', // Reduce el tamaño del texto interno
                },
              }}
              onChange={(e) => {
                if (/^[0-9]*$/.test(e.target.value) || e.target.value === '') {
                  setKmOTAux(e.target.value);
                }
              }}
            />
          </Box>
        </Box>

        <Button onClick={handleFijarKm} sx={{ mt: 4 }} variant='contained' color='success'>
          FIJAR KM
        </Button>
      </Card>

      {!isLoading && flotaCubiertas != null && kmOT != null && kmOT !== '' ? (
        <Box sx={{ mx: 25 }}>
          {filtroTipoPatente === true ? ( // Tractor
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {flotaCubiertas.POSICIONES.slice(0, 2).map((cubierta, i) =>
                  renderCard(cubierta, i, `Eje Delantero ${i + 1}`)
                )}
              </Box>
              {renderAxleLine(2)}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {flotaCubiertas.POSICIONES.slice(2, 6).map((cubierta, i) =>
                  renderCard(cubierta, i + 2, `Eje Tracción ${i + 1}`)
                )}
              </Box>
              {renderAxleLine(4)}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {flotaCubiertas.POSICIONES.slice(6, 7).map((cubierta, i) =>
                  renderCard(cubierta, i + 6, `Auxiliar ${i + 1}`)
                )}
              </Box>
            </>
          ) : filtroTipoPatente === false ? ( // Batea
            <>
               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {flotaCubiertas.POSICIONES.slice(0, 4).map((cubierta, i) =>
                  renderCard(cubierta, i + 8, `Primer Eje Batea ${i + 1}`)
                )}
              </Box>
              {renderAxleLine(4)}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {flotaCubiertas.POSICIONES.slice(4, 8).map((cubierta, i) =>
                  renderCard(cubierta, i + 12, `Segundo Eje Batea ${i + 1}`)
                )}
              </Box>
              {renderAxleLine(4)}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {flotaCubiertas.POSICIONES.slice(8, 10).map((cubierta, i) =>
                  renderCard(cubierta, i + 16, `Auxiliar ${i + 1}`)
                )}
              </Box>
            </>
          ) : null}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            margin: 'auto',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100vh'
          }}
        >
          <CircularProgress color='success' />
        </Box>
      )}
    </div>
  )
}

export default AltaCubiertaFlotaView
