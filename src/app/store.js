import { configureStore } from '@reduxjs/toolkit'
import minersReducer from '../features/miners/minersSlice'

export default configureStore({
    reducer: {
        miners: minersReducer
    }
});
