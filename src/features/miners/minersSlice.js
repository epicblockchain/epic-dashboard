import { createSlice } from '@reduxjs/toolkit'

const initialState = [];

const minersSlice = createSlice({
    name: 'miners',
    initialState,
    reducers: {
        minersAdded(state, action) {
            action.payload.forEach( (el) => {
                state.push(el);
            });
        }
    }
})

export const { minersAdded } = minersSlice.actions

export default minersSlice.reducer
