import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = [];

export const fetchMinerSummaries = createAsyncThunk(
    'miners/fetchMinerSummaries',
    async (params, thunkAPI) => {
        if (!thunkAPI.getState() || !thunkAPI.getState().miners){
            return
        }
        const miners = thunkAPI.getState().miners;
        const minersLen = miners.length;
        let responses = [];
        for (let i = 0; i < minersLen; i++){
            const response = await axios.get('https://' + miners[i].ip + '/summary')
            responses.push(response.data);
            console.log('testing')
            console.log(response.data);
        }
        return responses;
    }
)

const minersSlice = createSlice({
    name: 'miners',
    initialState,
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
            console.log('Fetch miner summaries fulfilled')
            console.log(action.payload)
            if (!state) {
                return
            }
        },
        [fetchMinerSummaries.rejected]: (state, action) => {
            console.log('Error: fetch miner summaries not fulfilled')
        }
    }
})

export const { minersAdded } = minersSlice.actions

export default minersSlice.reducer

export const selectAllMiners = state => state.miners
