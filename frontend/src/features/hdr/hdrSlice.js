import { createSlice } from '@reduxjs/toolkit';

export const hdrSlice = createSlice({
  name: 'hdr',
  initialState: {
    hdr_id: null,
    flota: '',
    chofer: ''
  },
  reducers: {
    setHDRInfo: (state, action) => {
      state.hdr_id = action.payload.hdr_id;
      state.flota = action.payload.flota;
      state.chofer = action.payload.chofer;
    },
  },
});

export const { setHDRInfo } = hdrSlice.actions;

export default hdrSlice.reducer;
