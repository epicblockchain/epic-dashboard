import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = [];

const minersSlice = createSlice({
    name: 'miners',
    initialState,
    reducers: {
        minersAdded(state, action) {
            action.payload.forEach( (el) => {
                state.push({
                    ip: el,
                    summary: {
                        state: 'idle',
                        error: null,
                        data: null //store the time accessed?
                    },
                    history: {
                        state: 'idle',
                        error: null,
                        data: null
                    }
                });
            });
        }
    }
})

export const { minersAdded } = minersSlice.actions

export default minersSlice.reducer

export const selectAllMiners = state => state.miners
