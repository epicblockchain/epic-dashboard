import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = [];

export const fetchMinerSummaries = createAsyncThunk(
    'miners/fetchMinerSummaries',
    async (params, thunkAPI) => {
        const response = await axios.get('http://jsonplaceholder.typicode.com/posts/1')
        return response;
    }
)

const minersSlice = createSlice({
    name: 'miners',
    initialState: [],
    reducers: {
        minersAdded(state, action) {
            action.payload.forEach( (el) => {
                state.push({
                    ip: el,
                    summary: {
                        status: 'idle',
                        error: null,
                        data: null,
                        lastUpdate: null
                    },
                    history: {
                        status: 'idle',
                        error: null,
                        data: null
                    }
                });
            });
        }
    },
    extraReducers: {
        [fetchMinerSummaries.fulfilled]: (state, action) => {
            console.log('fulfilled')
            console.log(action.payload)
            console.log(state.miners)
        },
        [fetchMinerSummaries.rejected]: () => {
            console.log('not fulfilled')
        }
    }
})

export const { minersAdded } = minersSlice.actions

export default minersSlice.reducer

export const selectAllMiners = state => state.miners
