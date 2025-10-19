import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Button, FormControl, FormHelperText, Grid, IconButton, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Icon } from '@iconify/react';

const Input = styled('input')({
  display: 'none',
});

const ControladorCargaFotos = ({
  name,
  control,
  errors = {},
  label,
  resetSignal,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event, onChange) => {
    const files = Array.from(event.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    onChange([...selectedFiles, ...files].map(fileObject => fileObject.file));
  };

  const handleRemoveFile = (fileToRemove) => {
    const newSelectedFiles = selectedFiles.filter(fileObject => fileObject !== fileToRemove);
    setSelectedFiles(newSelectedFiles);
  };

  useEffect(() => {
    console.log("Reseteando archivos", resetSignal);
    setSelectedFiles([]);  // Resetea el estado directamente
  }, [resetSignal]);

  return (
    <FormControl sx={{ width: '100%' }}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange } }) => (
          <div>
            <label htmlFor="icon-button-file">
              <Input accept="image/*" id="icon-button-file" multiple type="file" onChange={(e) => handleFileChange(e, onChange)} />
              <Button variant="contained" component="span" endIcon={<Icon icon='tabler:upload' />}> Subir Imagen</Button>
            </label>
            <Grid container spacing={2}>
              <ImageList sx={{ width: '100%' }} cols={3} rowHeight={164}>
                {selectedFiles.map((fileObject, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={fileObject.preview}
                      alt={`preview ${index}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                      position="top"
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                          onClick={() => handleRemoveFile(fileObject)}
                        >
                          <Icon icon='tabler:trash' />
                        </IconButton>
                      }
                      actionPosition="right"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
            {errors[name] && <FormHelperText sx={{ color: 'error.main' }}>{errors[name].message}</FormHelperText>}
          </div>
        )}
      />
    </FormControl>
  );
};

export default ControladorCargaFotos;
