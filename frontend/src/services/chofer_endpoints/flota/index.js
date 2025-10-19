import { axiosService } from '../../axios'
import { ELTA_URL } from 'src/config'

export const getFlotas = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/params/flota/`)

    return { data: response.data }
  } catch (err) {
    console.log('error')
  }
}
