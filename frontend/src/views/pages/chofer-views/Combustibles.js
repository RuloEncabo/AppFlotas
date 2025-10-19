import React, { useState, useEffect } from 'react';
import FormCargaCombustible from 'src/components/chofer-components/FormCargaCombustible';
import { Grid, Container, Box, Typography, Button, Divider } from '@mui/material';
import CardCombustibles from 'src/components/chofer-components/CardCombustibles';
import Icon from 'src/@core/components/icon';
import { getCargasHDR } from 'src/services/chofer_endpoints/carga';

const Combustibles = ({ data }) => {
  // Estados Formulario Carga Combustible
  const [agregarCombustibleOpen, setAgregarCombustibleOpen] = useState(false);

  const handleAgregarCombustibleOpen = () => {
    setAgregarCombustibleOpen(true);
  };

  const handleCloseCombustible = () => {
    setAgregarCombustibleOpen(false);
  };

  const [cargasCombustibles, setCargasCombustibles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCargas = await getCargasHDR(data.hoja_de_ruta.hdr_id);
        setCargasCombustibles(resCargas);
        console.log('LAS CARGAS SON', resCargas);
      } catch (error) {
        console.error('Error al obtener los movimientos:', error);
      }
    };

    fetchData();
  }, [data.hoja_de_ruta.hdr_id]);

  if (!data || !cargasCombustibles || cargasCombustibles.length === 0) {
    // Valida que exista una hoja de ruta o que no haya cargas de combustible
    return (
      <Container>
        <Typography variant='h6'>No hay cargas de combustible registradas.</Typography>

        <Button
          variant='contained'
          color='primary'
          startIcon={<Icon icon='tabler:note' />}
          sx={{ mb: 5, mt: 5 }}
          onClick={handleAgregarCombustibleOpen}
        >
          AGREGAR CARGA DE COMBUSTIBLE
        </Button>

        <FormCargaCombustible
          isOpen={agregarCombustibleOpen}
          onClose={handleCloseCombustible}
          data={null}
          isCrear={true}
          hdr_id={data.hoja_de_ruta.hdr_id}
          km={data.flota.odometro}
          setCC={setCargasCombustibles}
          listaCombustibles={cargasCombustibles}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth='xl'>
      <FormCargaCombustible
        isOpen={agregarCombustibleOpen}
        onClose={handleCloseCombustible}
        data={null} /* como es un agregar, no le paso nada */
        isCrear={true}
        hdr_id={data.hoja_de_ruta.hdr_id} /* Le paso el id para que completar el dato del endpoint */
        km={data.flota.odometro}
        setCC={setCargasCombustibles}
        listaCombustibles={cargasCombustibles}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant='h5'>Ultimos cargas de combustible registradas</Typography>
      </Box>
      <Container>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Icon icon='tabler:note' />}
              sx={{ mb: 5, mt: 5 }}
              onClick={handleAgregarCombustibleOpen}
            >
              AGREGAR CARGA DE COMBUSTIBLE
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        {cargasCombustibles.slice().reverse().map((item, index) => (
          <Grid key={index} item xs={12} sm={12} md={12} lg={12}>
            <CardCombustibles data={item} km={data.flota.odometro} listaCombustibles={cargasCombustibles} setCC={setCargasCombustibles} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Combustibles;
