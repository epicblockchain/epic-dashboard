import { createSlice } from '@reduxjs/toolkit'

const initialState = [];

const minersSlice = createSlice({
    name: 'miners',
    initialState,
    reducers: {
        minersAdded(state, action) {
            state.push(action.payload)
        }
    }
})

export const { minersAdded } = minersSlice.actions

export default minersSlice.reducer
