import { ELTA_URL } from 'src/config';
import { axiosService } from '../axios';

// POST
export const postFoto = async (tipo_foto, id_hdr, id, originalFile) => {
  try {
    // Convertir el archivo original a PNG
    const convertImageToPNG = async (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve(new File([blob], 'converted.png', { type: 'image/png' }));
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const pngFile = await convertImageToPNG(originalFile);

    // Crear FormData y añadir el archivo PNG
    const formData = new FormData();
    formData.append('nueva_foto', pngFile);

    // Realizar la petición POST con el archivo convertido
    const response = await axiosService.post(`${ELTA_URL}/params/cargar_foto/?tipo_foto=${tipo_foto}&id_hdr=${id_hdr}&id=${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw(error);
  }
};


// TODO UPLOAD FILE BUCKET
  /**
   * Valida el archivo en función de su tipo y tamaño.
   *
   * @param {File} file - El archivo a validar.
   * @param {string[]} types - Los tipos de archivo permitidos. Puede ser 'FOTOS' o 'DOCUMENTOS'.
   * @throws {Error} - Si el archivo no es válido.
   */
export const uploadFile = async (file, tipo_file) => {
  const fileTypeValidation = {
    'FOTOS': ['image/jpeg', 'image/png', 'image/jpg'],
    // pdfs , word, excel , csv
    'DOCUMENTOS': ['application/pdf', 'application/msword', 'application/vnd.ms-excel', 'text/csv'],
  };

  const maxSize = 5000000; // 5MB

  const validateFile = (file, types) => {
    if (!types.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido. Permitidos: ${types.join(', ')}`);
    }
    if (file.size > maxSize) {
      throw new Error(`El archivo supera el tamaño máximo permitido de ${maxSize / 1000000}MB.`);
    }
  };

  try {
    validateFile(file, fileTypeValidation[tipo_file]);

    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}.${file.name.split('.').pop()}`;

    // borrar al nombre la extension para que no se guarde el archivo en la BD
    const uniqueFilenameWithoutExtension = uniqueFilename.split('.').slice(0, -1).join('.');

    const formData = new FormData();
    formData.append('nuevo_archivo', file);

    const { data } = await axiosService.post(`${ELTA_URL}/params/cargar_archivo/?nombre=${uniqueFilenameWithoutExtension}&tipo=${tipo_file}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return uniqueFilename;
  } catch (error) {
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
};


export const getFotosPorTIPO_HDR_ID = async (tipo_foto, id_hdr,id) => {

  try {
    const response = await axiosService.get(`${ELTA_URL}/params/listado_fotos/?tipo=${tipo_foto}&hdr=${id_hdr}&id=${id}`)
    return { data: response.data }
  } catch (err) {
    throw(err)
  }
}


export const getFotosPorTIPO_HDR_ID_ADMIN = async (tipo_foto, id_hdr,id) => {

  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/listado_fotos_admin/?tipo=${tipo_foto}&hdr=${id_hdr}&id=${id}`)
    return response.data
  } catch (err) {
    throw(err)
  }
}


export const deleteDIRFotos = async (tipo_foto,id_hdr,id) => {
  if(id=="IMG"){
    return
  }
  try {
    const response = await axiosService.delete(`${ELTA_URL}/params/eliminar_fotos/?tipo_foto=${tipo_foto}&id_hdr=${id_hdr}&id=${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

