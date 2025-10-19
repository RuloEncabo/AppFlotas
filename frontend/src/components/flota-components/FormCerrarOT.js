import { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Select, MenuItem, Box, Divider, FormLabel
} from '@mui/material';
import IconifyIcon from 'src/@core/components/icon';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ControladorCargaNum from '../formComponents/ControladorCargaNum';
import ControladorCargaFotos from '../formComponents/ControladorCargaFoto';
import { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import ControladorCargaDate, { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate';
import ErrorDialog from '../ErrorDialog';
import { cambiarEstadoOT, getOTById } from 'src/services/flota_endpoints/ot_admin';
import { uploadFile } from 'src/services/foto';

const getSchema = (tipoTaller) => {
  return yup.object().shape({
    estado: yup.string().required('Estado obligatorio'),
    fechaReprogramacion: yup.date().nullable().when('estado', {
      is: val => val !== 'CERRADO',
      then: schema => schema.required('La fecha es obligatoria'),
      otherwise: schema => schema
    }),
    ot_nr_factura: yup.number().when('estado', {
      is: 'CERRADO',
      then: schema => schema.required('Número de factura obligatorio').typeError('Número de factura obligatorio'),
      otherwise: schema => schema.notRequired()
    }),
    ot_monto: yup.number().when('estado', {
      is: 'CERRADO',
      then: schema => schema.required('Monto obligatorio').typeError('Monto obligatorio'),
      otherwise: schema => schema.notRequired()
    }),
    //ot_imgs: yup.mixed().when('estado', {
    //  is: 'CERRADO',
    //  then: schema => schema.required('Debe subir al menos una imagen'),
    //  otherwise: schema => schema.notRequired()
    //}),
    ot_proveedor: yup.mixed().when(['estado'], {
      is: estado => estado === 'CERRADO' && tipoTaller === 'Externo',
      then: schema => schema.required('Proveedor obligatorio'),
      otherwise: schema => schema.notRequired()
    })
  });
};

const FormCerrarOT = ({
  otCompleta,
  nameButton = 'Editar',
  title = 'Editar Orden',
  message = 'Seleccione una opción',
  listOptions = ['PROGRAMADO', 'CERRADO'],
  iconName = 'tabler:edit',
  handleRefresh = () => {}
}) => {
  const [open, setOpen] = useState(false);
  const [errores, setErrores] = useState([]);


  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      estado: listOptions[0],
      fechaReprogramacion: null,
      ot_nr_factura: 0,
      ot_monto: 0,
      ot_imgs: null,
      ot_proveedor: null
    },
    resolver: yupResolver(getSchema(listOptions[0], otCompleta?.otTipoTaller || '')),
    mode: 'onBlur'
  });

  const estado = useWatch({ control, name: 'estado' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      console.log(data);
      // CASO REPROGRAMACION
      if (data.estado === 'PROGRAMADO') {
        console.log(otCompleta);
        const fecha = new Date(data.fechaReprogramacion).toISOString();
        await changeStateOT(otCompleta?.ID_OT, data.estado, fecha);
      }
      // CASO CERRADO
      else {
        let ot = await getOTById(otCompleta?.ID_OT);
        ot['ot_nr_factura'] = data.ot_nr_factura;
        ot['ot_monto'] = data.ot_monto;
        ot['ot_proveedor'] = data.ot_proveedor;

        // Recolectar fotos
        const fotos = getValues('ot_fotos');
        console.log( fotos )
        let imagenes = "";

        if (fotos && fotos.length > 0) {
          for (const file of fotos) {
            try {
              const uploadedFilename = await uploadFile(file, 'FOTOS');
              imagenes = `${imagenes}${uploadedFilename},`;
            } catch (uploadError) {
              console.error('Error subiendo archivo:', uploadError);
            }
          }
          // si no esta vacio las imagenes, remueve la ultima coma
          if (imagenes.length > 0) {
            imagenes = imagenes.slice(0, -1);
            ot['ot_imgs'] = imagenes;
          }

        }

        await changeStateOT(otCompleta?.ID_OT, data.estado, null, ot);
      }
      handleRefresh();
      handleClose();
    } catch (error) {
      console.log(error)
      setErrores([...errores,{error:422,message:error.response?.data?.detail ?? error?.message ?? error}])
    }

  };


  const changeStateOT = async(id,value,date, extraData) => {

    try {
      await cambiarEstadoOT(id, {"ot_estado": value}, date)
      handleRefresh();
      handleClose();

    } catch (error) {
      console.log(error)
      setErrores([...errores,{error:422,message:error.response?.data?.detail ?? error?.message ?? error}])
    }
  }

  return (
    <>
      {errores.length > 0 && <ErrorDialog titulo={"Ups"} errores={errores} onClose={() => setErrores([])} />}
      <Button
        variant="contained"
        fullWidth
        onClick={handleOpen}
        startIcon={<IconifyIcon icon={iconName} width={20} height={20} />}
      >
        {nameButton}
      </Button>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: 600,
            maxHeight: 'auto'
          }
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', height: '550px' }}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 600 }}>
            <DialogContentText>{message}</DialogContentText>

            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth sx={{ my: 3 }}>
                  {listOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              )}
            />

            {estado !== 'CERRADO' && (
              <Box>
                <ControladorCargaDate
                  control={control}
                  name="fechaReprogramacion"
                  label="Fecha Reprogramación"
                  errors={errors}
                />
              </Box>
            )}

            {estado === 'CERRADO' && (
              <>
                <FormLabel>Datos de Factura</FormLabel>
                <Box sx={{ height: 20 }} />

                <ControladorCargaNum
                  control={control}
                  name="ot_nr_factura"
                  label="Número de Factura"
                  err={errors.ot_nr_factura}
                />

                <Box sx={{ height: 20 }} />
                <ControladorCargaNum
                  control={control}
                  name="ot_monto"
                  label="Monto de la Factura"
                  err={errors.ot_monto}
                />
                <Divider sx={{ my: 3 }} />

                <Box sx={{ height: 50 }} />
                <ControladorCargaFotos
                  control={control}
                  name="ot_fotos"
                  label="Fotos"
                  errors={errors}
                />

                {(otCompleta?.otTipoTaller?? "Externo") === 'Externo' && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <FormLabel>Datos del proveedor</FormLabel>
                    <ControladorCargaComboAsync
                      control={control}
                      name="ot_proveedor"
                      label="Proveedor"
                      endpoint="/params/proveedores/"
                      optionValueKey="id"
                      optionLabelKey="prov_razon_social"
                      errors={errors}
                    />
                  </>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">Confirmar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default FormCerrarOT;
