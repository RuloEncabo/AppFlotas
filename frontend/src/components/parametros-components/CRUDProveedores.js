import { Button, Card, CardActionArea, CardActions, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material'
import React, { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ControladorCargaComb from '../formComponents/ControladorCargaComb'
import { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { deleteProveedores, getProveedores, postProveedores } from 'src/services/flota_endpoints/parametros_config'
import ErrorDialog from '../ErrorDialog'
import { Box } from '@mui/system'
import { DataGrid } from '@mui/x-data-grid'

/* {
  "prov_des": "string",
  "prov_nombre": "string",
  "prov_razon_social": "string",
  "prov_contacto": "string",
  "prov_ubic": "string",
  "prov_categ": 0
} */

const Formulario = ({setResetTabla}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState([])

  const initialValues = {
    prov_des: "",
    prov_nombre: "",
    prov_razon_social: "",
    prov_contacto: "",
    prov_ubic: "",
    prov_categ: 0
  }

  // yup schema
  const scheme = yup.object().shape({
    prov_des: yup.string().required(" "),
    prov_nombre: yup.string().required(" "),
    prov_razon_social: yup.string().required(" "),
    prov_contacto: yup.string().required(" "),
    prov_ubic: yup.string().required(" "),
    prov_categ: yup.number().required(" "),
  })
  //react hook form
  const {
    reset,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({ defaultValues:initialValues, mode: 'onSubmit', resolver: yupResolver(scheme) })


  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await postProveedores(data)
      setResetTabla(prev => !prev)
    } catch (error) {
      console.log(error)
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
            // Si 'errorDetails' no es un array, maneja el caso alternativo
            setApiErrors([{ error: 423, message:"Error inesperado en la validación de datos."}]);
        }
      } else {
        // Manejo de errores que no son de Axios
        console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }

    reset(initialValues)
    setIsLoading(false)
  }

  return (
    <Fragment>
       {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} titulo={"Errores de validación"} onClose={() => setApiErrors([])} /> }
       {isLoading ?  <CircularProgress  sx ={{ display: 'block', margin: 'auto' }} />  :
      <Card sx={{ maxWidth: 400, height: '600px' }}>
        <CardHeader title='CREAR PROVEEDOR' />
          <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
            <ControladorCargaComb name="prov_des" label="Descripción" control={control} err={errors.prov_des} />
            <ControladorCargaComb name="prov_nombre" label="Nombre" control={control} err={errors.prov_nombre} />
            <ControladorCargaComb name="prov_razon_social" label="Razón social" control={control} err={errors.prov_razon_social} />
            <ControladorCargaComb name="prov_contacto" label="Contacto" control={control} err={errors.prov_contacto} />
            <ControladorCargaComb name="prov_ubic" label="Ubicación" control={control} err={errors.prov_ubic} />
            <ControladorCargaComboAsync name="prov_categ" errors={errors} label="Categoría de proveedor" control={control}  endpoint="/params/cat_proveedores/" optionValueKey="id" optionLabelKey="cp_nombre" />
        </CardContent>
        <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button type='submit' variant="contained" sx={{ m: 2 }}>CREAR</Button>
          <Button variant="contained" sx={{ m: 2 }} onClick={() => reset(initialValues)}>LIMPIAR</Button>
        </CardActions>
          </form>
      </Card>
      }
    </Fragment>
  )
}

const Tabla = ({resetTabla, setResetTabla}) => {
  const [proveedores, setProveedores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiErrors, setApiErrors] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await getProveedores()
        setProveedores(res || [])
        setApiErrors([])
      } catch (error) {
        console.log(error)
        setApiErrors([{ error: error.response.status, message: error.response.data.detail }])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [resetTabla])

  const handleDelete = async (id) => {
    try {
      await deleteProveedores(id)
      setResetTabla(prev => !prev)
    } catch (error) {
      console.log(error)
      setApiErrors([{ error: 403, message: error }])
    }
  }

  const columns = [
    { field: 'prov_des', headerName: 'Descripción', width: 150 },
    { field: 'prov_nombre', headerName: 'Nombre', width: 150 },
    { field: 'prov_razon_social', headerName: 'Razón Social', width: 150 },
    { field: 'prov_contacto', headerName: 'Contacto', width: 150 },
    { field: 'prov_ubic', headerName: 'Ubicación', width: 150 },
    { field: 'prov_categ', headerName: 'Categoría', width: 150 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" color="secondary" onClick={() => handleDelete(params.id)}>
          Eliminar
        </Button>
      ),
    },
  ]

  return (
    <Card sx={{ width: '90%', maxWidth: 800, height: '600px' }}>
      <CardContent>
        <Typography variant='h5' mb={8}>TABLA DE PROVEEDORES</Typography>
        {isLoading ? (
          <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
        ) : (
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={proveedores}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              loading={isLoading}
              getRowId={(row) => row.id}
            />
          </div>
        )}
        {apiErrors.length > 0 && (
          <ErrorDialog
            errores={apiErrors}
            titulo={"Errores de validación"}
            onClose={() => setApiErrors([])}
          />
        )}
      </CardContent>
    </Card>
  )

}


export const CRUDProveedores = () => {
  const [resetTabla , setResetTabla] = useState(false)
  return (
    <Fragment>
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row',gap:3 }}>
        <Formulario setResetTabla={setResetTabla}/>
        <Tabla resetTabla={resetTabla} setResetTabla={setResetTabla}/>
      </Box>
    </Fragment>
  )
}
