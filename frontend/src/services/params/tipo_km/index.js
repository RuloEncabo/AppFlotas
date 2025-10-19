import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getTipoKm = async() => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/params/tipo_kilometro/`)

    return response.data
  } catch (error) {
    if(error.response && error.response.status === 404){
      return []
    }else{
      throw(error)
    }
  }
}
